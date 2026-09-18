(function(){
  function configured(){return !!(window.TUNESTREAM_SUPABASE&&window.TUNESTREAM_SUPABASE.url&&window.TUNESTREAM_SUPABASE.anonKey&&window.supabase)}
  let client=null;
  window.TuneStreamCloud={
    enabled:function(){return !!client&&configured()},
    async init(){
      if(!configured()) return null;
      if(!client) client=window.supabase.createClient(window.TUNESTREAM_SUPABASE.url,window.TUNESTREAM_SUPABASE.anonKey);
      const r=await client.auth.getSession();
      if(r.data.session) syncUser(r.data.session.user);
      client.auth.onAuthStateChange(function(event,session){
        if(session) syncUser(session.user); else { localStorage.removeItem("tunestream_user"); if(window.updateProfile) window.updateProfile(); }
        window.dispatchEvent(new CustomEvent("tunestream-auth",{detail:{event:event,session:session}}));
      });
      return r.data.session;
    },
    async signUp(name,email,password){if(!this.enabled())throw new Error("Cloud backend is not configured");const r=await client.auth.signUp({email,password,options:{data:{name:name||""}}});if(r.error)throw r.error;return r.data},
    async signIn(email,password){if(!this.enabled())throw new Error("Cloud backend is not configured");const r=await client.auth.signInWithPassword({email,password});if(r.error)throw r.error;return r.data},
    async addCollaborator(playlistId,userId,role="editor"){const u=await this.session();if(!u)throw new Error("Please login");const r=await client.from("playlist_collaborators").insert({playlist_id:playlistId,user_id:userId,role,added_by:u.user.id});if(r.error)throw r.error;return r.data},
    async collaborators(playlistId){const r=await client.from("playlist_collaborators").select("user_id,role,profiles(id,username,display_name)").eq("playlist_id",playlistId);if(r.error)throw r.error;return r.data||[]},
    subscribePlaylist(playlistId,handler){return client.channel("playlist:"+playlistId).on("postgres_changes",{event:"*",schema:"public",table:"playlist_tracks",filter:"playlist_id=eq."+playlistId},handler).subscribe()},
    async notifications(limit=30){const u=await this.session();if(!u)return[];const r=await client.from("notifications").select("*").eq("user_id",u.user.id).order("created_at",{ascending:false}).limit(limit);if(r.error)throw r.error;return r.data||[]},
    async markNotificationRead(id){const r=await client.from("notifications").update({read:true}).eq("id",id);if(r.error)throw r.error},
    subscribeNotifications(handler){const u=JSON.parse(localStorage.getItem("tunestream_user")||"{}");if(!u.id)return null;return client.channel("notifications:"+u.id).on("postgres_changes",{event:"INSERT",schema:"public",table:"notifications",filter:"user_id=eq."+u.id},handler).subscribe()},
    subscribeFriendActivity(handler){const u=JSON.parse(localStorage.getItem("tunestream_user")||"{}");if(!u.id)return null;return client.channel("activity:"+u.id).on("postgres_changes",{event:"INSERT",schema:"public",table:"listening_history"},handler).subscribe()},
    async signOut(){if(!this.enabled())return;const r=await client.auth.signOut();if(r.error)throw r.error},
    async session(){if(!this.enabled())return null;const r=await client.auth.getSession();return r.data.session},
    async profile(){const u=await this.session();if(!u)return null;const r=await client.from("profiles").select("*").eq("id",u.user.id).single();if(r.error)throw r.error;return r.data},
    async listPlaylists(){const u=await this.session();if(!u)return[];const r=await client.from("playlists").select("*").eq("owner_id",u.user.id).order("created_at",{ascending:false});if(r.error)throw r.error;return r.data||[]},
    async createPlaylist(name,description,isPublic){const u=await this.session();if(!u)throw new Error("Please login");const r=await client.from("playlists").insert({owner_id:u.user.id,name,description:description||null,is_public:!!isPublic}).select().single();if(r.error)throw r.error;return r.data},
    async addTrack(playlistId,songId,position=0){const u=await this.session();if(!u)throw new Error("Please login");const r=await client.from("playlist_tracks").insert({playlist_id:playlistId,song_id:songId,position,added_by:u.user.id});if(r.error)throw r.error;return r.data},
    async playlistTracks(playlistId){const r=await client.from("playlist_tracks").select("playlist_id,song_id,position,songs(*)").eq("playlist_id",playlistId).order("position",{ascending:true});if(r.error)throw r.error;return r.data||[]},
    async deletePlaylist(id){const r=await client.from("playlists").delete().eq("id",id);if(r.error)throw r.error},
    async searchProfiles(q){if(!q?.trim())return[];const v=q.trim();const r=await client.from("profiles").select("id,username,display_name,avatar_url").or("username.ilike.%"+v+"%,display_name.ilike.%"+v+"%").limit(20);if(r.error)throw r.error;return r.data||[]},
    async addFriend(userId){const u=await this.session();if(!u)throw new Error("Please login");if(userId===u.user.id)throw new Error("You cannot add yourself");const r=await client.from("friendships").insert({requester_id:u.user.id,addressee_id:userId}).select().single();if(r.error)throw r.error;return r.data},
    async createBlend(name="Blend"){const u=await this.session();if(!u)throw new Error("Please login");const r=await client.from("blends").insert({name,created_by:u.user.id}).select().single();if(r.error)throw r.error;const m=await client.from("blend_members").insert({blend_id:r.data.id,user_id:u.user.id});if(m.error)throw m.error;return r.data},
    async blendMembers(blendId){const r=await client.from("blend_members").select("user_id,profiles(id,username,display_name)").eq("blend_id",blendId);if(r.error)throw r.error;return r.data||[]},
    async addBlendMember(blendId,userId){const u=await this.session();if(!u)throw new Error("Please login");const own=await client.from("blends").select("id").eq("id",blendId).eq("created_by",u.user.id).single();if(own.error)throw own.error;const r=await client.from("blend_members").insert({blend_id:blendId,user_id:userId});if(r.error)throw r.error;return r.data},
    async blendRecommendations(blendId){const ms=await this.blendMembers(blendId);const ids=ms.map(x=>x.user_id);if(!ids.length)return[];const r=await client.from("likes").select("song_id,user_id").in("user_id",ids);if(r.error)throw r.error;const counts={};(r.data||[]).forEach(x=>counts[x.song_id]=(counts[x.song_id]||0)+1);return Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(x=>Number(x[0]))},
    async saveBlendPlaylist(blendId,songIds,name){const u=await this.session();if(!u)throw new Error("Please login");const p=await this.createPlaylist(name||"Blend Mix","Created from your TuneStream Blend",false);for(let i=0;i<songIds.length;i++){await this.addTrack(p.id,songIds[i],i)}return p},
    async joinBlend(blendId){const u=await this.session();if(!u)throw new Error("Please login");const r=await client.from("blend_members").insert({blend_id:blendId,user_id:u.user.id});if(r.error)throw r.error;return r.data},
    async createJam(name){const u=await this.session();if(!u)throw new Error("Please login");const r=await client.from("jams").insert({host_id:u.user.id,name:name||"TuneStream Jam"}).select().single();if(r.error)throw r.error;await client.from("jam_members").insert({jam_id:r.data.id,user_id:u.user.id});return r.data},
    async joinJam(jamId){const u=await this.session();if(!u)throw new Error("Please login");const r=await client.from("jam_members").insert({jam_id:jamId,user_id:u.user.id});if(r.error)throw r.error;return r.data},
    async jamChannel(jamId){if(!this.enabled())throw new Error("Cloud backend is not configured");await client.realtime.setAuth();return client.channel("jam:"+jamId,{config:{private:true,presence:{key:"user"}}})},
    subscribeJam:function(channel,handler){return channel.on("broadcast",{event:"playback"},handler).subscribe()},
    broadcastPlayback:function(channel,state){return channel.send({type:"broadcast",event:"playback,payload":state})},

  async friends(){const u=await this.session();if(!u)throw new Error("Please login");const r=await client.from("friendships").select("id,requester_id,addressee_id,status,created_at,requester:profiles!friendships_requester_id_fkey(id,username,display_name),addressee:profiles!friendships_addressee_id_fkey(id,username,display_name)").or("requester_id.eq."+u.user.id+",addressee_id.eq."+u.user.id).order("created_at",{ascending:false});if(r.error)throw r.error;return r.data||[]},
    async respondFriend(id,status){const u=await this.session();if(!u)throw new Error("Please login");if(!["accepted","blocked"].includes(status))throw new Error("Invalid status");const r=await client.from("friendships").update({status}).eq("id",id).eq("addressee_id",u.user.id).select().single();if(r.error)throw r.error;return r.data},
    async updateProfile(data){const u=await this.session();if(!u)throw new Error("Please login");const r=await client.from("profiles").update(data).eq("id",u.user.id).select().single();if(r.error)throw r.error;return r.data},
    async likeSong(songId){const u=await this.session();if(!u)throw new Error("Please login");const r=await client.from("likes").upsert({user_id:u.user.id,song_id:songId});if(r.error)throw r.error},
    async unlikeSong(songId){const u=await this.session();if(!u)throw new Error("Please login");const r=await client.from("likes").delete().eq("user_id",u.user.id).eq("song_id",songId);if(r.error)throw r.error},
    async cloudLikes(){const u=await this.session();if(!u)return[];const r=await client.from("likes").select("song_id").eq("user_id",u.user.id);if(r.error)throw r.error;return (r.data||[]).map(x=>x.song_id)},
    async recordPlay(songId){const u=await this.session();if(!u)return;const r=await client.from("listening_history").insert({user_id:u.user.id,song_id:songId});if(r.error)throw r.error},
    async cloudHistory(limit=30){const u=await this.session();if(!u)return[];const r=await client.from("listening_history").select("song_id,played_at").eq("user_id",u.user.id).order("played_at",{ascending:false}).limit(limit);if(r.error)throw r.error;return r.data||[]},
    client:function(){return client}
  };
  function syncUser(user){
    const old=JSON.parse(localStorage.getItem("tunestream_user")||"{}");
    localStorage.setItem("tunestream_user",JSON.stringify({name:user.user_metadata?.name||old.name||user.email?.split("@")[0]||"User",email:user.email||old.email,id:user.id,photo:old.photo}));
    if(window.updateProfile) window.updateProfile();
  }
  window.addEventListener("load",()=>window.TuneStreamCloud.init().catch(()=>{}));
})();