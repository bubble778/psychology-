const main=document.getElementById("main"), toast=document.getElementById("toast");
let session={events:[],screenings:0,assessments:0};

function esc(x){return String(x??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function flash(x){toast.textContent=x;toast.style.display="block";setTimeout(()=>toast.style.display="none",1600)}
function printPage(){window.print()}
function clearSession(){session={events:[],screenings:0,assessments:0};go("dashboard");flash("ล้างข้อมูล session แล้ว")}
function shell(title,sub,body){return `<div class="content"><section class="hero"><h2>${title}</h2><p>${sub}</p></section>${body}</div>`}
function field(id,label,type="text",extra=""){return `<div class="field"><label>${label}</label><input id="${id}" type="${type}" ${extra}></div>`}
function area(id,label,rows=4){return `<div class="field"><label>${label}</label><textarea id="${id}" rows="${rows}"></textarea></div>`}
function navActive(page){document.querySelectorAll("#nav button").forEach(b=>b.classList.toggle("active",b.dataset.page===page))}
function go(page){navActive(page);main.innerHTML=(pages[page]||pages.dashboard)()}

const pages={};

pages.dashboard=()=>shell("Professional Psychology Toolkit v2","เครื่องมือช่วยงานแบบ privacy-first — ข้อมูลเคสไม่ถูกส่งไป server หรือบันทึกลง browser storage",`
${overdueCount()>0?`<div class="card" style="margin-bottom:14px"><div class="result danger-box"><b>⚠️ มี ${overdueCount()} รายการ Follow-up/Reassessment เลยกำหนดใน session นี้</b><p class="small muted">ดูรายละเอียดที่ Schedule → Follow-up tracker</p></div></div>`:""}
<div class="grid">
<div class="card"><div class="kpi">${session.screenings}</div><div class="muted">Screening ใน session</div></div>
<div class="card"><div class="kpi">${session.assessments}</div><div class="muted">Assessment ใน session</div></div>
<div class="card"><div class="kpi">${session.events.length}</div><div class="muted">รายการนัดใน session</div></div>
<div class="card"><div class="kpi">0</div><div class="muted">ข้อมูลที่เก็บถาวร</div></div>
</div>
<div class="grid" style="margin-top:14px">
${[
["🔎","Screening Hub","คัดกรอง → positive → เลือก assessment","screening"],
["🧠","Adult Clinical","PHQ-9, GAD-7, WHO-5 และ clinical templates","adult"],
["🧒","Child Development","พัฒนาการ, milestone, growth, corrected age, intake และ referral","child"],
["🌱","DIR/Floortime Observation","FEDL profile จากการสังเกต","dir"],
["🧩","Case Formulation","5Ps + goals + risk + protective factors","formulation"],
["🚨","Risk Assessment","ASQ-based screening framework","risk"],
["🎯","Treatment Goals & Follow-up","SMART goals + reassessment planner","goals"],
["🗂️","Case Conceptualization","สรุปรวมจาก formulation/note/risk/goals","caseconcept"],
["📅","Schedule","นัดหมาย/Waitlist แบบ session-only","schedule"],
["📊","Statistics","สถิติ workload จากข้อมูลใน session","statistics"]
].map(x=>`<div class="card"><h3>${x[0]} ${x[1]}</h3><p class="muted">${x[2]}</p><button class="btn" onclick="go('${x[3]}')">เปิด</button></div>`).join("")}
</div>
<div class="card" style="margin-top:14px"><h3>Privacy architecture</h3>
<div class="flow"><div class="node">User input</div><div class="arrow">→</div><div class="node">Browser memory</div><div class="arrow">→</div><div class="node">Calculation</div><div class="arrow">→</div><div class="node">Print/PDF</div><div class="arrow">→</div><div class="node">Refresh = gone</div></div>
<p class="small muted">v2 ไม่ใช้ localStorage, sessionStorage, IndexedDB, Google Sheets, Drive, Docs, database หรือ analytics ใน starter นี้</p></div>`);

function scoreInputs(prefix,n,max=3){return Array.from({length:n},(_,i)=>`<div class="field"><label>ข้อ ${i+1}</label><input id="${prefix}${i+1}" type="number" min="0" max="${max}" value="0"></div>`).join("")}
function sum(prefix,n){return Array.from({length:n},(_,i)=>Number(document.getElementById(prefix+(i+1)).value)||0).reduce((a,b)=>a+b,0)}
pages.adult=()=>shell("Adult Clinical","ตัวคำนวณใช้เมื่อผู้ใช้มีแบบฟอร์มที่ได้รับอนุญาต; ไม่ฝังข้อความเครื่องมือที่มีข้อจำกัดด้านลิขสิทธิ์",`
<div class="grid">
<div class="card"><h3>PHQ-9 Calculator</h3>${scoreInputs("phq",9)}<button class="btn" onclick="calcPHQ()">คำนวณ</button><div id="phqR"></div></div>
<div class="card"><h3>GAD-7 Calculator</h3>${scoreInputs("gad",7)}<button class="btn" onclick="calcGAD()">คำนวณ</button><div id="gadR"></div></div>
<div class="card"><h3>WHO-5 Calculator</h3>${scoreInputs("who",5,5)}<button class="btn" onclick="calcWHO()">คำนวณ</button><div id="whoR"></div></div>
<div class="card"><h3>DASS-21 Calculator</h3><p class="small muted">21 ข้อ, 0-3 (0=ไม่ตรงเลย, 3=ตรงมาก) — แบ่ง Depression/Anxiety/Stress</p>${scoreInputs("dass",21)}<button class="btn" onclick="calcDASS()">คำนวณ</button><div id="dassR"></div></div>
<div class="card"><h3>PSS-10 Calculator</h3><p class="small muted">10 ข้อ, 0-4 (0=ไม่เคย, 4=บ่อยมาก)</p>${scoreInputs("pss",10,4)}<button class="btn" onclick="calcPSS()">คำนวณ</button><div id="pssR"></div></div>
<div class="card"><h3>Rosenberg Self-Esteem</h3><p class="small muted">10 ข้อ, 0-3 (Strongly Disagree→Strongly Agree)</p>${scoreInputs("rse",10)}<button class="btn" onclick="calcRSE()">คำนวณ</button><div id="rseR"></div></div>
<div class="card"><h3>ASRS v1.1 — Part A (adult ADHD screener)</h3><p class="small muted">6 ข้อ ความถี่ในช่วง 6 เดือนที่ผ่านมา (ไม่แสดงข้อความต้นฉบับ ตามเงื่อนไขลิขสิทธิ์)</p>${[1,2,3,4,5,6].map(i=>asrsSelect("asrs"+i,"ข้อ "+i)).join("")}<button class="btn" onclick="calcASRS()">คำนวณ</button><div id="asrsR"></div></div>
<div class="card"><h3>Clinical toolkit — เพิ่มได้ตาม license</h3><span class="tag">AUDIT</span><span class="tag">Mini-Cog</span><span class="tag">MSE</span><span class="tag">Risk</span><p class="small muted">วางแผนไว้ใน v2.3 Clinical Reasoning</p></div>
</div>`);

function tierClass(t){return t==="ok"?"success":t==="warn"?"warning":t==="alert"?"danger-box":""}
function put(id,score,label,detail="",tier=""){document.getElementById(id).innerHTML=`<div class="result ${tierClass(tier)}"><div class="score">${score}</div><b>${label}</b><p class="small muted">${detail}</p></div>`}
function history(tool,score,band){session.history=session.history||{};session.history[tool]=session.history[tool]||[];let prev=session.history[tool].length?session.history[tool][session.history[tool].length-1]:null;session.history[tool].push({score,band,t:Date.now()});return prev}
function historyNote(prev,score){if(!prev)return "";let d=score-prev.score,dir=d>0?"เพิ่มขึ้น":d<0?"ลดลง":"เท่าเดิม";return ` • เทียบครั้งก่อนใน session นี้: ${prev.score} → ${score} (${dir}${d?" "+Math.abs(d)+" คะแนน":""})`}
function renderHistorySummary(){let h=session.history||{},keys=Object.keys(h);if(!keys.length)return "<p class='muted'>ยังไม่มีผลการประเมินใน session นี้</p>";return `<table class="table"><tr><th>เครื่องมือ</th><th>คะแนนล่าสุด</th><th>ระดับ/ผล</th></tr>${keys.map(k=>{let e=h[k][h[k].length-1];return `<tr><td>${k}</td><td>${e.score}</td><td>${e.band}</td></tr>`}).join("")}</table>`}

function calcPHQ(){let s=sum("phq",9);let t=s<=4?"minimal":s<=9?"mild":s<=14?"moderate":s<=19?"moderately severe":"severe";let tier=s<=4?"ok":s<=9?"warn":"alert";let prev=history("PHQ-9",s,t);session.assessments++;put("phqR",s,t,"คะแนนประกอบการประเมิน ไม่ใช่ diagnosis"+historyNote(prev,s),tier);}
function calcGAD(){let s=sum("gad",7);let t=s<=4?"minimal":s<=9?"mild":s<=14?"moderate":"severe";let tier=s<=4?"ok":s<=9?"warn":"alert";let prev=history("GAD-7",s,t);session.assessments++;put("gadR",s,t,"คะแนนประกอบการประเมิน ไม่ใช่ diagnosis"+historyNote(prev,s),tier);}
function calcWHO(){let pct=sum("who",5)*4;let flag=pct<=50;let prev=history("WHO-5",pct,flag?"below threshold":"above threshold");session.assessments++;put("whoR",pct+"%","Well-being index","คะแนน ≤50% ควรพิจารณาประเมินภาวะซึมเศร้าเพิ่มเติม"+historyNote(prev,pct),flag?"alert":"ok");}

// ---- DASS-21 ----
function calcDASS(){
let vals=Array.from({length:21},(_,i)=>Number(document.getElementById("dass"+(i+1)).value)||0);
let dep=[3,5,10,13,16,17,21].reduce((a,i)=>a+vals[i-1],0)*2;
let anx=[2,4,7,9,15,19,20].reduce((a,i)=>a+vals[i-1],0)*2;
let str=[1,6,8,11,12,14,18].reduce((a,i)=>a+vals[i-1],0)*2;
let bd=dep<=9?"normal":dep<=13?"mild":dep<=20?"moderate":dep<=27?"severe":"extremely severe";
let ba=anx<=7?"normal":anx<=9?"mild":anx<=14?"moderate":anx<=19?"severe":"extremely severe";
let bs=str<=14?"normal":str<=18?"mild":str<=25?"moderate":str<=33?"severe":"extremely severe";
let tier=b=>b==="normal"?"ok":(b==="mild"||b==="moderate")?"warn":"alert";
history("DASS-Depression",dep,bd);history("DASS-Anxiety",anx,ba);history("DASS-Stress",str,bs);
session.assessments++;
document.getElementById("dassR").innerHTML=`
<div class="result ${tierClass(tier(bd))}"><b>Depression</b>: ${dep} (${bd})</div>
<div class="result ${tierClass(tier(ba))}"><b>Anxiety</b>: ${anx} (${ba})</div>
<div class="result ${tierClass(tier(bs))}"><b>Stress</b>: ${str} (${bs})</div>
<p class="small muted">คะแนนคูณ 2 เพื่อเทียบเกณฑ์มาตรฐาน DASS-42 — ใช้ประกอบการประเมิน ไม่ใช่ diagnosis</p>`;
}

// ---- PSS-10 ----
function calcPSS(){
let vals=Array.from({length:10},(_,i)=>Number(document.getElementById("pss"+(i+1)).value)||0);
let reverse=[4,5,7,8];
let total=vals.reduce((s,v,idx)=>s+(reverse.includes(idx+1)?4-v:v),0);
let band=total<=13?"low":total<=26?"moderate":"high";
let tier=band==="low"?"ok":band==="moderate"?"warn":"alert";
let prev=history("PSS-10",total,band);
session.assessments++;
put("pssR",total,"Perceived stress: "+band,"ข้อ 4,5,7,8 กลับคะแนนอัตโนมัติ"+historyNote(prev,total),tier);
}

// ---- Rosenberg Self-Esteem ----
function calcRSE(){
let vals=Array.from({length:10},(_,i)=>Number(document.getElementById("rse"+(i+1)).value)||0);
let reverse=[2,5,6,8,9];
let total=vals.reduce((s,v,idx)=>s+(reverse.includes(idx+1)?3-v:v),0);
let band=total<15?"low self-esteem":total<=25?"normal range":"high";
let tier=total<15?"alert":"ok";
let prev=history("Rosenberg",total,band);
session.assessments++;
put("rseR",total,band,"คะแนนรวม (0-30) ข้อ 2,5,6,8,9 กลับคะแนนอัตโนมัติ"+historyNote(prev,total),tier);
}

// ---- ASRS v1.1 Part A screener (threshold-based, no item text reproduced) ----
function asrsSelect(id,label){return `<div class="field"><label>${label}</label><select id="${id}"><option value="0">Never</option><option value="1">Rarely</option><option value="2">Sometimes</option><option value="3">Often</option><option value="4">Very Often</option></select></div>`}
function calcASRS(){
let vals=Array.from({length:6},(_,i)=>Number(document.getElementById("asrs"+(i+1)).value));
let met=vals.filter((v,idx)=>idx<3?v>=2:v>=3).length;
let positive=met>=4;
let prev=history("ASRS-PartA",met,positive?"positive screen":"negative screen");
session.screenings++;
put("asrsR",met+"/6",positive?"Positive screen":"Negative screen","เกณฑ์: เข้าเกณฑ์ ≥4 ใน 6 ข้อ (ข้อ 1-3 นับที่ Sometimes ขึ้นไป, ข้อ 4-6 นับที่ Often ขึ้นไป)"+historyNote(prev,met),positive?"warn":"ok");
}

// ---- M-CHAT-R/F score-only (no items reproduced, licensing) ----
function calcMCHAT(){
let s=Number(document.getElementById("mchatScore").value)||0;
let band=s<=2?"low risk":s<=7?"medium risk":"high risk";
let tier=s<=2?"ok":s<=7?"warn":"alert";
let prev=history("M-CHAT-R",s,band);
session.screenings++;
put("mchatR",s,band,"Low 0-2 (ไม่ต้องดำเนินการเพิ่ม) / Medium 3-7 (ทำ M-CHAT-R/F follow-up) / High 8-20 (ส่งต่อประเมิน + Early Intervention ทันที)"+historyNote(prev,s),tier);
}

// ---- SDQ (subscale raw totals — avoids guessing individual reverse-keyed items) ----
function calcSDQ(){
let emo=+document.getElementById("sdqEmo").value||0,cond=+document.getElementById("sdqCond").value||0,hyper=+document.getElementById("sdqHyper").value||0,peer=+document.getElementById("sdqPeer").value||0,pro=+document.getElementById("sdqPro").value||0;
let total=emo+cond+hyper+peer;
let band=total<=13?"normal":total<=16?"borderline":"abnormal";
let tier=band==="normal"?"ok":band==="borderline"?"warn":"alert";
let prev=history("SDQ-Total",total,band);
session.screenings++;
document.getElementById("sdqR").innerHTML=`<div class="result ${tierClass(tier)}"><b>Total Difficulties</b>: ${total} (${band})</div><p class="small muted">Prosocial (แยกต่างหาก ไม่รวมใน total): ${pro} — bands อ้างอิงเกณฑ์ SDQ มาตรฐาน (parent-rated) ควรตรวจสอบกับ Thai norm ที่หน่วยงานใช้${historyNote(prev,total)}</p>`;
}

// ---- SNAP-IV (domain average — avoids guessing item-level cutoffs) ----
function calcSNAP(){
let ina=+document.getElementById("snapIn").value||0,hyp=+document.getElementById("snapHyper").value||0,odd=+document.getElementById("snapODD").value||0;
let flag=x=>x>=1.78?["elevated (parent-rated cutoff)","alert"]:x>=1?["ควรพิจารณาเพิ่มเติม","warn"]:["ปกติ","ok"];
let[fi,ti]=flag(ina),[fh,th]=flag(hyp),[fo,to]=flag(odd);
session.screenings++;
document.getElementById("snapR").innerHTML=`
<div class="result ${tierClass(ti)}"><b>Inattention</b>: ${ina} — ${fi}</div>
<div class="result ${tierClass(th)}"><b>Hyperactivity/Impulsivity</b>: ${hyp} — ${fh}</div>
<div class="result ${tierClass(to)}"><b>ODD</b>: ${odd} — ${fo}</div>
<p class="small muted">คะแนนเฉลี่ยต่อข้อ (0-3); cutoff ~1.78 อ้างอิงงานวิจัย parent-rated ทั่วไป ควรตรวจสอบกับ norm ที่หน่วยงานใช้จริง</p>`;
}

pages.screening=()=>shell("Screening Hub","ออกแบบให้ screening เป็นตัวคัดกรอง ไม่ใช่การวินิจฉัย",`
<div class="grid">
<div class="card"><h3>เลือก domain</h3>
<div class="check"><input type="checkbox" id="sMood"><label for="sMood">Mood / depression concern</label></div>
<div class="check"><input type="checkbox" id="sAnxiety"><label for="sAnxiety">Anxiety concern</label></div>
<div class="check"><input type="checkbox" id="sDev"><label for="sDev">Developmental concern</label></div>
<div class="check"><input type="checkbox" id="sAlcohol"><label for="sAlcohol">Alcohol-related concern</label></div>
<div class="check"><input type="checkbox" id="sFunction"><label for="sFunction">Functional impairment</label></div>
<button class="btn" onclick="suggestAssessment()">สร้าง next-step</button><div id="screenR"></div></div>
<div class="card"><h3>Screening library</h3><span class="tag">SDQ</span><span class="tag">M-CHAT-R/F</span><span class="tag">DSPM</span><span class="tag">AUDIT</span><span class="tag">ASRS</span><span class="tag">SNAP-IV</span><p class="small muted">รายการนี้เป็น navigation/decision support; ใช้แบบฉบับที่ได้รับอนุญาต</p></div>
<div class="card"><h3>📋 ผลการประเมินใน session นี้</h3>${renderHistorySummary()}<p class="small muted">อัปเดตอัตโนมัติทุกครั้งที่เปิดหน้านี้ใหม่ — คะแนนอยู่ใน browser memory เท่านั้น</p></div>
</div>`);

function suggestAssessment(){session.screenings++;let out=[];if(document.getElementById("sMood").checked)out.push("พิจารณา depression assessment เช่น PHQ-9");if(document.getElementById("sAnxiety").checked)out.push("พิจารณา anxiety assessment เช่น GAD-7");if(document.getElementById("sDev").checked)out.push("พิจารณา developmental assessment และ multidisciplinary referral ตาม domain");if(document.getElementById("sAlcohol").checked)out.push("ทบทวน alcohol use และพิจารณาการประเมินเพิ่มเติม");if(document.getElementById("sFunction").checked)out.push("ประเมิน functional impairment และบริบทชีวิต");if(!out.length)out.push("ยังไม่มี domain ที่เลือก — ทบทวน presenting concern");document.getElementById("screenR").innerHTML=`<div class="result"><b>Suggested next step</b><ul>${out.map(x=>`<li>${x}</li>`).join("")}</ul></div>`}

pages.assessment=()=>shell("Assessment Hub","เลือกเครื่องมือจาก clinical question ไม่ใช่จากคะแนน screening เพียงอย่างเดียว",`
<div class="grid">${[
["Mood","PHQ-9","ติดตาม depressive symptom severity"],
["Anxiety","GAD-7","ติดตาม anxiety symptoms"],
["Stress","PSS-10","ประเมิน perceived stress"],
["Well-being","WHO-5","ประเมิน well-being"],
["Development","Developmental assessment","ประเมินตาม domain และอายุ"],
["Function","Functional assessment","ดูผลกระทบต่อชีวิตประจำวัน/โรงเรียน/งาน"]
].map(x=>`<div class="card"><h3>${x[0]}</h3><span class="tag">${x[1]}</span><p>${x[2]}</p><button class="ghost" onclick="flash('เลือกเครื่องมือ: ${x[1]}')">เลือก</button></div>`).join("")}</div>`);

// ---- v2.2 Child Development Suite helpers ----
const milestoneBank={
2:{"Social":["ยิ้มตอบเมื่อมีคนยิ้มให้/พูดด้วย","สบตาสั้น ๆ เมื่อมีคนอยู่ใกล้"],"Language":["ส่งเสียงอ้อแอ้นอกเหนือจากร้องไห้","สะดุ้ง/ตอบสนองต่อเสียงดัง"],"Cognitive":["จ้องมองหน้าคนใกล้ตัว","มองตามวัตถุที่เคลื่อนผ่านกลางลำตัว"],"Motor":["ยกศีรษะสั้น ๆ ขณะคว่ำ","ขยับแขนขาได้คล่องทั้งสองข้าง"]},
4:{"Social":["ยิ้มเองโดยไม่ต้องมีคนกระตุ้น","ชอบเล่นกับคน/ร้องไห้เมื่อเล่นหยุด"],"Language":["ส่งเสียงพยัญชนะ-สระเล่น","หันหาเสียงพูด"],"Cognitive":["มองตามวัตถุจนสุดสายตา","เอื้อมมือคว้าของเล่น"],"Motor":["ชันคอได้มั่นคงขณะอุ้ม","ดันตัวขึ้นเมื่อคว่ำ"]},
6:{"Social":["รู้จักหน้าคนคุ้นเคย","ชอบส่องกระจก/มองหน้าตัวเอง"],"Language":["ส่งเสียงพยางค์ซ้ำ ๆ","ตอบสนองต่อชื่อตัวเอง"],"Cognitive":["หาของที่ทำตกหรือซ่อนบางส่วน","ส่งของจากมือหนึ่งไปอีกมือ"],"Motor":["นั่งได้โดยพยุงเล็กน้อย","พลิกคว่ำ-หงายได้"]},
9:{"Social":["แสดงอาการกลัวคนแปลกหน้า","มีของเล่น/คนที่ชอบเป็นพิเศษ"],"Language":["เข้าใจคำว่า \"ไม่\"","เลียนเสียงพยัญชนะ"],"Cognitive":["มองหาของที่ซ่อนทั้งหมด","เล่นจ๊ะเอ๋"],"Motor":["นั่งได้มั่นคงโดยไม่พยุง","คลานหรือเคลื่อนที่ไปข้างหน้าได้"]},
12:{"Social":["โบกมือบ๊ายบาย","เล่นเลียนแบบท่าทางง่าย ๆ"],"Language":["พูดคำที่มีความหมาย 1-2 คำ","ทำตามคำสั่งง่าย ๆ ร่วมกับท่าทาง"],"Cognitive":["ชี้นิ้วบอกสิ่งที่ต้องการ","สำรวจของเล่นหลายวิธี"],"Motor":["ยืนเกาะได้","เดินโดยจับมือช่วย/เริ่มเดินเอง"]},
18:{"Social":["ชี้ให้ผู้อื่นดูสิ่งที่สนใจ","เล่นสมมติง่าย ๆ เช่น ป้อนตุ๊กตา"],"Language":["พูดคำศัพท์ได้หลายคำ","ทำตามคำสั่งง่าย ๆ ได้โดยไม่ต้องมีท่าทางช่วย"],"Cognitive":["ชี้ส่วนต่าง ๆ ของร่างกายได้บ้าง","เล่นเลียนแบบกิจวัตรที่เห็นบ่อย"],"Motor":["เดินได้คล่อง","ปีนขึ้นเฟอร์นิเจอร์"]},
24:{"Social":["เล่นข้าง ๆ เด็กคนอื่น","แสดงอารมณ์หลากหลาย"],"Language":["พูดเป็นวลี 2 คำ","เรียกชื่อสิ่งของคุ้นเคยได้"],"Cognitive":["เริ่มเล่นสมมติที่ซับซ้อนขึ้น","จัดกลุ่มของเล่นตามรูปร่าง/สี ได้บ้าง"],"Motor":["วิ่งได้","เตะบอลได้"]},
36:{"Social":["สนใจเล่นกับเด็กคนอื่น","แสดงความเห็นอกเห็นใจเมื่อคนอื่นเจ็บ/เสียใจ"],"Language":["พูดเป็นประโยคสั้น ๆ","คนแปลกหน้าเข้าใจคำพูดได้บางส่วน"],"Cognitive":["ทำตามคำสั่ง 2 ขั้นตอน","เข้าใจแนวคิดเรื่อง \"สอง\""],"Motor":["ปั่นจักรยานสามล้อ","ขึ้นบันไดสลับเท้าได้"]},
48:{"Social":["เล่นร่วมกับเพื่อนแบบมีกติกาง่าย ๆ","เล่นสมมติแบบมีบทบาท"],"Language":["เล่าเรื่องสั้น ๆ ได้","คนภายนอกเข้าใจคำพูดเกือบทั้งหมด"],"Cognitive":["นับของได้บ้าง","เข้าใจแนวคิดเวลาแบบคร่าว ๆ (เช้า/กลางคืน)"],"Motor":["กระโดดขาเดียวได้บ้าง","จับดินสอ/สีได้ถนัดมากขึ้น"]},
60:{"Social":["ต้องการทำให้เพื่อนพอใจ/อยากเป็นเหมือนเพื่อน","แยกแยะเรื่องจริง/สมมติได้บ้าง"],"Language":["เล่าเรื่องที่มีลำดับเหตุการณ์ได้","ใช้ประโยคที่ซับซ้อนขึ้น"],"Cognitive":["นับของได้ถึง 10 ขึ้นไป","เขียนตัวอักษร/ตัวเลขบางตัวได้"],"Motor":["กระโดดสลับเท้าได้","ทรงตัวขาเดียวได้หลายวินาที"]}
};
function msItemsHTML(age){let d=milestoneBank[age];return Object.keys(d).map(dom=>`<b>${dom}</b>`+d[dom].map((t,i)=>`<div class="check"><input type="checkbox" id="ms_${dom}_${i}"><label for="ms_${dom}_${i}">${t}</label></div>`).join("")).join("")}
function renderMSItems(){let age=document.getElementById("msAge").value;document.getElementById("msItems").innerHTML=msItemsHTML(age)}
function calcMilestone(){let age=document.getElementById("msAge").value,d=milestoneBank[age];let rows=Object.keys(d).map(dom=>{let total=d[dom].length,checked=d[dom].filter((_,i)=>document.getElementById("ms_"+dom+"_"+i).checked).length,pct=Math.round(checked/total*100);return{dom,checked,total,pct,flag:pct<50}});session.screenings++;document.getElementById("msR").innerHTML=`<table class="table"><tr><th>Domain</th><th>ผ่าน</th><th>%</th><th>สถานะ</th></tr>${rows.map(r=>`<tr><td>${r.dom}</td><td>${r.checked}/${r.total}</td><td>${r.pct}%</td><td>${r.flag?"⚠️ ควรติดตาม":"✅ ปกติคร่าวๆ"}</td></tr>`).join("")}</table><p class="small muted">Checklist นี้เป็นแนวทางคร่าว ๆ ไม่ใช่เครื่องมือคัดกรองมาตรฐาน ควรใช้ DSPM/ASQ หรือเครื่องมือที่หน่วยงานรับรองประกอบการตัดสินใจ</p>`;}

function growthHTML(){let g=session.growth||[];let rows=g.map(e=>`<tr><td>${esc(e.date)}</td><td>${e.w||"-"}</td><td>${e.h||"-"}</td><td>${e.hc||"-"}</td></tr>`).join("");let trend="";if(g.length>=2){let a=g[g.length-2],b=g[g.length-1],dw=(b.w-a.w).toFixed(2),dh=(b.h-a.h).toFixed(1);trend=`<p class="small muted">เทียบสองครั้งล่าสุด: น้ำหนัก ${dw>=0?"+":""}${dw} kg, ส่วนสูง ${dh>=0?"+":""}${dh} cm</p>`}return(g.length?`<table class="table"><tr><th>วันที่</th><th>น้ำหนัก(kg)</th><th>ส่วนสูง(cm)</th><th>รอบศีรษะ(cm)</th></tr>${rows}</table>`:"<p class='muted'>ยังไม่มีข้อมูล</p>")+trend+`<p class="small muted">เก็บ trend ใน session เท่านั้น ไม่คำนวณ percentile — ใช้ร่วมกับกราฟ WHO Child Growth Standards หรือกราฟกรมอนามัยฉบับทางการเพื่อ plot percentile จริง</p>`}
function addGrowth(){session.growth=session.growth||[];session.growth.push({date:document.getElementById("gwDate").value,w:+document.getElementById("gwWeight").value||0,h:+document.getElementById("gwHeight").value||0,hc:+document.getElementById("gwHead").value||0});document.getElementById("growthR").innerHTML=growthHTML();}

function calcMatrix(){let domains=["Social communication","Language","Motor","Cognitive","Behavior/Regulation","Sensory"];let results=domains.map(d=>{let id="cm_"+d.replace(/[^a-zA-Z]/g,"");return{d,v:+document.getElementById(id).value}});session.concernMatrix=results;let flagged=results.filter(r=>r.v>=2),sig=results.filter(r=>r.v>=3);let summary=sig.length?"มี domain ระดับมาก — พิจารณาส่งต่อ multidisciplinary team โดยเร็ว":flagged.length?"มี domain ระดับปานกลางขึ้นไป — พิจารณาการประเมินเพิ่มเติมตาม domain":"ยังไม่มี domain ที่เข้าเกณฑ์ต้องส่งต่อทันที — ติดตามตามความเหมาะสม";document.getElementById("matrixR").innerHTML=`<div class="result ${sig.length?"danger-box":flagged.length?"warning":"success"}"><b>สรุป</b><p>${summary}</p>${flagged.length?`<p class="small muted">Domain ที่ควรติดตาม: ${flagged.map(r=>r.d).join(", ")}</p>`:""}</div>`;}

function interviewSummary(){let ids=[["Pregnancy/Birth","piPregnancy"],["Milestones","piMilestone"],["Medical/Sleep/Feeding","piMedical"],["Daily routine/Regulation","piRoutine"],["Parent concern","piConcern"],["Strengths","piStrength"]];session.assessments++;document.getElementById("piR").innerHTML=`<div class="result">${ids.map(x=>`<p><b>${x[0]}</b><br>${esc(document.getElementById(x[1]).value)||"-"}</p>`).join("")}</div>`;}

pages.child=()=>shell("Child Development","สำหรับ developmental intake, milestone, growth, corrected age, referral และการวางแผนประเมิน",`
<div class="grid">
<div class="card"><h3>Parent Interview (Developmental History)</h3>${area("piPregnancy","ประวัติการตั้งครรภ์/การคลอด")}${area("piMilestone","พัฒนาการที่ผ่านมา (คลาน เดิน พูดคำแรก ฯลฯ)")}${area("piMedical","ประวัติทางการแพทย์/การนอน/การกินที่เกี่ยวข้องกับพัฒนาการ")}${area("piRoutine","กิจวัตรประจำวันและการควบคุมอารมณ์")}${area("piConcern","ข้อกังวลหลักของผู้ปกครอง")}${area("piStrength","จุดแข็ง/สิ่งที่เด็กทำได้ดี")}<button class="btn" onclick="interviewSummary()">สรุป</button><div id="piR"></div></div>
<div class="card"><h3>Corrected Age</h3><div class="row">${field("dob","วันเกิด","date")}${field("assessDate","วันที่ประเมิน","date")}</div>${field("gestAge","อายุครรภ์เมื่อคลอด (สัปดาห์)","number",'min="20" max="42" value="32"')}<button class="btn" onclick="corrected()">คำนวณ</button><div id="ageR"></div></div>
<div class="card"><h3>Milestone Checklist</h3><p class="small muted">แนวทางคร่าว ๆ อิงแนวคิดสาธารณะ ไม่ใช่ฉบับเต็มทางการ (CDC/DSPM)</p><div class="field"><label>ช่วงอายุ</label><select id="msAge" onchange="renderMSItems()">${Object.keys(milestoneBank).map(a=>`<option value="${a}"${a==="2"?" selected":""}>${a} เดือน</option>`).join("")}</select></div><div id="msItems">${msItemsHTML(2)}</div><button class="btn" onclick="calcMilestone()">ประเมิน</button><div id="msR"></div></div>
<div class="card"><h3>Growth Tracker (session-only)</h3><div class="row">${field("gwDate","วันที่ชั่ง","date")}${field("gwWeight","น้ำหนัก (kg)","number",'step="0.01" min="0"')}</div><div class="row">${field("gwHeight","ส่วนสูง (cm)","number",'step="0.1" min="0"')}${field("gwHead","รอบศีรษะ (cm, ถ้ามี)","number",'step="0.1" min="0"')}</div><button class="btn" onclick="addGrowth()">บันทึก</button><div id="growthR">${growthHTML()}</div></div>
<div class="card"><h3>Developmental Concern Matrix</h3>${["Social communication","Language","Motor","Cognitive","Behavior/Regulation","Sensory"].map(d=>{let id="cm_"+d.replace(/[^a-zA-Z]/g,"");return `<div class="field"><label>${d}</label><select id="${id}"><option value="0">ไม่มีข้อกังวล</option><option value="1">เล็กน้อย</option><option value="2">ปานกลาง</option><option value="3">มาก</option></select></div>`}).join("")}<button class="btn" onclick="calcMatrix()">สรุป</button><div id="matrixR"></div></div>
<div class="card"><h3>Early Intervention Pathway — Case tracking</h3><ol><li>Parent concern</li><li>Screening</li><li>Clinical observation</li><li>Domain assessment</li><li>Multidisciplinary review</li><li>Intervention + follow-up</li></ol><div class="field"><label>สถานะปัจจุบันของเคสนี้</label><select id="eiStage"><option>Parent concern</option><option>Screening</option><option>Clinical observation</option><option>Domain assessment</option><option>Multidisciplinary review</option><option>Intervention + follow-up</option></select></div><button class="btn" onclick="flash('บันทึกสถานะ: '+document.getElementById('eiStage').value)">บันทึกสถานะ (session)</button></div>
<div class="card"><h3>Observation domains</h3><span class="tag">Social communication</span><span class="tag">Play</span><span class="tag">Language</span><span class="tag">Adaptive</span><span class="tag">Motor</span><span class="tag">Regulation</span><span class="tag">Sensory context</span></div>
<div class="card"><h3>SDQ — Total Difficulties</h3><p class="small muted">กรอกคะแนนรวมแต่ละ subscale จากฉบับกระดาษที่ใช้ (แต่ละ subscale 0-10)</p>${field("sdqEmo","Emotional symptoms (0-10)","number",'min="0" max="10" value="0"')}${field("sdqCond","Conduct problems (0-10)","number",'min="0" max="10" value="0"')}${field("sdqHyper","Hyperactivity (0-10)","number",'min="0" max="10" value="0"')}${field("sdqPeer","Peer problems (0-10)","number",'min="0" max="10" value="0"')}${field("sdqPro","Prosocial (0-10)","number",'min="0" max="10" value="0"')}<button class="btn" onclick="calcSDQ()">คำนวณ</button><div id="sdqR"></div></div>
<div class="card"><h3>SNAP-IV — Domain averages</h3><p class="small muted">กรอกคะแนนเฉลี่ยต่อข้อของแต่ละ domain จากฉบับกระดาษที่ใช้ (0-3)</p>${field("snapIn","Inattention (avg 0-3)","number",'min="0" max="3" step="0.1" value="0"')}${field("snapHyper","Hyperactivity/Impulsivity (avg 0-3)","number",'min="0" max="3" step="0.1" value="0"')}${field("snapODD","ODD (avg 0-3)","number",'min="0" max="3" step="0.1" value="0"')}<button class="btn" onclick="calcSNAP()">คำนวณ</button><div id="snapR"></div></div>
<div class="card"><h3>M-CHAT-R/F — Score only</h3><p class="small muted">กรอกคะแนนรวมจากฉบับกระดาษที่ใช้ (ไม่แสดงข้อความต้นฉบับ ตามเงื่อนไขลิขสิทธิ์)</p>${field("mchatScore","คะแนนรวม (0-20)","number",'min="0" max="20" value="0"')}<button class="btn" onclick="calcMCHAT()">คำนวณ</button><div id="mchatR"></div></div>
</div>`);

function corrected(){let b=new Date(document.getElementById("dob").value),a=new Date(document.getElementById("assessDate").value),ga=Number(document.getElementById("gestAge").value);if(!b.getTime()||!a.getTime())return flash("กรอกวันที่");let weeks=Math.floor((a-b)/604800000),cw=weeks-(40-ga);document.getElementById("ageR").innerHTML=`<div class="result"><b>Corrected age (ประมาณ)</b><p>${Math.floor(cw/4.345)} เดือน ${Math.round(cw%4.345)} สัปดาห์</p></div>`}

pages.dir=()=>shell("DIR/Floortime Observation","อิง Functional Emotional Developmental Levels (FEDL) ตามแนวคิด Greenspan & Wieder — ใช้เป็นแนวทางสังเกต ไม่ใช่แบบประเมินมาตรฐานที่มีคะแนนตัดสิน",`
<div class="grid-2"><div class="card">
${[["FEDL 1","Self-regulation & interest in the world"],["FEDL 2","Engagement & relating"],["FEDL 3","Two-way purposeful communication"],["FEDL 4","Complex problem-solving & shared social communication"],["FEDL 5","Using symbols & emotional ideas"],["FEDL 6","Emotional thinking & logical bridging of ideas"]].map((f,i)=>`<div class="field"><label>${f[0]} — ${f[1]}</label><select id="fedl${i}"><option value="0">Not yet observed</option><option value="1">Emerging</option><option value="2">Established</option></select></div>`).join("")}
</div><div class="card">
${area("dirObs","สิ่งที่สังเกตเห็น (behavior notes)",6)}
${area("dirCaregiver","การมีส่วนร่วมของผู้ดูแล (affect, follow child's lead, circles of communication)",4)}
<button class="btn" onclick="dirSummary()">สร้างสรุป</button><div id="dirR"></div>
</div></div>`);

function dirSummary(){let levels=["FEDL 1 — Self-regulation & interest","FEDL 2 — Engagement & relating","FEDL 3 — Two-way communication","FEDL 4 — Complex problem-solving","FEDL 5 — Symbols & emotional ideas","FEDL 6 — Emotional/logical thinking"];let vals=levels.map((l,i)=>+document.getElementById("fedl"+i).value);let established=levels.filter((l,i)=>vals[i]===2),emerging=levels.filter((l,i)=>vals[i]===1),notyet=levels.filter((l,i)=>vals[i]===0);let highest=established.length?established[established.length-1]:"ยังไม่มีระดับที่ established ชัดเจน";session.assessments++;document.getElementById("dirR").innerHTML=`<div class="result"><b>Established</b><p>${established.join(", ")||"-"}</p><b>Emerging</b><p>${emerging.join(", ")||"-"}</p><b>Not yet observed</b><p>${notyet.join(", ")||"-"}</p><b>Observation notes</b><p>${esc(document.getElementById("dirObs").value)||"-"}</p><b>Caregiver involvement</b><p>${esc(document.getElementById("dirCaregiver").value)||"-"}</p></div><p class="small muted">Highest established level: ${highest} — ใช้เป็นจุดเริ่มต้นวางแผน Floortime session ตาม developmental level ของเด็ก</p>`;}

pages.formulation=()=>shell("Case Formulation — 5Ps","Template สำหรับ clinical reasoning; ไม่ควรใส่ข้อมูลระบุตัวบุคคลในระบบนี้",`
<div class="grid-2"><div class="card">
${area("fPresent","Presenting")}
${area("fPred","Predisposing")}
${area("fPrec","Precipitating")}
${area("fPerp","Perpetuating")}
${area("fProt","Protective")}
</div><div class="card">
${area("fGoals","Goals")}
${area("fStrength","Strengths")}
${area("fPlan","Intervention plan")}
${area("fFollow","Follow-up plan")}
<button class="btn" onclick="formulation()">สร้างสรุป</button><div id="formR"></div>
</div></div>`);

function formulation(){let ids=[["Presenting","fPresent"],["Predisposing","fPred"],["Precipitating","fPrec"],["Perpetuating","fPerp"],["Protective","fProt"],["Goals","fGoals"],["Strengths","fStrength"],["Plan","fPlan"],["Follow-up","fFollow"]];let vals=ids.map(x=>[x[0],esc(document.getElementById(x[1]).value)]);session.formulation=vals;document.getElementById("formR").innerHTML=`<div class="result">${vals.map(x=>`<p><b>${x[0]}</b><br>${x[1]||"-"}</p>`).join("")}</div>`}

const mseFields=[["mseApp","Appearance",["Well-groomed","Disheveled","Age-appropriate","Unusual dress"]],["mseBeh","Behavior",["Cooperative","Guarded","Restless/agitated","Psychomotor slowing"]],["mseSpeech","Speech",["Normal rate/volume","Pressured","Slowed","Slurred"]],["mseMood","Mood (patient-reported)","free"],["mseAffect","Affect",["Congruent","Flat/blunted","Labile","Restricted"]],["mseThoughtP","Thought process",["Linear/goal-directed","Tangential","Circumstantial","Disorganized"]],["mseThoughtC","Thought content",["No abnormal content noted","Preoccupations noted","Overvalued ideas noted","Further evaluation needed"]],["msePerc","Perception",["No abnormality noted","Further evaluation needed"]],["mseCog","Cognition",["Grossly intact","Impaired attention/concentration","Impaired memory","Further evaluation needed"]],["mseInsight","Insight",["Good","Fair","Limited","Poor"]],["mseJudg","Judgment",["Good","Fair","Limited","Poor"]]];
function mseFieldHTML(f){let[id,label,opts]=f;if(opts==="free")return `<div class="field"><label>${label}</label><input id="${id}" type="text"></div>`;return `<div class="field"><label>${label}</label><select id="${id}"><option value="">— เลือก —</option>${opts.map(o=>`<option>${o}</option>`).join("")}</select></div>`}
function generateMSE(){let lines=mseFields.map(f=>{let v=document.getElementById(f[0]).value;return v?`${f[1]}: ${esc(v)}`:null}).filter(Boolean);let report=lines.join("\\n");document.getElementById("nMSE").value=report;flash("แทรกลงช่อง MSE ในบันทึกแล้ว")}

pages.notes=()=>shell("Progress Notes / MSE","ใช้เป็น template และตรวจทานโดยผู้ประกอบวิชาชีพก่อนนำไปใช้จริง",`
<div class="card"><h3>MSE Generator</h3><p class="small muted">เลือกจากตัวเลือกมาตรฐาน แล้วกด "สร้าง MSE" เพื่อแทรกลงช่อง MSE ด้านล่าง</p><div class="grid">${mseFields.map(mseFieldHTML).join("")}</div><button class="btn" onclick="generateMSE()">สร้าง MSE</button></div>
<div class="card" style="margin-top:14px"><div class="grid-2">
<div>${area("nSubjective","Subjective")}${area("nObjective","Objective")}${area("nMSE","MSE")}</div>
<div>${area("nAssessment","Assessment")}${area("nPlan","Plan")}${area("nRisk","Risk / safety summary")}</div>
</div><button class="btn" onclick="notePreview()">Preview note</button><div id="noteR"></div></div>`);

function notePreview(){let ids=["nSubjective","nObjective","nMSE","nAssessment","nPlan","nRisk"];let names=["S","O","MSE","A","P","Risk"];let vals=ids.map((id,i)=>[names[i],esc(document.getElementById(id).value)]);session.lastNote=vals;document.getElementById("noteR").innerHTML=`<div class="result">${vals.map(x=>`<p><b>${x[0]}</b><br>${x[1]||"-"}</p>`).join("")}</div>`}

// ---- v2.3 Risk Assessment (ASQ-based, NIMH public domain framework) ----
pages.risk=()=>shell("Risk Assessment — ASQ framework","อิงกรอบ Ask Suicide-Screening Questions (ASQ, NIMH — public domain) เป็นเครื่องมือ decision-support สำหรับผู้ประกอบวิชาชีพ ไม่ใช่การวินิจฉัย",`
<div class="card">
<div class="field"><label>1) ในช่วงสัปดาห์ที่ผ่านมา รู้สึกอยากตายหรือหวังว่าตัวเองตายไปหรือไม่</label><select id="asq1"><option value="0">No</option><option value="1">Yes</option></select></div>
<div class="field"><label>2) ในช่วงสัปดาห์ที่ผ่านมา รู้สึกว่าตัวเองหรือครอบครัวจะดีขึ้นถ้าตายไป</label><select id="asq2"><option value="0">No</option><option value="1">Yes</option></select></div>
<div class="field"><label>3) ในสัปดาห์ที่ผ่านมา มีความคิดอยากฆ่าตัวตายหรือไม่</label><select id="asq3"><option value="0">No</option><option value="1">Yes</option></select></div>
<div class="field"><label>4) เคยพยายามฆ่าตัวตายมาก่อนหรือไม่ (ตลอดชีวิต)</label><select id="asq4"><option value="0">No</option><option value="1">Yes</option></select></div>
<div class="field"><label>5) (ถามเฉพาะกรณีตอบ Yes ข้อใดข้อหนึ่งข้างต้น) ขณะนี้มีความคิดอยากฆ่าตัวตายอยู่หรือไม่</label><select id="asq5"><option value="0">No</option><option value="1">Yes</option></select></div>
<button class="btn" onclick="calcRisk()">ประเมิน</button><div id="riskR"></div>
</div>`);
function calcRisk(){
let v1=+document.getElementById("asq1").value,v2=+document.getElementById("asq2").value,v3=+document.getElementById("asq3").value,v4=+document.getElementById("asq4").value,v5=+document.getElementById("asq5").value;
let anyPositive=v1||v2||v3||v4;
let level,action,tier;
if(!anyPositive){level="Negative screen";action="ไม่เข้าเกณฑ์ที่ต้องประเมินเพิ่มเติมทันที — ติดตามตามปกติทางคลินิก";tier="ok";}
else if(v5){level="Acute positive screen";action="ต้องได้รับการประเมินความปลอดภัยแบบเต็มรูปแบบทันที ก่อนออกจากการดูแล ไม่ควรปล่อยผู้รับบริการอยู่ตามลำพัง แจ้งผู้บังคับบัญชา/ทีมที่เกี่ยวข้อง และพิจารณาสายด่วนสุขภาพจิต 1323 หากอยู่นอกบริบทคลินิก";tier="alert";}
else{level="Non-acute positive screen";action="จำเป็นต้องมีการประเมินความปลอดภัยโดยผู้เชี่ยวชาญ (brief safety assessment) ก่อนสิ้นสุดการพบ ไม่จำเป็นต้องเป็นเหตุฉุกเฉินทันที แต่ห้ามละเลย";tier="warn";}
session.risk={v1,v2,v3,v4,v5,level,action,t:Date.now()};
session.assessments++;
put("riskR",level,level,action,tier);
}

// ---- v2.3 Treatment Goal Builder + Follow-up Planner ----
pages.goals=()=>shell("Treatment Goals & Follow-up","SMART goal builder และตัววางแผน follow-up (เชื่อมกับ Schedule)",`
<div class="grid-2">
<div class="card"><h3>เพิ่ม Treatment Goal</h3>
${field("gDomain","Domain (เช่น emotion regulation, social communication)")}
${area("gDesc","Goal statement (Specific/Measurable)",3)}
${field("gTarget","Target behavior / criteria")}
<div class="field"><label>แนวทาง/Modality</label><select id="gApproach"><option>CBT</option><option>ACT</option><option>DBT</option><option>Family Therapy</option><option>Parent Coaching</option><option>Play Therapy</option><option>DIR/Floortime</option><option>Other</option></select></div>
${field("gTimeline","Timeline (เช่น 8 สัปดาห์)")}
<button class="btn" onclick="addGoal()">เพิ่ม goal</button>
</div>
<div class="card"><h3>Follow-up Planner</h3>
${field("fuTool","เครื่องมือ reassessment (เช่น PHQ-9)")}
${field("fuWeeks","ระยะเวลาถึงนัดถัดไป (สัปดาห์)","number",'min="1" value="4"')}
${field("fuCase","Case code","text",'placeholder="C-001"')}
<button class="btn" onclick="planFollowUp()">เพิ่มเข้า Schedule</button><div id="fuR"></div>
</div>
</div>
<div class="card" style="margin-top:14px"><h3>Goal list (session)</h3><div id="goalR">${goalsHTML()}</div></div>`);

function goalsHTML(){let g=session.goals||[];return g.length?`<table class="table"><tr><th>Domain</th><th>Goal</th><th>Target</th><th>Modality</th><th>Timeline</th></tr>${g.map(x=>`<tr><td>${esc(x.domain)}</td><td>${esc(x.desc)}</td><td>${esc(x.target)}</td><td>${esc(x.approach)}</td><td>${esc(x.timeline)}</td></tr>`).join("")}</table>`:"<p class='muted'>ยังไม่มี goal</p>"}
function addGoal(){session.goals=session.goals||[];session.goals.push({domain:document.getElementById("gDomain").value,desc:document.getElementById("gDesc").value,target:document.getElementById("gTarget").value,approach:document.getElementById("gApproach").value,timeline:document.getElementById("gTimeline").value});document.getElementById("goalR").innerHTML=goalsHTML();flash("เพิ่ม goal แล้ว");}
function planFollowUp(){let tool=document.getElementById("fuTool").value,weeks=+document.getElementById("fuWeeks").value||4,code=document.getElementById("fuCase").value;let d=new Date();d.setDate(d.getDate()+weeks*7);session.events=session.events||[];session.events.push({date:d.toISOString().slice(0,16),code:code,type:"Reassessment",note:"Reassess: "+tool});document.getElementById("fuR").innerHTML=`<div class="result success"><b>เพิ่มลง Schedule แล้ว</b><p>${esc(code)} — Reassess ${esc(tool)} — ${d.toLocaleDateString("th-TH")}</p></div>`;}

// ---- v2.3 Case Conceptualization (integrates Formulation, MSE/Note, Risk, Goals, Concern Matrix) ----
pages.caseconcept=()=>shell("Case Conceptualization Summary","รวบรวมข้อมูลจาก Case Formulation, Progress Note, Risk Assessment, Treatment Goals และ Developmental Concern Matrix ที่กรอกไว้ใน session นี้",`
<div class="card"><button class="btn" onclick="buildCaseConcept()">สร้างสรุป</button> <button class="ghost" onclick="printPage()">🖨 Print</button><div id="ccR"></div></div>`);
function buildCaseConcept(){
let out="";
if(session.formulation)out+=`<div class="result"><h3>Case Formulation (5Ps)</h3>${session.formulation.map(x=>`<p><b>${x[0]}</b><br>${x[1]||"-"}</p>`).join("")}</div>`;
else out+=`<div class="result warning"><p class="muted">ยังไม่มีข้อมูล Case Formulation — ไปกรอกที่หน้า Case Formulation ก่อน</p></div>`;
if(session.concernMatrix){let flagged=session.concernMatrix.filter(r=>r.v>=2);out+=`<div class="result"><h3>Developmental Concern Matrix</h3>${flagged.length?`<ul>${flagged.map(r=>`<li>${r.d}: ระดับ ${r.v}</li>`).join("")}</ul>`:"<p class='muted'>ไม่มี domain ที่เข้าเกณฑ์</p>"}</div>`}
if(session.risk)out+=`<div class="result ${session.risk.tier?tierClass(session.risk.tier):""}"><h3>Risk Assessment</h3><p><b>${session.risk.level}</b></p><p class="small muted">${session.risk.action}</p></div>`;
if(session.lastNote)out+=`<div class="result"><h3>Latest Progress Note</h3>${session.lastNote.map(x=>`<p><b>${x[0]}</b><br>${x[1]||"-"}</p>`).join("")}</div>`;
if(session.goals&&session.goals.length)out+=`<div class="result"><h3>Treatment Goals</h3>${goalsHTML()}</div>`;
document.getElementById("ccR").innerHTML=out||"<p class='muted'>ยังไม่มีข้อมูลใน session นี้</p>";
}

// ---- v2.4 Practice Management: calendar views, waitlist, follow-up tracker ----
function eventsSorted(){return (session.events||[]).slice().sort((a,b)=>new Date(a.date)-new Date(b.date))}
function listViewHTML(){let ev=eventsSorted();return ev.length?`<table class="table"><tr><th>Date</th><th>Case</th><th>Type</th><th>Note</th></tr>${ev.map(e=>`<tr><td>${esc(e.date)}</td><td>${esc(e.code)}</td><td>${esc(e.type)}</td><td>${esc(e.note)}</td></tr>`).join("")}</table>`:"<p class='muted'>ยังไม่มีรายการ</p>"}
function weekViewHTML(anchorStr){let anchor=anchorStr?new Date(anchorStr):new Date();let day=anchor.getDay();let sun=new Date(anchor);sun.setDate(anchor.getDate()-day);let days=Array.from({length:7},(_,i)=>{let d=new Date(sun);d.setDate(sun.getDate()+i);return d});let ev=session.events||[];let cols=days.map(d=>{let dstr=d.toISOString().slice(0,10);let dayEvents=ev.filter(e=>e.date&&e.date.slice(0,10)===dstr);return `<div class="card"><h4>${d.toLocaleDateString("th-TH",{weekday:"short",day:"numeric",month:"short"})}</h4>${dayEvents.length?dayEvents.map(e=>`<div class="tag">${(e.date.slice(11,16)||"")} ${esc(e.code)} — ${esc(e.type)}</div>`).join(""):"<p class='muted small'>ว่าง</p>"}</div>`});return `<div class="grid" style="grid-template-columns:repeat(7,1fr)">${cols.join("")}</div>`}
function renderSchedule(){let view=document.getElementById("schedView").value,anchor=document.getElementById("schedAnchor").value;document.getElementById("eventR").innerHTML=view==="week"?weekViewHTML(anchor):listViewHTML();}
function addEvent(){session.events=session.events||[];session.events.push({date:document.getElementById("evDate").value,code:document.getElementById("evCase").value,type:document.getElementById("evType").value,note:document.getElementById("evNote").value});renderSchedule();}

function waitlistHTML(){let w=session.waitlist||[];return w.length?`<table class="table"><tr><th>Case</th><th>Priority</th><th>วันที่เพิ่ม</th><th>หมายเหตุ</th><th></th></tr>${w.map((x,i)=>`<tr><td>${esc(x.code)}</td><td>${esc(x.priority)}</td><td>${esc(x.dateAdded)}</td><td>${esc(x.note)}</td><td><button class="ghost" onclick="promoteWaitlist(${i})">Promote</button> <button class="ghost" onclick="removeWaitlist(${i})">Remove</button></td></tr>`).join("")}</table>`:"<p class='muted'>Waitlist ว่าง</p>"}
function addWaitlist(){session.waitlist=session.waitlist||[];session.waitlist.push({code:document.getElementById("wlCase").value,priority:document.getElementById("wlPriority").value,dateAdded:new Date().toISOString().slice(0,10),note:document.getElementById("wlNote").value});document.getElementById("waitlistR").innerHTML=waitlistHTML();}
function removeWaitlist(i){session.waitlist.splice(i,1);document.getElementById("waitlistR").innerHTML=waitlistHTML();}
function promoteWaitlist(i){let w=session.waitlist[i];session.events=session.events||[];session.events.push({date:new Date().toISOString().slice(0,16),code:w.code,type:"Initial",note:"Promoted from waitlist"+(w.note?": "+w.note:"")});session.waitlist.splice(i,1);document.getElementById("waitlistR").innerHTML=waitlistHTML();document.getElementById("eventR").innerHTML=listViewHTML();flash("Promote "+w.code+" เข้าตารางนัดแล้ว");}

function followUpHTML(){let ev=session.events||[];let today=new Date();let relevant=ev.filter(e=>e.type==="Reassessment"||e.type==="Follow-up").map(e=>({...e,d:new Date(e.date)})).sort((a,b)=>a.d-b.d);if(!relevant.length)return "<p class='muted'>ยังไม่มีรายการ follow-up/reassessment</p>";return `<table class="table"><tr><th>วันที่</th><th>Case</th><th>ประเภท</th><th>หมายเหตุ</th><th>สถานะ</th></tr>${relevant.map(e=>`<tr><td>${esc(e.date)}</td><td>${esc(e.code)}</td><td>${esc(e.type)}</td><td>${esc(e.note)}</td><td>${e.d<today?"⚠️ เลยกำหนด":"🔜 กำลังจะถึง"}</td></tr>`).join("")}</table>`}
function overdueCount(){let ev=session.events||[],today=new Date();return ev.filter(e=>(e.type==="Reassessment"||e.type==="Follow-up")&&new Date(e.date)<today).length}

pages.schedule=()=>shell("Schedule / Waitlist","รายการนี้อยู่ใน JavaScript memory เท่านั้น — refresh แล้วหาย",`
<div class="card"><div class="row">${field("evDate","วันที่/เวลา","datetime-local")}${field("evCase","Case code","text",'placeholder="C-001"')}</div><div class="row"><div class="field"><label>ประเภท</label><select id="evType"><option>Initial</option><option>Follow-up</option><option>Reassessment</option><option>Supervision</option><option>Teaching</option></select></div>${field("evNote","หมายเหตุสั้น ๆ")}</div><button class="btn" onclick="addEvent()">เพิ่ม</button></div>
<div class="card" style="margin-top:14px"><h3>Session schedule</h3><div class="row"><div class="field"><label>มุมมอง</label><select id="schedView" onchange="renderSchedule()"><option value="list">List</option><option value="week">Week</option></select></div><div class="field"><label>สัปดาห์อ้างอิง (สำหรับ Week view)</label><input id="schedAnchor" type="date" value="${new Date().toISOString().slice(0,10)}" onchange="renderSchedule()"></div></div><div id="eventR">${listViewHTML()}</div></div>
<div class="card" style="margin-top:14px"><h3>Waitlist</h3><div class="row">${field("wlCase","Case code","text",'placeholder="C-002"')}<div class="field"><label>Priority</label><select id="wlPriority"><option>Routine</option><option>Priority</option><option>Urgent</option></select></div></div>${field("wlNote","หมายเหตุ")}<button class="btn" onclick="addWaitlist()">เพิ่มเข้า waitlist</button><div id="waitlistR" style="margin-top:10px">${waitlistHTML()}</div></div>
<div class="card" style="margin-top:14px"><h3>📌 Follow-up / Reassessment tracker</h3>${followUpHTML()}</div>`);

function referralSuggestions(){let m=session.concernMatrix;let map={"Social communication":"Psychology / Developmental pediatrics","Language":"SLP","Motor":"PT/OT","Cognitive":"Psychology / Developmental pediatrics","Behavior/Regulation":"Psychology / OT (sensory-regulation)","Sensory":"OT"};if(!m)return `<div class="card"><h3>🎯 Suggested referral</h3><p class="muted">ยังไม่มีข้อมูลจาก Developmental Concern Matrix (ไปที่ Child Development เพื่อกรอก)</p></div>`;let flagged=m.filter(r=>r.v>=2);return flagged.length?`<div class="card"><h3>🎯 Suggested referral (จาก Concern Matrix)</h3><ul>${flagged.map(r=>`<li><b>${r.d}</b> (ระดับ ${r.v}) → ${map[r.d]}</li>`).join("")}</ul></div>`:`<div class="card"><h3>🎯 Suggested referral</h3><p class="muted">ยังไม่มี domain ที่เข้าเกณฑ์แนะนำส่งต่อจาก Concern Matrix</p></div>`}
pages.referral=()=>shell("Referral Pathway","decision-support template — referral ปลายทางควรอิงระบบจริงของหน่วยงานและพื้นที่",`
<div class="grid">
${referralSuggestions()}
${[
["Mental health / psychiatric","อาการรุนแรง, risk, diagnostic complexity → ประเมินโดยผู้เชี่ยวชาญที่เหมาะสม"],
["Developmental pediatrics","สงสัยพัฒนาการหลาย domain / medical-developmental concern"],
["Psychology","assessment, formulation, psychotherapy ตามขอบเขตวิชาชีพ"],
["OT","occupation, sensory-motor, ADL, participation"],
["SLP","speech, language, communication, feeding ตามขอบเขต"],
["PT","gross motor / mobility / physical function"],
["Social work","family, social determinants, safeguarding / community support"]
].map(x=>`<div class="card"><h3>${x[0]}</h3><p>${x[1]}</p></div>`).join("")}</div>`);

pages.resources=()=>shell("Psychoeducation Resource Library","วางลิงก์หรือเอกสารที่หน่วยงานมีสิทธิ์เผยแพร่ได้ โดยไม่เก็บข้อมูลผู้รับบริการ",`
<div class="grid">${["Sleep hygiene","Stress & coping","Emotion regulation","Parent coaching","School collaboration","Developmental milestones","When to seek help","Communication supports"].map(x=>`<div class="card"><h3>📄 ${x}</h3><p class="muted">Resource placeholder</p><button class="ghost" onclick="flash('เพิ่ม resource ได้ใน repository')">จัดการ</button></div>`).join("")}</div>`);

function workloadHTML(){let ev=session.events||[];let byType={};ev.forEach(e=>byType[e.type]=(byType[e.type]||0)+1);let byWeek={};ev.forEach(e=>{if(!e.date)return;let d=new Date(e.date);if(!d.getTime())return;let onejan=new Date(d.getFullYear(),0,1);let week=Math.ceil((((d-onejan)/86400000)+onejan.getDay()+1)/7);let key=d.getFullYear()+"-W"+week;byWeek[key]=(byWeek[key]||0)+1});return `<div class="grid">
<div class="card"><h3>By type</h3>${Object.keys(byType).length?Object.keys(byType).map(k=>`<div>${esc(k)}: <b>${byType[k]}</b></div>`).join(""):"<p class='muted'>ยังไม่มีข้อมูลจาก Schedule</p>"}</div>
<div class="card"><h3>By week</h3>${Object.keys(byWeek).length?Object.keys(byWeek).sort().map(k=>`<div>${k}: <b>${byWeek[k]}</b></div>`).join(""):"<p class='muted'>ยังไม่มีข้อมูล</p>"}</div>
<div class="card"><h3>Total นัดหมายใน session</h3><div class="kpi">${ev.length}</div></div>
</div>`}
pages.statistics=()=>shell("Statistics / Workload","Workload ด้านบนคำนวณอัตโนมัติจากรายการใน Schedule; ตัวคำนวณ ratio ด้านล่างกรอกเอง",`
<div class="card"><h3>📊 Workload dashboard (auto จาก Schedule)</h3>${workloadHTML()}</div>
<div class="grid" style="margin-top:14px"><div class="card">${field("st","Total sessions","number",'min="0" value="0"')}${field("sa","Assessments","number",'min="0" value="0"')}${field("sf","Follow-ups","number",'min="0" value="0"')}<button class="btn" onclick="stats()">คำนวณ ratio</button><div id="statR"></div></div><div class="card"><h3>Privacy note</h3><p>ไม่มี patient-level dataset และไม่มี historical database ในระบบนี้</p></div></div>`);
function stats(){let a=+document.getElementById("st").value||0,b=+document.getElementById("sa").value||0,c=+document.getElementById("sf").value||0;document.getElementById("statR").innerHTML=`<div class="result"><div>Assessment ratio: ${a?Math.round(b/a*100):0}%</div><div>Follow-up ratio: ${a?Math.round(c/a*100):0}%</div></div>`}

// ---- v2.5 Professional Reference library ----
const dsmChapters=[
["Neurodevelopmental Disorders","ASD, ADHD, Intellectual Disability, SLD, Communication & Motor disorders — onset in developmental period"],
["Schizophrenia Spectrum & Other Psychotic Disorders","Delusions, hallucinations, disorganized thinking/behavior"],
["Bipolar & Related Disorders","Manic/hypomanic + depressive episodes"],
["Depressive Disorders","MDD, PDD/dysthymia, DMDD, PMDD"],
["Anxiety Disorders","GAD, panic, phobias, social anxiety, separation anxiety"],
["Obsessive-Compulsive & Related Disorders","OCD, body dysmorphic, hoarding, trichotillomania"],
["Trauma- & Stressor-Related Disorders","PTSD, acute stress, adjustment disorders, RAD"],
["Dissociative Disorders","Dissociative identity, amnesia, depersonalization/derealization"],
["Somatic Symptom & Related Disorders","Distressing somatic symptoms with excessive thoughts/behaviors"],
["Feeding & Eating Disorders","Anorexia, bulimia, binge-eating, ARFID"],
["Elimination Disorders","Enuresis, encopresis"],
["Sleep-Wake Disorders","Insomnia, hypersomnia, parasomnias, breathing-related"],
["Disruptive, Impulse-Control & Conduct Disorders","ODD, CD, IED, kleptomania"],
["Substance-Related & Addictive Disorders","Substance use disorders, gambling disorder"],
["Neurocognitive Disorders","Delirium, mild/major NCD"],
["Personality Disorders","Cluster A/B/C patterns"]
];
const icdChapters=[
["Neurodevelopmental disorders","ASD, ADHD, disorders of intellectual development, developmental speech/language & motor disorders"],
["Schizophrenia or other primary psychotic disorders",""],
["Catatonia",""],
["Mood disorders","Bipolar/related, depressive disorders"],
["Anxiety or fear-related disorders",""],
["Obsessive-compulsive or related disorders",""],
["Disorders specifically associated with stress","PTSD, complex PTSD, adjustment disorder, RAD"],
["Dissociative disorders",""],
["Feeding or eating disorders",""],
["Elimination disorders",""],
["Bodily distress or bodily experience disorders",""],
["Disorders due to substance use or addictive behaviours",""],
["Impulse control disorders",""],
["Disruptive behaviour or dissocial disorders","ODD, conduct-dissocial disorder"],
["Personality disorders and related traits",""],
["Neurocognitive disorders",""]
];
const assessmentIndex=[
["PHQ-9","Depression screening — adult","adult","built"],["GAD-7","Anxiety screening — adult","adult","built"],["WHO-5","Well-being index","adult","built"],
["DASS-21","Depression/Anxiety/Stress","adult","built"],["PSS-10","Perceived stress","adult","built"],["Rosenberg RSES","Self-esteem","adult","built"],
["ASRS v1.1 Part A","Adult ADHD screener (WHO/Kessler)","adult","built"],["SDQ","Strengths & Difficulties — child/adolescent","child","built"],
["SNAP-IV","ADHD/ODD rating — child","child","built"],["M-CHAT-R/F","Autism screening — toddler","child","built"],
["AUDIT","Alcohol use screening","adult","planned"],["Mini-Cog","Cognitive screening — older adult","adult","planned"],
["BDI-II","Depression inventory (proprietary — license required)","adult","external"],["Vanderbilt ADHD Rating Scale","ADHD — child, parent/teacher forms","child","external"],
["CBCL","Child Behavior Checklist (proprietary — license required)","child","external"],["Vineland-3","Adaptive behavior (proprietary)","child","external"],
["Bayley-4","Infant/toddler development (proprietary)","child","external"],["ADOS-2 / ADI-R","Autism diagnostic — requires certified training","child","external"]
];
const therapyApproaches=[
["CBT","Links thoughts-feelings-behaviors; structured, present-focused, uses cognitive restructuring & behavioral experiments"],
["ACT","Acceptance & Commitment Therapy — psychological flexibility, values-based action, defusion from unhelpful thoughts"],
["DBT","Combines CBT with mindfulness/acceptance; skills in distress tolerance, emotion regulation, interpersonal effectiveness"],
["Schema Therapy","Targets early maladaptive schemas & modes, integrates cognitive/experiential/behavioral techniques"],
["Family Therapy","Works with the family system, communication patterns, and relational dynamics rather than the individual alone"],
["Parent Coaching","Builds parent skills/responsiveness to support the child's development and regulation"],
["Play Therapy","Uses play as the child's natural medium for expression, processing, and skill-building"],
["DIR/Floortime","Follows the child's lead to build FEDL capacities through affect-based, relationship-driven interaction"],
["Trauma-Informed Practice","Recognizes trauma impact; prioritizes safety, trust, choice, collaboration, and avoiding re-traumatization"]
];
const neurodevConditions=[
["Autism Spectrum Disorder","Social communication differences + restricted/repetitive patterns — see M-CHAT-R/F, DIR/Floortime Observation"],
["ADHD","Inattention and/or hyperactivity-impulsivity impacting function — see ASRS (adult), SNAP-IV (child)"],
["Intellectual Disability / GDD","Deficits in intellectual & adaptive functioning relative to developmental expectations"],
["Specific Learning Disorder","Persistent difficulty in reading, writing, or math despite adequate instruction"],
["Communication Disorders","Language, speech sound, fluency, or social (pragmatic) communication difficulties — see SLP referral"],
["Motor Disorders (DCD, Tics)","Developmental coordination disorder, tic disorders, stereotypic movement disorder"]
];
const childDevRefs=[
["DSPM (Thai national)","Developmental Surveillance and Promotion Manual used in Thai well-child care"],
["CDC Learn the Signs. Act Early.","US public developmental milestone surveillance program"],
["ASQ-3","Ages & Stages Questionnaires — parent-completed developmental screening"],
["Denver II","Structured developmental screening tool"],
["Bayley-4 / Vineland-3","Standardized developmental & adaptive behavior assessments (proprietary, trained administration)"]
];
function refFilter(){let q=document.getElementById("refSearch").value.toLowerCase();document.querySelectorAll("#refBody .card").forEach(c=>c.style.display=c.innerText.toLowerCase().includes(q)?"":"none")}
pages.reference=()=>shell("Reference & Licensing","Navigation/index เท่านั้น — ไม่คัดลอกเกณฑ์วินิจฉัยฉบับเต็มหรือข้อคำถามที่มีลิขสิทธิ์ ใช้คู่กับคู่มือ/ฉบับที่ได้รับอนุญาตจริง",`
<div class="field"><label>ค้นหาในหน้านี้</label><input id="refSearch" type="text" oninput="refFilter()" placeholder="พิมพ์เพื่อกรอง เช่น ADHD, CBT, ICD"></div>
<div id="refBody" class="grid">
<div class="card"><h3>DSM-5-TR — Chapter index</h3>${dsmChapters.map(x=>`<p><b>${x[0]}</b><br><span class="small muted">${x[1]}</span></p>`).join("")}<p class="small muted">รายชื่อหมวดหมู่เพื่อ navigation เท่านั้น — เกณฑ์วินิจฉัยฉบับเต็มต้องใช้จากคู่มือ DSM-5-TR ที่มีลิขสิทธิ์</p></div>
<div class="card"><h3>ICD-11 — Chapter 06 blocks</h3>${icdChapters.map(x=>`<p><b>${x[0]}</b>${x[1]?`<br><span class="small muted">${x[1]}</span>`:""}</p>`).join("")}<p class="small muted">รหัสที่แน่นอนควรตรวจสอบกับ ICD-11 browser ทางการ (icd.who.int)</p></div>
<div class="card"><h3>Assessment Index</h3><table class="table"><tr><th>เครื่องมือ</th><th>ใช้กับ</th><th>สถานะ</th></tr>${assessmentIndex.map(x=>`<tr><td>${x[0]}<br><span class="small muted">${x[1]}</span></td><td>${x[2]}</td><td>${x[3]==="built"?`<button class="ghost" onclick="go('${x[2]==='adult'?'adult':'child'}')">เปิดเครื่องคำนวณ</button>`:x[3]==="planned"?"🔧 วางแผนไว้":"🔒 external/licensed"}</td></tr>`).join("")}</table></div>
<div class="card"><h3>Psychotherapy Approaches</h3>${therapyApproaches.map(x=>`<p><b>${x[0]}</b><br><span class="small muted">${x[1]}</span></p>`).join("")}</div>
<div class="card"><h3>Neurodevelopmental Conditions</h3>${neurodevConditions.map(x=>`<p><b>${x[0]}</b><br><span class="small muted">${x[1]}</span></p>`).join("")}</div>
<div class="card"><h3>Child Development References</h3>${childDevRefs.map(x=>`<p><b>${x[0]}</b><br><span class="small muted">${x[1]}</span></p>`).join("")}</div>
<div class="card"><h3>Assessment licensing</h3><p>ตรวจ license ก่อนฝังข้อคำถาม, manual, scoring rules หรือ forms ฉบับเต็มของเครื่องมือใด ๆ ในระบบนี้</p></div>
</div>`);

pages.privacy=()=>shell("Privacy Center","สถาปัตยกรรม v2 ตั้งใจให้เป็น stateless/session-only",`
<div class="grid">
<div class="card"><h3>สิ่งที่ไม่มี</h3><ul><li>Google Drive storage</li><li>Google Sheets</li><li>Google Docs</li><li>Database</li><li>localStorage</li><li>sessionStorage</li><li>IndexedDB</li><li>Analytics / tracking ใน starter</li></ul></div>
<div class="card"><h3>สิ่งที่มี</h3><ul><li>HTML/CSS/JavaScript</li><li>Browser memory</li><li>Local calculations</li><li>Print / browser PDF</li></ul></div>
</div>
<div class="card" style="margin-top:14px"><h3>Security boundary</h3><div class="result warning"><b>Privacy-first ≠ automatic clinical compliance.</b><p>หากนำไปใช้กับข้อมูลผู้รับบริการจริง ต้องพิจารณานโยบายขององค์กร กฎหมาย/จริยธรรม การควบคุมอุปกรณ์ การส่งออก PDF และความเสี่ยงจาก clipboard/print/browser อย่างแยกต่างหาก</p></div></div>`);

function filterNav(){let q=document.getElementById("search").value.toLowerCase();document.querySelectorAll("#nav button").forEach(b=>b.style.display=b.innerText.toLowerCase().includes(q)?"block":"none")}
document.querySelectorAll("#nav button").forEach(b=>b.onclick=()=>go(b.dataset.page));
go("dashboard");
