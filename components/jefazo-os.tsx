"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
// EL JEFAZO OS v5 — MASTER CONTROL PWA (Next.js Build)
// ═══════════════════════════════════════════════════════════════

const BUGATTI_IMG = "/bugatti.jpg";

const T = {
  bg: "#000410", bgCard: "#0A1628", bgCardLight: "#0D1E35",
  border: "#1A5A8A", borderBright: "#2080C0",
  neon: "#00C8FF", neonBright: "#60E8FF", neonWhite: "#C0F4FF",
  electric: "#3A9FFF", white: "#E0F4FF", gray: "#5A8AAA", grayLight: "#7AACCC",
  dark: "#050C18", glow: "#0060DD", deepBlue: "#001830", accent: "#0090E0",
  red: "#FF4466", redDark: "#802030", green: "#00FF80", greenDark: "#005530",
  orange: "#FFA040", yellow: "#FFE040",
};
const APP_VERSION = "5.0.0";

// ── PERSISTENCE ────────────────────────────────────────────
const LS = {
  get: (k: string, d: unknown) => { try { const v = typeof window !== "undefined" ? localStorage.getItem("jz_" + k) : null; return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k: string, v: unknown) => { try { if (typeof window !== "undefined") localStorage.setItem("jz_" + k, JSON.stringify(v)); } catch {} },
};
const semver = {
  parse: (v: string) => (v||"0.0.0").replace(/^v/,"").split(".").map(Number),
  gt: (a: string, b: string) => { const pa=semver.parse(a),pb=semver.parse(b); for(let i=0;i<3;i++){if(pa[i]>pb[i])return true;if(pa[i]<pb[i])return false;} return false; },
};
const delay = (ms=800) => new Promise(r => setTimeout(r, ms + Math.random()*400));
void delay;
const uid = () => Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const daysUntil = (d: string) => { const now=new Date(),t=new Date(d); return Math.ceil((t.getTime()-now.getTime())/86400000); };
const fmtDate = (d: string) => { try{return new Date(d).toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit",year:"2-digit"});}catch{return"-";} };
const fmtDT = (d: string | Date) => { try{return new Date(d).toLocaleString("es-ES",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});}catch{return"-";} };

interface Renovacion {
  id: string;
  nombre: string;
  tipo: string;
  fechaRenovacion: string;
  precio: string;
  notas: string;
  recordatorioActivado: boolean;
  snoozeUntil: string | null;
}

interface Clone {
  id: string;
  name: string;
  desc: string;
  tipo: string;
  icon: string;
  vi: string;
  vd: string;
  estado: string;
  server: string;
  sync: string;
  upd: string;
  perm: string;
  ch: string;
  auto: boolean;
  logs: string[];
  prev: string | null;
}

interface GlobalState {
  master: boolean;
  maintenance: boolean;
  emergency: boolean;
  autoUpdate: boolean;
}

const renovEstado = (r: Renovacion) => {
  if(r.snoozeUntil && new Date(r.snoozeUntil)>new Date()) return "SNOOZED";
  const d=daysUntil(r.fechaRenovacion);
  if(d<0) return "VENCIDO"; if(d<=3) return "CRITICO"; if(d<=7) return "PROXIMO"; return "OK";
};
const estColor: Record<string, string> = {OK:T.green,PROXIMO:T.orange,CRITICO:T.red,VENCIDO:T.red,SNOOZED:T.gray};

// ── MARKETPLACE DATA ───────────────────────────────────────
const MP_CLONES = [
  {id:"fitness",name:"CENTRO FITNESS LITE",desc:"App de entrenamiento completa",tipo:"fitness",ver:"2.4.0",size:"12.3 MB",cat:"Salud",icon:"💪"},
  {id:"nutri",name:"NUTRI-COACH PREMIUM",desc:"Nutricion con IA avanzada",tipo:"nutricion",ver:"1.9.2",size:"8.7 MB",cat:"Salud",icon:"🥗"},
  {id:"yoga",name:"YOGA STUDIO BASE",desc:"Yoga con seguimiento",tipo:"bienestar",ver:"1.6.0",size:"15.1 MB",cat:"Bienestar",icon:"🧘"},
  {id:"strength",name:"ELITE STRENGTH",desc:"Programa de fuerza elite",tipo:"fitness",ver:"1.6.1",size:"10.2 MB",cat:"Fitness",icon:"⚡"},
  {id:"cardio",name:"CARDIO BLAST PRO",desc:"Cardio intenso",tipo:"fitness",ver:"3.1.0",size:"9.8 MB",cat:"Fitness",icon:"🏃"},
  {id:"mind",name:"MINDFULNESS APP",desc:"Meditacion guiada",tipo:"bienestar",ver:"2.0.0",size:"6.4 MB",cat:"Bienestar",icon:"🧠"},
  {id:"shop",name:"TIENDA ONLINE",desc:"E-commerce con pagos",tipo:"comercio",ver:"4.2.1",size:"22.5 MB",cat:"Comercio",icon:"🛒"},
  {id:"crm",name:"CRM JEFAZO",desc:"Gestion de clientes",tipo:"negocio",ver:"1.0.0",size:"18.9 MB",cat:"Negocio",icon:"📊"},
];
const DEF_CLONES: Clone[] = [
  {id:"fitness",name:"CENTRO FITNESS LITE",desc:"App fitness",tipo:"fitness",vi:"2.3.1",vd:"2.4.0",estado:"ACTIVO",server:"ONLINE",sync:"2026-02-09T10:30:00Z",upd:"2026-02-07T08:00:00Z",perm:"Admin",icon:"💪",ch:"stable",auto:false,logs:["Instalado v2.3.1"],prev:"2.2.0"},
  {id:"nutri",name:"NUTRI-COACH PREMIUM",desc:"Nutricion IA",tipo:"nutricion",vi:"1.8.0",vd:"1.9.2",estado:"ACTIVO",server:"ONLINE",sync:"2026-02-08T14:00:00Z",upd:"2026-01-15T12:00:00Z",perm:"User",icon:"🥗",ch:"stable",auto:true,logs:["Instalado v1.8.0"],prev:"1.7.0"},
  {id:"yoga",name:"YOGA STUDIO BASE",desc:"Yoga",tipo:"bienestar",vi:"1.5.0",vd:"1.6.0",estado:"INACTIVO",server:"OFFLINE",sync:"2026-01-20T09:00:00Z",upd:"2026-01-10T10:00:00Z",perm:"User",icon:"🧘",ch:"beta",auto:false,logs:["Instalado v1.5.0"],prev:"1.4.0"},
];
const DEF_RENOV: Renovacion[] = [
  {id:"r1",nombre:"Dominio jefazo.app",tipo:"dominio",fechaRenovacion:"2026-02-13T00:00:00Z",precio:"14.99€",notas:"GoDaddy",recordatorioActivado:true,snoozeUntil:null},
  {id:"r2",nombre:"Hosting Vercel Pro",tipo:"hosting",fechaRenovacion:"2026-03-01T00:00:00Z",precio:"20€/mes",notas:"",recordatorioActivado:true,snoozeUntil:null},
  {id:"r3",nombre:"API OpenAI",tipo:"api",fechaRenovacion:"2026-02-11T00:00:00Z",precio:"50€",notas:"Plan Plus",recordatorioActivado:true,snoozeUntil:null},
];


// ═══════════════════════════════════════════════════════════════
// GLOBAL CSS
// ═══════════════════════════════════════════════════════════════
const GlobalCSS = () => (
  <style dangerouslySetInnerHTML={{__html: `
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@400;500;600;700&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body,html{margin:0;padding:0;background:#000410;font-family:'Rajdhani',sans-serif;color:#E0F4FF;-webkit-font-smoothing:antialiased;overflow:hidden;height:100vh;width:100vw}
    ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(0,200,255,0.25);border-radius:3px}
    @keyframes neonSweep{0%{background-position:0% 0%}100%{background-position:400% 0%}}
    @keyframes slideIn{from{opacity:0;transform:translateX(60px)}to{opacity:1;transform:translateX(0)}}
    @keyframes slideOut{from{opacity:1;transform:translateX(0)}to{opacity:0;transform:translateX(-60px)}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes stagger{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
    @keyframes toastPop{from{opacity:0;transform:translateY(25px) scale(0.94)}to{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes borderGlow{0%,100%{box-shadow:0 0 8px rgba(0,200,255,0.2),0 0 20px rgba(0,100,220,0.1)}50%{box-shadow:0 0 16px rgba(0,200,255,0.4),0 0 40px rgba(0,100,220,0.2)}}
    @keyframes accessPulse{0%{opacity:0;transform:scale(0.7)}30%{opacity:1;transform:scale(1.08)}50%{transform:scale(1)}100%{opacity:1;transform:scale(1)}}
    @keyframes loadBar{0%{width:0%}100%{width:100%}}
    @keyframes loadGlow{0%,100%{box-shadow:0 0 10px rgba(0,200,255,0.6)}50%{box-shadow:0 0 20px rgba(0,200,255,0.9)}}
    @keyframes greenFlash{0%{opacity:0}20%{opacity:1}80%{opacity:1}100%{opacity:0}}
    @keyframes sirenPulse{0%,100%{opacity:0.6;text-shadow:0 0 20px #FF4466}50%{opacity:1;text-shadow:0 0 60px #FF4466}}
    @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    @keyframes flickerTitle{0%,92%,94%,98%,100%{opacity:1}93%{opacity:0.7}97%{opacity:0.8}}
    @keyframes scanlines{0%{background-position:0 0}100%{background-position:0 4px}}
  `}} />
);

// ═══════════════════════════════════════════════════════════════
// REUSABLE COMPONENTS
// ═══════════════════════════════════════════════════════════════
const NeonBorder = ({children,on=true,r=16,glow=1,color,style:sx={}}: {children: React.ReactNode; on?: boolean; r?: number; glow?: number; color?: string; style?: React.CSSProperties}) => {
  const c=color||T.neon, c2=color||T.electric;
  return (
    <div style={{position:"relative",borderRadius:r,padding:1.5,
      background:on?`linear-gradient(90deg,transparent,${c}00 10%,${c2}88 40%,${c} 50%,${c2}88 60%,${c}00 90%,transparent)`:`linear-gradient(135deg,${T.border}66,${T.border}33)`,
      backgroundSize:on?"400% 100%":"100% 100%",animation:on?"neonSweep 4s linear infinite":"none",
      boxShadow:on?`0 0 ${16*glow}px ${c}33,0 0 ${40*glow}px ${c}18`:"none",...sx}}>
      <div style={{borderRadius:r-1.5,overflow:"hidden",background:T.bgCard}}>{children}</div>
    </div>
  );
};

const Btn = ({children,onClick,primary=true,w="100%",h=48,neon=true,glow=1,fs=12,danger=false,success=false,icon=null,disabled=false,neonColor}: {children: React.ReactNode; onClick?: () => void; primary?: boolean; w?: string; h?: number; neon?: boolean; glow?: number; fs?: number; danger?: boolean; success?: boolean; icon?: React.ReactNode; disabled?: boolean; neonColor?: string}) => {
  const [pr,setPr]=useState(false),[hov,setHov]=useState(false);
  const bg=danger?"#802020":success?"#105530":primary?"#0A3058":"transparent";
  const bg2=danger?"#A03030":success?"#187740":primary?"#184878":"transparent";
  const bc=danger?"#CC4444":success?"#22CC66":primary?T.borderBright:T.border;
  const tc=danger?"#FF8888":success?"#66FFAA":T.neonBright;
  const inner=(
    <button onClick={disabled?undefined:onClick} onPointerDown={()=>!disabled&&setPr(true)} onPointerUp={()=>setPr(false)} onPointerLeave={()=>{setPr(false);setHov(false)}} onPointerEnter={()=>!disabled&&setHov(true)}
      style={{width:"100%",height:h,position:"relative",overflow:"hidden",border:`1.5px solid ${bc}${primary||danger||success?"88":""}`,borderRadius:12,opacity:disabled?0.4:1,
        background:primary||danger||success?`linear-gradient(180deg,${bg2} 0%,${bg} 40%,${T.dark} 100%)`:"linear-gradient(180deg,rgba(15,30,55,0.4) 0%,rgba(5,12,24,0.6) 100%)",
        color:tc,fontSize:fs,fontWeight:700,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.14em",cursor:disabled?"not-allowed":"pointer",
        transform:pr?"scale(0.95) translateY(2px)":hov?"scale(1.01) translateY(-1px)":"scale(1)",transition:"all 0.15s cubic-bezier(0.34,1.56,0.64,1)",
        boxShadow:(primary||danger||success)&&!disabled?pr?`0 1px 4px #000c`:`0 4px 16px #000a,0 0 ${hov?20:8}px ${bc}1a`:"none",
        textShadow:`0 0 12px ${tc}66`,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
      {hov&&!disabled&&<div style={{position:"absolute",inset:0,background:`linear-gradient(90deg,transparent 30%,rgba(0,200,255,0.04) 50%,transparent 70%)`,backgroundSize:"200% 100%",animation:"shimmer 2.5s ease-in-out infinite"}}/>}
      {icon&&<span style={{fontSize:fs+4,lineHeight:1}}>{icon}</span>}{children}
    </button>
  );
  if(neon) return <NeonBorder on={!disabled} r={12} glow={glow} style={{width:w}} color={neonColor||(danger?T.red:success?T.green:undefined)}>{inner}</NeonBorder>;
  return <div style={{width:w}}>{inner}</div>;
};

const Card = ({children,neon=false,glow=0.5,style:sx={},neonColor}: {children: React.ReactNode; neon?: boolean; glow?: number; style?: React.CSSProperties; neonColor?: string}) => {
  const inner=<div style={{padding:16,...sx}}>{children}</div>;
  if(neon) return <NeonBorder on r={16} glow={glow} color={neonColor}>{inner}</NeonBorder>;
  return <div style={{padding:16,background:`linear-gradient(145deg,${T.bgCardLight},${T.bgCard})`,borderRadius:16,border:`1px solid ${T.border}44`,boxShadow:`0 2px 12px ${T.neon}08`,animation:"borderGlow 4.5s ease-in-out infinite",...sx}}>{children}</div>;
};

const InputField = ({placeholder,type="text",value,onChange,style:sx={}}: {placeholder?: string; type?: string; value?: string; onChange?: React.ChangeEventHandler<HTMLInputElement>; style?: React.CSSProperties}) => {
  const [f,setF]=useState(false);
  return <input type={type} placeholder={placeholder} value={value} onChange={onChange} onFocus={()=>setF(true)} onBlur={()=>setF(false)}
    style={{width:"100%",height:44,background:"#060E1C",border:`1.5px solid ${f?T.neon:T.border}`,borderRadius:10,color:T.white,fontSize:13,fontWeight:600,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.06em",padding:"0 14px",outline:"none",boxShadow:f?`0 0 14px ${T.neon}28`:`inset 0 2px 6px #0006`,transition:"all 0.2s",...sx}}/>;
};

const Toggle = ({on,set}: {on: boolean; set: (v: boolean) => void}) => (
  <div onClick={()=>set(!on)} style={{width:52,height:28,borderRadius:14,cursor:"pointer",position:"relative",flexShrink:0,background:on?`linear-gradient(135deg,#0060CC,${T.neon})`:`linear-gradient(135deg,#0A1520,#0A1828)`,border:`1.5px solid ${on?T.neon+"66":T.border+"55"}`,boxShadow:on?`0 0 14px ${T.neon}44`:"inset 0 2px 6px #0008",transition:"all 0.25s cubic-bezier(0.34,1.56,0.64,1)"}}>
    <div style={{width:20,height:20,borderRadius:"50%",position:"absolute",top:2.5,left:on?26:3,background:on?"radial-gradient(circle at 35% 30%,#fff,#90E0FF)":"radial-gradient(circle at 35% 30%,#445566,#223344)",boxShadow:on?`0 0 8px ${T.neon}88`:"0 2px 4px #0008",transition:"all 0.25s cubic-bezier(0.34,1.56,0.64,1)"}}/>
  </div>
);

const Toast = ({msg,on,hide}: {msg: string; on: boolean; hide: () => void}) => {
  useEffect(()=>{if(on){const t=setTimeout(hide,2400);return()=>clearTimeout(t)}},[on,hide]);
  if(!on) return null;
  return <div style={{position:"fixed",bottom:40,left:"50%",transform:"translateX(-50%)",zIndex:9999,animation:"toastPop 0.3s cubic-bezier(0.34,1.56,0.64,1)"}}>
    <div style={{background:`linear-gradient(135deg,#0C2040,#061020)`,border:`1px solid ${T.neon}44`,borderRadius:14,padding:"12px 26px",color:T.neonBright,fontSize:13,fontWeight:700,fontFamily:"'Rajdhani',sans-serif",boxShadow:`0 8px 32px #000c,0 0 30px ${T.neon}18`,display:"flex",alignItems:"center",gap:10,whiteSpace:"nowrap",maxWidth:"90vw"}}>
      <span style={{color:T.neon,fontSize:16}}>{"◈"}</span>{msg}
    </div>
  </div>;
};

const Label = ({children}: {children: React.ReactNode}) => <div style={{fontSize:10,fontWeight:700,color:T.gray,letterSpacing:"0.18em",marginBottom:10,textTransform:"uppercase",fontFamily:"'Orbitron',sans-serif"}}>{children}</div>;
const Badge = ({text,color=T.neon}: {text: string; color?: string}) => <span style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:6,color,background:`${color}15`,border:`1px solid ${color}33`,letterSpacing:"0.08em"}}>{text}</span>;
const HudStat = ({label,value,color=T.neon}: {label: string; value: number | string; color?: string}) => <div style={{textAlign:"center",flex:1}}><div style={{fontSize:20,fontWeight:900,color,fontFamily:"'Orbitron',sans-serif",textShadow:`0 0 12px ${color}66`}}>{value}</div><div style={{fontSize:8,fontWeight:700,color:T.gray,letterSpacing:"0.12em",marginTop:2,textTransform:"uppercase"}}>{label}</div></div>;

const Header = ({title,sub,back,icon="⬡"}: {title: string; sub?: string; back?: () => void; icon?: string}) => (
  <div style={{padding:"16px 16px 0",animation:"fadeUp 0.3s ease-out"}}>
    {back&&<button onClick={back} style={{background:"none",border:"none",cursor:"pointer",padding:"6px 2px",display:"flex",alignItems:"center",gap:6,color:T.neon,fontSize:13,fontWeight:700,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.08em",marginBottom:4}}>
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke={T.neon} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>BACK
    </button>}
    <div style={{display:"flex",alignItems:"center",gap:12}}>
      <div style={{width:30,height:30,border:`1.5px solid ${T.neon}44`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 0 12px ${T.neon}22`,fontSize:14,color:T.neon}}>{icon}</div>
      <div>
        <h1 style={{fontSize:18,fontWeight:800,letterSpacing:"0.14em",margin:0,color:T.white,fontFamily:"'Orbitron',sans-serif",textShadow:`0 0 14px ${T.neon}33`,animation:"flickerTitle 8s infinite"}}>{title}</h1>
        {sub&&<p style={{fontSize:11,fontWeight:600,color:T.gray,marginTop:1,letterSpacing:"0.06em"}}>{sub}</p>}
      </div>
    </div>
    <div style={{height:1,background:`linear-gradient(90deg,${T.neon}44,${T.border}22,transparent)`,marginTop:12}}/>
  </div>
);

const Screen = ({children}: {children: React.ReactNode}) => (
  <div style={{width:"100%",height:"100%",background:`radial-gradient(ellipse at 50% 0%,#011A40,${T.bg} 55%)`,display:"flex",flexDirection:"column",overflow:"hidden",position:"relative"}}>
    <div style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:0,opacity:0.03,background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,200,255,0.1) 2px,rgba(0,200,255,0.1) 4px)"}}/>
    {children}
  </div>
);

const Modal = ({open,onClose,title,children}: {open: boolean; onClose: () => void; title: string; children: React.ReactNode}) => {
  if(!open) return null;
  return <div style={{position:"fixed",inset:0,zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
    <div style={{position:"absolute",inset:0,background:"rgba(0,2,8,0.85)"}}/>
    <div onClick={e=>e.stopPropagation()} style={{position:"relative",width:"100%",maxWidth:420,maxHeight:"85vh",zIndex:1}}>
      <NeonBorder on r={18} glow={1.2}>
        <div style={{padding:20,maxHeight:"85vh",overflowY:"auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <h2 style={{fontSize:16,fontWeight:800,color:T.white,fontFamily:"'Orbitron',sans-serif",letterSpacing:"0.1em"}}>{title}</h2>
            <button onClick={onClose} style={{background:"none",border:"none",color:T.gray,fontSize:20,cursor:"pointer",padding:4}}>{"✕"}</button>
          </div>
          {children}
        </div>
      </NeonBorder>
    </div>
  </div>;
};


// ═══════════════════════════════════════════════════════════════
// QUICK ACTIONS FAB
// ═══════════════════════════════════════════════════════════════
const QuickActions = ({onSync,onUpdate,onExport,onImport,onEmergency,emergency}: {onSync: () => void; onUpdate: () => void; onExport: () => void; onImport: () => void; onEmergency: () => void; emergency: boolean}) => {
  const [open,setOpen]=useState(false);
  const acts=[{i:"🔄",l:"SYNC TODO",fn:onSync},{i:"⬆️",l:"UPDATE TODO",fn:onUpdate},{i:"🧾",l:"EXPORTAR",fn:onExport},{i:"📥",l:"IMPORTAR",fn:onImport},{i:"🚨",l:emergency?"EMERG OFF":"EMERG ON",fn:onEmergency,d:true}];
  return <>
    <div onClick={()=>setOpen(!open)} style={{position:"fixed",bottom:16,right:16,zIndex:800,width:48,height:48,borderRadius:"50%",background:`linear-gradient(135deg,#0A3058,#184878)`,border:`2px solid ${T.neon}66`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:`0 0 20px ${T.neon}44`,fontSize:20,transform:open?"rotate(45deg)":"none",transition:"transform 0.3s"}}>{"⚡"}</div>
    {open&&<div style={{position:"fixed",bottom:72,right:16,zIndex:800,display:"flex",flexDirection:"column",gap:8,animation:"fadeUp 0.2s ease-out"}}>
      {acts.map(a=><div key={a.l} onClick={()=>{a.fn();setOpen(false)}} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 14px",borderRadius:10,cursor:"pointer",background:a.d?"linear-gradient(135deg,#301020,#200818)":"linear-gradient(135deg,#0C2040,#061020)",border:`1px solid ${a.d?T.red+"44":T.neon+"33"}`,color:a.d?T.red:T.neonBright,fontSize:11,fontWeight:700,letterSpacing:"0.08em",boxShadow:`0 4px 16px #000a`}}>
        <span style={{fontSize:14}}>{a.i}</span>{a.l}
      </div>)}
    </div>}
  </>;
};

// ═══════════════════════════════════════════════════════════════
// LOGIN SCREEN
// ═══════════════════════════════════════════════════════════════
const LoginInput = ({placeholder,type="text",value,onChange}: {placeholder?: string; type?: string; value?: string; onChange?: React.ChangeEventHandler<HTMLInputElement>}) => {
  const [f,setF]=useState(false);
  return <div style={{borderRadius:8,padding:1.5,background:f?`linear-gradient(90deg,${T.neon}00,${T.electric}bb,${T.neonBright},${T.electric}bb,${T.neon}00)`:`linear-gradient(90deg,${T.neon}55,${T.electric}77,${T.neonBright}88,${T.electric}77,${T.neon}55)`,backgroundSize:f?"200% 100%":"100% 100%",animation:f?"neonSweep 2.5s linear infinite":"none",boxShadow:f?`0 0 18px ${T.neon}55`:`0 0 10px ${T.neon}22`,transition:"box-shadow 0.3s"}}>
    <input type={type} placeholder={placeholder} value={value} onChange={onChange} onFocus={()=>setF(true)} onBlur={()=>setF(false)}
      style={{width:"100%",height:"5.5vh",minHeight:38,maxHeight:48,background:"rgba(6,14,28,0.95)",border:"none",borderRadius:6.5,color:T.white,fontSize:"clamp(13px, 2vh, 16px)",fontWeight:700,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.12em",padding:"0 16px",outline:"none"}}/>
  </div>;
};

const LoginScreen = ({go}: {go: () => void}) => {
  const [u,setU]=useState("");const [pw,setPw]=useState("");
  const [loading,setLoading]=useState(false);const [granted,setGranted]=useState(false);
  const [error,setError]=useState("");
  const doLogin=()=>{
    if(loading)return;
    if(u.trim().toLowerCase()!=="el jefazo"||pw!=="berzosa15031980"){
      setError("CREDENCIALES INCORRECTAS");setTimeout(()=>setError(""),2500);return;
    }
    setLoading(true);setTimeout(()=>{setGranted(true);setTimeout(()=>go(),1800)},1500);
  };
  return (
    <div style={{width:"100%",height:"100%",background:"radial-gradient(ellipse at 50% 30%, #021840 0%, #000a1a 40%, #000308 70%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",overflow:"hidden",position:"relative",padding:"4vh 0 3vh"}}>
      {/* Lightning background effect */}
      <div style={{position:"absolute",inset:0,pointerEvents:"none",
        background:"radial-gradient(ellipse at 20% 10%, rgba(0,100,255,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 15%, rgba(0,150,255,0.06) 0%, transparent 40%)",
        zIndex:0}}/>

      {/* TITULO EL JEFAZO - Chrome/Silver metal like the reference photo */}
      <div style={{animation:"fadeUp 0.4s ease-out",textAlign:"center",flexShrink:0,zIndex:1}}>
        <div style={{
          fontSize:"clamp(36px, 11vw, 56px)",fontWeight:900,fontFamily:"'Orbitron',sans-serif",letterSpacing:"0.08em",lineHeight:1,
          color:"#D8DDE4",
          textShadow:`
            0 1px 0 #C0C4CC,
            0 2px 0 #A8ACB4,
            0 3px 0 #90949C,
            0 4px 0 #787C84,
            0 5px 0 #60646C,
            0 6px 12px rgba(0,0,0,0.95),
            0 0 30px rgba(180,200,220,0.25),
            0 0 60px rgba(100,140,180,0.15),
            0 -1px 2px rgba(255,255,255,0.35)
          `,
        }}>EL JEFAZO</div>
      </div>

      {/* BUGATTI - same size as original, just flipped */}
      <div style={{width:"92%",maxWidth:400,position:"relative",animation:"fadeUp 0.5s ease-out 0.1s both",flexShrink:1,minHeight:0,zIndex:1}}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={BUGATTI_IMG} alt="El Jefazo" style={{width:"100%",height:"auto",display:"block",borderRadius:12,filter:"brightness(1.1) contrast(1.08) saturate(1.12)",transform:"scaleX(-1)"}}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:"25%",borderRadius:"0 0 12px 12px",background:"linear-gradient(transparent,#000308)"}}/>
      </div>

      {/* LOGIN FORM SECTION */}
      <div style={{width:"85%",maxWidth:360,display:"flex",flexDirection:"column",gap:"1.2vh",animation:"fadeUp 0.6s ease-out 0.2s both",flexShrink:0,zIndex:1}}>
        {/* SYSTEM IDENTIFICATION label */}
        <div style={{textAlign:"center",marginBottom:"0.5vh"}}>
          <div style={{fontSize:"clamp(11px, 1.8vh, 14px)",fontWeight:700,fontFamily:"'Orbitron',sans-serif",letterSpacing:"0.25em",color:"#4090BB",textShadow:"0 0 10px rgba(0,150,255,0.3)"}}>SYSTEM IDENTIFICATION</div>
        </div>

        <LoginInput placeholder="USUARIO / ID" value={u} onChange={e=>setU(e.target.value)}/>
        <LoginInput placeholder={"CONTRASE\u00D1A"} type="password" value={pw} onChange={e=>setPw(e.target.value)}/>

        {error&&<div style={{color:T.red,fontSize:12,fontWeight:700,fontFamily:"'Orbitron',sans-serif",letterSpacing:"0.08em",textAlign:"center",textShadow:`0 0 10px ${T.red}88`,animation:"fadeUp 0.3s ease-out"}}>{error}</div>}

        {/* ENTRAR BUTTON - Metallic silver/chrome like second reference photo */}
        <div style={{marginTop:"0.5vh"}}>
          <div style={{borderRadius:10,padding:2,overflow:"hidden",
            background:loading
              ?`linear-gradient(90deg,${T.neonBright},${T.electric},${T.neonBright})`
              :"linear-gradient(90deg, #405060, #8090A0, #C0CCD8, #8090A0, #405060)",
            backgroundSize:loading?"100% 100%":"300% 100%",
            animation:loading?"loadGlow 1s ease-in-out infinite":"neonSweep 4s linear infinite",
            boxShadow:loading
              ?`0 0 30px ${T.neon}88, 0 0 60px ${T.neon}44`
              :"0 0 15px rgba(150,180,210,0.2), 0 0 30px rgba(100,140,180,0.1)"}}>
            <button onClick={doLogin} style={{
              width:"100%",height:"6vh",minHeight:44,maxHeight:56,position:"relative",overflow:"hidden",
              background:"linear-gradient(180deg, #B0BCC8 0%, #8898A8 20%, #607080 50%, #485868 80%, #384858 100%)",
              border:"none",borderRadius:8,
              color:"#E8F0F8",fontSize:"clamp(16px, 2.5vh, 22px)",fontWeight:900,fontFamily:"'Orbitron',sans-serif",letterSpacing:"0.2em",
              cursor:loading?"default":"pointer",
              textShadow:"0 1px 0 rgba(255,255,255,0.3), 0 -1px 0 rgba(0,0,0,0.5), 0 0 15px rgba(180,210,240,0.4)",
              display:"flex",alignItems:"center",justifyContent:"center"}}>
              {loading?<div style={{display:"flex",alignItems:"center",gap:10,width:"80%"}}><div style={{flex:1,height:4,background:"rgba(0,20,60,0.6)",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",borderRadius:3,background:`linear-gradient(90deg,${T.neon},${T.neonBright},#fff)`,animation:"loadBar 1.5s ease-in-out forwards",boxShadow:`0 0 8px ${T.neon}`}}/></div><span style={{fontSize:12,letterSpacing:2,opacity:0.7}}>{">>>>"}</span></div>:"ENTRAR"}
            </button>
          </div>
        </div>

        {/* Footer text */}
        <div style={{textAlign:"center",marginTop:"0.5vh"}}>
          <div style={{fontSize:8,fontWeight:600,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.3em",color:"#2A5070",textTransform:"uppercase"}}>SECURE BIOMETRIC CONNECTION v5.0</div>
        </div>
      </div>

      {/* ACCESO CONCEDIDO overlay */}
      {granted&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:10,background:"rgba(0,5,15,0.7)",animation:"greenFlash 1.8s ease-out forwards"}}>
        <div style={{textAlign:"center",animation:"accessPulse 1s ease-out forwards"}}>
          <div style={{fontSize:"clamp(30px, 8vw, 42px)",fontWeight:900,fontFamily:"'Orbitron',sans-serif",color:"#00FF80",letterSpacing:"0.08em",lineHeight:1.2,textShadow:"0 0 30px rgba(0,255,120,0.9),0 0 60px rgba(0,255,80,0.6),0 0 100px rgba(0,255,80,0.3)"}}>ACCESO</div>
          <div style={{fontSize:"clamp(38px, 10vw, 52px)",fontWeight:900,fontFamily:"'Orbitron',sans-serif",color:"#00FF80",letterSpacing:"0.06em",lineHeight:1.2,textShadow:"0 0 30px rgba(0,255,120,0.9),0 0 60px rgba(0,255,80,0.6),0 0 100px rgba(0,255,80,0.3)"}}>CONCEDIDO</div>
        </div>
      </div>}

      {/* Outer border glow like the reference */}
      <div style={{position:"absolute",inset:8,border:"1.5px solid rgba(0,150,255,0.15)",borderRadius:20,pointerEvents:"none",boxShadow:"inset 0 0 30px rgba(0,100,255,0.05), 0 0 20px rgba(0,100,255,0.05)"}}/>
    </div>
  );
};


// ═══════════════════════════════════════════════════════════════
// ECOSYSTEM SCREEN (DASHBOARD)
// ═══════════════════════════════════════════════════════════════
const Ecosystem = ({clones,renovaciones,nav,toast,onSync,onUpdate}: {clones: Clone[]; renovaciones: Renovacion[]; nav: (to: string, arg?: string | null) => void; toast: (msg: string) => void; onSync: (id: string) => void; onUpdate: (id: string) => void}) => {
  const [search,setSearch]=useState("");const [filter,setFilter]=useState("all");
  const activos=clones.filter(c=>c.estado==="ACTIVO").length;
  const updates=clones.filter(c=>semver.gt(c.vd,c.vi)).length;
  const critR=renovaciones.filter(r=>{const e=renovEstado(r);return e==="CRITICO"||e==="VENCIDO"}).length;
  const gStatus=critR>0?"CRITICO":updates>0?"ALERTA":"OK";
  const gColor=critR>0?T.red:updates>0?T.orange:T.green;
  const filtered=clones.filter(c=>{
    if(search&&!c.name.toLowerCase().includes(search.toLowerCase()))return false;
    if(filter==="active")return c.estado==="ACTIVO";if(filter==="inactive")return c.estado==="INACTIVO";
    if(filter==="update")return semver.gt(c.vd,c.vi);return true;
  });
  return <Screen>
    <Header title="ECOSISTEMA" sub="Control maestro de clones" icon="⬡"/>
    <div style={{flex:1,overflowY:"auto",padding:"10px 16px",display:"flex",flexDirection:"column",gap:12,position:"relative",zIndex:1}}>
      {/* HUD */}
      <div style={{animation:"stagger 0.35s ease-out 0.04s both"}}><Card neon glow={0.8}>
        <div style={{display:"flex",justifyContent:"space-around",padding:"4px 0"}}>
          <HudStat label="Total" value={clones.length}/><HudStat label="Activos" value={activos} color={T.green}/>
          <HudStat label="Off" value={clones.length-activos} color={T.gray}/><HudStat label="Updates" value={updates} color={updates>0?T.orange:T.neon}/>
          <HudStat label="Alertas" value={critR} color={critR>0?T.red:T.green}/>
        </div>
        <div style={{marginTop:10,textAlign:"center"}}><Badge text={`SISTEMA: ${gStatus}`} color={gColor}/></div>
      </Card></div>
      {/* Search */}
      <div style={{animation:"stagger 0.35s ease-out 0.08s both"}}>
        <InputField placeholder="🔍 Buscar clon..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <div style={{display:"flex",gap:6,marginTop:8}}>
          {([["all","TODOS"],["active","ACTIVOS"],["inactive","OFF"],["update","UPDATE"]] as const).map(([k,l])=>
            <button key={k} onClick={()=>setFilter(k)} style={{flex:1,padding:"5px 0",borderRadius:8,fontSize:9,fontWeight:700,letterSpacing:"0.1em",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",background:filter===k?`${T.neon}20`:"transparent",border:`1px solid ${filter===k?T.neon+"55":T.border+"33"}`,color:filter===k?T.neonBright:T.gray}}>{l}</button>
          )}
        </div>
      </div>
      {/* Clones */}
      {filtered.map((c,i)=>{const hu=semver.gt(c.vd,c.vi);return(
        <div key={c.id} style={{animation:`stagger 0.35s ease-out ${0.12+i*0.05}s both`}}><Card>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <div style={{width:40,height:40,border:`1px solid ${T.border}44`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",background:`radial-gradient(circle,${T.neon}06,${T.bgCard})`,fontSize:18,flexShrink:0}}>{c.icon}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:800,color:T.white,letterSpacing:"0.04em"}}>{c.name}</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:3}}>
                <Badge text={c.vi} color={T.neonBright}/><Badge text={c.estado} color={c.estado==="ACTIVO"?T.green:T.gray}/>
                <Badge text={c.server} color={c.server==="ONLINE"?T.neon:T.red}/>
                {hu&&<Badge text={`↑${c.vd}`} color={T.orange}/>}
              </div>
            </div>
          </div>
          <div style={{fontSize:10,color:T.gray,marginBottom:8}}>Sync: {fmtDT(c.sync)}</div>
          <div style={{display:"flex",gap:6}}>
            <Btn h={34} fs={9} glow={0.4} w="33%" onClick={()=>nav("ctrl",c.id)}>ACCEDER</Btn>
            <Btn h={34} fs={9} glow={0.3} w="33%" primary={false} onClick={()=>onSync(c.id)}>SYNC</Btn>
            {hu&&<Btn h={34} fs={9} glow={0.5} w="33%" neonColor={T.orange} onClick={()=>onUpdate(c.id)}>UPDATE</Btn>}
          </div>
        </Card></div>
      )})}
      {/* Bottom actions */}
      <div style={{display:"flex",gap:8,animation:`stagger 0.35s ease-out ${0.12+filtered.length*0.05}s both`}}>
        <Btn h={46} fs={10} glow={1} w="50%" icon="＋" onClick={()=>nav("addclone")}>ANADIR CLON</Btn>
        <Btn h={46} fs={10} glow={1} w="50%" icon="📦" onClick={()=>nav("market")}>MARKETPLACE</Btn>
      </div>
      <div style={{display:"flex",gap:8}}>
        <Btn h={42} fs={10} w="50%" icon="💬" onClick={()=>nav("msg")}>MENSAJERIA</Btn>
        <Btn h={42} fs={10} w="50%" icon="📅" onClick={()=>nav("renov")}>RENOVACIONES</Btn>
      </div>
      <Btn h={42} fs={10} icon="🎯" onClick={()=>nav("cmd")}>CENTRO DE MANDO</Btn>
      <Btn h={42} fs={10} icon="📱" onClick={()=>nav("share")}>COMPARTIR / QR</Btn>
      <div style={{height:70}}/>
    </div>
  </Screen>;
};


// ═══════════════════════════════════════════════════════════════
// CLONE CONTROL SCREEN
// ═══════════════════════════════════════════════════════════════
const CloneCtrl = ({clone,back,toast,updateClone,onSync,onUpdate}: {clone: Clone | undefined; back: () => void; toast: (msg: string) => void; updateClone: (id: string, data: Partial<Clone>) => void; onSync: (id: string) => void; onUpdate: (id: string) => void}) => {
  if(!clone)return <Screen><Header title="ERROR" back={back}/><div style={{padding:20,color:T.red}}>Clon no encontrado</div></Screen>;
  const [mods,setMods]=useState<Record<string, boolean>>({"Entrenamiento":true,"Nutricion":true,"Chat":false,"Pagos":true,"Notificaciones":true,"Analytics":false});
  const hu=semver.gt(clone.vd,clone.vi);
  const toggleEst=()=>{const ne=clone.estado==="ACTIVO"?"INACTIVO":"ACTIVO";updateClone(clone.id,{estado:ne,logs:[...clone.logs,`Estado→${ne} (${fmtDT(new Date())})`]});toast(`${clone.name} → ${ne}`)};
  return <Screen>
    <Header title={clone.name} sub={`${clone.vi} — ${clone.estado}`} back={back} icon={clone.icon}/>
    <div style={{flex:1,overflowY:"auto",padding:"10px 16px",display:"flex",flexDirection:"column",gap:12,zIndex:1}}>
      <Card neon glow={0.7}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:T.white,letterSpacing:"0.1em",fontFamily:"'Orbitron',sans-serif"}}>MASTER</div>
            <div style={{marginTop:4,fontSize:11,fontWeight:600,color:clone.estado==="ACTIVO"?T.green:T.gray,display:"flex",alignItems:"center",gap:6}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:clone.estado==="ACTIVO"?T.green:T.gray,boxShadow:clone.estado==="ACTIVO"?`0 0 8px ${T.green}`:"none",display:"inline-block"}}/>{clone.estado==="ACTIVO"?"Sistema activo":"Sistema OFF"}
            </div>
          </div>
          <Toggle on={clone.estado==="ACTIVO"} set={toggleEst}/>
        </div>
      </Card>
      <Card><Label>Modulos</Label>
        {Object.entries(mods).map(([m,on],i)=><div key={m}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",height:44}}>
            <div><div style={{fontSize:13,fontWeight:600,color:T.white}}>{m}</div><div style={{fontSize:9,fontWeight:700,color:on?T.neon+"bb":T.gray+"55",fontFamily:"'Orbitron',sans-serif",letterSpacing:"0.1em"}}>{on?"ON":"OFF"}</div></div>
            <Toggle on={on} set={v=>setMods(p=>({...p,[m]:v}))}/>
          </div>{i<Object.keys(mods).length-1&&<div style={{height:1,background:`${T.border}18`}}/>}
        </div>)}
      </Card>
      <Card><Label>Info del clon</Label>
        {([["Version instalada",clone.vi],["Version disponible",clone.vd],["Ultima sync",fmtDT(clone.sync)],["Ultima update",fmtDT(clone.upd)],["Canal",clone.ch],["Auto-update",clone.auto?"SI":"NO"],["Server",clone.server],["Permisos",clone.perm]] as const).map(([l,v])=>
          <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${T.border}12`}}>
            <span style={{fontSize:11,color:T.gray}}>{l}</span><span style={{fontSize:12,fontWeight:700,color:T.white}}>{v}</span>
          </div>)}
      </Card>
      <div style={{display:"flex",gap:8}}>
        <Btn h={42} fs={10} w="50%" icon="🔄" onClick={()=>onSync(clone.id)}>SINCRONIZAR</Btn>
        {hu&&<Btn h={42} fs={10} w="50%" icon="⬆️" neonColor={T.orange} onClick={()=>onUpdate(clone.id)}>ACTUALIZAR</Btn>}
      </div>
      {clone.prev&&<Btn h={38} fs={10} primary={false} icon="↩️" onClick={()=>{updateClone(clone.id,{vi:clone.prev!,logs:[...clone.logs,`Rollback→${clone.prev}`]});toast(`Rollback a ${clone.prev}`)}}>{"ROLLBACK → "}{clone.prev}</Btn>}
      <Card><Label>Logs</Label><div style={{maxHeight:120,overflowY:"auto"}}>{clone.logs.slice(-10).reverse().map((l,i)=><div key={i} style={{fontSize:10,color:T.gray,padding:"3px 0",borderBottom:`1px solid ${T.border}0a`}}>{"› "}{l}</div>)}</div></Card>
      <div style={{height:70}}/>
    </div>
  </Screen>;
};

// ═══════════════════════════════════════════════════════════════
// ADD CLONE SCREEN
// ═══════════════════════════════════════════════════════════════
const AddClone = ({back,toast,addClone}: {back: () => void; toast: (msg: string) => void; addClone: (c: Clone) => void}) => {
  const [n,setN]=useState("");const [t,setT]=useState("");const [d,setD]=useState("");const [v,setV]=useState("1.0.0");
  const submit=()=>{if(!n){toast("Nombre obligatorio");return;}
    addClone({id:uid(),name:n.toUpperCase(),desc:d,tipo:t||"custom",icon:"🔷",vi:v,vd:v,estado:"ACTIVO",server:"ONLINE",sync:new Date().toISOString(),upd:new Date().toISOString(),perm:"Admin",ch:"stable",auto:false,logs:[`Creado ${fmtDT(new Date())}`],prev:null});
    toast(`Clon "${n}" creado`);back();};
  return <Screen>
    <Header title="ANADIR CLON" sub="Crear nuevo clon" back={back} icon="＋"/>
    <div style={{flex:1,overflowY:"auto",padding:"14px 16px",display:"flex",flexDirection:"column",gap:14,zIndex:1}}>
      <Card neon><Label>Datos del clon</Label>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <InputField placeholder="Nombre *" value={n} onChange={e=>setN(e.target.value)}/>
          <InputField placeholder="Tipo (fitness, negocio...)" value={t} onChange={e=>setT(e.target.value)}/>
          <InputField placeholder="Version (ej: 1.0.0)" value={v} onChange={e=>setV(e.target.value)}/>
          <InputField placeholder="Descripcion" value={d} onChange={e=>setD(e.target.value)}/>
        </div>
        <div style={{marginTop:14}}><Btn h={48} fs={13} icon="✓" success onClick={submit}>CREAR CLON</Btn></div>
      </Card>
    </div>
  </Screen>;
};

// ═══════════════════════════════════════════════════════════════
// MARKETPLACE SCREEN
// ═══════════════════════════════════════════════════════════════
const Marketplace = ({back,toast,clones,addClone,removeClone}: {back: () => void; toast: (msg: string) => void; clones: Clone[]; addClone: (c: Clone) => void; removeClone: (id: string) => void}) => {
  const installed=clones.map(c=>c.id);const [confirm,setConfirm]=useState<string | null>(null);
  const install=(mp: typeof MP_CLONES[0])=>{addClone({id:mp.id,name:mp.name,desc:mp.desc,tipo:mp.tipo,icon:mp.icon,vi:mp.ver,vd:mp.ver,estado:"ACTIVO",server:"ONLINE",sync:new Date().toISOString(),upd:new Date().toISOString(),perm:"User",ch:"stable",auto:false,logs:[`INSTALADO ${mp.ver}`],prev:null});toast(`${mp.name} instalado`)};
  return <Screen>
    <Header title="MARKETPLACE" sub="Biblioteca de clones" back={back} icon="📦"/>
    <div style={{flex:1,overflowY:"auto",padding:"10px 16px",display:"flex",flexDirection:"column",gap:12,zIndex:1}}>
      {MP_CLONES.map((mp,i)=>{const isI=installed.includes(mp.id);return(
        <div key={mp.id} style={{animation:`stagger 0.35s ease-out ${0.05+i*0.04}s both`}}><Card>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <span style={{fontSize:22}}>{mp.icon}</span>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:800,color:T.white}}>{mp.name}</div><div style={{fontSize:10,color:T.gray,marginTop:1}}>{mp.desc}</div>
              <div style={{display:"flex",gap:5,marginTop:4}}><Badge text={mp.ver} color={T.neonBright}/><Badge text={mp.cat} color={T.electric}/><Badge text={mp.size} color={T.gray}/></div>
            </div>
          </div>
          {isI?<div style={{display:"flex",gap:6}}><Btn h={34} fs={9} w="50%" success disabled>{"INSTALADO ✓"}</Btn><Btn h={34} fs={9} w="50%" danger onClick={()=>setConfirm(mp.id)}>DESINSTALAR</Btn></div>
          :<Btn h={38} fs={10} success icon="📥" onClick={()=>install(mp)}>INSTALAR</Btn>}
        </Card></div>)})}
      <div style={{height:70}}/>
    </div>
    <Modal open={!!confirm} onClose={()=>setConfirm(null)} title="CONFIRMAR">
      <p style={{color:T.white,fontSize:14,marginBottom:16}}>Desinstalar este clon? Se perderan sus datos.</p>
      <div style={{display:"flex",gap:8}}><Btn h={40} fs={11} w="50%" danger onClick={()=>{removeClone(confirm!);toast("Desinstalado");setConfirm(null)}}>SI</Btn><Btn h={40} fs={11} w="50%" primary={false} onClick={()=>setConfirm(null)}>NO</Btn></div>
    </Modal>
  </Screen>;
};


// ═══════════════════════════════════════════════════════════════
// CENTRO DE MANDO
// ═══════════════════════════════════════════════════════════════
const CentroMando = ({back,toast,clones,nav,updateClone,gs,setGs,onExport,onImport}: {back: () => void; toast: (msg: string) => void; clones: Clone[]; nav: (to: string, arg?: string | null) => void; updateClone: (id: string, data: Partial<Clone>) => void; gs: GlobalState; setGs: React.Dispatch<React.SetStateAction<GlobalState>>; onExport: () => void; onImport: () => void}) => {
  const logs=[{t:"INFO",msg:"Sistema iniciado",ts:new Date().toISOString()},{t:"OK",msg:"Clones sincronizados",ts:new Date(Date.now()-3600000).toISOString()},{t:"WARN",msg:"Updates disponibles",ts:new Date(Date.now()-7200000).toISOString()}];
  return <Screen>
    <Header title="CENTRO DE MANDO" sub={`v${APP_VERSION}`} back={back} icon="🎯"/>
    <div style={{flex:1,overflowY:"auto",padding:"10px 16px",display:"flex",flexDirection:"column",gap:12,zIndex:1}}>
      <Card neon><Label>Control General</Label>
        {([["Master Switch","master",T.neon],["Mantenimiento","maintenance",T.orange],["Emergencia","emergency",T.red]] as const).map(([l,k])=>
          <div key={k} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 0"}}>
            <span style={{fontSize:12,fontWeight:600,color:T.white}}>{l}</span><Toggle on={gs[k]} set={v=>setGs(p=>({...p,[k]:v}))}/>
          </div>)}
        <div style={{display:"flex",gap:8,marginTop:10}}>
          <Btn h={36} fs={9} w="50%" danger icon="⏻" onClick={()=>{setGs(p=>({...p,master:false}));toast("Sistema apagado")}}>APAGAR TODO</Btn>
          <Btn h={36} fs={9} w="50%" icon="🔃" onClick={()=>{setGs(p=>({...p,master:true}));toast("Reiniciado")}}>REINICIAR</Btn>
        </div>
      </Card>
      <Card><Label>Auto-Update Global</Label>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:12,color:T.white}}>Auto-update todos</span>
          <Toggle on={gs.autoUpdate} set={v=>{setGs(p=>({...p,autoUpdate:v}));clones.forEach(c=>updateClone(c.id,{auto:v}));toast(v?"Auto-update ON":"Auto-update OFF")}}/>
        </div>
      </Card>
      <Card><Label>{"Clones — Versiones"}</Label>
        {clones.map(c=><div key={c.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${T.border}12`}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:14}}>{c.icon}</span><span style={{fontSize:11,fontWeight:700,color:T.white}}>{c.name}</span></div>
          <div style={{display:"flex",gap:4}}><Badge text={c.vi} color={T.neonBright}/>{semver.gt(c.vd,c.vi)&&<Badge text={`→${c.vd}`} color={T.orange}/>}</div>
        </div>)}
      </Card>
      <Card><Label>Logs del sistema</Label>
        {logs.map((l,i)=><div key={i} style={{display:"flex",gap:8,padding:"4px 0",borderBottom:`1px solid ${T.border}0a`}}>
          <Badge text={l.t} color={l.t==="OK"?T.green:l.t==="WARN"?T.orange:T.neon}/><span style={{fontSize:11,color:T.white,flex:1}}>{l.msg}</span><span style={{fontSize:9,color:T.gray}}>{fmtDT(l.ts)}</span>
        </div>)}
      </Card>
      <Card><Label>Backup Global</Label>
        <div style={{display:"flex",gap:8}}><Btn h={40} fs={10} w="50%" icon="🧾" onClick={onExport}>EXPORTAR</Btn><Btn h={40} fs={10} w="50%" icon="📥" onClick={onImport}>IMPORTAR</Btn></div>
      </Card>
      <Card><Label>Seguridad</Label>
        <div style={{fontSize:11,color:T.gray,marginBottom:8}}>Rol: <span style={{color:T.neonBright,fontWeight:700}}>SuperAdmin</span></div>
        <Btn h={38} fs={10} danger icon="🔒" onClick={()=>nav("login")}>CERRAR SESION</Btn>
      </Card>
      <div style={{height:70}}/>
    </div>
  </Screen>;
};

// ═══════════════════════════════════════════════════════════════
// RENOVACIONES SCREEN
// ═══════════════════════════════════════════════════════════════
const Renovaciones = ({back,toast,renovaciones:rn,setRenovaciones:setRn}: {back: () => void; toast: (msg: string) => void; renovaciones: Renovacion[]; setRenovaciones: React.Dispatch<React.SetStateAction<Renovacion[]>>}) => {
  const [modal,setModal]=useState<Renovacion | "add" | null>(null);
  const [form,setForm]=useState<Partial<Renovacion>>({nombre:"",tipo:"dominio",fechaRenovacion:"",precio:"",notas:""});
  const openAdd=()=>{setForm({nombre:"",tipo:"dominio",fechaRenovacion:"",precio:"",notas:""});setModal("add")};
  const openEdit=(r: Renovacion)=>{setForm({...r});setModal(r)};
  const save=()=>{if(!form.nombre||!form.fechaRenovacion){toast("Nombre y fecha obligatorios");return;}
    if(modal==="add"){setRn(p=>[...p,{...form as Renovacion,id:uid(),recordatorioActivado:true,snoozeUntil:null}]);toast("Anadida")}
    else if(modal){setRn(p=>p.map(r=>r.id===modal.id?{...r,...form}:r));toast("Actualizada")} setModal(null)};
  const sorted=[...rn].sort((a,b)=>new Date(a.fechaRenovacion).getTime()-new Date(b.fechaRenovacion).getTime());
  const crit=sorted.filter(r=>{const e=renovEstado(r);return e==="CRITICO"||e==="VENCIDO"}).length;
  const prox=sorted.filter(r=>renovEstado(r)==="PROXIMO").length;
  return <Screen>
    <Header title="RENOVACIONES" sub={`${rn.length} registros`} back={back} icon="📅"/>
    <div style={{flex:1,overflowY:"auto",padding:"10px 16px",display:"flex",flexDirection:"column",gap:12,zIndex:1}}>
      <Card neon glow={0.6}><div style={{display:"flex",justifyContent:"space-around"}}><HudStat label="Total" value={rn.length}/><HudStat label="Proximas" value={prox} color={T.orange}/><HudStat label="Criticas" value={crit} color={crit>0?T.red:T.green}/></div></Card>
      {sorted.map((r,i)=>{const est=renovEstado(r),col=estColor[est],days=daysUntil(r.fechaRenovacion);return(
        <div key={r.id} style={{animation:`stagger 0.3s ease-out ${0.05+i*0.04}s both`}}>
          <Card neonColor={(est==="CRITICO"||est==="VENCIDO")?T.red:undefined} neon={est==="CRITICO"||est==="VENCIDO"}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <span style={{fontSize:13,fontWeight:800,color:T.white}}>{r.nombre}</span><Badge text={est} color={col}/>
            </div>
            <div style={{fontSize:11,color:T.gray}}>Tipo: {r.tipo} | {fmtDate(r.fechaRenovacion)} | {r.precio||"-"}</div>
            <div style={{fontSize:10,color:T.gray,marginTop:2}}>{days<0?`Vencido hace ${Math.abs(days)} dias`:`${days} dias restantes`}</div>
            <div style={{display:"flex",gap:6,marginTop:8}}>
              <Btn h={30} fs={8} w="33%" primary={false} onClick={()=>openEdit(r)}>EDITAR</Btn>
              <Btn h={30} fs={8} w="33%" danger onClick={()=>{setRn(p=>p.filter(x=>x.id!==r.id));toast("Eliminada")}}>ELIMINAR</Btn>
              <Btn h={30} fs={8} w="33%" primary={false} onClick={()=>{setRn(p=>p.map(x=>x.id===r.id?{...x,snoozeUntil:new Date(Date.now()+86400000).toISOString()}:x));toast("Snooze 24h")}}>SNOOZE</Btn>
            </div>
          </Card>
        </div>)})}
      <Btn h={48} fs={12} icon="＋" success onClick={openAdd}>ANADIR RENOVACION</Btn>
      <div style={{height:70}}/>
    </div>
    <Modal open={!!modal} onClose={()=>setModal(null)} title={modal==="add"?"NUEVA RENOVACION":"EDITAR"}>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <InputField placeholder="Nombre *" value={form.nombre||""} onChange={e=>setForm(p=>({...p,nombre:e.target.value}))}/>
        <select value={form.tipo||"dominio"} onChange={e=>setForm(p=>({...p,tipo:e.target.value}))} style={{width:"100%",height:42,background:"#060E1C",border:`1px solid ${T.border}`,borderRadius:10,color:T.white,padding:"0 12px",fontSize:13}}>
          {["dominio","hosting","suscripcion","api","otros"].map(t=><option key={t} value={t}>{t}</option>)}
        </select>
        <InputField placeholder="Fecha YYYY-MM-DD *" value={form.fechaRenovacion?form.fechaRenovacion.slice(0,10):""} onChange={e=>setForm(p=>({...p,fechaRenovacion:e.target.value+"T00:00:00Z"}))}/>
        <InputField placeholder="Precio" value={form.precio||""} onChange={e=>setForm(p=>({...p,precio:e.target.value}))}/>
        <InputField placeholder="Notas" value={form.notas||""} onChange={e=>setForm(p=>({...p,notas:e.target.value}))}/>
        <Btn h={44} fs={12} success icon="✓" onClick={save}>GUARDAR</Btn>
      </div>
    </Modal>
  </Screen>;
};


// ═══════════════════════════════════════════════��═══════════════
// COMUNICACIONES SCREEN
// ═══════════════════════════════════════════════════════════════
const Comunicaciones = ({back,toast}: {back: () => void; toast: (msg: string) => void}) => {
  const [phone,setPhone]=useState(()=>LS.get("comms_ph","") as string);const [email,setEmail]=useState(()=>LS.get("comms_em","") as string);
  const [subject,setSubject]=useState("EL JEFAZO — Info");const [msg,setMsg]=useState("");
  useEffect(()=>{LS.set("comms_ph",phone)},[phone]);useEffect(()=>{LS.set("comms_em",email)},[email]);
  const sendWA=()=>{if(!phone||!msg){toast("Telefono y mensaje");return;}window.open(`https://wa.me/${phone.replace(/\D/g,"")}?text=${encodeURIComponent(msg)}`,"_blank");toast("WhatsApp...")};
  const sendEM=()=>{if(!email||!msg){toast("Email y mensaje");return;}window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(msg)}`,"_blank");toast("Email...")};
  const tpl=[{l:"Acceso listo",t:"Tu acceso a EL JEFAZO ha sido activado."},{l:"Actualizacion",t:"Nueva actualizacion disponible en EL JEFAZO OS."},{l:"Pago recibido",t:"Tu pago ha sido recibido. Suscripcion activa."}];
  return <Screen>
    <Header title="COMUNICACIONES" sub="WhatsApp y Email" back={back} icon="💬"/>
    <div style={{flex:1,overflowY:"auto",padding:"10px 16px",display:"flex",flexDirection:"column",gap:12,zIndex:1}}>
      <Card><Label>Plantillas</Label><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{tpl.map(t=><button key={t.l} onClick={()=>setMsg(t.t)} style={{background:`${T.neon}12`,border:`1px solid ${T.neon}33`,borderRadius:8,color:T.neonBright,fontSize:10,fontWeight:700,padding:"5px 10px",cursor:"pointer"}}>{t.l}</button>)}</div></Card>
      <Card neon glow={0.5}><Label>Mensaje</Label>
        <textarea value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Escribe tu mensaje..." style={{width:"100%",height:90,background:"#060E1C",border:`1px solid ${T.border}44`,borderRadius:10,color:T.white,fontSize:13,fontWeight:600,fontFamily:"'Rajdhani',sans-serif",padding:"10px 14px",outline:"none",resize:"none"}}/>
      </Card>
      <Card><Label>WhatsApp</Label><InputField placeholder="No telefono (ej: 34612345678)" value={phone} onChange={e=>setPhone(e.target.value)}/><div style={{marginTop:10}}><Btn h={44} fs={11} icon="💬" onClick={sendWA}>ENVIAR POR WHATSAPP</Btn></div></Card>
      <Card><Label>Email</Label><InputField placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/><div style={{marginTop:8}}><InputField placeholder="Asunto" value={subject} onChange={e=>setSubject(e.target.value)}/></div><div style={{marginTop:10}}><Btn h={44} fs={11} icon="✉" onClick={sendEM}>ENVIAR POR EMAIL</Btn></div></Card>
      <Btn h={48} fs={12} icon="📡" onClick={()=>{if(!msg){toast("Escribe mensaje");return}if(phone)sendWA();if(email)sendEM();if(!phone&&!email)toast("Anade contacto")}}>ENVIAR A TODOS</Btn>
      <div style={{height:70}}/>
    </div>
  </Screen>;
};

// ═══════════════════════════════════════════════════════════════
// COMPARTIR / QR SCREEN
// ══���══════════════════════════════════════════════════════��═════
const ShareQR = ({back,toast}: {back: () => void; toast: (msg: string) => void}) => {
  const [url,setUrl]=useState(()=>LS.get("share_url","https://eljefazo.vercel.app") as string);
  useEffect(()=>{LS.set("share_url",url)},[url]);
  const qr=`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(url)}&bgcolor=0A1628&color=00C8FF`;
  return <Screen>
    <Header title="COMPARTIR" sub="Link + QR" back={back} icon="📱"/>
    <div style={{flex:1,overflowY:"auto",padding:"14px 16px",display:"flex",flexDirection:"column",gap:14,zIndex:1,alignItems:"center"}}>
      <Card neon style={{width:"100%"}}><Label>URL de despliegue</Label>
        <InputField placeholder="https://miapp.vercel.app" value={url} onChange={e=>setUrl(e.target.value)}/>
        <div style={{display:"flex",gap:8,marginTop:10}}>
          <Btn h={38} fs={10} w="50%" icon="📋" onClick={()=>{navigator.clipboard?.writeText(url);toast("Copiado")}}>COPIAR LINK</Btn>
          <Btn h={38} fs={10} w="50%" icon="📲" onClick={()=>window.open(url,"_blank")}>ABRIR</Btn>
        </div>
      </Card>
      <Card neon glow={1} style={{width:"100%",display:"flex",flexDirection:"column",alignItems:"center"}}><Label>Codigo QR</Label>
        <div style={{padding:16,background:"#060E1C",borderRadius:14,border:`1px solid ${T.neon}33`,marginTop:8}}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="QR Code" style={{width:200,height:200,display:"block",borderRadius:8}} crossOrigin="anonymous"/>
        </div>
        <div style={{fontSize:10,color:T.gray,marginTop:8,textAlign:"center"}}>Escanea para instalar la PWA</div>
      </Card>
      <Card style={{width:"100%"}}><Label>Instalacion</Label>
        <div style={{fontSize:12,color:T.grayLight,lineHeight:1.6}}>
          <div style={{marginBottom:8}}><strong style={{color:T.white}}>iPhone:</strong> Safari → Compartir → Anadir a pantalla</div>
          <div style={{marginBottom:8}}><strong style={{color:T.white}}>Android:</strong> Chrome → Menu → Instalar app</div>
          <div><strong style={{color:T.white}}>Deploy:</strong> vercel deploy / netlify deploy</div>
        </div>
      </Card>
      <div style={{height:70}}/>
    </div>
  </Screen>;
};

// ═══════════════════════════════════════════════════════════════
// CRITICAL ALERT OVERLAY
// ═══════════════════════════════════════════════════════════════
const CriticalAlert = ({renov,onResolve,onSnooze,onDismiss,toast}: {renov: Renovacion | null; onResolve: () => void; onSnooze: () => void; onDismiss: () => void; toast: (msg: string) => void}) => {
  if(!renov) return null;
  const days=daysUntil(renov.fechaRenovacion);
  return <div style={{position:"fixed",inset:0,zIndex:9990,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
    <div style={{width:"100%",maxWidth:400}}>
      <NeonBorder on r={20} glow={2} color={T.red}>
        <div style={{padding:24,textAlign:"center"}}>
          <div style={{fontSize:48,animation:"sirenPulse 1s ease-in-out infinite"}}>{"🚨"}</div>
          <div style={{fontSize:18,fontWeight:900,fontFamily:"'Orbitron',sans-serif",color:T.red,marginTop:12,letterSpacing:"0.12em",textShadow:`0 0 20px ${T.red}88`}}>ALERTA CRITICA</div>
          <div style={{fontSize:16,fontWeight:700,color:T.white,marginTop:12}}>{renov.nombre}</div>
          <div style={{fontSize:14,color:days<0?T.red:T.orange,marginTop:6,fontWeight:700}}>{days<0?`VENCIDO hace ${Math.abs(days)} dias`:`Renueva en ${days} dias`}</div>
          <div style={{fontSize:11,color:T.gray,marginTop:4}}>{fmtDate(renov.fechaRenovacion)} | {renov.precio||"-"}</div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:20}}>
            <Btn h={44} fs={11} success icon="✅" onClick={onResolve}>MARCAR RESUELTO</Btn>
            <Btn h={44} fs={11} icon="⏰" onClick={onSnooze}>RECORDAR EN 24H</Btn>
            <div style={{display:"flex",gap:8}}>
              <Btn h={40} fs={10} w="50%" icon="📲" onClick={()=>{const ph=LS.get("comms_ph","") as string;if(ph)window.open(`https://wa.me/${ph.replace(/\D/g,"")}?text=${encodeURIComponent(`ALERTA: ${renov.nombre}`)}`,"_blank");else toast("Configura telefono")}}>WHATSAPP</Btn>
              <Btn h={40} fs={10} w="50%" icon="📩" onClick={()=>{const em=LS.get("comms_em","") as string;if(em)window.open(`mailto:${em}?subject=${encodeURIComponent("ALERTA: "+renov.nombre)}`,"_blank");else toast("Configura email")}}>EMAIL</Btn>
            </div>
            <Btn h={38} fs={10} primary={false} onClick={onDismiss}>CERRAR</Btn>
          </div>
        </div>
      </NeonBorder>
    </div>
  </div>;
};


// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function JefazoOS() {
  // ── STATE ���───────────────────────────────────────────────
  const [scr, setScr] = useState("login");
  const [scrArg, setScrArg] = useState<string | null>(null);
  const [anim, setAnim] = useState(false);
  const [dir, setDir] = useState("in");
  const [toast, setToast] = useState({ on: false, msg: "" });
  const [clones, setClones] = useState<Clone[]>(() => LS.get("clones", DEF_CLONES) as Clone[]);
  const [renovaciones, setRenovaciones] = useState<Renovacion[]>(() => LS.get("renov", DEF_RENOV) as Renovacion[]);
  const [gs, setGs] = useState<GlobalState>(() => LS.get("gs", { master: true, maintenance: false, emergency: false, autoUpdate: false }) as GlobalState);
  const [critAlert, setCritAlert] = useState<Renovacion | null>(null);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── PERSIST ──────────────────────────────────────────────
  useEffect(() => { LS.set("clones", clones); }, [clones]);
  useEffect(() => { LS.set("renov", renovaciones); }, [renovaciones]);
  useEffect(() => { LS.set("gs", gs); }, [gs]);

  // ── CRITICAL ALERT CHECK ─────────────────────────────────
  useEffect(() => {
    if (alertDismissed || scr === "login") return;
    const crit = renovaciones.find(r => {
      const e = renovEstado(r);
      return e === "CRITICO" || e === "VENCIDO";
    });
    if (crit) setCritAlert(crit); else setCritAlert(null);
  }, [renovaciones, scr, alertDismissed]);

  // ── NAV ──────────────────────────────────────────────────
  const nav = useCallback((to: string, arg: string | null = null) => {
    if (anim) return;
    setAnim(true); setDir("out");
    setTimeout(() => { setScr(to); setScrArg(arg); setDir("in"); setAlertDismissed(false); setTimeout(() => setAnim(false), 250); }, 200);
  }, [anim]);

  const show = useCallback((msg: string) => setToast({ on: true, msg }), []);
  const hide = useCallback(() => setToast({ on: false, msg: "" }), []);

  // ── CLONE OPERATIONS ─────────────────────────────────────
  const addClone = useCallback((c: Clone) => setClones(p => { if (p.find(x => x.id === c.id)) return p; return [...p, c]; }), []);
  const removeClone = useCallback((id: string) => setClones(p => p.filter(c => c.id !== id)), []);
  const updateClone = useCallback((id: string, data: Partial<Clone>) => setClones(p => p.map(c => c.id === id ? { ...c, ...data } : c)), []);

  const onSync = useCallback((id: string) => {
    const now = new Date().toISOString();
    updateClone(id, { sync: now, logs: [...((clones.find(c => c.id === id) || {} as Clone).logs || []), `Sync ${fmtDT(now)}`] });
    show("Sincronizado");
  }, [clones, updateClone, show]);

  const onUpdate = useCallback((id: string) => {
    const c = clones.find(x => x.id === id);
    if (!c || !semver.gt(c.vd, c.vi)) return;
    updateClone(id, { vi: c.vd, prev: c.vi, upd: new Date().toISOString(), logs: [...c.logs, `Update ${c.vi}→${c.vd}`] });
    show(`${c.name} actualizado a ${c.vd}`);
  }, [clones, updateClone, show]);

  const syncAll = useCallback(() => { clones.forEach(c => onSync(c.id)); show("Todos sincronizados"); }, [clones, onSync, show]);
  const updateAll = useCallback(() => { clones.filter(c => semver.gt(c.vd, c.vi)).forEach(c => onUpdate(c.id)); show("Todos actualizados"); }, [clones, onUpdate, show]);

  // ── BACKUP ───────────────────────────────────────────────
  const onExport = useCallback(() => {
    const data = { clones, renovaciones, gs, comms: { phone: LS.get("comms_ph", "") as string, email: LS.get("comms_em", "") as string }, version: APP_VERSION, exported: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `jefazo-backup-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
    show("Backup exportado");
  }, [clones, renovaciones, gs, show]);

  const onImport = useCallback(() => { fileRef.current?.click(); }, []);

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.clones) setClones(data.clones);
        if (data.renovaciones) setRenovaciones(data.renovaciones);
        if (data.gs) setGs(data.gs);
        if (data.comms) { LS.set("comms_ph", data.comms.phone || ""); LS.set("comms_em", data.comms.email || ""); }
        show("Backup importado");
      } catch { show("Error: JSON invalido"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, [show]);

  const onEmergency = useCallback(() => { setGs(p => ({ ...p, emergency: !p.emergency })); show(gs.emergency ? "Emergencia OFF" : "Emergencia ON"); }, [gs.emergency, show]);

  // ── RENDER ──��────────────────────────────────────────────
  const currentClone = scrArg ? clones.find(c => c.id === scrArg) : undefined;
  const showQA = scr !== "login";

  return (
    <div style={{ width: "100vw", height: "100vh", maxWidth: 480, margin: "0 auto", background: T.bg, overflow: "hidden", position: "relative", borderLeft: `1px solid ${T.border}08`, borderRight: `1px solid ${T.border}08` }}>
      <GlobalCSS />
      <input type="file" ref={fileRef} accept=".json" style={{ display: "none" }} onChange={handleImport} />
      <div style={{ width: "100%", height: "100%", animation: dir === "in" ? "slideIn 0.24s cubic-bezier(0.25,0.46,0.45,0.94) both" : "slideOut 0.18s ease-in both" }}>
        {scr === "login" && <LoginScreen go={() => nav("eco")} />}
        {scr === "eco" && <Ecosystem clones={clones} renovaciones={renovaciones} nav={nav} toast={show} onSync={onSync} onUpdate={onUpdate} />}
        {scr === "ctrl" && <CloneCtrl clone={currentClone} back={() => nav("eco")} toast={show} updateClone={updateClone} onSync={onSync} onUpdate={onUpdate} />}
        {scr === "addclone" && <AddClone back={() => nav("eco")} toast={show} addClone={addClone} />}
        {scr === "market" && <Marketplace back={() => nav("eco")} toast={show} clones={clones} addClone={addClone} removeClone={removeClone} />}
        {scr === "cmd" && <CentroMando back={() => nav("eco")} toast={show} clones={clones} nav={nav} updateClone={updateClone} gs={gs} setGs={setGs} onExport={onExport} onImport={onImport} />}
        {scr === "renov" && <Renovaciones back={() => nav("eco")} toast={show} renovaciones={renovaciones} setRenovaciones={setRenovaciones} />}
        {scr === "msg" && <Comunicaciones back={() => nav("eco")} toast={show} />}
        {scr === "share" && <ShareQR back={() => nav("eco")} toast={show} />}
      </div>
      <Toast msg={toast.msg} on={toast.on} hide={hide} />
      {showQA && <QuickActions onSync={syncAll} onUpdate={updateAll} onExport={onExport} onImport={onImport} onEmergency={onEmergency} emergency={gs.emergency} />}
      <CriticalAlert renov={critAlert} toast={show}
        onResolve={() => { if (critAlert) { setRenovaciones(p => p.filter(r => r.id !== critAlert.id)); setCritAlert(null); show("Resuelto"); } }}
        onSnooze={() => { if (critAlert) { setRenovaciones(p => p.map(r => r.id === critAlert.id ? { ...r, snoozeUntil: new Date(Date.now() + 86400000).toISOString() } : r)); setCritAlert(null); show("Snooze 24h"); } }}
        onDismiss={() => { setCritAlert(null); setAlertDismissed(true); }}
      />
    </div>
  );
}
