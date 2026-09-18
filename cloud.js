(function(){
  function configured(){return window.TUNESTREAM_SUPABASE&&window.TUNESTREAM_SUPABASE.url&&window.TUNESTREAM_SUPABASE.anonKey&&window.supabase}
  window.TuneStreamCloud={
    enabled:function(){return !!configured()},
    async signUp(name,email,password){if(!configured())throw new Error("Cloud backend is not configured");let r=await supabase.auth.signUp({email,password,options:{data:{name:name||""}}});if(r.error)throw r.error;return r.data},
    async signIn(email,password){if(!configured())throw new Error("Cloud backend is not configured");let r=await supabase.auth.signInWithPassword({email,password});if(r.error)throw r.error;return r.data},
    async signOut(){if(!configured())return;let r=await supabase.auth.signOut();if(r.error)throw r.error},
    async session(){if(!configured())return null;let r=await supabase.auth.getSession();return r.data.session},
    async createPlaylist(name,description,isPublic){let u=await this.session();if(!u)throw new Error("Please login");let r=await supabase.from("playlists").insert({owner_id:u.user.id,name,description:description||null,is_public:!!isPublic}).select().single();if(r.error)throw r.error;return r.data},
    async addFriend(userId){let u=await this.session();if(!u)throw new Error("Please login");let r=await supabase.from("friendships").insert({requester_id:u.user.id,addressee_id:userId});if(r.error)throw r.error;return r.data},
    async createJam(name){let u=await this.session();if(!u)throw new Error("Please login");let r=await supabase.from("jams").insert({host_id:u.user.id,name:name||"TuneStream Jam"}).select().single();if(r.error)throw r.error;await supabase.from("jam_members").insert({jam_id:r.data.id,user_id:u.user.id});return r.data},
    async joinJam(jamId){let u=await this.session();if(!u)throw new Error("Please login");let r=await supabase.from("jam_members").insert({jam_id:jamId,user_id:u.user.id});if(r.error)throw r.error;return r.data},
    jamChannel:function(jamId){if(!configured())throw new Error("Cloud backend is not configured");return supabase.channel("jam:"+jamId,{config:{private:true}})},
    subscribeJam:function(channel,handler){channel.on("broadcast",{event:"playback"},handler).subscribe()},
    broadcastPlayback:function(channel,state){return channel.send({type:"broadcast",event:"playback",payload:state})}
  };
  if(configured()){window.supabaseClient=supabase.createClient(window.TUNESTREAM_SUPABASE.url,window.TUNESTREAM_SUPABASE.anonKey);window.supabase=supabaseClient;supabaseClient.auth.onAuthStateChange(function(event,session){window.dispatchEvent(new CustomEvent("tunestream-auth",{detail:{event:event,session:session}}))})}
})();