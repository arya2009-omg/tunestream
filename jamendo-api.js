/* TuneStream authorized music API adapter
 * Source: Jamendo API v3
 * TuneStream's own Jamendo developer client id.
 * Keep the Jamendo client_secret private; it is never needed for public read/search calls.
 */
(function(){
  const CLIENT_ID = window.TUNESTREAM_JAMENDO_CLIENT_ID || "d9bd2820";
  const API = "https://api.jamendo.com/v3.0/tracks/";
  let lastResults = [];

  function mapTrack(t){
    return {
      id: 1000000 + Number(t.id),
      title: t.name || "Unknown track",
      artist: t.artist_name || "Unknown artist",
      album: t.album_name || "Jamendo",
      emoji: "🎧",
      genre: "API Music",
      audio: t.audio || null,
      cover: t.album_image || t.image || "",
      apiSource: "Jamendo",
      sourceUrl: t.shareurl || t.shorturl || "",
      license: t.license_ccurl || "",
      duration: Number(t.duration || 0)
    };
  }

  async function searchJamendo(query, limit){
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      format: "json",
      limit: String(limit || 20),
      search: query || "hindi",
      include: "licenses",
      audioformat: "mp32",
      imagesize: "300"
    });
    const res = await fetch(API + "?" + params.toString());
    if(!res.ok) throw new Error("Music API request failed (" + res.status + ")");
    const data = await res.json();
    if(data.headers && data.headers.status !== "success") throw new Error(data.headers.error_message || "Music API error");
    return Array.isArray(data.results) ? data.results.map(mapTrack) : [];
  }

  function render(list, title){
    lastResults = list || [];
    list.forEach(function(s){
      const old = songs.findIndex(function(x){return x.id===s.id});
      if(old >= 0) songs[old] = s; else songs.push(s);
    });
    const box = document.getElementById("apiMusicResults");
    if(!box) return;
    box.innerHTML = list.length ? list.map(createRow).join("") :
      '<div class="empty">No API tracks found.</div>';
    const heading = document.getElementById("apiMusicTitle");
    if(heading) heading.textContent = title || "API Music";
  }

  window.apiMusicPage = async function(query){
    currentPage = "api";
    setActive(null);
    const q = (query || "hindi").trim();
    document.getElementById("content").innerHTML =
      '<div class="section-head"><div><h2 id="apiMusicTitle">API Music</h2><p class="muted">Authorized independent music from Jamendo.</p></div><button class="secondary" onclick="browsePage()">← Browse</button></div>' +
      '<div class="quick-actions"><input id="apiMusicSearch" value="' + esc(q) + '" placeholder="Search music..." style="flex:1;min-width:220px;padding:12px;border-radius:24px;border:1px solid var(--border);background:var(--panel);color:var(--text)"><button class="primary" onclick="searchApiMusic()">Search API</button></div>' +
      '<div id="apiMusicResults" class="rows" style="margin-top:16px"><div class="empty">Loading music…</div></div>' +
      '<div class="notice">🎵 Audio is streamed from the API source; TuneStream does not bundle copyrighted audio files. Check each track license before commercial use.</div>';
    try{
      const list = await searchJamendo(q, 30);
      render(list, 'API Music • ' + q);
    }catch(e){
      const box=document.getElementById("apiMusicResults");
      if(box) box.innerHTML='<div class="empty">Could not connect to music API: '+esc(e.message)+'</div>';
    }
  };

  window.searchApiMusic = function(){
    const q=(document.getElementById("apiMusicSearch")?.value||"").trim();
    apiMusicPage(q || "hindi");
  };

  window.searchJamendoTracks = searchJamendo;
  window.getJamendoApiResults = function(){return lastResults.slice();};

  window.addEventListener("load", function(){
    const original = window.startCurrentSong;
    if(!original) return;
    // Existing player already supports s.audio, so API tracks use the same player.
  });
})();