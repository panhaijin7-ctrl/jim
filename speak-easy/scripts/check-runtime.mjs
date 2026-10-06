// Regression checks run in memory. They never access learner browser storage or a microphone.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root=new URL('../',import.meta.url);
const app=fs.readFileSync(new URL('dist/app.js',root),'utf8');
const course={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('dist/course-data.js',root),'utf8'),course);
vm.runInNewContext(fs.readFileSync(new URL('dist/course-expansion.js',root),'utf8'),course);
const lessons=course.window.SpeakEasyCourse.lessons;
const allTasks=lessons.flatMap(lesson=>lesson.tasks.map(task=>({task,lesson})));
const storeKey='speak-easy-progress-v2';
function functionSource(name){
  const pattern=new RegExp('^( {2,4})(?:async )?function '+name+'\\(','m');
  const declaration=app.match(pattern);
  assert.ok(declaration,'Missing controller function: '+name);
  const tail=app.slice(declaration.index),firstLine=tail.split(/\r?\n/,1)[0];
  if(firstLine.trimEnd().endsWith('}'))return firstLine;
  // Controller functions close on a line at their declaration's indentation.
  // Do not include event wiring located between two function declarations.
  const end=tail.search(new RegExp('^'+declaration[1]+'}\\s*$','m'));
  assert.ok(end>=0,'Missing function end: '+name);
  return tail.slice(0,end+declaration[1].length+1);
}
function fixture(memory=new Map()){
  const elements=new Map(),messages=[];
  const element=selector=>{
    if(!elements.has(selector))elements.set(selector,{hidden:false,disabled:false,value:selector==='#practiceMode'?'guided':'unchanged learner input',textContent:'',classList:{contains:()=>true,add(){},remove(){}},replaceChildren(){},append(){},addEventListener(){},pause(){}});
    return elements.get(selector);
  };
  const c={lessons,allTasks,storeKey,hasSpeechAssets:true,current:0,round:null,questionInProgress:true,questionRevision:1,microphoneTicket:0,recorder:null,stream:null,recordUrl:null,activeElapsed:10000,activeStarted:0,lastResult:null,document:{hidden:false,createElement:()=>element('created')},window:{MediaRecorder:true},navigator:{mediaDevices:{}},quotaFailure:false,resumed:0,savedWrites:0,Blob,URL,console,
    locale:'en',esc:value=>String(value??''),formatDuration:seconds=>String(seconds),local:value=>value.en,t:key=>key,toast:message=>messages.push(message),$:selector=>selector==='#audioWrap audio'?null:element(selector),$$:()=>[],stopSpeech(){},stopCue(){},cleanAudio(){},pausePractice(){},resumePractice(){c.resumed++},resetTimer(){},renderStats(){},renderCourse(){},renderHome(){},renderResult(){},renderTaskLabels(){},celebrate(){},showView(){},playCue(){},
    localStorage:{getItem:key=>memory.get(key)??null,setItem:(key,value)=>{if(c.quotaFailure)throw new Error('QuotaExceededError');memory.set(key,value);c.savedWrites++}},
    renderQuestion:index=>{c.current=index;c.activeElapsed=10000;c.questionInProgress=true;c.questionRevision++}
  };
  vm.createContext(c);
  const names=['validateDraft','load','save','completedUnits','mockUnit','recommended','stopRecorder','startUnit','toggleRecord','recordAnswer','applyMode','idleVoiceStatus','speak'];
  for(const name of names)vm.runInContext(functionSource(name),c);
  vm.runInContext(app.match(/const empty=([^;]+);/)[0],c);
  c.state=c.load();
  return {c,memory,messages,elements};
}
const checks=[];
function passed(name){checks.push(name)}

for(const failure of ['constructor','start']){
  const {c,messages}=fixture();let stopped=0;
  const source={getTracks:()=>[{stop(){stopped++}}]};
  c.navigator.mediaDevices.getUserMedia=async()=>source;
  c.MediaRecorder=class{
    state='inactive';
    constructor(){if(failure==='constructor')throw new Error('unsupported recording initialization')}
    start(){throw new Error('recorder start failed')}
  };
  await c.toggleRecord();
  assert.equal(stopped,1);assert.equal(c.stream,null);assert.equal(c.recorder,null);
  assert.equal(c.$('#recordBtn').disabled,false);assert.equal(messages.at(-1),'recordDenied');
  passed('microphone cleanup after '+failure+' failure');
}
{
  const {c}=fixture();let stopped=0;
  c.stream={getTracks:()=>[{stop(){stopped++}}]};
  c.recorder={state:'recording',stop(){throw new Error('recorder stop failed')}};
  c.stopRecorder();assert.equal(stopped,1);assert.equal(c.stream,null);assert.equal(c.recorder,null);
  passed('track cleanup even when recorder.stop throws');
}
{
  const {c}=fixture();let stopped=0,initialized=0,resolvePermission;
  c.navigator.mediaDevices.getUserMedia=()=>new Promise(resolve=>{resolvePermission=resolve});
  c.MediaRecorder=class{constructor(){initialized++}};
  const pending=c.toggleRecord();c.stopRecorder();
  resolvePermission({getTracks:()=>[{stop(){stopped++}}]});await pending;
  assert.equal(stopped,1);assert.equal(initialized,0);assert.equal(c.stream,null);
  passed('late microphone permission does not start recording after navigation');
}
{
  const {c,memory}=fixture();c.startUnit(0);
  const first=c.recordAnswer([3,3,3,3],'Use a clearer greeting.');
  assert.equal(first.saved,true);assert.equal(c.savedWrites,1);assert.equal(c.current,1);
  const stored=JSON.parse(memory.get(storeKey));
  assert.equal(stored.sessions.length,0);assert.equal(stored.pendingRounds[lessons[0].id].answers.length,1);
  assert.equal(stored.pendingRounds[lessons[0].id].answers[0].note,'Use a clearer greeting.');
  assert.equal(stored.pendingRounds[lessons[0].id].answers[0].seconds,10);
  assert.ok(!memory.get(storeKey).includes('unchanged learner input'));
  const reload=fixture(memory).c;reload.startUnit(0);
  assert.equal(reload.current,1);assert.equal(reload.round.position,1);assert.equal(reload.round.answers.length,1);
  for(let i=1;i<5;i++)reload.recordAnswer([3,3,3,3],'');
  assert.equal(reload.state.sessions.length,1);assert.equal(reload.state.sessions[0].questions,5);
  assert.equal(reload.state.sessions[0].answers.length,5);assert.equal(reload.state.totalSeconds,50);
  assert.equal(reload.state.pendingRounds[lessons[0].id],undefined);
  assert.equal(fixture(memory).c.state.sessions.length,1);
  passed('per-answer checkpoint survives refresh and completes exactly once');
}
{
  const {c,memory,messages}=fixture();c.startUnit(0);c.quotaFailure=true;
  const before=JSON.stringify(c.state),result=c.recordAnswer([2,2,2,2],'Keep this note.');
  assert.equal(result.saved,false);assert.equal(JSON.stringify(c.state),before);
  assert.equal(c.current,0);assert.equal(c.round.answers.length,0);assert.equal(c.round.position,0);
  assert.equal(c.questionInProgress,true);assert.equal(c.$('#practiceMode').value,'guided');
  assert.equal(memory.size,0);assert.equal(messages.at(-1),'saveError');assert.equal(c.resumed,1);
  c.quotaFailure=false;assert.equal(c.recordAnswer([2,2,2,2],'Keep this note.').saved,true);
  assert.equal(c.round.answers.length,1);
  passed('failed checkpoint preserves the current answer and supports retry');
}
{
  const {c,messages}=fixture();c.startUnit(0);
  for(let i=0;i<4;i++)c.recordAnswer([3,3,3,3],'');
  c.quotaFailure=true;const result=c.recordAnswer([4,4,4,4],'Final note.');
  assert.equal(result.saved,false);assert.equal(c.state.sessions.length,0);
  assert.equal(c.round.position,4);assert.equal(c.round.answers.length,4);assert.equal(c.current,4);
  assert.equal(messages.at(-1),'saveError');assert.equal(c.state.totalSeconds,0);
  c.quotaFailure=false;c.recordAnswer([4,4,4,4],'Final note.');
  assert.equal(c.state.sessions.length,1);assert.equal(c.state.totalSeconds,50);
  passed('failed final save neither discards checkpoints nor duplicates a session');
}
{
  const legacy={date:'2026-10-05T12:00:00Z',title:'Existing learner record',score:2.5,seconds:60,questions:1,notes:['Preserve this.']};
  const memory=new Map([[storeKey,JSON.stringify({sessions:[legacy],totalSeconds:60})]]);
  const {c}=fixture(memory);assert.equal(c.state.sessions.length,1);assert.equal(c.state.totalSeconds,60);
  assert.equal(c.state.sessions[0].notes[0],'Preserve this.');assert.equal(Object.keys(c.state.pendingRounds).length,0);
  c.startUnit(0);c.recordAnswer([3,3,3,3],'');assert.equal(c.state.sessions[0].title,legacy.title);
  passed('legacy journals remain intact');
}
{
  const {c}=fixture();c.startUnit(0);c.recordAnswer([3,3,3,3],'First unit note.');
  c.startUnit(1);c.recordAnswer([2,2,2,2],'Second unit note.');
  assert.equal(Object.keys(c.state.pendingRounds).length,2);c.startUnit(0);
  assert.equal(c.current,1);assert.equal(c.round.answers[0].note,'First unit note.');
  assert.equal(c.state.pendingRounds[lessons[1].id].answers[0].note,'Second unit note.');
  passed('starting another unit preserves other saved checkpoints');
}
{
  const {c}=fixture();const bad={mode:'challenge',answers:[{taskId:lessons[0].tasks[1].id,score:3,seconds:10,note:'wrong order'}]};
  assert.equal(c.validateDraft(lessons[0].id,bad),null);
  assert.equal(c.validateDraft('unknown',bad),null);
  assert.equal(c.validateDraft(lessons[0].id,{answers:[{taskId:lessons[0].tasks[0].id,score:3,seconds:-1}]}),null);
  assert.equal(c.validateDraft(lessons[0].id,{answers:[]}),null);
  const valid=c.validateDraft(lessons[0].id,{mode:'invalid',answers:[{taskId:lessons[0].tasks[0].id,score:3,seconds:10,note:'x'.repeat(600)}]});
  assert.equal(valid.mode,'guided');assert.equal(valid.answers[0].note.length,500);
  passed('invalid or incompatible checkpoints are rejected safely');
}
{
  const {c}=fixture();c.startUnit(0);
  for(const scores of [[1,2,3],[1,2,3,5],[1,2,3,2.5],null])assert.throws(()=>c.recordAnswer(scores,''));
  assert.throws(()=>c.recordAnswer([3,3,3,3],'x'.repeat(501)));
  assert.equal(c.savedWrites,0);
  passed('rating and note validation precedes writes');
}
const html=fs.readFileSync(new URL('dist/index.html',root),'utf8');
for(const match of app.matchAll(/\$\('#([\w-]+)(?:\s[^']*)?'\)/g))assert.ok(html.includes('id="'+match[1]+'"'),'Missing DOM ID: '+match[1]);
passed('literal controller ID selectors resolve in the HTML');
{
  const {c,messages}=fixture();c.hasSpeechAssets=false;
  c.speak('q-0',null);assert.equal(messages.at(-1),'voiceNotIncluded');
  c.idleVoiceStatus();assert.equal(c.$('#speechRate').disabled,true);
  assert.equal(c.$('#practiceMode option[value="challenge"]').disabled,true);
  assert.equal(c.$('#voiceStatus').textContent,'voiceNotIncluded');
  c.$('#practiceMode').value='challenge';c.applyMode();
  assert.equal(c.$('#practiceMode').value,'guided');assert.equal(c.$('#questionText').hidden,false);
  passed('source-only mode keeps questions visible and never attempts missing speech playback');
}
{
  const {c}=fixture();c.$('#practiceMode').value='challenge';c.applyMode();
  assert.equal(c.$('#practiceMode').value,'challenge');assert.equal(c.$('#questionText').hidden,true);
  passed('full-audio mode retains the listen-first challenge');
}
{
  const {c,memory}=fixture();const index=lessons.length-1,offset=index*5;
  c.startUnit(index);assert.equal(c.current,offset);
  c.recordAnswer([3,3,3,3],'My new mock checkpoint.');
  const reload=fixture(memory).c;reload.startUnit(index);
  assert.equal(reload.current,offset+1);assert.equal(reload.round.answers[0].taskId,'task-101');
  for(let i=1;i<5;i++)reload.recordAnswer([3,3,3,3],'');
  assert.equal(reload.state.sessions[0].lessonId,'extended-mock');
  assert.equal(reload.state.sessions[0].answers.at(-1).taskId,'task-105');
  assert.equal(reload.state.pendingRounds['extended-mock'],undefined);
  passed('new final unit resumes and saves all five extended tasks');
}
{
  const sessions=lessons.slice(0,8).map(l=>({lessonId:l.id,date:'2026-10-06T00:00:00Z',score:3,seconds:50,questions:5,notes:[],answers:[]}));
  const {c}=fixture(new Map([[storeKey,JSON.stringify({sessions,totalSeconds:400})]]));
  assert.equal(c.completedUnits().size,8);assert.equal(c.recommended(),8);
  assert.equal(c.mockUnit(),20);assert.equal(lessons[c.mockUnit()].id,'extended-mock');
  c.state.sessions=lessons.map(l=>({...sessions[0],lessonId:l.id}));
  assert.equal(c.recommended(),20);
  assert.ok(app.includes("$('#startMock').addEventListener('click',()=>startUnit(mockUnit()))"));
  passed('old eight-unit completion unlocks new content and mock targets the extended unit');
}
{
  const {c}=fixture();vm.runInContext(functionSource('renderStats'),c);
  c.renderStats();assert.equal(c.$('#phaseText').textContent,'0 / 21');
  assert.equal((c.$('#phaseTrack').innerHTML.match(/<span /g)||[]).length,21);
  c.state.sessions=[{lessonId:lessons[0].id,date:'2026-10-06T00:00:00Z',score:3,seconds:50,questions:5,notes:[],answers:[]}];
  c.renderStats();assert.equal(c.$('#phaseText').textContent,'1 / 21');
  passed('journal renders the expanded unit count instead of a hard-coded eight');
}
console.log(JSON.stringify({status:'passed',checks:checks.length,details:checks}));
