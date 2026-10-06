# Speak easy

An account-free English speaking-practice prototype. The first audience is students
preparing for Summer Work Travel (SWT) interviews and communication at work in the US.
The longer-term audience also includes Camp participants and everyday English learners.

**This repository contains the static app and its current course audio; it is not yet
a deployed website.** At the repository owner's express request, the 276 active
AI-synthesized speech recordings are included, with separate natural and slow readings.
Question playback, model-answer playback, phrase playback and the listen-first challenge
are enabled. Four original feedback sounds and local microphone replay are also included.
The app plays static files; it does not generate new speech or silently use browser TTS.
See [audio provenance](dist/audio/README.md) for voice IDs, source and publication notes.

## 当前版本（简体中文）

- 无须登录，无须配置 API key；当前没有付费、AI 服务或云同步。
- 8 个 SWT 基础单元、40 道题、40 个原创参考回答、40 道追问，另有 6 个救场场景和 12 条表达笔记。
- 英文 / 简体中文界面；小轮练习、计时、录音回听、规则式文本检查和自主复盘。
- 每次保存都会记录当前进度；刷新后可继续。保存失败时保留当前输入，不会假报成功。
- 学习记录保存在当前浏览器；完整输入答案和录音不会上传或永久保存。
- 已按仓库所有者要求包含 276 段 AI 配音（自然 / 慢速两版），并保留 4 个原创提示音和页面动效。
- 当前课程是 SWT 基础，不是完整 Camp 课程或通用英语课程，也不是官方考试。

上传源码不等于网站已上线，不能把 GitHub 仓库链接当作学习网站链接。
本仓库暂未选定开源许可证；公开可见不代表自动获得任意再分发授权。

## What is included

Each of the eight units contains five questions, answer frames, model answers,
follow-ups, task-specific self-checks and localized guidance. The app also includes
clarification practice, phrase notes, an optional timer and a four-dimension self-rating.
Recorded answers can be replayed within the current practice screen. Recordings are
discarded when the page reloads or the user leaves that question.

The text checker runs entirely in the browser. It reports task-specific text clues,
matching evidence and a limited set of common grammar patterns. Its clue count is
**not** a proficiency score or an AI assessment. It cannot determine truth, complete
semantic correctness, pronunciation, fluency, accent or program eligibility.
Learners must use their own experiences rather than memorize sample answers as facts.

The current interface supports English and Simplified Chinese. Learning content and
UI translations are separate so additional languages can be added later. Current
English headlines are branding copy, not a claim of complete multilingual localization.

## Structure

| File | Purpose |
| --- | --- |
| `dist/index.html` | Static bilingual interface with speech playback enabled |
| `dist/app.js` | Practice flow, recording, local journal, motion and audio controls |
| `dist/course-data.js` | English course content and localized guidance |
| `dist/locales.js` | UI translation pairs |
| `dist/feedback.js` | Visible deterministic text-check rules |
| `dist/theme.css` | Existing responsive design and reduced-motion support |
| `dist/audio/cue-*.wav` | Four original synthesized mallet feedback cues |
| `dist/audio/*.mp3` | 276 fixed-course AI speech recordings |
| `dist/audio/manifest.json` | Text, voice IDs, rates, file sizes and SHA-256 hashes |
| `scripts/` | Dependency-free checks and fixed-content export tools |

No npm install or build step is needed for these static assets. Verification scripts
require a modern Node.js runtime; they use only built-in modules. Cue regeneration
uses Python 3's standard library. `export-prompts.mjs` exports only fixed course text,
not learner inputs. No voice-service credentials or voice-generation service are included.

## Verification

From this folder, run:

```text
node scripts/check-content.mjs
node scripts/check-runtime.mjs
node --check dist/app.js
node --check dist/course-data.js
node --check dist/locales.js
node --check dist/feedback.js
```

The content check verifies all 40 model answers against their text rules, course IDs,
unit counts and referenced translation keys, plus all 276 speech files against their
manifest. It checks SHA-256 hashes, file sizes, fixed-course text, voice IDs, roles and
reading rates. These technical checks do not determine redistribution or commercial rights.
The optional `--without-speech-assets` flag skips audio checks and must not be represented
as passing full-audio verification. If speech assets are intentionally omitted later,
set `data-speech-assets="excluded"` on the HTML root to explain the missing audio and
keep guided text practice available rather than requesting nonexistent clips.

Fourteen in-memory regression checks cover microphone cleanup on failures and late
permission responses; resumable per-answer checkpoints; quota and final-save failures;
legacy journals; independent unit drafts; invalid input; literal controller IDs; and
source-only / full-audio practice behavior. They do not use an actual microphone,
inspect learner storage or replace real-device and accessibility QA.

## Privacy and product boundaries

No login, payment, social sign-in, model API, analytics or cloud learner database is
connected. Records stay in this browser on this origin; another browser, phone or
domain will not automatically receive them. Browser storage can be cleared or blocked.
Checkpoint data includes task IDs, self-ratings, short learner notes and practice time,
not full typed answers or recording blobs. Use the built-in reset only when you intend
to erase the local journal.

Microphone use requires user permission and a supported browser in a secure context.
The app releases microphone tracks on navigation and recording failures. Verify iOS
and Android browser behavior before a public release; mocked checks cannot prove it.

Any later paid DeepSeek tutor needs a backend holding the API key, verified account
and subscription permissions, request quotas, spending limits and an appropriate
privacy policy. Never put an API secret, paid entitlement or payment verification
solely in browser code. Free local practice should remain available without an account.

## Publication status and next steps

The existing `jim` repository's root README and history are preserved. This folder
is a fresh source snapshot, not the original private Sites history. Local hosting
configuration, credentials, private planning/chat files and unused legacy speech assets
are not included. The current course's speech files are included following the owner's
confirmation on 2026-10-06. No GitHub Pages configuration or Play Store package is published.

Before launching the complete public learning website:

1. Retain speech provenance and any permissions relied on by the owner; review terms
   before commercial distribution or replace the recordings if needed. Uploading these
   files does not itself grant a Microsoft license or verify commercial rights. Do not
   use copied Duolingo audio or cloned character voices. This project uses neither.
2. Verify recording, keyboard navigation, reduced motion, readable zoomed text and
   mobile layouts on real browsers.
3. Expand and review separate SWT, Camp and everyday-speaking paths. Camp activities,
   communication with children and reporting concerns are not yet a complete course;
   examples must not be presented as safety qualifications or official screening rules.

For eventual static hosting, the output folder is `speak-easy/dist` relative to the
repository root. Use an HTTPS host suitable for the intended product and policies.
Publishing this folder on GitHub alone does not deploy it. Android / Play distribution,
additional interface languages and paid AI remain separate planned work.
