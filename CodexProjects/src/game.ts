export type PetKind = 'cat' | 'dog' | 'fox' | 'fantasy'
export type Theme = 'cozy' | 'night' | 'forest' | 'beach' | 'garden'
export type Stats = { hunger: number; happiness: number; energy: number; health: number; cleanliness: number }
export type Item = { id: string; name: string; category: 'Food' | 'Toy' | 'Accessory' | 'Outfit'; price: number; icon: string; description: string; owned?: boolean }
export type Game = { pet: PetKind; name: string; stats: Stats; coins: number; level: number; xp: number; theme: Theme; inventory: Record<string, number>; equipped: string | null; taskDate: string; tasks: Record<string, number>; claimed: string[]; log: string[]; sound: boolean }
type SavedGame = Partial<Game> & { lastActive?: number }
export const catalog: Item[] = [
  {id:'salmon',name:'Salmon bites',category:'Food',price:12,icon:'🐟',description:'A tiny tasty treat'}, {id:'berry',name:'Berry bowl',category:'Food',price:18,icon:'🫐',description:'Sweet and nourishing'}, {id:'ball',name:'Bouncy ball',category:'Toy',price:25,icon:'🎾',description:'For a playful afternoon'}, {id:'yarn',name:'Yarn ball',category:'Toy',price:20,icon:'🧶',description:'A classic favorite'}, {id:'scarf',name:'Sunny scarf',category:'Accessory',price:45,icon:'🧣',description:'A little pop of color'}, {id:'crown',name:'Tiny crown',category:'Accessory',price:80,icon:'👑',description:'Fit for a little royal'}, {id:'hoodie',name:'Cloud hoodie',category:'Outfit',price:65,icon:'🧥',description:'Extra cozy, extra cute'}, {id:'wings',name:'Dream wings',category:'Outfit',price:100,icon:'🪽',description:'Float through the day'}
]
export const themes: {id:Theme;name:string;icon:string}[] = [{id:'cozy',name:'Cozy room',icon:'🏡'},{id:'night',name:'Night room',icon:'🌙'},{id:'forest',name:'Forest',icon:'🌲'},{id:'beach',name:'Beach',icon:'🏖️'},{id:'garden',name:'Garden',icon:'🌷'}]
const day = () => new Date().toLocaleDateString('en-CA')
export const initialGame = (): Game => ({pet:'cat',name:'Mochi',stats:{hunger:76,happiness:84,energy:72,health:96,cleanliness:80},coins:120,level:1,xp:20,theme:'cozy',inventory:{},equipped:null,taskDate:day(),tasks:{visit:1},claimed:[],log:['Mochi moved into the cozy room.'],sound:true})
const clamp = (n:number) => Number.isFinite(n)?Math.max(0,Math.min(100,Math.round(n))):0
export function loadGame(): Game {
  try {
    const raw=localStorage.getItem('pocket-pal-v1'); if(!raw) return initialGame()
    const parsed=JSON.parse(raw) as SavedGame; const base=initialGame()
    if(!parsed || !parsed.stats || typeof parsed.stats.hunger!=='number') return base
    const saved={...base,...parsed,pet:['cat','dog','fox','fantasy'].includes(parsed.pet??'')?parsed.pet!:base.pet,theme:['cozy','night','forest','beach','garden'].includes(parsed.theme??'')?parsed.theme!:base.theme,stats:{...base.stats,...parsed.stats},inventory:parsed.inventory&&typeof parsed.inventory==='object'?parsed.inventory:{},tasks:parsed.tasks&&typeof parsed.tasks==='object'?parsed.tasks:{},claimed:Array.isArray(parsed.claimed)?parsed.claimed:[],log:Array.isArray(parsed.log)?parsed.log:[]}
    Object.keys(saved.stats).forEach(k=>{saved.stats[k as keyof Stats]=clamp(saved.stats[k as keyof Stats])})
    const elapsed=Math.max(0,Math.min(48,(Date.now()-(Number(parsed.lastActive)||Date.now()))/3600000))
    saved.stats.hunger=clamp(saved.stats.hunger-elapsed*2.2); saved.stats.energy=clamp(saved.stats.energy-elapsed*1.1); saved.stats.cleanliness=clamp(saved.stats.cleanliness-elapsed*.8)
    const needsCare=saved.stats.hunger<30||saved.stats.energy<20||saved.stats.cleanliness<25
    if(needsCare){saved.stats.happiness=clamp(saved.stats.happiness-elapsed*.55);saved.stats.health=clamp(saved.stats.health-elapsed*.28)}
    else if(saved.stats.hunger>65&&saved.stats.energy>55&&saved.stats.cleanliness>60){saved.stats.health=clamp(saved.stats.health+elapsed*.12)}
    if(saved.taskDate!==day()){saved.taskDate=day();saved.tasks={visit:1};saved.claimed=[]}
    return saved
  } catch { return initialGame() }
}
export function saveGame(g:Game) { try { localStorage.setItem('pocket-pal-v1',JSON.stringify({...g,lastActive:Date.now()})) } catch { /* storage may be disabled */ } }
export function mood(s:Stats) { if(s.health<30) return 'Needs care'; if(s.energy<24) return 'Sleepy'; if(s.hunger<25) return 'Hungry'; if(s.happiness<30) return 'A little sad'; if(s.happiness>78&&s.energy>52) return 'So happy'; return 'Feeling good' }
export function act(g:Game, action:'feed'|'play'|'sleep'|'clean') {
 const s={...g.stats}; const inventory={...g.inventory}; let phrase=''; let xp=8; let coins=2
 if(action==='feed'){s.hunger=clamp(s.hunger+28);s.happiness=clamp(s.happiness+5);phrase='Yum, thank you!'; if(inventory.salmon||inventory.berry){const id=inventory.salmon?'salmon':'berry';inventory[id]--;phrase='That was delicious!';}}
 if(action==='play'){s.happiness=clamp(s.happiness+20);s.energy=clamp(s.energy-16);s.hunger=clamp(s.hunger-8);phrase="Let's play!";xp=12;coins=4}
 if(action==='sleep'){s.energy=clamp(s.energy+34);s.health=clamp(s.health+3);phrase='A little rest feels lovely.';xp=5}
 if(action==='clean'){s.cleanliness=clamp(s.cleanliness+38);s.happiness=clamp(s.happiness+4);phrase='Fresh and fluffy!';xp=7}
 const next={...g,stats:s,inventory,xp:g.xp+xp,coins:g.coins+coins,log:[`${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})} · ${action[0].toUpperCase()+action.slice(1)} time`,...g.log].slice(0,12)}
 const task=action==='feed'?'feed':action==='play'?'play':null; if(task) next.tasks={...next.tasks,[task]:Math.min(1,(next.tasks[task]||0)+1)}
 if(action==='clean')next.tasks={...next.tasks,clean:1}
 if(s.hunger>55&&s.happiness>55&&s.cleanliness>55&&s.energy>35)next.tasks={...next.tasks,healthy:1}
 if((next.tasks.feed||0)>0&&(next.tasks.play||0)>0&&(next.tasks.clean||0)>0)next.tasks={...next.tasks,routine:1}
 while(next.xp>=100){next.xp-=100;next.level++;next.coins+=25;const milestone=next.level===2?'scarf':next.level===4?'crown':null;if(milestone)next.inventory[milestone]=(next.inventory[milestone]||0)+1;next.log=[`✨ Level ${next.level}! ${milestone?'A new look joined your bag and you earned 25 coins':'You earned a 25 coin milestone gift'}`,...next.log]}
 return {game:next,phrase}
}
