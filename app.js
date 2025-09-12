import { needFor, pick3, STORAGE_KEY, SafeStore } from './scripts/util.js';

// ===== DB =====
// ===== Rank helper (homeless edition) =====
function rankFor(level){
  if(level >= 50) return '王者';
  if(level >= 40) return '翡翠';
  if(level >= 30) return '白金'; 
  if(level >= 20) return '金牌';
  if(level >= 10) return '銀牌';
  return '銅牌';
}

const DEFAULT_DB={
  lang:'zh',
  me:{name:'',title:'遊民'/* fixed */,cls:'銅牌',level:1,exp:0,coins:200,avatarImg:null},
  cards:{refresh:2},
  login:{streak:0,last:0},
  notifs:['歡迎來到學習任務面板！'],
  skills:{},
  tasks:[],
  side:[],
  history:[],
  ui:{skillPct:{}},
  currentQ:null
};
let DB=SafeStore.load(STORAGE_KEY)||JSON.parse(JSON.stringify(DEFAULT_DB));
function save(){SafeStore.save(STORAGE_KEY,DB)}

// ===== Elements =====
const viewDashboard=document.getElementById('viewDashboard');
const viewCharacter=document.getElementById('viewCharacter');
const viewSettings=document.getElementById('viewSettings');
const btnViewDashboard=document.getElementById('btnViewDashboard');
const btnViewCharacter=document.getElementById('btnViewCharacter');
const btnViewSettings=document.getElementById('btnViewSettings');
const chipUser=document.getElementById('chipUser');
const chipCoins=document.getElementById('chipCoins');
const chipCards=document.getElementById('chipCards');
const notifMain=document.getElementById('notifMain');
const meta=document.getElementById('meta');
const charXP=document.getElementById('charXP');
const charXPWrap=document.getElementById('charXPWrap');
const charXPNum=document.getElementById('charXPNum');
const skillsBox=document.getElementById('skills');
const tasksBox=document.getElementById('tasks');
const sideBox=document.getElementById('side');
const btnLang=document.getElementById('btnLang');
const cardCountA=document.getElementById('cardCountA');
const avatarImg=document.getElementById('avatarImg');
const avatarSVG=document.getElementById('avatarSVG');
const btnApplyTop=document.getElementById('btnApplyTop');
const btnResetTop=document.getElementById('btnResetTop');

// Problem area
const problemTitle=document.getElementById('problemTitle');
const problemBody=document.getElementById('problemBody');
const problemExplain=document.getElementById('problemExplain');
const problemMsg=document.getElementById('problemMsg');
const btnSubmitAns=document.getElementById('btnSubmitAns');
const btnClearAns=document.getElementById('btnClearAns');

// Upload controls
const avatarInput=document.getElementById('avatarInput');
const btnApplyAvatar=document.getElementById('btnApplyAvatar');
const btnClearAvatar=document.getElementById('btnClearAvatar');

// Settings
const inputName=document.getElementById('inputName');
const selectRank=document.getElementById('selectRank');
const radarCanvas=document.getElementById('radar');
const profileSkillsList=document.getElementById('profileSkillsList');

// Shop & tasks controls
const btnRefreshDaily=document.getElementById('btnRefreshDaily');
const btnRerollSide=document.getElementById('btnRerollSide');
const btnBuy1=document.getElementById('btnBuy1');
const btnBuy5=document.getElementById('btnBuy5');

// ===== i18n =====
const I18N = {
  zh: {
    navDash:'任務面板', navChar:'角色介面', navProfile:'個人資料',
    notif:'通知', character:'角色概況', apply:'套用', resetAll:'重置所有資料',
    xp:'角色經驗', skills:'技能與經驗', problems:'作題區', startHint:'請從右側任務選擇一題開始作答',
    daily:'核心任務', dailySub:'（每日 20:00 刷新）', side:'日常任務', update:'更新',
    shop:'卡片 / 商城', shopDesc:'刷新卡可用於重新抽核心任務。升級與連續登入可獲得卡片。',
    upload:'上傳角色圖片', choose:'選擇圖片', applyAvatar:'套用至角色介面', clearAvatar:'移除自訂圖片', uploadHint:'圖片將以 base64 儲存於本機（localStorage），不會上傳到網路。',
    profile:'個人資料', name:'姓名', grade:'年級', radar:'能力雷達圖', skillPanel:'技能一覽',
    clear:'清除', submit:'提交', applied:'已套用', confirmReset:'確定重製資料？', confirmResetEn:'Reset all data?',
    completed:'完成', begin:'開始', wrong:'答錯了，請再試一次', correct:'答對！已發放經驗值', coins:'金幣', cards:'刷新卡',
    loginStreak:'登入連續天數'
  },
  en: {
    navDash:'Dashboard', navChar:'Character', navProfile:'Profile',
    notif:'Notifications', character:'Overview', apply:'Apply', resetAll:'Reset All Data',
    xp:'Character EXP', skills:'Skills & EXP', problems:'Problem Area', startHint:'Pick a task on the right to start.',
    daily:'Daily Core', dailySub:'(refresh 20:00)', side:'Side Quests', update:'Reroll',
    shop:'Cards / Shop', shopDesc:'Use refresh cards to reroll core tasks. Earn by leveling and login streaks.',
    upload:'Upload Character Image', choose:'Choose Image', applyAvatar:'Apply to Character', clearAvatar:'Remove Custom Image', uploadHint:'Image stores locally in base64 (localStorage), not uploaded.',
    profile:'Profile', name:'Name', grade:'Grade', radar:'Ability Radar', skillPanel:'Skills',
    clear:'Clear', submit:'Submit', applied:'Applied', confirmReset:'確定重製資料？', confirmResetEn:'Reset all data?',
    completed:'Done', begin:'Start', wrong:'Incorrect, try again.', correct:'Correct! EXP granted.', coins:'Coins', cards:'Refresh Cards',
    loginStreak:'Login Streak'
  }
}
function L(zh,en){return {zh,en}}
function getText(v){if(!v)return'';if(typeof v==='string')return v;return v[DB.lang]||v.zh||v.en||''}
function t(key){return I18N[DB.lang][key]||key}
function renderI18n(){
  btnViewDashboard.textContent=t('navDash');
  btnViewCharacter.textContent=t('navChar');
  btnViewSettings.textContent=t('navProfile');
  document.getElementById('ttlNotif').textContent=t('notif');
  document.getElementById('hCharacter').textContent=t('character');
  document.getElementById('btnApplyTop').textContent=t('apply');
  document.getElementById('btnResetTop').textContent=t('resetAll');
  document.getElementById('lblXP').textContent=t('xp');
  document.getElementById('hSkills').textContent=t('skills');
  document.getElementById('hProblems').textContent=t('problems');
  problemTitle.textContent=t('startHint');
  document.getElementById('hDaily').firstChild.textContent=t('daily')+' ';
  document.getElementById('hDailySub').textContent=t('dailySub');
  document.getElementById('hSide').firstChild.textContent=t('side')+' ';
  document.getElementById('btnRerollSide').textContent=t('update');
  document.getElementById('hShop').textContent=t('shop');
  document.getElementById('shopDesc').textContent=t('shopDesc');
  document.getElementById('hUpload').textContent=t('upload');
  document.getElementById('lblChoose').textContent=t('choose');
  document.getElementById('btnApplyAvatar').textContent=t('applyAvatar');
  document.getElementById('btnClearAvatar').textContent=t('clearAvatar');
  document.getElementById('uploadHint').textContent=t('uploadHint');
  document.getElementById('hProfile').textContent=t('profile');
  document.getElementById('lblName').textContent=t('name');
  document.getElementById('lblGrade').textContent=t('grade');
  document.getElementById('lblRadar').textContent=t('radar');
  document.getElementById('lblSkillPanel').textContent=t('skillPanel');
  document.getElementById('btnClearAns').textContent=t('clear');
  document.getElementById('btnSubmitAns').textContent=t('submit');
}
function addNotif(msg){DB.notifs.push(msg);renderNotifs();save()}

// ===== Skills =====
const SKILL_NAMES={
  calc: L('資源搜尋','Scavenging'),
  geom: L('路線規劃','Route Planning'),
  algebra: L('交換談判','Barter & Negotiation'),
  apply: L('自我保護','Self‑Protection')
};
const gradeSkillsKeys=['calc','geom','algebra','apply'];
function ensureSkills(){ gradeSkillsKeys.forEach(k=>{ if(!DB.skills[k]) DB.skills[k]={name:SKILL_NAMES[k], xp:0, lvl:1, unlocked:true}; }); }

// ===== 題庫載入 =====
let dailyPool=[], sidePool=[];
async function loadTasks(){
  const [coreRes, dailyRes] = await Promise.all([
    fetch('./tasks/core.json'), fetch('./tasks/daily.json')
  ]);
  const [core, daily] = await Promise.all([coreRes.json(), dailyRes.json()]);
  dailyPool = core;
  sidePool = daily;
}
function genDaily(){DB.tasks=pick3(dailyPool).map(d=>({ ...d, done:false }))}
function genSide(){DB.side=pick3(sidePool).map(s=>({ ...s, done:false }))}

// ===== Rewards / Leveling =====
function onReward(xp,skillKey){
  DB.me.exp += xp;
  let need = needFor(DB.me.level);
  while(DB.me.exp >= need){ DB.me.exp -= need; DB.me.level++; DB.cards.refresh++; DB.me.coins += 50; DB.me.cls = rankFor(DB.me.level); addNotif(`[Lv Up] Lv.${DB.me.level} 卡 x1 + 金幣 50`); need = needFor(DB.me.level); }
  if(!DB.skills[skillKey]) DB.skills[skillKey]={name:SKILL_NAMES[skillKey]||L(skillKey,skillKey), xp:0, lvl:1, unlocked:true};
  const s=DB.skills[skillKey]; s.xp = Math.min(100, s.xp + Math.floor(xp));
  if(s.xp>=100){ s.xp=0; s.lvl=(s.lvl||1)+1; addNotif(`[技能升級] ${getText(s.name)} LV${s.lvl}`); }
}

// ===== Render =====
function bar(initPct,targetPct){const init=Math.max(0,Math.min(100,Number(initPct)));const target=Math.max(0,Math.min(100,Number(targetPct)));return `<div class='bar'><i data-w='${target}' style='width:${init}%'></i></div>`}
function animateBars(){document.querySelectorAll('.bar>i').forEach(i=>{const t=i.dataset.w;if(t!==undefined){requestAnimationFrame(()=>{i.style.width=t+'%';});}})}

function renderTop(){
  const need = needFor(DB.me.level); const pct = Math.round((DB.me.exp/need)*100);
  chipUser.textContent=`Lv.${DB.me.level} / ${pct}%`;
  chipCoins.textContent=`${t('coins')} ${DB.me.coins}`;
  DB.me.cls = rankFor(DB.me.level);
  chipCards.textContent=`${t('cards')} x${DB.cards.refresh}`;
  cardCountA.textContent=DB.cards.refresh;
}
function renderMeta(){
  meta.innerHTML='';
  const need = needFor(DB.me.level); const pct = Math.max(0,Math.min(100,Math.round((DB.me.exp/need)*100)));
  [[DB.lang==='zh'?'姓名':'Name',DB.me.name||'-'],[DB.lang==='zh'?'遊民':'Homeless',DB.me.title],[DB.lang==='zh'?'職階':'Rank',DB.me.cls||'銅牌'],['Lv.',DB.me.level]].forEach(([k,v])=>{
    const d=document.createElement('div'); d.innerHTML=`<span>${k}</span><strong>${v}</strong>`; meta.appendChild(d)
  });
  const tip = `${Math.floor(DB.me.exp)}/${need}`; charXP.dataset.w=pct; charXPNum.textContent=pct+'%';
  charXPWrap.setAttribute('title', tip); charXPNum.setAttribute('title', tip);
}
function renderNotifs(){ notifMain.innerHTML=''; DB.notifs.slice(-3).forEach(n=>{const li=document.createElement('li'); li.textContent=n; notifMain.appendChild(li)}) }
function renderSkills(){
  skillsBox.innerHTML='';
  Object.entries(DB.skills).forEach(([key,s])=>{
    const pct=s.xp, init=(typeof DB.ui.skillPct[key]==='number'?DB.ui.skillPct[key]:pct);
    const row=document.createElement('div'); row.className='stat';
    row.innerHTML=`<div class='skillName'><span>${getText(s.name)}</span><span class='lv'>LV${s.lvl||1}</span></div>${bar(init,pct)}<div class='val xpGold'>${Math.round(pct)}%</div>`;
    skillsBox.appendChild(row); DB.ui.skillPct[key]=pct
  })
}
function renderProfileSkills(){
  profileSkillsList.innerHTML='';
  Object.entries(DB.skills).forEach(([k,s])=>{
    const div=document.createElement('div');
    div.style.display='grid'; div.style.gridTemplateColumns='1fr auto'; div.style.gap='6px'; div.style.margin='4px 0';
    div.innerHTML = `<span class='skillName'>${getText(s.name)} <span class='lv'>LV${s.lvl||1}</span></span><span class='xpGold'>${Math.round(s.xp)}%</span>`;
    profileSkillsList.appendChild(div);
  })
}

function taskRow(task, isDaily){
  const el=document.createElement('div'); el.className='taskItem';
  const left=document.createElement('div'); left.className='taskname'; left.textContent=getText(task.title);
  const xp=document.createElement('div'); xp.className='xpGold'; xp.textContent=`+${task.xp} EXP`;
  const btn=document.createElement('button'); btn.className='btn'+(task.done?' done':''); btn.textContent= task.done ? t('completed') : t('begin');
  btn.onclick=()=>openQuestion(task, isDaily ? 'daily' : 'side', btn);
  el.appendChild(left); el.appendChild(xp); el.appendChild(btn);
  return el;
}
function renderTasks(){ tasksBox.innerHTML=''; DB.tasks.slice(0,3).forEach(t=> tasksBox.appendChild(taskRow(t,true))) }
function renderSide(){ sideBox.innerHTML=''; DB.side.slice(0,3).forEach(t=> sideBox.appendChild(taskRow(t,false))) }

function updateAll(){ renderI18n(); renderTop(); renderMeta(); renderSkills(); renderTasks(); renderSide(); renderNotifs(); drawRadar(); renderProfileSkills(); animateBars(); save() }

// ===== 作題區邏輯 =====
function openQuestion(task, bucket, btnRef){
  if(task.done){ problemTitle.textContent = DB.lang==='zh'?'此任務已完成':'Already completed'; problemBody.innerHTML=''; problemMsg.textContent=''; problemExplain.textContent=''; return; }
  DB.currentQ = { bucket, id:task.id };
  problemTitle.textContent = `${DB.lang==='zh'?'作答：':'Answer:'} ${getText(task.title)}`;
  problemMsg.textContent=''; problemMsg.className='msg'; problemExplain.textContent='';

  if(task.q.type==='fill'){
    problemBody.innerHTML = `
      <div class="problemBody">
        <div style="margin-bottom:6px">${getText(task.q.prompt)}</div>
        <input id="answerInput" placeholder="${DB.lang==='zh'?'請輸入答案':'Enter your answer'}" style="height:38px;width:240px;background:#0a1d2b;border:1px solid #62c8ff66;border-radius:8px;color:#eaffff;padding:0 8px;font-family:'Share Tech Mono',monospace" />
      </div>`;
  }else{
    const opts = task.q.options||[];
    problemBody.innerHTML = `
      <div class="problemBody">
        <div style="margin-bottom:6px">${getText(task.q.prompt)}</div>
        ${opts.map((o,i)=>`<label class="opt"><input type="radio" name="opt" value="${i}"/><span>${getText(o)}</span></label>`).join('')}
      </div>`;
  }
  btnSubmitAns.disabled=false; btnSubmitAns.textContent=t('submit');
  btnSubmitAns.onclick=()=>handleSubmit(task, btnRef);
  btnClearAns.onclick=()=>{ problemMsg.textContent=''; problemMsg.className='msg'; problemExplain.textContent=''; const input=document.getElementById('answerInput'); if(input) input.value=''; document.querySelectorAll('input[name=opt]').forEach(r=>r.checked=false); };
}

function handleSubmit(task, btnRef){
  if(task.done || btnSubmitAns.disabled) return;
  let correct=false;
  if(task.q.type==='fill'){
    const v=(document.getElementById('answerInput')?.value||'').trim();
    correct = (v === String(task.q.answer));
  }else{
    const r=[...document.querySelectorAll('input[name=opt]')].find(x=>x.checked);
    correct = r ? (Number(r.value)===Number(task.q.answer)) : false;
  }
  if(!correct){ problemMsg.textContent=t('wrong'); problemMsg.className='msg err'; return; }

  // 鎖定提交
  btnSubmitAns.disabled=true; btnSubmitAns.textContent= DB.lang==='zh' ? '已提交' : 'Submitted';
  problemMsg.textContent=t('correct'); problemMsg.className='msg ok';

  // 標記完成
  const idxDaily = DB.tasks.findIndex(t=>t.id===task.id);
  const inDaily = idxDaily>=0;
  if(inDaily){ DB.tasks[idxDaily].done=true; } else { const idxSide = DB.side.findIndex(t=>t.id===task.id); if(idxSide>=0) DB.side[idxSide].done=true; }

  // 經驗
  onReward(task.xp, task.skill);
  // 隨機金幣 1~3
  const coinBonus = 1 + Math.floor(Math.random()*3);
  DB.me.coins += coinBonus;
  addNotif(`${DB.lang==='zh'?'完成任務：':''}${getText(task.title)} (+${task.xp} EXP, +${coinBonus} ${t('coins')})`);

  // 解答邏輯
  const explain = task.explain ? getText(task.explain) : '';
  if(explain){ problemExplain.textContent = `${DB.lang==='zh'?'解題：':'Explanation:'} ${explain}`; problemExplain.className='msg ok'; }

  DB.history.push({type: inDaily?'daily':'side', id:task.id, skill:task.skill, time:Date.now(), ok:true, coins:coinBonus});
  updateAll();
}

// ===== Refresh / Shop =====
function confirmModal(msg,ok){ if(confirm(msg)) ok&&ok() }
btnRefreshDaily.onclick=()=>{ if(DB.cards.refresh>0){ DB.cards.refresh--; genDaily(); addNotif(DB.lang==='zh'?'使用刷新卡 x1':'Used refresh card x1'); updateAll() }else{ confirmModal(DB.lang==='zh'?'刷新卡不足，是否花 100 金幣購買 1 張？':'No card. Spend 100 coins to buy 1?',()=>{ if(DB.me.coins>=100){ DB.me.coins-=100; DB.cards.refresh++; addNotif(DB.lang==='zh'?'購買刷新卡 x1':'Bought refresh card x1'); updateAll() } else { addNotif(DB.lang==='zh'?'金幣不足':'Not enough coins') } }) } }
btnRerollSide.onclick=()=>{ genSide(); addNotif(DB.lang==='zh'?'已更新日常任務':'Side quests rerolled'); updateAll() }
btnBuy1.onclick=()=>{ if(DB.me.coins>=100){ DB.me.coins-=100; DB.cards.refresh+=1; addNotif(DB.lang==='zh'?'購買刷新卡 x1':'Bought x1'); updateAll()} else addNotif(DB.lang==='zh'?'金幣不足':'Not enough coins') }
btnBuy5.onclick=()=>{ if(DB.me.coins>=450){ DB.me.coins-=450; DB.cards.refresh+=5; addNotif(DB.lang==='zh'?'購買刷新卡 x5':'Bought x5'); updateAll()} else addNotif(DB.lang==='zh'?'金幣不足':'Not enough coins') }

// ===== Views =====
function setActive(btn){ document.querySelectorAll('.navBtn').forEach(b=>b.classList.remove('active')); btn.classList.add('active') }
btnViewDashboard.onclick=()=>{ viewDashboard.classList.remove('hidden'); viewCharacter.classList.add('hidden'); viewSettings.classList.add('hidden'); setActive(btnViewDashboard) }
btnViewCharacter.onclick=()=>{ viewDashboard.classList.add('hidden'); viewCharacter.classList.remove('hidden'); viewSettings.classList.add('hidden'); setActive(btnViewCharacter); applyAvatar() }
btnViewSettings.onclick=()=>{ viewDashboard.classList.add('hidden'); viewCharacter.classList.add('hidden'); viewSettings.classList.remove('hidden'); setActive(btnViewSettings); renderSettings(); drawRadar(); renderProfileSkills(); }
btnLang.onclick=()=>{ DB.lang = DB.lang==='zh'?'en':'zh'; addNotif(`Lang: ${DB.lang}`); save(); if(DB.currentQ){ const tsk= DB.tasks.find(x=>x.id===DB.currentQ.id) || DB.side.find(x=>x.id===DB.currentQ.id); if(tsk) openQuestion(tsk, null, null); else { problemTitle.textContent=t('startHint'); problemBody.innerHTML=''; problemMsg.textContent=''; } } updateAll(); }

// ===== Login streak =====
function handleLogin(){ const last = new Date(DB.login.last||0); const now=new Date(); const lastDay=last.toDateString(); const today=now.toDateString(); if(today!==lastDay){ DB.login.streak = ( (new Date(+last+86400000)).toDateString()===today ? DB.login.streak+1 : (DB.login.streak?1:1) ); DB.login.last=+now; addNotif(`Login x${DB.login.streak}`); if(DB.login.streak%7===0){ DB.cards.refresh++; addNotif('Weekly streak + card'); } save() } }

// ===== Settings on Profile page (only input fields) =====
s(){ inputName.value=DB.me.name||''; if(selectRank){ selectRank.innerHTML='<option>銅牌</option><option>銀牌</option><option>金牌</option><option>白金</option><option>翡翠</option><option>王者</option>'; selectRank.value = DB.me.cls || '銅牌'; } const metaS=document.getElementById('metaSettings'); metaS.innerHTML=''; [['姓名',DB.me.name||'-'],['職階',DB.me.cls||'銅牌'],['Lv.',DB.me.level]].forEach(([k,v])=>{ const d=document.createElement('div'); d.className='chip'; d.textContent=`${k}: ${v}`; metaS.appendChild(d) }); }: ${v}`; metaS.appendChild(d) }); }

// === Apply/Reset moved to Profile page (buttons' IDs unchanged) ===
btnApplyTop.onclick=()=>{
  DB.me.name=(inputName.value||'').trim(); const old=DB.me.cls; DB.me.cls=selectRank.value; if(DB.me.cls!==old){ addNotif(DB.lang==='zh'?`切換年級：${DB.me.cls}`:`Grade -> ${DB.me.cls}`) }
  save(); updateAll(); alert(t('applied'));
}
btnResetTop.onclick=()=>{ if(confirm(DB.lang==='zh'?t('confirmReset'):t('confirmResetEn'))){ try{ localStorage.removeItem(STORAGE_KEY); }catch(e){} DB=JSON.parse(JSON.stringify(DEFAULT_DB)); save(); location.reload(); } }

// ===== Avatar Upload / Apply =====
avatarInput && (avatarInput.onchange=(e)=>{ const file = e.target.files && e.target.files[0]; if(!file) return; const reader = new FileReader(); reader.onload=(ev)=>{ DB.me.avatarImg = ev.target.result; save(); addNotif(DB.lang==='zh'?'已載入角色圖片（尚未套用）':'Image loaded (not applied)'); }; reader.readAsDataURL(file); });
btnApplyAvatar && (btnApplyAvatar.onclick=()=>{ if(DB.me.avatarImg){ addNotif(DB.lang==='zh'?'角色圖片已套用':'Avatar applied'); applyAvatar(); } else { addNotif(DB.lang==='zh'?'尚未選擇圖片':'No image selected'); } });
btnClearAvatar && (btnClearAvatar.onclick=()=>{ DB.me.avatarImg=null; save(); applyAvatar(); addNotif(DB.lang==='zh'?'已移除自訂圖片':'Custom image removed'); });
function applyAvatar(){ if(DB.me.avatarImg){ avatarImg.src = DB.me.avatarImg; avatarImg.classList.remove('hidden'); avatarSVG.classList.add('hidden'); } else { avatarImg.src=''; avatarImg.classList.add('hidden'); avatarSVG.classList.remove('hidden'); } }

// ===== Radar Chart (shifted left; labels pushed outward) =====
function drawRadar(){
  const c = radarCanvas; if(!c) return;
  const ctx=c.getContext('2d'); const w=c.width, h=c.height;
  ctx.clearRect(0,0,w,h);

  // 中心點向左移一些，讓整張雷達圖更靠近畫布中線左側
  const cx=w/2 - 14, cy=h/2 + 10;
  const R=120;
  const N=gradeSkillsKeys.length;
  const values=gradeSkillsKeys.map(k=> Math.min(1,(DB.skills[k]?.lvl||1)/5));

  // rings
  ctx.strokeStyle='#62c8ff55'; ctx.fillStyle='#62c8ff16'; ctx.lineWidth=1;
  for(let ring=1; ring<=4; ring++){
    const r=R*ring/4; ctx.beginPath();
    for(let i=0;i<N;i++){
      const ang=-Math.PI/2 + i*2*Math.PI/N;
      const x=cx+r*Math.cos(ang), y=cy+r*Math.sin(ang);
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.closePath(); ctx.stroke();
  }

  // spokes + labels（把標籤半徑外推到 R+26，避免碰到雷達圖）
  ctx.fillStyle='#d6f8ff';
  ctx.font='12px "Share Tech Mono", monospace';
  ctx.textAlign='center';
  gradeSkillsKeys.forEach((k,i)=>{
    const ang=-Math.PI/2 + i*2*Math.PI/N;
    const x=cx+R*Math.cos(ang), y=cy+R*Math.sin(ang);
    ctx.strokeStyle='#62c8ff44';
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(x,y); ctx.stroke();
    const label=getText(SKILL_NAMES[k]);
    const lx = cx+(R+26)*Math.cos(ang), ly = cy+(R+26)*Math.sin(ang);
    ctx.fillText(label, lx, ly);
  });

  // shape
  ctx.beginPath();
  values.forEach((v,i)=>{
    const ang=-Math.PI/2 + i*2*Math.PI/N; const r=R*v;
    const x=cx+r*Math.cos(ang), y=cy+r*Math.sin(ang);
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.closePath();
  ctx.fillStyle='#62c8ff33'; ctx.fill();
  ctx.strokeStyle='#62c8ffcc'; ctx.stroke();
}

// ===== Init =====
function ensureInitial(){ ensureSkills(); if(DB.tasks.length===0) genDaily(); if(DB.side.length===0) genSide(); handleLogin(); applyAvatar(); }
async function start(){ await loadTasks(); ensureInitial(); updateAll(); }
start();
