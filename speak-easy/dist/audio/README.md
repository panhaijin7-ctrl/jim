# Course audio provenance

The repository owner requested publication of the existing course recordings and
confirmed their use on 2026-10-06. This note records their technical origin; it is
not an independent legal determination or a grant of rights from Microsoft.

## Speech recordings

- Source: Microsoft's Edge online text-to-speech service, accessed using the
  third-party Python client [`edge-tts`](https://github.com/rany2/edge-tts), version 7.2.8.
- Jamie / interviewer: `en-US-AndrewMultilingualNeural`.
- Mia / practice partner: `en-US-AvaMultilingualNeural`.
- Jamie and Mia are app persona labels, not separate voice models or cloned people.
- 333 fixed texts, each with a natural (`-4%`) and slow (`-23%`) reading: 666 MP3 files.
- The expansion added 390 clips for 65 new questions, models and follow-ups. The original
  276 active clips were reused without regeneration or replacement.
- Both variants play at 1x. Slow playback uses its own recording rather than changing pitch.
- Texts consist only of the project's fixed questions, model answers, follow-ups and
  expression examples. No learner answers, recordings or private planning documents
  are included or sent to a speech service by the app.
- `manifest.json` records each file's text, role, voice ID, rate, byte size and SHA-256 hash.
- Only files used by the current course are included; unused legacy recordings are omitted.
- These recordings are AI-synthesized. No Duolingo audio, samples or cloned character voices
  are used. There is no Microsoft or Duolingo sponsorship or endorsement.

The app needs no speech API key and makes no runtime TTS requests: it plays these files
from the same static host as the lessons. Extension speech was generated on 2026-10-06
using the same two voices and reading rates. The optional maintenance generator is in
`scripts/generate-voice.py`; it exports no learner inputs and is not a runtime app service.

## Original feedback sounds

`cue-start.wav`, `cue-saved.wav`, `cue-complete.wav` and `cue-time.wav` are original short
mallet cues rendered mathematically using `scripts/generate-cues.py`. They contain no
sampled third-party audio. They are separate from Microsoft's synthesized speech.

## Publication and rights notes

A software client's open-source license does not by itself establish rights to the
service's voice models or generated audio. The project does not declare these recordings
to be public domain, CC0, or automatically covered by any future source-code license.

Microsoft Q&A contains [a June 2026 discussion of Edge voice commercial use](https://learn.microsoft.com/en-us/answers/questions/5925556/commercial-use-of-edge-read-aloud-voices-via-edge).
The moderator explicitly describes the forum's guidance as non-binding and recommends
direct clarification where certainty is needed. It is not a commercial redistribution
license. An [earlier service-licensing discussion](https://learn.microsoft.com/en-us/answers/questions/2088770/are-opensource-edge-tts-free-for-commercial-use)
also distinguishes a client's license from Microsoft's service terms. Azure product
permissions must not be assumed to apply to recordings generated via Edge.

The owner remains responsible for the permissions relied upon for public and later
commercial distribution. Keep relevant permission records and review applicable terms
before launching a paid service or distributing a Play Store application. If a license
cannot be established for the intended use, replace the speech files and manifest.
