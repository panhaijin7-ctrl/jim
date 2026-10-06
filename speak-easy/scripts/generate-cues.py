"""Render original, short mallet cues. No sampled or third-party sound assets."""
from array import array
from pathlib import Path
import math
import wave

RATE = 44100
OUT = Path(__file__).resolve().parents[1] / "dist" / "audio"
CUES = {
    "start": [(0, 392, .20, .30), (.085, 587.33, .24, .24)],
    "saved": [(0, 659.25, .22, .26), (.06, 783.99, .24, .23), (.13, 987.77, .28, .20)],
    "complete": [(0, 392, .34, .23), (.10, 493.88, .36, .25), (.21, 587.33, .38, .25),
                 (.34, 783.99, .46, .24), (.34, 392, .40, .10)],
    "time": [(0, 523.25, .23, .23), (.15, 659.25, .27, .18)],
}


def mallet(t, frequency, duration):
    attack = min(1.0, t / .008)
    tail = min(1.0, (duration - t) / .06)
    body = math.sin(2 * math.pi * frequency * t) * math.exp(-8 * t)
    bell = .21 * math.sin(2 * math.pi * frequency * 2.76 * t) * math.exp(-19 * t)
    shimmer = .045 * math.sin(2 * math.pi * frequency * 5.4 * t) * math.exp(-32 * t)
    return (body + bell + shimmer) * attack * max(0, tail)


OUT.mkdir(parents=True, exist_ok=True)
for name, notes in CUES.items():
    duration = max(start + length for start, _, length, _ in notes) + .03
    samples = [0.0] * math.ceil(duration * RATE)
    for start, frequency, length, level in notes:
        offset = round(start * RATE)
        for n in range(round(length * RATE)):
            samples[offset + n] += level * mallet(n / RATE, frequency, length)
    peak = max(abs(sample) for sample in samples)
    gain = min(1, .42 / peak)
    pcm = array("h", (round(sample * gain * 32767) for sample in samples))
    target = OUT / f"cue-{name}.wav"
    with wave.open(str(target), "wb") as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(RATE)
        output.writeframes(pcm.tobytes())
    print(f"Prepared {target.name}: {duration:.2f}s, peak {peak * gain:.3f}")
