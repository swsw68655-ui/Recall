(()=>{
'use strict';
let on=false;
const R={esc:t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
 head:(t,p)=>'<header class="ph"><div><h1>'+t+'</h1>'+(p?'<p class="meta">'+p+'</p>':'')+'</div></header>',
 ask:async t=>confirm(t),
 get view(){return on?'mcq':''},
 render:()=>paint()},K='recall.mcq.v1',L='ABCDE',esc=R.esc,$=s=>document.querySelector(s);
let Q=[],qs=null,ed=null,msg=null,cfg={f:'',d:'',m:'todo',n:20,bf:'',bd:'',bp:''},open=new Set(),opened=false;
try{Q=JSON.parse(localStorage.getItem(K)||'[]').filter(q=>q&&q.s&&Array.isArray(q.o)&&Array.isArray(q.a)).map(q=>Object.assign({id:Math.random().toString(36).slice(2),f:'General',d:'General',e:'',src:'',n:0,r:0,last:null},q))}catch(e){}
const sv=()=>{try{localStorage.setItem(K,JSON.stringify(Q))}catch(e){msg={t:'Could not save: this browser is blocking storage.',e:1}}};
const say=(t,e)=>{msg={t,e};R.render()};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const pl=(n,w)=>n+' '+w+(n===1?'':'s');
const folders=()=>[...new Set(Q.map(q=>q.f))].sort();
const decksOf=f=>[...new Set(Q.filter(q=>!f||q.f===f).map(q=>q.d))].sort();
const decks=()=>decksOf('');
const scope=q=>(!cfg.f||q.f===cfg.f)&&(!cfg.d||q.d===cfg.d);
const pick=()=>Q.filter(q=>scope(q)&&(cfg.m==='all'||(cfg.m==='todo'?q.last!==true:q.last===false)));
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const cur=()=>qs&&Q.find(x=>x.id===qs.ids[qs.i]);
const same=(a,b)=>a.length===b.length&&a.every(x=>b.includes(x));
const blank=(f,d,s)=>({id:null,f:f||cfg.f||'',d:d||cfg.d||'',src:s||'',s:'',o:['','','','',''],a:[],e:''});
const st=document.createElement('style');
st.textContent='.qo{display:flex;gap:10px;align-items:flex-start;justify-content:flex-start;width:100%;height:auto;min-height:48px;padding:10px 14px;margin:0 0 8px;text-align:left;white-space:pre-wrap;overflow-wrap:anywhere}.qo b{flex:none;width:1.4em}.qo.sel{border-color:var(--pr);background:var(--acs)}.qo.ok{background:var(--p0);border-color:var(--c3)}.qo.no{background:var(--p1);border-color:var(--c1)}.qo.miss{border:2px dashed var(--c3)}.qx{margin-top:12px;padding-top:12px;border-top:1px solid var(--bd);white-space:pre-wrap;overflow-wrap:anywhere}.qs{font-weight:600;white-space:pre-wrap;overflow-wrap:anywhere;font-size:1.1rem}select{width:100%;min-height:44px;padding:0 12px;border:1px solid var(--bd);border-radius:14px;background:var(--fld);color:var(--tx);font:inherit}.qf{display:flex;gap:8px;align-items:center;margin-bottom:8px}.qf input{flex:1;min-width:0}';
document.head.appendChild(st);

function parse(t){
 const out=[];let bad=0;
 for(const blk of t.replace(/\r/g,'').split(/^\s*Q\s*:/im).slice(1)){
  const q={s:'',o:[],a:[],e:'',src:'',f:'',d:''};let f='s';
  for(const ln of blk.split('\n')){
   let m;
   if((m=ln.match(/^\s*([A-E])\s*[.)]\s*(.*)$/))&&(f==='s'||typeof f==='number')&&m[1]===L[q.o.length]){q.o.push(m[2]);f=q.o.length-1}
   else if(m=ln.match(/^\s*(?:answers?|correct)\s*[:=]\s*(.*)$/i)){q.a=[...new Set((m[1].toUpperCase().match(/[A-E]/g)||[]).map(c=>L.indexOf(c)))].sort();f='x'}
   else if(m=ln.match(/^\s*(?:explanation|commentary)\s*[:=]\s*(.*)$/i)){q.e=m[1];f='e'}
   else if(m=ln.match(/^\s*folder\s*[:=]\s*(.*)$/i)){q.f=m[1].trim();f='x'}
   else if(m=ln.match(/^\s*deck\s*[:=]\s*(.*)$/i)){q.d=m[1].trim();f='x'}
   else if(m=ln.match(/^\s*(?:source|tag)\s*[:=]\s*(.*)$/i)){q.src=m[1].trim();f='x'}
   else if(f==='s')q.s+=(q.s?'\n':'')+ln.trim();
   else if(typeof f==='number')q.o[f]+=' '+ln.trim();
   else if(f==='e')q.e+='\n'+ln;
  }
  q.s=q.s.trim();q.e=q.e.trim();q.o=q.o.map(x=>x.trim());
  if(q.s&&q.o.length>=2&&q.a.length&&q.a.every(i=>i<q.o.length))out.push(q);else bad++;
 }
 return{out,bad};
}
async function imp(){
 const fl=$('#qbfile').files[0],fo=cfg.bf.trim()||'General',d=cfg.bd.trim()||'General';let t=cfg.bp;
 if(fl)try{t=await fl.text()}catch(e){return say('Could not read that file.',1)}
 if(!t.trim())return say('Paste questions or choose a file first.',1);
 let add=[],bad=0;
 if(/^\s*[\[{]/.test(t)){
  try{const j=JSON.parse(t),ids=new Set(Q.map(q=>q.id));for(const q of(Array.isArray(j)?j:[])){if(q&&q.s&&Array.isArray(q.o)&&Array.isArray(q.a)&&!ids.has(q.id))add.push(Object.assign({id:uid(),f:'General',d:'General',e:'',src:'',n:0,r:0,last:null},q));else bad++}}
  catch(e){return say('That JSON file could not be read.',1)}
 }else{
  const p=parse(t);bad=p.bad;add=p.out.map(q=>Object.assign(q,{id:uid(),f:q.f||fo,d:q.d||d,n:0,r:0,last:null}));
 }
 if(!add.length)return say('No valid questions found. Check the format below: each question needs Q:, at least two options (A. B. ...) and an Answer: line.',1);
 Q.push(...add);cfg.bp='';sv();
 say('Imported '+pl(add.length,'question')+(bad?' ('+bad+' skipped because they were incomplete)':'')+'.');
}
function saveQ(){
 const o=ed.o.map(x=>x.trim());let n=o.length;while(n&&!o[n-1])n--;
 const opts=o.slice(0,n),a=ed.a.filter(i=>i<n).sort(),d=ed.d.trim()||'General',f=ed.f.trim()||'General';
 if(!ed.s.trim())return say('Write the question text.',1);
 if(n<2||opts.some(x=>!x))return say('Fill at least 2 options, with no gaps (A, B, C, ...).',1);
 if(!a.length)return say('Mark at least one correct option.',1);
 const v={f,d,s:ed.s.trim(),o:opts,a,e:ed.e.trim(),src:ed.src.trim()};
 if(ed.id){Object.assign(Q.find(x=>x.id===ed.id),v);sv();ed=null;say('Question updated.')}
 else{Q.push(Object.assign({id:uid(),n:0,r:0,last:null},v));sv();const k=ed;ed=blank(k.f,k.d,k.src);say('Question saved. Add the next one.')}
}
function exp(){
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(Q,null,1)],{type:'application/json'}));
 a.download='recall-quiz-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
const note=()=>{const m=msg;msg=null;return m?'<p class="status'+(m.e?' err':'')+'" role="status">'+esc(m.t)+'</p>':''};

function home(){
 const fs=folders();
 if(cfg.f&&!fs.includes(cfg.f)){cfg.f='';cfg.d=''}
 if(cfg.d&&!decksOf(cfg.f).includes(cfg.d))cfg.d='';
 if(!opened){opened=true;if(fs.length<=2)fs.forEach(f=>open.add(f))}
 const n=Q.length,tn=Q.reduce((s,q)=>s+q.n,0),tr=Q.reduce((s,q)=>s+q.r,0),k=pick().length;
 const tile=(b,l,i)=>'<div class="stat b'+i+'"><b>'+b+'</b><span>'+l+'</span></div>';
 const FOLD='<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',CH='<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';
 const chips=l=>'<div class="chips"><span class="chip">'+pl(l.length,'question')+'</span><span class="chip">'+l.filter(q=>q.last!==true).length+' to do</span></div>';
 const tree=fs.map((f,i)=>{
  const o=open.has(f),fe=esc(f),qf=Q.filter(q=>q.f===f),ds=decksOf(f);
  return '<section class="panel"><div class="frow"><button class="fh" data-q="fold" data-f="'+fe+'" aria-expanded="'+o+'"><span class="ft b'+(i%6)+'">'+FOLD+'</span><span class="fn"><strong>'+fe+'</strong><span class="meta">'+pl(ds.length,'deck')+', '+pl(qf.length,'question')+'</span></span><span class="chev'+(o?' open':'')+'">'+CH+'</span></button><button class="primary" data-q="pd" data-f="'+fe+'">Practice</button></div>'+
  (o?'<div class="dl">'+ds.map(d=>{const de=esc(d);return '<div class="dr"><div class="n"><strong>'+de+'</strong>'+chips(qf.filter(q=>q.d===d))+'</div><div class="row"><button data-q="pd" data-f="'+fe+'" data-d="'+de+'">Practice</button><button class="ghost danger" data-q="deld" data-f="'+fe+'" data-d="'+de+'">Delete</button></div></div>'}).join('')+'<div class="row" style="justify-content:flex-end"><button class="ghost danger" data-q="delf" data-f="'+fe+'">Delete folder</button></div></div>':'')+'</section>';
 }).join('');
 const lst=Q.filter(scope).slice(0,100).map(q=>'<div class="cr"><div class="ct"><div class="cf">'+esc(q.s.slice(0,160))+'</div><div class="cb">'+esc(q.f+' / '+q.d+(q.src?' · '+q.src:''))+' · answer '+q.a.map(i=>L[i]).join('')+'</div></div><div class="cm"><span class="chip">'+(q.n?(q.last?'Right':'Wrong')+' '+q.r+'/'+q.n:'New')+'</span><div><button class="ghost" data-q="edit" data-id="'+esc(q.id)+'">Edit</button><button class="ghost danger" data-q="del" data-id="'+esc(q.id)+'">Delete</button></div></div></div>').join('');
 const opt=(v,t,sel)=>'<option value="'+esc(v)+'"'+(sel?' selected':'')+'>'+esc(t)+'</option>';
 return R.head('Quiz',n?pl(n,'question')+' in '+pl(fs.length,'folder'):'Practice with multiple-choice questions from past exams.')+note()+
 (n?'<div class="stats">'+tile(n,'Questions',3)+tile(tn,'Answered',2)+tile(tn?Math.round(100*tr/tn)+'%':'-','Accuracy',0)+tile(Q.filter(q=>q.last===false).length,'Last answer wrong',1)+'</div>':'')+
 (n?'<section class="panel"><h2>Practice</h2><label class="f" for="qcf">Folder</label><select id="qcf">'+opt('','All folders',!cfg.f)+fs.map(f=>opt(f,f,f===cfg.f)).join('')+'</select>'+(cfg.f?'<label class="f" for="qcd">Deck</label><select id="qcd">'+opt('','All decks in this folder',!cfg.d)+decksOf(cfg.f).map(d=>opt(d,d,d===cfg.d)).join('')+'</select>':'')+'<label class="f" for="qcm">Which questions</label><select id="qcm">'+[['todo','Not yet answered correctly'],['wrong','Last answer wrong'],['all','All questions']].map(m=>opt(m[0],m[1],m[0]===cfg.m)).join('')+'</select><label class="f" for="qcn">How many (0 = all)</label><input type="number" id="qcn" min="0" max="999" inputmode="numeric" value="'+cfg.n+'"><div class="row"><button class="primary" data-q="start"'+(k?'':' disabled')+'>Start ('+pl(Math.min(k,cfg.n||k),'question')+')</button></div></section>':'')+
 tree+
 '<section class="panel"><h2>Add questions</h2><div class="row" style="margin-top:0"><button class="primary" data-q="new">Write a question</button></div><div class="two"><div><label class="f" for="qbf">Folder for imported questions</label><input type="text" id="qbf" list="qfl" autocomplete="off" placeholder="General" value="'+esc(cfg.bf)+'"><datalist id="qfl">'+fs.map(f=>'<option value="'+esc(f)+'">').join('')+'</datalist></div><div><label class="f" for="qbd">Deck for imported questions</label><input type="text" id="qbd" list="qdl" autocomplete="off" placeholder="General" value="'+esc(cfg.bd)+'"><datalist id="qdl">'+decks().map(d=>'<option value="'+esc(d)+'">').join('')+'</datalist></div></div><label class="f" for="qbfile">Import a .txt or backup .json file</label><input type="file" id="qbfile" accept=".txt,.json,text/*,application/json"><label class="f" for="qbp">Or paste questions</label><textarea id="qbp" placeholder="Q: ...">'+esc(cfg.bp)+'</textarea><div class="row"><button class="primary" data-q="import">Import</button></div><details style="margin-top:12px"><summary>Text format</summary><pre class="meta" style="white-space:pre-wrap">Q: Regarding the spleen:\nA. First option\nB. Second option\nC. Third option\nD. Fourth option\nE. Fifth option\nAnswer: AC\nExplanation: Why the answer is right and the others are wrong.\nSource: U02-2025\nFolder: Digestive System (optional)\nDeck: Spleen (optional)</pre><p class="meta">One or more letters can be correct. Explanation, Source, Folder and Deck are optional. If a question has no Folder or Deck line, it goes into the folder and deck typed above. Start each question with Q:</p></details></section>'+
 (n?'<section class="panel"><h2>Questions'+(cfg.f?' in '+esc(cfg.f+(cfg.d?' / '+cfg.d:'')):'')+'</h2>'+(lst||'<p class="meta">No questions here.</p>')+(Q.filter(scope).length>100?'<p class="meta">Showing the first 100.</p>':'')+'<div class="row"><button data-q="export">Download questions (.json)</button></div><p class="meta">The main Settings backup does not include quiz questions. Download them here to back up.</p></section>':'');
}
function form(){
 return '<div class="row" style="margin:0 0 8px"><button class="ghost" data-q="cancel">&larr; Quiz</button></div>'+R.head(ed.id?'Edit question':'New question')+note()+
 '<section class="panel"><div class="two"><div><label class="f" for="ff" style="margin-top:0">Folder</label><input type="text" id="ff" list="gfl" autocomplete="off" placeholder="General" value="'+esc(ed.f)+'"><datalist id="gfl">'+folders().map(f=>'<option value="'+esc(f)+'">').join('')+'</datalist></div><div><label class="f" for="fd" style="margin-top:0">Deck</label><input type="text" id="fd" list="gdl" autocomplete="off" placeholder="General" value="'+esc(ed.d)+'"><datalist id="gdl">'+decksOf(ed.f.trim()).map(d=>'<option value="'+esc(d)+'">').join('')+'</datalist></div></div>'+
 '<label class="f" for="fsrc">Source (optional)</label><input type="text" id="fsrc" autocomplete="off" placeholder="U02-2025 (MCQ 12)" value="'+esc(ed.src)+'">'+
 '<label class="f" for="fs">Question</label><textarea id="fs">'+esc(ed.s)+'</textarea><p class="meta" style="margin-top:14px"><b>Options</b> &middot; tap Correct on every right answer</p>'+
 ed.o.map((t,i)=>'<div class="qf"><b>'+L[i]+'</b><input type="text" id="fo'+i+'" autocomplete="off" aria-label="Option '+L[i]+'" value="'+esc(t)+'"><button data-q="tg" data-i="'+i+'" aria-pressed="'+ed.a.includes(i)+'" aria-label="Option '+L[i]+' is correct">Correct</button></div>').join('')+
 '<label class="f" for="fe">Explanation (optional)</label><textarea id="fe">'+esc(ed.e)+'</textarea><div class="row"><button class="primary" data-q="save">Save question</button><button data-q="cancel">Cancel</button></div></section>';
}
function run(){
 const q=cur();if(!q)return fin();
 const done=qs.done,ok=same(qs.sel,q.a),pct=Math.round(100*qs.i/qs.ids.length);
 const opts=q.o.map((t,i)=>{
  const s=qs.sel.includes(i),c=q.a.includes(i);
  const cls=!done?(s?' sel':''):c?(s?' ok':' miss'):(s?' no':'');
  const tag=!done?'':c?(s?' ✓':' (correct answer)'):(s?' ✗':'');
  return '<button class="qo'+cls+'" data-q="opt" data-i="'+i+'" aria-pressed="'+s+'"><b>'+L[i]+'</b><span>'+esc(t)+tag+'</span></button>';
 }).join('');
 return '<div class="top"><button class="ghost" data-q="exit">Exit</button><div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+pct+'"><div style="width:'+pct+'%"></div></div><span class="meta">'+(qs.i+1)+'/'+qs.ids.length+'</span></div>'+
 '<section class="panel"><p class="meta">'+esc(q.d+(q.src?' · '+q.src:''))+'</p><div class="qs">'+esc(q.s)+'</div></section>'+
 '<p class="meta">'+(done?'':'Select all the correct answers. One or more may be correct.')+'</p>'+opts+
 (done?'<p class="status'+(ok?'':' err')+'" role="status">'+(ok?'Correct.':'Incorrect. Correct answer: '+q.a.map(i=>L[i]).join(', ')+'.')+'</p>'+(q.e?'<div class="panel"><b>Explanation</b><div class="qx" style="border:0;margin:0;padding:6px 0 0">'+esc(q.e)+'</div></div>':'')+'<div class="row"><button class="primary" data-q="next" style="width:100%">'+(qs.i+1<qs.ids.length?'Next':'Finish')+'</button></div>'
  :'<div class="row"><button class="primary" data-q="check" style="width:100%"'+(qs.sel.length?'':' disabled')+'>Check answer</button></div><p class="meta hint">Keys A-E or 1-5 select, Enter checks.</p>');
}
function fin(){
 const t=qs.ids.length;
 return '<div class="panel b0"><h2>Session complete</h2><p>Score: '+qs.ok+' / '+t+' ('+Math.round(100*qs.ok/t)+'%)</p></div>'+
 (qs.miss.length?'<section class="panel"><h2>To review</h2>'+qs.miss.map(id=>{const q=Q.find(x=>x.id===id);return q?'<div class="cr"><div class="ct"><div class="cf">'+esc(q.s.slice(0,140))+'</div><div class="cb">Correct: '+q.a.map(i=>L[i]).join('')+'</div></div></div>':''}).join('')+'</section>':'')+
 '<div class="row">'+(qs.miss.length?'<button class="primary" data-q="again">Retry missed</button>':'')+'<button data-q="exit">Done</button></div>';
}
const begin=ids=>{qs={ids,i:0,sel:[],done:false,ok:0,miss:[]};R.render();scrollTo(0,0)};
function check(){
 const q=cur();if(!q||qs.done||!qs.sel.length)return;
 const ok=same(qs.sel,q.a);qs.done=true;q.n++;if(ok){q.r++;qs.ok++}else qs.miss.push(q.id);q.last=ok;sv();R.render();
}
function next(){qs.i++;qs.sel=[];qs.done=false;R.render();scrollTo(0,0)}
function toggle(i){const q=cur();if(!q||qs.done||i<0||i>=q.o.length)return;const k=qs.sel.indexOf(i);if(k<0)qs.sel.push(i);else qs.sel.splice(k,1);qs.sel.sort();R.render()}

$('#app').addEventListener('click',async e=>{
 const b=e.target.closest('[data-q]');if(!b||R.view!=='mcq')return;
 const a=b.dataset.q,i=+b.dataset.i;
 if(a==='opt')toggle(i);
 else if(a==='check')check();
 else if(a==='next')next();
 else if(a==='exit'){qs=null;R.render();scrollTo(0,0)}
 else if(a==='again'){const m=qs.miss.slice();begin(m)}
 else if(a==='start'){const l=shuf(pick()).slice(0,cfg.n||9999);if(l.length)begin(l.map(q=>q.id))}
 else if(a==='fold'){const f=b.dataset.f;if(open.has(f))open.delete(f);else open.add(f);R.render()}
 else if(a==='pd'){cfg.f=b.dataset.f;cfg.d=b.dataset.d||'';let l=pick();if(!l.length){const m=cfg.m;cfg.m='all';l=pick();cfg.m=m}l=shuf(l).slice(0,cfg.n||9999);if(l.length)begin(l.map(q=>q.id))}
 else if(a==='deld'||a==='delf'){const f=b.dataset.f,d=b.dataset.d,x=Q.filter(q=>q.f===f&&(a==='delf'||q.d===d)).length;if(await R.ask('Delete '+(a==='delf'?'folder "'+f+'"':'deck "'+d+'"')+' and its '+pl(x,'question')+'? This cannot be undone.')){Q=Q.filter(q=>!(q.f===f&&(a==='delf'||q.d===d)));sv();R.render()}}
 else if(a==='new'){ed=blank();R.render();scrollTo(0,0)}
 else if(a==='edit'){const q=Q.find(x=>x.id===b.dataset.id);if(q){ed={id:q.id,f:q.f,d:q.d,src:q.src||'',s:q.s,o:q.o.concat(['','','','','']).slice(0,5),a:q.a.slice(),e:q.e||''};R.render();scrollTo(0,0)}}
 else if(a==='del'){if(await R.ask('Delete this question? This cannot be undone.')){Q=Q.filter(x=>x.id!==b.dataset.id);sv();R.render()}}
 else if(a==='tg'){const k=ed.a.indexOf(i);if(k<0)ed.a.push(i);else ed.a.splice(k,1);R.render()}
 else if(a==='save')saveQ();
 else if(a==='cancel'){ed=null;R.render();scrollTo(0,0)}
 else if(a==='import')imp();
 else if(a==='export')exp();
});
$('#app').addEventListener('input',e=>{
 if(R.view!=='mcq')return;const t=e.target,id=t.id;
 if(id==='qbp')cfg.bp=t.value;else if(id==='qbf')cfg.bf=t.value;else if(id==='qbd')cfg.bd=t.value;
 else if(ed){if(id==='fs')ed.s=t.value;else if(id==='fe')ed.e=t.value;else if(id==='fd')ed.d=t.value;else if(id==='ff')ed.f=t.value;else if(id==='fsrc')ed.src=t.value;else if(/^fo\d$/.test(id))ed.o[+id[2]]=t.value}
});
$('#app').addEventListener('change',e=>{
 if(R.view!=='mcq')return;const t=e.target;
 if(t.id==='qcf'){cfg.f=t.value;cfg.d='';R.render()}else if(t.id==='qcd'){cfg.d=t.value;R.render()}else if(t.id==='qcm'){cfg.m=t.value;R.render()}else if(t.id==='qcn'){cfg.n=Math.max(0,parseInt(t.value,10)||0);R.render()}
});
addEventListener('keydown',e=>{
 if(R.view!=='mcq'||!qs||!cur()||e.ctrlKey||e.metaKey||e.altKey)return;
 const tg=e.target.tagName;if(tg==='INPUT'||tg==='TEXTAREA'||tg==='SELECT')return;
 if(e.key==='Enter'){if(tg==='BUTTON')return;e.preventDefault();qs.done?next():check();return}
 const k=e.key.toUpperCase();let i=k.length===1?L.indexOf(k):-1;if(i<0&&e.key.length===1)i='12345'.indexOf(e.key);
 if(i>=0){e.preventDefault();toggle(i)}
});
const nav=$('#nav'),app=$('#app'),html=()=>qs?run():ed?form():home();
const ICO='<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7"/><path d="M12 17h.01"/></svg>';
const obs=new MutationObserver(()=>sync());
const watch=()=>{obs.observe(nav,{childList:true});obs.observe(app,{childList:true})};
function sync(){
 obs.disconnect();
 if(nav.hidden)on=false;
 else{
  const box=nav.querySelector('.nav-in');
  if(box&&!box.querySelector('[data-mcq]')){
   const b=document.createElement('button');b.className='tab';b.dataset.mcq='1';b.innerHTML=ICO+'<span>Quiz</span>';
   const t=box.querySelectorAll('.tab');box.insertBefore(b,t[t.length-1]||null);
  }
  if(on){
   nav.querySelectorAll('.tab').forEach(t=>{if(t.dataset.mcq)t.setAttribute('aria-current','page');else t.removeAttribute('aria-current')});
   app.innerHTML=html();
  }
 }
 watch();
}
function paint(){sync()}
nav.addEventListener('click',e=>{
 const b=e.target.closest('.tab');if(!b)return;
 if(b.dataset.mcq){on=true;sync();scrollTo(0,0)}else on=false;
},true);
window.MCQ={html};
sync();
})();
