function featureList(title,subtitle,list){currentPage='feature';setActive(null);document.getElementById('content').innerHTML='<div class="section-head"><div><h2>'+esc(title)+'</h2><p class="muted">'+esc(subtitle)+'</p></div><button class="secondary" onclick="homePage()">Home</button></div><div class="rows">'+list.map(createRow).join('')+'</div>'}
window.discoverPage=function(){featureList('Discover Weekly','Fresh tracks selected for your taste.',[songs[1],songs[4],songs[7],songs[2],songs[5],songs[3]])}
window.dailyMixPage=function(){featureList('Daily Mixes','Mood based mixes ready to play.',[songs[0],songs[2],songs[6],songs[7]])}
window.releaseRadarPage=function(){featureList('Release Radar','New demo releases from artists you like.',[songs[4],songs[5],songs[7]])}
window.blendPage=function(){featureList('Blend','A shared style mix from your music.',songs.slice().sort(function(){return Math.random()-.5}).slice(0,6))}
window.filterMusic=function(tag){var map={Chill:[5,3,4],Focus:[6,1,3],Workout:[8,7,4],Party:[2,7,8]};featureList(tag,'Browse by mood.',map[tag].map(function(id){return songs.find(function(s){return s.id===id})}))}
window.browsePage=function(){currentPage='browse';setActive(null);document.getElementById('content').innerHTML='<div class="section-head"><h2>Browse</h2><span class="muted">Genres, moods and activities</span></div><div class="browse-grid"><div class="browse-pill" onclick="filterMusic(\'Chill\')">Chill<small>Relax and night</small></div><div class="browse-pill" onclick="filterMusic(\'Focus\')">Focus<small>Study and coding</small></div><div class="browse-pill" onclick="filterMusic(\'Workout\')">Workout<small>Energy</small></div><div class="browse-pill" onclick="filterMusic(\'Party\')">Party<small>Dance</small></div></div>'}
window.queuePage=function(){currentPage='queue';setActive(null);document.getElementById('content').innerHTML='<div class="section-head"><h2>Queue</h2><button class="secondary" onclick="queue=[...songs];queuePage()">Reset Queue</button></div><div class="queue-panel">'+queue.map(function(s,i){return '<div class="queue-item"><span class="muted">'+(i+1)+'</span><span style="flex:1"><b>'+esc(s.title)+'</b><small class="muted" style="display:block">'+esc(s.artist)+'</small></span><button class="icon-btn" onclick="playSongById('+s.id+')">Play</button></div>'}).join('')+'</div>'}
window.wrappedPage=function(){var h=history().map(function(id){return songs.find(function(s){return s.id===id})}).filter(Boolean);currentPage='wrapped';setActive(null);document.getElementById('content').innerHTML='<section class="hero"><div class="muted">YOUR TUNESTREAM WRAPPED</div><h1>Your listening story</h1><p>You played <b>'+h.length+'</b> recent tracks. Your history is saved on this device.</p><button class="primary" onclick="featureList(\'Top Tracks\',\'From your recent history.\',songs.slice(0,5))">View Top Tracks</button></section>'}
window.settingsPage=function(){currentPage='settings';setActive(null);document.getElementById('content').innerHTML='<div class="section-head"><h2>Settings</h2></div><div class="queue-panel"><div class="setting-row"><span>Auto Update</span><span class="muted">Enabled</span></div><div class="setting-row"><span>Connection</span><span class="muted">'+(navigator.onLine?'Online':'Offline')+'</span></div><div class="setting-row"><span>Storage</span><button class="secondary" onclick="clearTuneData()">Clear local data</button></div></div>'}
window.clearTuneData=function(){if(confirm('Clear likes, playlists, history and login?')){['tunestream_liked','tunestream_playlists','tunestream_history','tunestream_user'].forEach(function(k){localStorage.removeItem(k)});updateProfile();toast('Local data cleared');settingsPage()}}
window.addToQueue=function(id){var s=songs.find(function(x){return x.id===id});if(s&&!queue.some(function(x){return x.id===id}))queue.push(s);toast(s?s.title+' added to queue':'Song not found')}
window.showContext=function(e,id){e.preventDefault();var m=document.getElementById('contextMenu');if(!m){m=document.createElement('div');m.id='contextMenu';m.className='context-menu';document.body.appendChild(m)}m.innerHTML='<button onclick="playSongById('+id+');hideContext()">Play now</button><button onclick="toggleLike('+id+');hideContext()">Like / Unlike</button><button onclick="addToQueue('+id+');hideContext()">Add to queue</button>';m.style.left=Math.min(e.clientX,window.innerWidth-205)+'px';m.style.top=Math.min(e.clientY,window.innerHeight-150)+'px';m.style.display='block'}
window.hideContext=function(){var m=document.getElementById('contextMenu');if(m)m.style.display='none'}
document.addEventListener('contextmenu',function(e){var el=e.target.closest('.card,.row');if(!el)return;var n=el.querySelector('.row-title,h3');if(!n)return;var s=songs.find(function(x){return x.title===n.textContent.trim()});if(s)showContext(e,s.id)})
document.addEventListener('click',function(e){if(!e.target.closest('.context-menu'))hideContext()})
(function(){var old=window.homePage;window.homePage=function(){old();var content=document.getElementById('content');var hero=content.querySelector('.hero');if(hero&&!content.querySelector('.feature-strip')){var box=document.createElement('div');box.innerHTML='<div class="section-head"><h2>Made For You</h2><span class="muted">Personalized features</span></div><div class="feature-strip"><div class="feature" onclick="discoverPage()">Discover Weekly</div><div class="feature" onclick="dailyMixPage()">Daily Mixes</div><div class="feature" onclick="releaseRadarPage()">Release Radar</div><div class="feature" onclick="blendPage()">Blend</div></div><div class="section-head"><h2>Browse by Mood</h2></div><div class="browse-grid"><div class="browse-pill" onclick="filterMusic(\'Chill\')">Chill</div><div class="browse-pill" onclick="filterMusic(\'Focus\')">Focus</div><div class="browse-pill" onclick="filterMusic(\'Workout\')">Workout</div><div class="browse-pill" onclick="filterMusic(\'Party\')">Party</div></div>';hero.insertAdjacentElement('afterend',box)}}})();

/* TuneStream web upgrade pack — responsive polish + player shortcuts */
(function(){
  var style=document.createElement('style');
  style.textContent='
    .ts-upgrade-bar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:0 0 22px}
    .ts-chip{border:1px solid var(--border);background:var(--panel);color:var(--text);padding:9px 13px;border-radius:999px;cursor:pointer;font-size:13px}
    .ts-chip:hover{background:var(--panel2);border-color:#354047}
    .ts-shortcuts{margin-top:14px;padding:12px 14px;border:1px solid var(--border);border-radius:12px;background:rgba(18,22,26,.72);color:var(--muted);font-size:12px}
    .ts-shortcuts kbd{padding:2px 6px;border:1px solid #394249;border-radius:5px;background:#0c1013;color:var(--text)}
    .card,.feature,.browse-pill,.mini-stat,.mood{border:1px solid transparent}
    .card:hover,.feature:hover,.browse-pill:hover,.mini-stat:hover,.mood:hover{border-color:#303a40}
    @media(max-width:800px){.ts-upgrade-bar{margin-bottom:16px}.ts-chip{padding:8px 11px}.ts-shortcuts{font-size:11px}}
  ';
  document.head.appendChild(style);
  function safePlayRandom(){
    if(!window.songs||!songs.length)return;
    var s=songs[Math.floor(Math.random()*songs.length)];
    if(s&&typeof playSongById==='function'){playSongById(s.id);if(typeof toast==='function')toast('✨ Playing a surprise pick');}
  }
  function addUpgradeUI(){
    var c=document.getElementById('content'); if(!c)return;
    var hero=c.querySelector('.home-hero');
    if(hero&&!c.querySelector('.ts-upgrade-bar')){
      var bar=document.createElement('div');bar.className='ts-upgrade-bar';
      bar.innerHTML='<button class="ts-chip" onclick="safeTuneStreamSurprise()">✨ Surprise me</button><button class="ts-chip" onclick="queuePage()">☰ Queue</button><button class="ts-chip" onclick="wrappedPage()">📊 Listening history</button>';
      hero.insertAdjacentElement('afterend',bar);
    }
  }
  window.safeTuneStreamSurprise=safePlayRandom;
  document.addEventListener('dblclick',function(e){
    var el=e.target.closest('.card,.row'); if(!el||!window.songs)return;
    var n=el.querySelector('.row-title,h3'); if(!n)return;
    var s=songs.find(function(x){return x.title===n.textContent.trim()});
    if(s&&typeof playSongById==='function')playSongById(s.id);
  });
  document.addEventListener('keydown',function(e){
    if(e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
    if(e.code==='Space'){e.preventDefault();if(typeof togglePlay==='function')togglePlay();}
    else if(e.key==='ArrowRight'&&typeof audio!=='undefined'&&audio.duration)audio.currentTime=Math.min(audio.duration,audio.currentTime+5);
    else if(e.key==='ArrowLeft'&&typeof audio!=='undefined')audio.currentTime=Math.max(0,audio.currentTime-5);
    else if(e.key.toLowerCase()==='n'&&typeof nextSong==='function')nextSong();
    else if(e.key.toLowerCase()==='p'&&typeof prevSong==='function')prevSong();
  });
  window.addEventListener('online',function(){if(typeof toast==='function')toast('🟢 Back online');});
  window.addEventListener('offline',function(){if(typeof toast==='function')toast('🔴 You are offline');});
  var oldHome=window.homePage;
  if(oldHome)window.homePage=function(){oldHome();setTimeout(addUpgradeUI,0);};
  window.addEventListener('load',function(){setTimeout(addUpgradeUI,250);});
})();