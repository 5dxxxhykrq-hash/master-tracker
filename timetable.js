const START_HOUR = 9;
const END_HOUR = 19;
const HOUR_PX = 72;
const days = [
  {key:"mon", label:"MON", zh:"周一"},
  {key:"tue", label:"TUE", zh:"周二"},
  {key:"wed", label:"WED", zh:"周三"},
  {key:"thu", label:"THU", zh:"周四"},
  {key:"fri", label:"FRI", zh:"周五"}
];

const events = [
  {day:"mon",start:"14:00",end:"16:00",title:"课程名待确认",category:"pending",meta:"NetTable 显示 Seminar · 可能为选修 / 旁听"},
  {day:"mon",start:"16:00",end:"18:00",title:"课程名待确认",category:"pending",meta:"NetTable 显示 Lecture · 可能为选修 / 旁听"},
  {day:"tue",start:"11:00",end:"13:00",title:"课程名待确认",category:"pending",meta:"NetTable 显示 Lecture · 请之后补课程名"},
  {day:"tue",start:"14:00",end:"17:00",title:"Critical Issues",code:"ANTH0127",category:"core",meta:"必修 · 3 hr"},
  {day:"wed",start:"11:00",end:"13:00",title:"Social Anthropology Seminars",category:"seminar",meta:"系内 seminar series · 2 hr"},
  {day:"wed",start:"17:00",end:"19:00",title:"Explore Your Entrepreneurial Idea",category:"entrepreneurship",meta:"BaseKX · 28 Oct + 4/11/18 Nov only"},
  {day:"thu",start:"09:00",end:"11:00",title:"Primate Behaviour & Ecology",code:"ANTH0060",category:"elective",meta:"选修 · 2 hr"},
  {day:"thu",start:"14:00",end:"16:00",title:"Primate Behaviour & Ecology",code:"ANTH0060",category:"elective",meta:"选修 · 2 hr"},
  {day:"fri",start:"09:00",end:"10:00",title:"Method in Ethnography",code:"ANTH0130",category:"core",meta:"必修 · Lecture"},
  {day:"fri",start:"10:00",end:"12:00",title:"Method in Ethnography",code:"ANTH0130",category:"pending",meta:"Seminar allocation / clash · 待确认组别"},
  {day:"fri",start:"12:00",end:"14:00",title:"Method in Ethnography",code:"ANTH0130",category:"pending",meta:"Alternative seminar slot / clash"},
  {day:"fri",start:"15:00",end:"17:00",title:"课程名待确认",category:"pending",meta:"NetTable 显示 Seminar · 可能为选修 / 旁听"}
];

const colors = {
  core:"#8f2737", elective:"#0f7168", entrepreneurship:"#b86913",
  audit:"#6d4ca0", seminar:"#47687c", pending:"#b5453f"
};

let currentFilter = "all";

function minutes(t){
  const [h,m] = t.split(":").map(Number);
  return (h-START_HOUR)*60+m;
}
function position(t){ return minutes(t)/60*HOUR_PX; }
function duration(s,e){ return (minutes(e)-minutes(s))/60*HOUR_PX; }

function buildGrid(){
  const grid = document.getElementById("calendarGrid");
  grid.innerHTML = '<div class="corner"></div>';

  days.forEach((d,i)=>{
    const h=document.createElement("div");
    h.className="day-head";
    h.style.gridColumn=String(i+2); h.style.gridRow="1";
    h.innerHTML=`${d.label}<span>${d.zh}</span>`;
    grid.appendChild(h);
  });

  const time=document.createElement("div");
  time.className="time-col";
  for(let h=START_HOUR;h<=END_HOUR;h++){
    const l=document.createElement("div");
    l.className="time-label"; l.style.top=((h-START_HOUR)*HOUR_PX)+"px";
    l.textContent=String(h).padStart(2,"0")+":00";
    time.appendChild(l);
  }
  grid.appendChild(time);

  days.forEach((d,i)=>{
    const col=document.createElement("div");
    col.className="day-col"; col.dataset.day=d.key;
    col.style.gridColumn=String(i+2); col.style.gridRow="2";
    events.filter(e=>e.day===d.key).forEach(e=>col.appendChild(eventEl(e)));
    grid.appendChild(col);
  });
  applyFilter();
}

function eventEl(e){
  const el=document.createElement("div");
  el.className=`event ${e.category}`;
  el.dataset.category=e.category;
  el.style.top=position(e.start)+"px";
  el.style.height=Math.max(duration(e.start,e.end)-6,38)+"px";
  el.innerHTML=`
    <div class="event-time">${e.start}–${e.end}</div>
    <div class="event-title">${e.code?'<span>'+e.code+'</span> · ':''}${e.title}</div>
    <div class="event-meta">${e.meta||""}</div>`;
  return el;
}

function buildAgenda(){
  const root=document.getElementById("agendaView");
  root.innerHTML="";
  days.forEach(d=>{
    const section=document.createElement("section");
    section.className="agenda-day";
    section.innerHTML=`<h4>${d.label} · ${d.zh}</h4>`;
    events.filter(e=>e.day===d.key).forEach(e=>{
      const item=document.createElement("div");
      item.className="agenda-item";
      item.dataset.category=e.category;
      item.style.setProperty("--c",colors[e.category]);
      item.innerHTML=`<time>${e.start}–${e.end}</time><div><b>${e.code?e.code+" · ":""}${e.title}</b><small>${e.meta||""}</small></div>`;
      section.appendChild(item);
    });
    root.appendChild(section);
  });
  applyFilter();
}

function applyFilter(){
  document.querySelectorAll("[data-category]").forEach(el=>{
    const show=currentFilter==="all" || el.dataset.category===currentFilter ||
      (currentFilter==="audit" && el.dataset.category==="pending");
    el.style.display=show?"":"none";
  });
}

document.querySelectorAll(".chip").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".chip").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter=btn.dataset.filter;
    applyFilter();
  });
});

document.querySelectorAll(".view-btn").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".view-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    const grid=btn.dataset.view==="grid";
    document.getElementById("gridView").classList.toggle("hidden",!grid);
    document.getElementById("agendaView").classList.toggle("hidden",grid);
  });
});

buildGrid();
buildAgenda();
