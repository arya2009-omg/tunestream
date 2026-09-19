(function(){
  async function searchAudius(query,limit=10){
    const q=String(query||"").trim();
    if(!q)return [];
    const r=await fetch("/api/music/audius/search?q="+encodeURIComponent(q)+"&limit="+Math.min(Math.max(limit,1),25));
    if(!r.ok)throw new Error((await r.json().catch(()=>({}))).message||"Audius search failed");
    return await r.json();
  }
  window.searchAudius=searchAudius;
  window.getAudiusResults=searchAudius;
})();