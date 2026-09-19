import{create}from"zustand";import AsyncStorage from"@react-native-async-storage/async-storage";import api from"@/lib/api";
export interface User{id:string;name:string;email:string}
interface State{user:User|null;loading:boolean;login:(e:string,p:string)=>Promise<void>;signup:(n:string,e:string,p:string)=>Promise<void>;logout:()=>Promise<void>;fetchUser:()=>Promise<void>}
export const useAuthStore=create<State>(set=>({user:null,loading:true,
login:async(e,p)=>{const r=await api.post("/auth/login",{email:e,password:p});await AsyncStorage.setItem("token",r.data.token);set({user:r.data.user,loading:false})},
signup:async(n,e,p)=>{const r=await api.post("/auth/signup",{name:n,email:e,password:p});await AsyncStorage.setItem("token",r.data.token);set({user:r.data.user,loading:false})},
logout:async()=>{await AsyncStorage.removeItem("token");set({user:null,loading:false})},
fetchUser:async()=>{try{const t=await AsyncStorage.getItem("token");if(!t)return set({user:null,loading:false});const r=await api.get("/auth/me");set({user:r.data,loading:false})}catch{set({user:null,loading:false})}}
}));