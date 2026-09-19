import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {fileURLToPath} from "node:url";

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const PORT=Number(process.env.PORT||5000);
const JWT_SECRET=process.env.JWT_SECRET||"dev-only-change-me";
const DATA_DIR=path.resolve(__dirname,process.env.DATA_DIR||"./data");
const UPLOAD_DIR=path.resolve(__dirname,process.env.UPLOAD_DIR||"./uploads");
fs.mkdirSync(DATA_DIR,{recursive:true});fs.mkdirSync(UPLOAD_DIR,{recursive:true});
const file=(name)=>path.join(DATA_DIR,name);
const read=(name,fallback=[])=>{try{return JSON.parse(fs.readFileSync(file(name),"utf8"))}catch{return fallback}};
const write=(name,data)=>fs.writeFileSync(file(name),JSON.stringify(data,null,2));
for(const [n,d] of [["users.json",[]],["songs.json",[]],["playlists.json",[]],["likes.json",[]]])if(!fs.existsSync(file(n)))write(n,d);

const app=express();
app.use(cors({origin:process.env.CLIENT_ORIGIN||"*"}));
app.use(express.json({limit:"2mb"}));
app.use("/uploads",express.static(UPLOAD_DIR));
app.get("/health",(req,res)=>res.json({ok:true,service:"tunestream-server"}));

const publicUser=u=>({_id:u._id,id:u._id,name:u.name,email:u.email});
const tokenFor=u=>jwt.sign({sub:u._id},JWT_SECRET,{expiresIn:"30d"});
const auth=async(req,res,next)=>{try{const h=req.headers.authorization||"";if(!h.startsWith("Bearer "))return res.status(401).json({message:"Authentication required"});const p=jwt.verify(h.slice(7),JWT_SECRET);const u=read("users.json").find(x=>x._id===p.sub);if(!u)return res.status(401).json({message:"User not found"});req.user=u;next()}catch{return res.status(401).json({message:"Invalid or expired token"})}};

app.post("/api/auth/signup",async(req,res)=>{const{name,email,password}=req.body||{};if(!name?.trim()||!email?.trim()||!password)return res.status(400).json({message:"Name, email and password are required"});if(password.length<6)return res.status(400).json({message:"Password must be at least 6 characters"});const users=read("users.json");const e=email.trim().toLowerCase();if(users.some(u=>u.email===e))return res.status(409).json({message:"Email already registered"});const u={_id:crypto.randomUUID(),name:name.trim(),email:e,passwordHash:await bcrypt.hash(password,12),createdAt:new Date().toISOString()};users.push(u);write("users.json",users);res.status(201).json({token:tokenFor(u),user:publicUser(u)})});
app.post("/api/auth/login",async(req,res)=>{const{email,password}=req.body||{};const u=read("users.json").find(x=>x.email===String(email||"").trim().toLowerCase());if(!u||!(await bcrypt.compare(password||"",u.passwordHash)))return res.status(401).json({message:"Invalid email or password"});res.json({token:tokenFor(u),user:publicUser(u)})});
app.get("/api/auth/me",auth,(req,res)=>res.json(publicUser(req.user)));

const cleanSong=s=>({...s});
app.get("/api/songs",(req,res)=>{const songs=read("songs.json").sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));res.json(songs.map(cleanSong))});
app.get("/api/songs/search",(req,res)=>{const q=String(req.query.q||"").trim().toLowerCase();if(!q)return res.json([]);res.json(read("songs.json").filter(s=>[s.title,s.artist,s.album,s.genre].some(v=>String(v||"").toLowerCase().includes(q))))});
app.get("/api/songs/liked",auth,(req,res)=>{const likes=read("likes.json").filter(x=>x.userId===req.user._id).map(x=>x.songId);res.json(read("songs.json").filter(s=>likes.includes(s._id)))});
app.post("/api/songs/:id/like",auth,(req,res)=>{const likes=read("likes.json");if(!likes.some(x=>x.userId===req.user._id&&x.songId===req.params.id)){likes.push({_id:crypto.randomUUID(),userId:req.user._id,songId:req.params.id});write("likes.json",likes)}res.json({liked:true})});
app.delete("/api/songs/:id/like",auth,(req,res)=>{write("likes.json",read("likes.json").filter(x=>!(x.userId===req.user._id&&x.songId===req.params.id)));res.json({liked:false})});

const storage=multer.diskStorage({destination:(req,file,cb)=>cb(null,UPLOAD_DIR),filename:(req,file,cb)=>{const ext=path.extname(file.originalname)||".bin";cb(null,crypto.randomUUID()+ext)}});
const upload=multer({storage,limits:{fileSize:100*1024*1024},fileFilter:(req,file,cb)=>{if(file.fieldname==="audio"&&file.mimetype.startsWith("audio/"))return cb(null,true);if(file.fieldname==="cover"&&file.mimetype.startsWith("image/"))return cb(null,true);cb(new Error("Only audio files and image covers are allowed"))}});
app.post("/api/songs/upload",auth,upload.fields([{name:"audio",maxCount:1},{name:"cover",maxCount:1}]),(req,res)=>{const f=req.files||{};if(!f.audio?.[0])return res.status(400).json({message:"Audio file is required"});const body=req.body||{};if(!body.title?.trim()||!body.artist?.trim())return res.status(400).json({message:"Title and artist are required"});const song={_id:crypto.randomUUID(),title:body.title.trim(),artist:body.artist.trim(),album:body.album?.trim()||"",genre:body.genre?.trim()||"",audioUrl:"/uploads/"+f.audio[0].filename,coverImage:f.cover?.[0]?"/uploads/"+f.cover[0].filename:"",uploadedBy:req.user._id,createdAt:new Date().toISOString()};const songs=read("songs.json");songs.push(song);write("songs.json",songs);res.status(201).json(song)});

app.get("/api/playlists",auth,(req,res)=>res.json(read("playlists.json").filter(p=>p.userId===req.user._id).map(p=>({...p,songs:read("songs.json").filter(s=>p.songIds.includes(s._id))}))));
app.post("/api/playlists",auth,(req,res)=>{const{name}=req.body||{};if(!name?.trim())return res.status(400).json({message:"Playlist name is required"});const p={_id:crypto.randomUUID(),userId:req.user._id,name:name.trim(),songIds:[],createdAt:new Date().toISOString()};const ps=read("playlists.json");ps.push(p);write("playlists.json",ps);res.status(201).json({...p,songs:[]})});
app.get("/api/playlists/:id",auth,(req,res)=>{const p=read("playlists.json").find(x=>x._id===req.params.id&&x.userId===req.user._id);if(!p)return res.status(404).json({message:"Playlist not found"});res.json({...p,songs:read("songs.json").filter(s=>p.songIds.includes(s._id))})});
app.post("/api/playlists/:id/songs",auth,(req,res)=>{const{songId}=req.body||{};const ps=read("playlists.json");const p=ps.find(x=>x._id===req.params.id&&x.userId===req.user._id);if(!p)return res.status(404).json({message:"Playlist not found"});if(!read("songs.json").some(s=>s._id===songId))return res.status(404).json({message:"Song not found"});if(!p.songIds.includes(songId))p.songIds.push(songId);write("playlists.json",ps);res.json({...p,songs:read("songs.json").filter(s=>p.songIds.includes(s._id))})});
app.delete("/api/playlists/:id/songs/:songId",auth,(req,res)=>{const ps=read("playlists.json");const p=ps.find(x=>x._id===req.params.id&&x.userId===req.user._id);if(!p)return res.status(404).json({message:"Playlist not found"});p.songIds=p.songIds.filter(id=>id!==req.params.songId);write("playlists.json",ps);res.json({ok:true})});

app.use((err,req,res,next)=>{console.error(err);if(err instanceof multer.MulterError)return res.status(400).json({message:err.message});res.status(400).json({message:err.message||"Server error"})});
app.listen(PORT,"0.0.0.0",()=>console.log("TuneStream API running on http://0.0.0.0:"+PORT));