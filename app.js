import { needFor, pick3, STORAGE_KEY, SafeStore } from './scripts/util.js';

// ===== Rank helper =====
function rankFor(level){
  if(level >= 50) return '王者';
  if(level >= 40) return '翡翠';
  if(level >= 30) return '白金'; 
  if(level >= 20) return '金牌';
  if(level >= 10) return '銀牌';
  return '銅牌';
}

// ===== DB =====
const DEFAULT_DB = {
  lang:'zh',
  me:{name:'',title:'職業',cls:'銅牌',level:1,exp:0,coins:200,avatarImg:null},
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
let DB = SafeStore.load(STORAGE_KEY) || JSON.parse(JSON.stringify(DEFAULT_DB));
function save(){ SafeStore.save(STORAGE_KEY, DB); }

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
const problemTitle=document.getElementById('problemTitle');
const problemBody=document.getElementById('problemBody');
const problemExplain=document.getElementById('problemExplain');
const problemMsg=document.getElementById('problemMsg');
const btnSubmitAns=document.getElementById('btnSubmitAns');
const btnClearAns=document.getElementById('btnClearAns');
const avatarInput=document.getElementById('avatarInput');
const btnApplyAvatar=document.getElementById('btnApplyAvatar');
const btnClearAvatar=document.getElementById('btnClearAvatar');
const inputName=document.getElementById('inputName');
const selectRank=document.getElementById('selectRank');
const radarCanvas=document.getElementById('radar');
const profileSkillsList=document.getElementById('profileSkillsList');
const btnRefreshDaily=document.getElementById('btnRefreshDaily');
const btnRerollSide=document.getElementById('btnRerollSide');
const btnBuy1=document.getElementById('btnBuy1');
const btnBuy5=document.getElementById('btnBuy5');

// ===== i18n =====
const I18N = {
  zh:{ navDash:'任務面板', navChar:'角色介面', navProfile:'個人資料', notif:'通知', character:'角色概況',
       apply:'套用', resetAll:'重置所有資料', xp:'角色經驗', skills:'技能與經驗', problems:'作題區',
       startHint:'請從右側任務選擇一題開始作答', daily:'核心任務', dailySub:'（每日 20:00 刷新）',
       side:'日常任務', update:'更新', shop:'卡片 / 商城',
       shopDesc:'刷新卡可用於重新抽核心任務。升級與連續登入可獲得卡片。',
       upload:'上傳角色圖片', choose:'選擇圖片', applyAvatar:'套用至角色介面', clearAvatar:'移除自訂圖片',
       uploadHint:'圖片將以 base64 儲存於本機，不會上傳到網路。',
       profile:'個人資料', name:'姓名', grade:'職階', radar:'能力雷達圖', skillPanel:'技能一覽',
       clear:'清除', submit:'提交', applied:'已套用', confirmReset:'確定重製資料？',
       confirmResetEn:'Reset all data?', completed:'完成', begin:'開始',
       wrong:'答錯了，請再試一次', correct:'答對！已發放經驗值', coins:'金幣', cards:'刷新卡',
       loginStreak:'登入連續天數'
  },
  en:{ navDash:'Dashboard', navChar:'Character', navProfile:'Profile', notif:'Notifications', character:'Overview',
       apply:'Apply', resetAll:'Reset All Data', xp:'Character EXP', skills:'Skills & EXP', problems:'Problem Area',
       startHint:'Pick a task on the right to start.', daily:'Daily Core', dailySub:'(refresh 20:00)',
       side:'Side Quests', update:'Reroll', shop:'Cards / Shop',
       shopDesc:'Use refresh cards to reroll core tasks. Earn by leveling and login streaks.',
       upload:'Upload Character Image', choose:'Choose Image', applyAvatar:'Apply to Character', clearAvatar:'Remove Custom Image',
       uploadHint:'Image stores locally, not uploaded.',
       profile:'Profile', name:'Name', grade:'Rank', radar:'Ability Radar', skillPanel:'Skills',
       clear:'Clear', submit:'Submit', applied:'Applied', confirmReset:'確定重製資料？',
       confirmResetEn:'Reset all data?', completed:'Done', begin:'Start',
       wrong:'Incorrect, try again.', correct:'Correct! EXP granted.', coins:'Coins', cards:'Refresh Cards',
       loginStreak:'Login Streak'
  }
};
function t(key){ return I18N[DB.lang][key] || key; }
function getText(v){ if(!v) return ''; if(typeof v==='string') return v; return v[DB.lang]||v.zh||v.en||''; }
function addNotif(msg){ DB.notifs.push(msg); renderNotifs(); save(); }

// ===== Skills =====
const SKILL_NAMES = {
  calc:{zh:'資源搜尋', en:'Scavenging'},
  geom:{zh:'路線規劃', en:'Route Planning'},
  algebra:{zh:'交換談判', en:'Barter & Negotiation'},
  apply:{zh:'自我保護', en:'Self-Protection'}
};
const gradeSkillsKeys=['calc','geom','algebra','apply'];
function ensureSkills(){
  gradeSkillsKeys.forEach(k=>{
    if(!DB.skills[k]) DB.skills[k]={name:SKILL_NAMES[k], xp:0, lvl:1, unlocked:true};
  });
}

// ===== 題庫載入 =====
let dailyPool=[], sidePool=[];
async function loadTasks(){
  try {
    const [coreRes, dailyRes] = await Promise.all([
      fetch('/core.json'), fetch('/daily.json')
    ]);
    dailyPool = await coreRes.json();
    sidePool = await dailyRes.json();
    console.log('Loaded tasks:', {dailyPool, sidePool});
  } catch(e){
    console.error('讀取任務失敗:', e);
    dailyPool=[]; sidePool=[];
  }
}
function genDaily(){ DB.tasks=pick3(dailyPool).map(d=>({...d,done:false})); }
function genSide(){ DB.side=pick3(sidePool).map(s=>({...s,done:false})); }

// ===== 其他函數（render, onReward, openQuestion, handleSubmit, refresh...） =====
// （保留和你之前一樣的邏輯，不需要重複貼完，只有 loadTasks 改動）

// ===== Init =====
function ensureInitial(){
  ensureSkills();
  if(DB.tasks.length===0) genDaily();
  if(DB.side.length===0) genSide();
}
async function start(){
  await loadTasks();
  ensureInitial();
  updateAll();
}
start();
