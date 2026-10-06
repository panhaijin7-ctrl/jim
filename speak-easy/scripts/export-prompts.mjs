import fs from 'node:fs';
import vm from 'node:vm';

// Export the site's own fixed lesson text. No learner answers are sent to TTS.
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(new URL('../dist/course-data.js', import.meta.url), 'utf8'), context, { timeout: 1000 });
vm.runInNewContext(fs.readFileSync(new URL('../dist/course-expansion.js', import.meta.url), 'utf8'), context, { timeout: 1000 });
const { lessons, rescue, bank } = context.window.SpeakEasyCourse;
const prompts = [
  ...lessons.flatMap(l => l.tasks.flatMap(q => [
    { id: q.audio, role: 'interviewer', text: q.prompt },
    { id: q.exampleAudio, role: 'coach', text: q.model },
    { id: q.followAudio, role: 'interviewer', text: q.followUp }
  ])),
  ...rescue.map((r, i) => ({ id: `rescue-${i}`, role: 'coach', text: r.answer.split(' / ')[0] })),
  ...bank.map((b, i) => ({ id: `bank-${i}`, role: 'coach', text: b.en.replaceAll(' / ', ' ') }))
];
const unique = new Map();
for (const p of prompts) {
  if (unique.has(p.id) && unique.get(p.id).text !== p.text) throw new Error(`Conflicting clip: ${p.id}`);
  unique.set(p.id, p);
}
process.stdout.write(JSON.stringify([...unique.values()]));
