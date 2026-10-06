import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const root=new URL('../',import.meta.url),c={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('dist/course-data.js',root),'utf8'),c,{timeout:1000});
const originalUnits=JSON.stringify(c.window.SpeakEasyCourse.lessons);
for(const file of ['course-expansion.js','locales.js','feedback.js'])vm.runInNewContext(fs.readFileSync(new URL('dist/'+file,root),'utf8'),c,{timeout:1000});
const {lessons,rescue,bank}=c.window.SpeakEasyCourse,strings=c.window.SpeakEasyStrings;
const tasks=lessons.flatMap(l=>l.tasks);
assert.equal(JSON.stringify(lessons.slice(0,8)),originalUnits,'Extension must not rewrite the original eight units');
assert.equal(lessons.length,21);assert.equal(tasks.length,105);assert.equal(new Set(tasks.map(t=>t.id)).size,105);
assert.equal(new Set(lessons.map(l=>l.id)).size,21);
assert.equal(rescue.length,6);assert.equal(bank.length,12);assert.equal(c.window.SpeakEasyFeedback.rules.length,105);
for(const [i,task] of tasks.entries())assert.equal(task.id,'task-'+(i+1),'Stable sequential task IDs');
for(const l of lessons){assert.equal(l.tasks.length,5);assert.equal(l.chunks.length,4);for(const key of ['title','summary','outcome','stage'])for(const lang of ['en','zh-CN'])assert.ok(l[key][lang]);}
for(const task of tasks){
  for(const key of ['prompt','frame','model','followUp','audio','exampleAudio','followAudio'])assert.ok(typeof task[key]==='string'&&task[key].trim());
  assert.equal(task.checks.length,3);
  for(const lang of ['en','zh-CN']){assert.ok(task.context[lang]&&task.tip[lang]);for(const check of task.checks)assert.ok(check[lang]);}
  const f=c.window.SpeakEasyFeedback.check(task,task.model);
  assert.ok(f.total>=2);assert.equal(f.found,f.total,'Model should contain the specified text clues: '+task.id);assert.equal(f.grammar.length,0);
  assert.equal(c.window.SpeakEasyFeedback.check(task,'').found,0,'Empty answers must not contain text clues: '+task.id);
  for(const item of f.items)assert.ok(item.label.en&&item.label['zh-CN']&&item.suggestion);
}
const html=fs.readFileSync(new URL('dist/index.html',root),'utf8'),app=fs.readFileSync(new URL('dist/app.js',root),'utf8');
const scripts=[...html.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]);
assert.ok(scripts.indexOf('course-data.js')<scripts.indexOf('course-expansion.js'));
assert.ok(scripts.indexOf('course-expansion.js')<scripts.indexOf('feedback.js'));
assert.ok(scripts.indexOf('feedback.js')<scripts.indexOf('app.js'));
const keys=[...html.matchAll(/data-(?:t|aria|placeholder)="([^"]+)"/g)].map(m=>m[1]).concat([...app.matchAll(/\bt\('([^']+)'/g)].map(m=>m[1]));
for(const key of keys)if(key!=='scores')assert.ok(strings[key],'Missing translation: '+key);
for(let i=1;i<=4;i++)assert.ok(strings['scores'+i]);
for(const [key,pair] of Object.entries(strings))assert.equal(pair.length,2,'Locale count: '+key);
const withoutSpeechAssets=process.argv.includes('--without-speech-assets');
if(!withoutSpeechAssets){const manifest=JSON.parse(fs.readFileSync(new URL('dist/audio/manifest.json',root),'utf8'));
assert.equal(manifest.clips.length,666);
assert.equal(new Set(manifest.clips.map(clip=>clip.file)).size,666);
assert.deepEqual(fs.readdirSync(new URL('dist/audio/',root)).filter(file=>file.endsWith('.mp3')).sort(),manifest.clips.map(clip=>clip.file).sort(),'No unused or unlisted speech files');
const voices={interviewer:'en-US-AndrewMultilingualNeural',coach:'en-US-AvaMultilingualNeural'},rates={natural:'-4%',slow:'-23%'};
const fixedPrompts=tasks.flatMap(task=>[{id:task.audio,text:task.prompt,role:'interviewer'},{id:task.exampleAudio,text:task.model,role:'coach'},{id:task.followAudio,text:task.followUp,role:'interviewer'}]).concat(rescue.map((r,i)=>({id:'rescue-'+i,text:r.answer.split(' / ')[0],role:'coach'})),bank.map((b,i)=>({id:'bank-'+i,text:b.en.replaceAll(' / ',' '),role:'coach'})));
const expectedClips=new Map(fixedPrompts.flatMap(prompt=>Object.entries(rates).map(([variant,rate])=>[prompt.id+'-'+variant+'.mp3',{...prompt,variant,rate,voice:voices[prompt.role]}])));
assert.equal(expectedClips.size,666);
for(const clip of manifest.clips){const expected=expectedClips.get(clip.file);assert.ok(expected,'Unknown audio file: '+clip.file);for(const key of ['text','role','variant','rate','voice'])assert.equal(clip[key],expected[key],'Audio '+key+' mismatch: '+clip.file);const bytes=fs.readFileSync(new URL('dist/audio/'+clip.file,root));assert.equal(bytes.length,clip.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),clip.sha256);}}
const promptCount=new Set(tasks.flatMap(q=>[q.audio,q.exampleAudio,q.followAudio]).concat(rescue.map((_,i)=>'rescue-'+i),bank.map((_,i)=>'bank-'+i))).size;
assert.equal(promptCount,333);
console.log(JSON.stringify({units:lessons.length,tasks:tasks.length,modelAnswers:tasks.length,followUps:tasks.length,rescue:rescue.length,phrases:bank.length,locales:['en','zh-CN'],voiceClips:withoutSpeechAssets?'not checked: source-only distribution':666,textCheckRules:c.window.SpeakEasyFeedback.rules.length,status:'passed'}));
