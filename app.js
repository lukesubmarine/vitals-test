(function(){
"use strict";
const DATA=window.VITALS_DATA;
const EDIT_PASSCODE="3272";
if(!DATA||!Array.isArray(DATA.catalog))throw new Error("VITALS checklist data did not load.");
const SIZES=DATA.sizes;
const STORE_KEY="vitals-store";
const $=id=>document.getElementById(id);
const homePage=$("homePage"),detailPage=$("detailPage"),searchInput=$("searchInput");
const resultBox=$("results"),filterBox=$("filters"),cloudStatus=$("cloudStatus");
const cloudConfig=window.VITALS_CLOUD_CONFIG||{};
const legacyTitles=["Unconscious but breathing","Cardiac arrest — CPR and AED","Severe bleeding","Burns and scalds","Choking — blocked airways","Asthma attack","Anaphylaxis","Epileptic seizure","Suspected fracture","Heat exhaustion and heatstroke","Hypoglycaemia — low blood sugar","Stroke"];
const legacyDescriptions=["unresponsive, passed out, recovery position","collapse, not breathing normally, defibrillator","haemorrhage, haemorrhaging, blood loss, wound","thermal burn, hot liquid, chemical or electrical burn","airway obstruction, foreign object","wheezing, difficulty breathing, constricted breathing","severe allergic reaction, adrenaline autoinjector","fit, convulsion, epilepsy","broken bone, limb injury","overheating, heat illness","diabetes, hypo","facial droop, weakness, slurred speech, FAST"];
const legacyTemplates=[
["Recognises the scenario and identifies the main concern.","Checks the scene for danger before approaching.","Gets appropriate help and communicates clearly.","Provides suitable immediate support within their training.","Monitors the person and seeks further help if their condition changes."],
["Introduces themselves and gains cooperation where possible.","Uses a structured approach to check immediate safety.","Identifies relevant signs and symptoms.","Asks focused questions about what happened and when.","Calls emergency services when indicated.","Chooses an appropriate first-aid response within their training.","Explains actions and reassures the person.","Avoids actions that could worsen the situation.","Reassesses the person's condition after intervention.","Provides a concise handover to the next level of care."],
["Completes a systematic scene-safety and personal-protection check.","Identifies immediate life threats and prioritises them.","Assesses responsiveness and the person's ability to communicate.","Checks relevant symptoms, onset, mechanism and medical history.","Recognises signs that require urgent escalation.","Activates emergency response promptly and delegates tasks clearly.","Selects an intervention consistent with current accredited training.","Explains the purpose of each action and obtains cooperation where possible.","Uses equipment appropriately and checks it is suitable.","Avoids contraindicated, unnecessary or unsafe interventions.","Reassesses after each significant intervention.","Monitors for deterioration and anticipates likely complications.","Maintains the person's dignity, warmth and comfort.","Records key observations, timings and interventions.","Gives a structured handover, including changes and response to care."]
];
function same(a,b){return JSON.stringify(a)===JSON.stringify(b)}
function oldGeneric(record,index){
 if(index>=legacyTitles.length||!record||!Array.isArray(record.levels))return false;
 const expected=[1,2,3].map(n=>legacyTemplates[n-1].slice(0,SIZES[n-1]).map(x=>x.replaceAll("the scenario",legacyTitles[index].toLowerCase())));
 return same(record.levels,expected);
}
function validLevels(levels){return Array.isArray(levels)&&levels.length===3&&levels.every((level,i)=>Array.isArray(level)&&level.length===SIZES[i]&&level.every(x=>typeof x==="string"))}
function normalizeChecks(checks,levels){return levels.map((items,i)=>items.map((_,j)=>Boolean(Array.isArray(checks&&checks[i])&&checks[i][j])))}
function parseStored(){try{const value=JSON.parse(localStorage.getItem(STORE_KEY)||"null");return Array.isArray(value)?value:[]}catch(_){return[]}}
let previous=parseStored();
let pending=localStorage.getItem("vitals-pending")==="1";
const oldById=new Map(previous.filter(item=>item&&item.id).map(item=>[item.id,item]));
const store=DATA.catalog.map((base,index)=>{
 const prior=oldById.get(base.id);
 oldById.delete(base.id);
 const item={id:base.id,name:base.name,category:base.category,desc:base.desc,aliases:base.aliases.slice(),levels:base.levels.map(a=>a.slice()),checks:[[],[],[]],localOnly:false};
 if(!prior)return item;
 const generic=oldGeneric(prior,index);
 const customLabel=index<legacyTitles.length&&(prior.name!==legacyTitles[index]||prior.desc!==legacyDescriptions[index]);
 const changedCriteria=!generic&&validLevels(prior.levels)&&!same(prior.levels,base.levels);
 if(customLabel||changedCriteria)pending=true;
 item.name=prior.name||item.name;
 item.desc=prior.desc||item.desc;
 const priorAliases=Array.isArray(prior.aliases)?prior.aliases:(typeof prior.aliases==="string"?prior.aliases.split(/[|,;]/):[]);
 item.aliases=Array.from(new Set(item.aliases.concat(priorAliases)));
 if(!generic&&validLevels(prior.levels)){
  item.levels=prior.levels.map(a=>a.slice());
  item.checks=normalizeChecks(prior.checks,item.levels);
 }
 return item;
});
for(const prior of oldById.values()){
 if(String(prior.id).startsWith("custom-")||prior.localOnly){
  const levels=validLevels(prior.levels)?prior.levels.map(a=>a.slice()):DATA.catalog[0].levels.map(a=>a.slice());
  store.push({id:prior.id,name:prior.name||"Custom checklist",category:prior.category||"Custom",desc:prior.desc||"",aliases:Array.isArray(prior.aliases)?prior.aliases:(prior.aliases||"").split(/[|,;]/),levels,checks:normalizeChecks(prior.checks,levels),localOnly:true});
  pending=true;
 }
}
let current=null,activeLevel=1,activeCategory="ALL",editUnlocked=false,pendingEditAction=null,unlockTimer=null,cloudToken=null,lastUpdated=null;
function persist(markDirty){
 if(markDirty)pending=true;
 try{localStorage.setItem(STORE_KEY,JSON.stringify(store));localStorage.setItem("vitals-pending",pending?"1":"0")}catch(_){setCloudStatus("This browser could not save local checklist data.")}
 updateCloudStatus();
}
persist(false);

function normalize(text){return String(text||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim()}
function termsFor(item){const aliases=Array.isArray(item.aliases)?item.aliases:(typeof item.aliases==="string"?item.aliases.split(/[|,;]/):[]);return[item.name,item.desc].concat(aliases).map(normalize).filter(Boolean)}
function distance(a,b){const row=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let diagonal=row[0];row[0]=i;for(let j=1;j<=b.length;j++){const above=row[j];row[j]=Math.min(row[j]+1,row[j-1]+1,diagonal+(a[i-1]===b[j-1]?0:1));diagonal=above}}return row[b.length]}
const synonyms={"bleeding":["haemorrhage","hemorrhage","haemorrhaging","blood loss"],"haemorrhage":["bleeding","hemorrhage"],"difficulty breathing":["constricted breathing","shortness of breath"],"constricted breathing":["difficulty breathing","shortness of breath"],"choking":["blocked airways","blocked airway","airway obstruction"],"blocked airways":["choking","airway obstruction"],"snakebite":["snake bite"],"hyperthermia":["heat illness","heatstroke"],"panic":["panic attack"]};
function score(item,query){
 const q=normalize(query);if(!q)return 0;
 const terms=termsFor(item),expanded=[q].concat((synonyms[q]||[]).map(normalize));
 if(terms.includes(q))return 100;
 if(terms.some(term=>term.includes(q)||q.includes(term)))return 88;
 if(expanded.slice(1).some(alias=>terms.some(term=>term.includes(alias)||alias.includes(term))))return 84;
 const words=q.split(" ").filter(word=>word.length>2),hay=terms.join(" ");
 const hits=words.filter(word=>hay.includes(word)).length;
 if(words.length&&hits)return 45+hits*10/words.length;
 let best=0;
 if(q.length>4)terms.forEach(term=>term.split(" ").forEach(word=>best=Math.max(best,1-distance(q,word)/Math.max(q.length,word.length))));
 return best>.72?44:0;
}
function categoriesNow(){
 const found=store.map(item=>item.category||"Custom");
 return DATA.categories.filter(item=>found.includes(item)).concat(found.filter(item=>!DATA.categories.includes(item)).filter((item,index,list)=>list.indexOf(item)===index));
}
function setCloudStatus(message){cloudStatus.textContent=message}
function cloudReady(){
 const url=String(cloudConfig.url||"").trim().replace(/\/+$/,"");
 return /^https:\/\/[a-z0-9.-]+$/i.test(url)&&typeof cloudConfig.anonKey==="string"&&cloudConfig.anonKey.trim().length>20;
}
function updateCloudStatus(){
 if(pending)setCloudStatus("LOCAL CHECKLIST EDITS WAITING TO PUBLISH");
 else if(lastUpdated)setCloudStatus("SHARED LIST UPDATED "+new Date(lastUpdated).toLocaleString());
 else if(cloudReady())setCloudStatus("SHARED LIST READY · CHECKING FOR UPDATES");
 else setCloudStatus("OFFLINE-FIRST · SHARED UPDATES NEED ONE-TIME SETUP");
}
function renderFilters(){
 filterBox.innerHTML="";
 ["ALL"].concat(categoriesNow()).forEach(category=>{
  const button=document.createElement("button");button.type="button";button.className="filter"+(category===activeCategory?" active":"");button.textContent=category==="ALL"?"ALL SCENARIOS":category.toUpperCase();
  button.addEventListener("click",()=>{activeCategory=category;renderFilters();renderHome()});filterBox.appendChild(button);
 });
}
function resultButton(item){
 const button=document.createElement("button");button.type="button";button.className="result";
 const text=document.createElement("span");text.textContent=item.name;
 const description=document.createElement("small");description.textContent=item.desc||"First aid training checklist";text.appendChild(description);
 const arrow=document.createElement("span");arrow.className="arrow";arrow.textContent="›";button.append(text,arrow);
 button.addEventListener("click",()=>openChecklist(item.id));return button;
}
function renderHome(){
 const query=searchInput.value.trim();
 const available=store.filter(item=>activeCategory==="ALL"||(item.category||"Custom")===activeCategory);
 resultBox.innerHTML="";
 if(!query){
  if(!available.length){const empty=document.createElement("div");empty.className="empty";empty.textContent="No checklists in this category.";resultBox.appendChild(empty);return}
  const groups=new Map();available.forEach(item=>{const category=item.category||"Custom";if(!groups.has(category))groups.set(category,[]);groups.get(category).push(item)});
  const order=categoriesNow();
  Array.from(groups.entries()).sort((a,b)=>order.indexOf(a[0])-order.indexOf(b[0])).forEach(([category,items])=>{
   const section=document.createElement("section");section.className="group";const heading=document.createElement("h3");heading.textContent=category.toUpperCase()+" · "+items.length;section.appendChild(heading);items.forEach(item=>section.appendChild(resultButton(item)));resultBox.appendChild(section);
  });
  return;
 }
 const matches=available.map(item=>({item,score:score(item,query)})).filter(entry=>entry.score>=38).sort((a,b)=>b.score-a.score).slice(0,16);
 matches.forEach(entry=>resultBox.appendChild(resultButton(entry.item)));
 if(!matches.length||!matches.some(entry=>normalize(entry.item.name)===normalize(query))){
  const empty=document.createElement("div");empty.className="empty";empty.appendChild(document.createTextNode(matches.length?"Not what you need?":"No matching checklist found."));
  const button=document.createElement("button");button.type="button";button.className="primary";button.style.marginTop="13px";button.textContent="＋ CREATE “"+query.toUpperCase()+"” CHECKLIST";button.addEventListener("click",()=>requestEdit(()=>openCreate(query)));empty.appendChild(document.createElement("br"));empty.appendChild(button);resultBox.appendChild(empty);
 }
}
function openChecklist(id){
 current=store.find(item=>item.id===id)||null;if(!current)return;
 activeLevel=1;homePage.classList.remove("active");homePage.hidden=true;detailPage.hidden=false;detailPage.classList.add("active");$("editor").classList.remove("open");renderDetail();window.scrollTo(0,0);
}
function goHome(){
 current=null;detailPage.classList.remove("active");detailPage.hidden=true;homePage.hidden=false;homePage.classList.add("active");renderFilters();renderHome();window.scrollTo(0,0);
}
function renderDetail(){
 if(!current)return;
 current.checks=normalizeChecks(current.checks,current.levels);
 $("scenarioTitle").textContent=current.name;$("scenarioDescription").textContent=current.desc||"FIRST AID TRAINING CHECKLIST";$("scenarioCategory").textContent=current.category||"CUSTOM";
 document.querySelectorAll(".tab").forEach(button=>{const selected=Number(button.dataset.level)===activeLevel;button.classList.toggle("active",selected);button.setAttribute("aria-selected",selected?"true":"false")});
 $("levelName").textContent=["FOUNDATION","DEVELOPING","DETAILED"][activeLevel-1];
 const criteria=current.levels[activeLevel-1],checks=current.checks[activeLevel-1];$("progressCount").textContent=checks.filter(Boolean).length+" / "+criteria.length+" COMPLETE";
 const list=$("criteriaList");list.innerHTML="";
 criteria.forEach((text,index)=>{
  const row=document.createElement("div");row.className="criterion"+(checks[index]?" done":"");const check=document.createElement("input");check.className="tick";check.type="checkbox";check.id="criterion-"+index;check.checked=checks[index];const label=document.createElement("label");label.htmlFor=check.id;label.textContent=text;
  check.addEventListener("change",()=>{current.checks[activeLevel-1][index]=check.checked;persist(false);renderDetail()});row.append(check,label);list.appendChild(row);
 });
}
function showModal(id){$(id).classList.add("open");$(id).setAttribute("aria-hidden","false")}
function hideModal(id){$(id).classList.remove("open");$(id).setAttribute("aria-hidden","true")}
function requestEdit(action){
 if(editUnlocked){action();return}
 pendingEditAction=action;$("passcodeInput").value="";showModal("passcodeModal");setTimeout(()=>$("passcodeInput").focus(),20);
}
function openCreate(query){
 $("newTitle").value=query||"";$("newDescription").value="";
 fillCategory($("newCategory"),activeCategory==="ALL"?"Injury":activeCategory);
 showModal("createModal");setTimeout(()=>$("newTitle").focus(),20);
}
function fillCategory(select,value){
 const options=categoriesNow().concat(["Custom"]).filter((category,index,list)=>list.indexOf(category)===index);
 select.innerHTML="";options.forEach(category=>{const option=document.createElement("option");option.value=category;option.textContent=category;select.appendChild(option)});
 select.value=options.includes(value)?value:(options[0]||"Custom");
}
function openEditor(){
 if(!current)return;
 const values=current.levels[activeLevel-1],fields=$("editorFields");fields.innerHTML="";
 $("editorHeading").textContent="EDIT LEVEL "+activeLevel;
 values.forEach((text,index)=>{const row=document.createElement("div");row.className="edit-row";const area=document.createElement("textarea");area.className="field";area.rows=2;area.setAttribute("aria-label","Criterion "+(index+1));area.value=text;row.appendChild(area);fields.appendChild(row)});
 $("editor").classList.add("open");$("editor").scrollIntoView({behavior:"smooth"});
}
function customLevels(name){
 const title=String(name||"scenario").toLowerCase();
 return[
  ["Recognises "+title+" and identifies the main concern.","Checks the scene for danger before approaching.","Gets appropriate help and communicates clearly.","Provides suitable immediate support within training.","Monitors the person and reassesses for changes."],
  ["Introduces themselves and gains cooperation where possible.","Uses a structured approach to check safety.","Identifies relevant signs and symptoms.","Asks what happened and when.","Calls emergency services when indicated.","Chooses an action within current first-aid training.","Explains actions and reassures the person.","Avoids actions that could worsen the situation.","Reassesses after intervention.","Gives a concise handover."],
  ["Checks scene safety and uses appropriate protection.","Identifies and prioritises immediate life threats.","Assesses responsiveness and communication.","Checks symptoms, onset, mechanism and relevant history.","Recognises signs needing urgent escalation.","Calls emergency services promptly and delegates tasks.","Selects an action consistent with accredited training.","Explains the purpose of actions.","Uses equipment appropriately.","Avoids unsafe or unnecessary interventions.","Reassesses after significant actions.","Monitors for deterioration.","Maintains dignity, warmth and comfort.","Records key observations and timing.","Gives a structured handover."]
 ];
}
function openRename(){
 if(!current)return;
 $("renameTitle").value=current.name;$("renameDescription").value=current.desc||"";fillCategory($("renameCategory"),current.category||"Custom");showModal("renameModal");
}
function normalizeChecksForAll(item){item.checks=normalizeChecks(item.checks,item.levels)}
function projectUrl(){return String(cloudConfig.url||"").trim().replace(/\/+$/,"")}
function cloudMessage(text){$("cloudMessage").textContent=text}
function openCloud(){
 if(!cloudReady()){ $("cloudHelp").textContent="Shared backup needs a one-time Supabase setup. See SETUP.md and supabase-setup.sql in the replacement package.";cloudMessage("Project URL and public publishable key are not set in public-config.js."); }
 else{ $("cloudHelp").textContent="Anyone can read the published list. Only the owner account configured in Supabase can publish.";cloudMessage(pending?"This device has unpublished checklist edits. Publish them or load the shared version.":"Checklist edits publish only when you choose to publish."); }
 $("ownerCredentials").hidden=Boolean(cloudToken);$("signOutButton").hidden=!cloudToken;$("publishButton").textContent=cloudToken?"PUBLISH CHANGES":"SIGN IN & PUBLISH";
 $("ownerEmail").value="";$("ownerPassword").value="";showModal("cloudModal");
}
function sharedPayload(){
 return{catalogVersion:DATA.catalogVersion,publishedAt:new Date().toISOString(),checklists:store.map(item=>({id:item.id,name:item.name,category:item.category||"Custom",desc:item.desc||"",aliases:Array.isArray(item.aliases)?item.aliases:[],levels:item.levels,localOnly:false}))};
}
function validSharedItem(item){return item&&typeof item.id==="string"&&typeof item.name==="string"&&validLevels(item.levels)}
async function loadShared(force){
 if(!cloudReady()){cloudMessage("Add the Supabase URL and public publishable key to public-config.js first.");return false}
 if(!navigator.onLine){cloudMessage("You are offline. Saved checklists remain available on this device.");return false}
 cloudMessage("Checking for the latest shared list…");
 try{
  const response=await fetch(projectUrl()+"/rest/v1/vitals_checklists?id=eq.1&select=payload,updated_at",{headers:{apikey:cloudConfig.anonKey}});
  if(!response.ok)throw new Error("Database request failed ("+response.status+"). Check the SQL setup and public key.");
  const rows=await response.json(),row=rows[0];
  if(!row||!row.payload||!Array.isArray(row.payload.checklists)||!row.payload.checklists.length){cloudMessage("No shared checklist has been published yet. Built-in checklists remain available.");return false}
  if(pending&&!force){cloudMessage("This device has unpublished edits. Choose Load Shared List to replace its checklist definitions, or publish your local edits.");return false}
  if(pending&&force&&!window.confirm("Loading the shared list replaces this device's unpublished checklist edits. Local progress stays here. Continue?"))return false;
  const progress=new Map(store.map(item=>[item.id,item.checks]));
  let next=row.payload.checklists.filter(validSharedItem).map(item=>Object.assign({},item,{aliases:Array.isArray(item.aliases)?item.aliases:[],localOnly:false,checks:normalizeChecks(progress.get(item.id),item.levels)}));
  if(Number(row.payload.catalogVersion||0)<DATA.catalogVersion){const have=new Set(next.map(item=>item.id));DATA.catalog.forEach(item=>{if(!have.has(item.id))next.push(Object.assign({},item,{levels:item.levels.map(a=>a.slice()),checks:normalizeChecks(progress.get(item.id),item.levels)}))})}
  store.filter(item=>item.localOnly).forEach(item=>{if(!next.some(remote=>remote.id===item.id))next.push(item)});
  store.splice(0,store.length,...next);pending=false;lastUpdated=row.updated_at||row.payload.publishedAt||null;persist(false);renderFilters();
  if(current){const id=current.id;current=store.find(item=>item.id===id)||null;if(current)renderDetail();else goHome()}else renderHome();
  cloudMessage("Loaded the shared checklist list. Progress stays local to this device.");updateCloudStatus();return true;
 }catch(error){cloudMessage(error.message||"Could not load shared checklists.");return false}
}
async function publishShared(){
 if(!cloudReady()){cloudMessage("Add the Supabase URL and public publishable key to public-config.js first.");return false}
 if(!navigator.onLine){cloudMessage("Reconnect to the internet before publishing.");return false}
 if(!cloudToken){cloudMessage("Sign in with the authorized owner account.");return false}
 cloudMessage("Publishing checklist changes…");
 try{
  const response=await fetch(projectUrl()+"/rest/v1/vitals_checklists?id=eq.1",{method:"PATCH",headers:{apikey:cloudConfig.anonKey,Authorization:"Bearer "+cloudToken,"Content-Type":"application/json",Prefer:"return=representation"},body:JSON.stringify({payload:sharedPayload()})});
  if(!response.ok){const detail=await response.text();throw new Error("Could not publish ("+response.status+"). "+detail.slice(0,200))}
  const rows=await response.json();if(!rows.length)throw new Error("No shared row was updated. Check that the signed-in account matches the owner UUID in Supabase.");
  pending=false;lastUpdated=rows[0].updated_at||new Date().toISOString();persist(false);cloudMessage("Published. Visitors to this same website can load the list while online.");return true;
 }catch(error){cloudMessage(error.message||"Could not publish checklist changes.");return false}
}
async function signInAndPublish(){
 if(!cloudReady()){cloudMessage("Add the Supabase URL and public publishable key to public-config.js first.");return}
 if(cloudToken){await publishShared();return}
 const email=$("ownerEmail").value.trim(),password=$("ownerPassword").value;
 if(!email||!password){cloudMessage("Enter the owner email and password for this Supabase project.");return}
 cloudMessage("Signing in to Supabase…");
 try{
  const response=await fetch(projectUrl()+"/auth/v1/token?grant_type=password",{method:"POST",headers:{apikey:cloudConfig.anonKey,"Content-Type":"application/json"},body:JSON.stringify({email:email,password:password})});
  const result=await response.json();if(!response.ok)throw new Error(result.msg||result.message||result.error_description||"Sign-in failed. Check the owner account.");
  cloudToken=result.access_token;$("ownerPassword").value="";$("ownerCredentials").hidden=true;$("signOutButton").hidden=false;$("publishButton").textContent="PUBLISH CHANGES";await publishShared();
 }catch(error){cloudMessage(error.message||"Could not sign in.")}
}
function initialize(){
 document.querySelectorAll(".tab").forEach(button=>button.addEventListener("click",()=>{activeLevel=Number(button.dataset.level);$("editor").classList.remove("open");renderDetail()}));
 $("searchInput").addEventListener("input",renderHome);
 $("homeButton").addEventListener("click",goHome);$("backButton").addEventListener("click",goHome);
 $("editLevelButton").addEventListener("click",()=>requestEdit(()=>{$("editor").classList.contains("open")?$("editor").classList.remove("open"):openEditor()}));
 $("cancelEditorButton").addEventListener("click",()=>$("editor").classList.remove("open"));
 $("saveEditorButton").addEventListener("click",()=>requestEdit(()=>{
  const values=Array.from($("editorFields").querySelectorAll("textarea")).map(area=>area.value.trim());
  if(values.length!==SIZES[activeLevel-1]){window.alert("This level must contain exactly "+SIZES[activeLevel-1]+" criteria.");return}
  current.levels[activeLevel-1]=values.map(value=>value||"Add a criterion.");current.checks[activeLevel-1]=SIZES[activeLevel-1].map(()=>false);persist(true);$("editor").classList.remove("open");renderDetail();
 }));
 $("editChecklistButton").addEventListener("click",()=>requestEdit(openRename));
 $("cancelRenameButton").addEventListener("click",()=>hideModal("renameModal"));
 $("saveRenameButton").addEventListener("click",()=>requestEdit(()=>{
  if(!current)return;current.name=$("renameTitle").value.trim()||current.name;current.desc=$("renameDescription").value.trim();current.category=$("renameCategory").value||"Custom";persist(true);hideModal("renameModal");renderFilters();renderDetail();
 }));
 $("deleteChecklistButton").addEventListener("click",()=>requestEdit(()=>{
  if(current&&window.confirm("Delete \""+current.name+"\" and all its criteria from this device?")){const id=current.id;store.splice(0,store.length,...store.filter(item=>item.id!==id));persist(true);current=null;activeCategory="ALL";renderFilters();goHome()}
 }));
 $("cancelPasscodeButton").addEventListener("click",()=>hideModal("passcodeModal"));
 $("unlockButton").addEventListener("click",()=>{
  if($("passcodeInput").value!==EDIT_PASSCODE){window.alert("That passcode is not correct.");$("passcodeInput").select();return}
  editUnlocked=true;hideModal("passcodeModal");const action=pendingEditAction;pendingEditAction=null;if(action)action();if(unlockTimer)clearTimeout(unlockTimer);unlockTimer=setTimeout(()=>{editUnlocked=false;unlockTimer=null},15*60*1000);
 });
 $("passcodeInput").addEventListener("keydown",event=>{if(event.key==="Enter")$("unlockButton").click()});
 $("cancelCreateButton").addEventListener("click",()=>hideModal("createModal"));
 $("createButton").addEventListener("click",()=>requestEdit(createChecklist));
 $("sharedButton").addEventListener("click",openCloud);
 $("closeCloudButton").addEventListener("click",()=>hideModal("cloudModal"));
 $("loadSharedButton").addEventListener("click",()=>loadShared(true));
 $("publishButton").addEventListener("click",signInAndPublish);
 $("signOutButton").addEventListener("click",()=>{cloudToken=null;$("ownerCredentials").hidden=false;$("signOutButton").hidden=true;$("publishButton").textContent="SIGN IN & PUBLISH";cloudMessage("Signed out. Shared lists remain publicly readable.")});
 document.querySelectorAll(".modal-bg").forEach(modal=>modal.addEventListener("click",event=>{if(event.target===modal)hideModal(modal.id)}));
 document.addEventListener("keydown",event=>{if(event.key==="Escape")document.querySelectorAll(".modal-bg.open").forEach(modal=>hideModal(modal.id))});
 renderFilters();renderHome();updateCloudStatus();if(cloudReady())loadShared(false);
 window.addEventListener("online",()=>{if(!pending)loadShared(false)});
 if("serviceWorker"in navigator&&location.protocol!=="file:")window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}
function createChecklist(){
 const name=$("newTitle").value.trim();if(!name){$("newTitle").focus();return}
 const desc=$("newDescription").value.trim(),category=$("newCategory").value||"Custom",id="custom-"+Date.now();
 const item={id:id,name:name,category:category,desc:desc,aliases:desc.split(/[|,;]/).map(x=>x.trim()).filter(Boolean),levels:customLevels(name),checks:[[],[],[]],localOnly:true};
 store.push(item);persist(true);hideModal("createModal");renderFilters();openChecklist(id);openEditor();
}
initialize();
})();
