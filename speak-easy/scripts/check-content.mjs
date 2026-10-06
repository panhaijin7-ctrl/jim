import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const root=new URL('../',import.meta.url),c={window:{}};
for(const file of ['course-data.js','locales.js','feedback.js'])vm.runInNewContext(fs.readFileSync(new URL('dist/'+file,root),'utf8'),c,{timeout:1000});
const {lessons,rescue,bank}=c.window.SpeakEasyCourse,strings=c.window.SpeakEasyStrings;
const tasks=lessons.flatMap(l=>l.tasks);
assert.equal(lessons.length,8);assert.equal(tasks.length,40);assert.equal(new Set(tasks.map(t=>t.id)).size,40);
assert.equal(rescue.length,6);assert.equal(bank.length,12);assert.equal(c.window.SpeakEasyFeedback.rules.length,40);
for(const l of lessons){assert.equal(l.tasks.length,5);assert.equal(l.chunks.length,4);for(const key of ['title','summary','outcome','stage'])for(const lang of ['en','zh-CN'])assert.ok(l[key][lang]);}
for(const task of tasks){for(const key of ['prompt','frame','model','followUp','audio','exampleAudio','followAudio'])assert.ok(task[key]);assert.equal(task.checks.length,3);for(const lang of ['en','zh-CN'])assert.ok(task.context[lang]&&task.tip[lang]);const f=c.window.SpeakEasyFeedback.check(task,task.model);assert.ok(f.total>=2);assert.equal(f.found,f.total,'Model should contain the specified text clues: '+task.id);assert.equal(f.grammar.length,0);}
const html=fs.readFileSync(new URL('dist/index.html',root),'utf8'),app=fs.readFileSync(new URL('dist/app.js',root),'utf8');
const keys=[...html.matchAll(/data-(?:t|aria|placeholder)="([^"]+)"/g)].map(m=>m[1]).concat([...app.matchAll(/\bt\('([^']+)'/g)].map(m=>m[1]));
for(const key of keys)if(key!=='scores')assert.ok(strings[key],'Missing translation: '+key);
for(let i=1;i<=4;i++)assert.ok(strings['scores'+i]);
for(const [key,pair] of Object.entries(strings))assert.equal(pair.length,2,'Locale count: '+key);
const withoutSpeechAssets=process.argv.includes('--without-speech-assets');
if(!withoutSpeechAssets){const manifest=JSON.parse(fs.readFileSync(new URL('dist/audio/manifest.json',root),'utf8'));
assert.equal(manifest.clips.length,276);
for(const clip of manifest.clips){const bytes=fs.readFileSync(new URL('dist/audio/'+clip.file,root));assert.equal(bytes.length,clip.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),clip.sha256);}}
const promptCount=new Set(tasks.flatMap(q=>[q.audio,q.exampleAudio,q.followAudio]).concat(rescue.map((_,i)=>'rescue-'+i),bank.map((_,i)=>'bank-'+i))).size;
assert.equal(promptCount,138);
console.log(JSON.stringify({units:8,tasks:40,modelAnswers:40,followUps:40,rescue:6,phrases:12,locales:['en','zh-CN'],voiceClips:withoutSpeechAssets?'not checked: source-only distribution':276,textCheckRules:c.window.SpeakEasyFeedback.rules.length,status:'passed'}));
