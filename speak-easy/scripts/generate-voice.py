"""Prepare fixed English lesson audio; no learner text or recordings are used."""
import asyncio
import hashlib
import json
from pathlib import Path
import sys

import edge_tts

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "dist" / "audio"
RATES = {"natural": "-4%", "slow": "-23%"}


async def main():
    prompts = json.load(sys.stdin)
    catalog = await edge_tts.list_voices()
    choices = {v["ShortName"]: v for v in catalog}
    roles = {"interviewer": "en-US-AndrewMultilingualNeural", "coach": "en-US-AvaMultilingualNeural"}
    for role, name in roles.items():
        if name not in choices:
            raise RuntimeError(f"Selected {role} voice is not in the live catalog")
        print(json.dumps({"role": role, "voice": choices[name]}, ensure_ascii=False), flush=True)
    OUTPUT.mkdir(parents=True, exist_ok=True)
    gate = asyncio.Semaphore(3)
    completed = []
    manifest = OUTPUT / "manifest.json"
    previous = {c["file"]: c for c in json.loads(manifest.read_text(encoding="utf-8")).get("clips", [])} if manifest.exists() else {}

    async def produce(prompt, variant, rate):
        async with gate:
            name = f'{prompt["id"]}-{variant}.mp3'
            target = OUTPUT / name
            old = previous.get(name)
            if (old and target.exists() and old.get("text") == prompt["text"]
                    and old.get("role") == prompt["role"]
                    and old.get("voice", roles[prompt["role"]]) == roles[prompt["role"]]
                    and old.get("rate", rate) == rate
                    and old.get("sha256") == hashlib.sha256(target.read_bytes()).hexdigest()):
                completed.append({**old, "voice": roles[prompt["role"]], "rate": rate})
                print(f'Reused {name}', flush=True)
                return
            for attempt in range(3):
                try:
                    voice = edge_tts.Communicate(prompt["text"], roles[prompt["role"]], rate=rate)
                    await voice.save(str(target))
                    if target.stat().st_size < 1000:
                        raise RuntimeError("Audio output is empty")
                    completed.append({"file": name, "text": prompt["text"], "variant": variant,
                                      "role": prompt["role"], "voice": roles[prompt["role"]], "rate": rate, "bytes": target.stat().st_size,
                                      "sha256": hashlib.sha256(target.read_bytes()).hexdigest()})
                    print(f'Prepared {name} ({target.stat().st_size} bytes)', flush=True)
                    return
                except Exception as error:
                    if attempt == 2:
                        raise RuntimeError(f'Could not prepare {name}') from error
                    await asyncio.sleep(0.5 * (attempt + 1))

    results = await asyncio.gather(*(produce(p, variant, rate) for p in prompts for variant, rate in RATES.items()),
                                   return_exceptions=True)
    # Generated asset manifest, not user state. Package it with the static files.
    (OUTPUT / "manifest.json").write_text(json.dumps({"synthetic": True, "clips": sorted(completed, key=lambda x: x["file"])},
                                                    ensure_ascii=False, indent=2), encoding="utf-8")
    failures = [result for result in results if isinstance(result, BaseException)]
    if failures:
        # Retain successful clips in the manifest so retrying does not regenerate them.
        print(f'{len(completed)} clips retained; {len(failures)} failed.', flush=True)
        raise RuntimeError('Voice generation incomplete; retry to finish missing clips') from failures[0]
    print(f'All {len(completed)} voice clips prepared.', flush=True)


if __name__ == "__main__":
    asyncio.run(main())
