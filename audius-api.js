(function(){
  const API='https://api.audius.co/v1';
  const KEY=window.TUNESTREAM_AUDIUS_API_KEY||'';
  async function searchAudius(query,limit=10){
    if(!KEY) return [];
    const url=API+'/tracks/search?query='+encodeURIComponent(query)+'&limit='+limit+'&sortMethod=relevant';
    const r=await fetch(url,{headers:{'x-api-key':KEY}});
    if(!r.ok) throw new Error('Audius API '+r.status);
    const j=await r.json();
    return (j.data||[]).map(t=>({
      id:'audius-'+t.id,
      title:t.title||'Unknown',
      artist:t.user?.name||t.user?.handle||'Audius artist',
      album:t.albumTitle||'Audius',
      emoji:'🎧',
      genre:t.genre||'Music',
      audio:API+'/tracks/'+encodeURIComponent(t.id)+'/stream?app_name=TuneStream',
      cover:t.artwork?.['480x480']||t.artwork?.['1000x1000']||t.artwork?.['150x150']||null,
      source:'Audius',
      sourceUrl:'https://audius.co/'+(t.user?.handle||'')+'/'+(t.permalink||'')
    }));
  }
  window.searchAudius=searchAudius;
  window.getAudiusResults=searchAudius;
})();