const START_HOUR = 9;
const END_HOUR = 19;
const days = [
  {key:"mon", label:"MON", zh:"周一"},
  {key:"tue", label:"TUE", zh:"周二"},
  {key:"wed", label:"WED", zh:"周三"},
  {key:"thu", label:"THU", zh:"周四"},
  {key:"fri", label:"FRI", zh:"周五"}
];

const events = [
  {day:"mon",start:"14:00",end:"16:00",title:"Foundations of Buddhist Philosophy",code:"PHIL0215",category:"audit",meta:"旁听 · Term 1"},
  {day:"mon",start:"16:00",end:"18:00",title:"Entrepreneurship in a Global Context",code:"MSIN0060",category:"entrepreneurship",meta:"Lecture · Term 1"},

  {day:"tue",start:"14:00",end:"17:00",title:"Critical Issues",code:"ANTH0127",category:"core",meta:"必修 · 3 hr"},
  {day:"tue",start:"17:00",end:"18:30",title:"Dissertation Workshop",code:"ANTH0145",category:"core",meta:"Week 9 only"},

  {day:"wed",start:"11:00",end:"13:00",title:"Oceans, Life and Climate",code:"GEOL0044",category:"audit",meta:"旁听 · Lecture"},
  {day:"wed",start:"11:00",end:"13:00",title:"Social Anthropology Seminars",category:"seminar",meta:"系内 seminar series · 与 GEOL0044 同时段"},
  {day:"wed",start:"17:00",end:"19:00",title:"Explore Your Entrepreneurial Idea",category:"entrepreneurship",meta:"BaseKX · 28 Oct + 4/11/18 Nov only"},

  {day:"thu",start:"09:00",end:"11:00",title:"Primate Behaviour & Ecology",code:"ANTH0060",category:"elective",meta:"选修 · Seminar"},
  {day:"thu",start:"14:00",end:"16:00",title:"Primate Behaviour & Ecology",code:"ANTH0060",category:"elective",meta:"选修 · Lecture"},

  {day:"fri",start:"09:00",end:"10:00",title:"Anthropological Methods",code:"ANTH0130",category:"core",meta:"必修 · Lecture"},
  {day:"fri",start:"10:00",end:"12:00",title:"Anthropological Methods",code:"ANTH0130",category:"pending",meta:"Seminar option / allocation 待确认"},
  {day:"fri",start:"12:00",end:"14:00",title:"Anthropological Methods",code:"ANTH0130",category:"pending",meta:"Alternative seminar option / allocation 待确认"},
  {day:"fri",start:"15:00",end:"17:00",title:"Entrepreneurship in a Global Context",code:"MSIN0060",category:"entrepreneurship",meta:"Seminar Group 2"}
];

const colors = {
  core:"#8f2737", elective:"#0f7168", entrepreneurship:"#b86913",
  audit:"#6d4ca0", seminar:"#47687c", pending:"#b5453f"
};

let currentFilter = "all";

function hourPx(){
  return window.matchMedia("(max-width: 760px)").matches ? 66 : 72;
}
function minutes(t){
  const [h,m] = t.split(":").map(Number);
  return (h-START_HOUR)*60+m;
}
function position(t){ return minutes(t)/60*hourPx(); }
function duration(s,e){ return (minutes(e)-minutes(s))/60*hourPx(); }

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
    l.className="time-label";
    l.style.top=((h-START_HOUR)*hourPx())+"px";
    l.textContent=String(h).padStart(2,"0")+":00";
    time.appendChild(l);
  }
  grid.appendChild(time);

  days.forEach((d,i)=>{
    const col=document.createElement("div");
    col.className="day-col"; col.dataset.day=d.key;
    col.style.gridColumn=String(i+2); col.style.gridRow="2";

    const dayEvents = events.filter(e=>e.day===d.key);
    dayEvents.forEach((e,index)=>{
      const overlaps = dayEvents.filter(x => x !== e && !(minutes(x.end) <= minutes(e.start) || minutes(x.start) >= minutes(e.end)));
      const el = eventEl(e);
      if(overlaps.length){
        const group = [e,...overlaps].sort((a,b)=>a.category.localeCompare(b.category));
        const idx = group.findIndex(x=>x===e);
        const width = 100/group.length;
        el.style.left = `calc(${idx*width}% + 5px)`;
        el.style.right = `calc(${100-(idx+1)*width}% + 5px)`;
      }
      col.appendChild(el);
    });
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
    const show=currentFilter==="all" || el.dataset.category===currentFilter;
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

let resizeTimer;
window.addEventListener("resize",()=>{
  clearTimeout(resizeTimer);
  resizeTimer=setTimeout(buildGrid,120);
});

buildGrid();
buildAgenda();
