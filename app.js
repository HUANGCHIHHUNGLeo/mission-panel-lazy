// ===== util =====
const STORAGE_KEY = 'mission_panel_mvp';
const SafeStore = {
  load(k) {
    try { return JSON.parse(localStorage.getItem(k) || 'null'); }
    catch(e){ return null; }
  },
  save(k,v){
    try { localStorage.setItem(k, JSON.stringify(v)); }
    catch(e){}
  }
};
function needFor(level){ return 100 + (level-1)*20; }
function pick3(pool){ return pool.sort(()=>Math.random()-0.5).slice(0,3); }
function rankFor(level){
  if(level>=50) return '王者';
  if(level>=40) return '翡翠';
  if(level>=30) return '白金';
  if(level>=20) return '金牌';
  if(level>=10) return '銀牌';
  return '銅牌';
}

// ===== DB =====
const DEFAULT_DB = {
  lang:'zh',
  me:{name:'',cls:'銅牌',level:1,exp:0,coins:200,avatarImg:null},
  cards:{refresh:2},
  tasks:[],
  side:[],
  notifs:['歡迎來到任務面板！'],
};
let DB = SafeStore.load(STORAGE_KEY) || structuredClone(DEFAULT_DB);
function save(){ SafeStore.save(STORAGE_KEY,DB); }

// ===== Elements =====
const tasksBox=document.getElementById('tasks');
const sideBox=document.getElementById('side');
const notifMain=document.getElementById('notifMain');
const chipUser=document.getElementById('chipUser');
const chipCoins=document.getElementById('chipCoins');
const chipCards=document.getElementById('chipCards');
const cardCountA=document.getElementById('cardCountA');
const problemTitle=document.getElementById('problemTitle');
const problemBody=document.getElementById('problemBody');
const problemMsg=document.getElementById('problemMsg');
const problemExplain=document.getElementById('problemExplain');
const btnSubmitAns=document.getElementById('btnSubmitAns');
const btnClearAns=document.getElementById('btnClearAns');

// ===== Pools =====
let dailyPool=[], sidePool=[];
async function loadTasks(){
  try {
    const [coreRes,dailyRes] = await Promise.all([
      fetch('/core.json'), fetch('/daily.json')
    ]);
    dailyPool = await coreRes.json();
    sidePool = await dailyRes.json();
  }catch(e){ console.error("讀取任務失敗",e); }
}
function genDaily(){ DB.tasks=pick3(dailyPool).map(t=>({...t,done:false})); }
function genSide(){ DB.side=pick3(sidePool).map(t=>({...t,done:false})); }

// ===== Render =====
function addNotif(msg){ DB.notifs.push(msg); renderNotifs(); save(); }
function renderNotifs(){ notifMain.innerHTML=''; DB.notifs.slice(-3).forEach(n=>{ const li=document.createElement('li'); li.textContent=n; notifMain.appendChild(li); }); }
function renderTop(){
  const need=needFor(DB.me.level), pct=Math.round(DB.me.exp/need*100);
  chipUser.textContent=`Lv.${DB.me.level} / ${pct}%`;
  chipCoins.textContent=`金幣 ${DB.me.coins}`;
  chipCards.textContent=`刷新卡 x${DB.cards.refresh}`;
  cardCountA.textContent=DB.cards.refresh;
}
function taskRow(task,isDaily){
  const el=document.createElement('div'); el.className='taskItem';
  const left=document.createElement('div'); left.textContent=task.title.zh;
  const xp=document.createElement('div'); xp.className='xpGold'; xp.textContent=`+${task.xp} EXP`;
  const btn=document.createElement('button'); btn.textContent=task.done?'完成':'開始';
  btn.onclick=()=>openQuestion(task,isDaily?'daily':'side',btn);
  el.append(left,xp,btn); return el;
}
function renderTasks(){ tasksBox.innerHTML=''; DB.tasks.forEach(t=>tasksBox.appendChild(taskRow(t,true))); }
function renderSide(){ sideBox.innerHTML=''; DB.side.forEach(t=>sideBox.appendChild(taskRow(t,false))); }
function updateAll(){ renderTop(); renderTasks(); renderSide(); renderNotifs(); save(); }

// ===== Question =====
function openQuestion(task,bucket,btnRef){
  if(task.done){ problemTitle.textContent="任務已完成"; return; }
  problemTitle.textContent=`作答：${task.title.zh}`;
  problemExplain.textContent=''; problemMsg.textContent='';
  if(task.q.type==='fill'){
    problemBody.innerHTML=`<input id="answerInput" placeholder="請輸入答案"/>`;
  }else{
    problemBody.innerHTML=task.q.options.map((o,i)=>
      `<label><input type="radio" name="opt" value="${i}">${o.zh}</label>`).join('<br>');
  }
  btnSubmitAns.onclick=()=>handleSubmit(task,btnRef);
  btnClearAns.onclick=()=>{ problemMsg.textContent=''; problemExplain.textContent=''; problemBody.querySelectorAll('input').forEach(x=>x.checked=false); };
}
function handleSubmit(task,btnRef){
  let correct=false;
  if(task.q.type==='fill'){
    const v=document.getElementById('answerInput').value.trim();
    correct=(v===String(task.q.answer));
  }else{
    const r=[...document.querySelectorAll('input[name=opt]')].find(x=>x.checked);
    correct=r?(Number(r.value)===Number(task.q.answer)):false;
  }
  if(!correct){ problemMsg.textContent="答錯了，請再試一次"; return; }

  task.done=true; btnRef.textContent="完成";
  const xp=task.xp; DB.me.exp+=xp;
  if(DB.me.exp>=needFor(DB.me.level)){ DB.me.level++; DB.me.exp=0; DB.me.cls=rankFor(DB.me.level); addNotif(`升級 Lv.${DB.me.level}`); }
  DB.me.coins+=5;
  addNotif(`完成任務：${task.title.zh} (+${xp} EXP, +5 金幣)`);
  if(task.explain){ problemExplain.textContent="解題："+task.explain.zh; }
  problemMsg.textContent="答對！已獲得獎勵";
  updateAll();
}

// ===== Buttons =====
document.getElementById('btnRefreshDaily').onclick=()=>{ if(DB.cards.refresh>0){ DB.cards.refresh--; genDaily(); addNotif("刷新核心任務"); updateAll(); } else addNotif("刷新卡不足"); };
document.getElementById('btnRerollSide').onclick=()=>{ genSide(); addNotif("更新日常任務"); updateAll(); };
document.getElementById('btnBuy1').onclick=()=>{ if(DB.me.coins>=100){ DB.me.coins-=100; DB.cards.refresh++; addNotif("購買刷新卡 x1"); updateAll(); } else addNotif("金幣不足"); };
document.getElementById('btnBuy5').onclick=()=>{ if(DB.me.coins>=450){ DB.me.coins-=450; DB.cards.refresh+=5; addNotif("購買刷新卡 x5"); updateAll(); } else addNotif("金幣不足"); };

// ===== Init =====
async function start(){
  await loadTasks();
  if(DB.tasks.length===0) genDaily();
  if(DB.side.length===0) genSide();
  updateAll();
}
start();
