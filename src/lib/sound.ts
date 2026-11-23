/**
 * PlayDaily-style WebAudio game audio engine.
 * Synthesized SFX (no audio files needed) + looping ambience beds:
 *   - underwater hum + bubble stream (Krillion)
 *   - forest birdsong + breeze (Noillirk)
 * Every failure is silent — audio is pure garnish.
 */

export type SoundKind =
  | "click"   // UI button press
  | "pop"     // soft pop (chip appears)
  | "good"    // small success arpeggio
  | "bad"     // soft error buzz
  | "tick"    // countdown tick
  | "type"    // keypress blip while typing
  | "splash"  // begin descent — big water splash
  | "bubble"  // random underwater bubble
  | "whoosh"  // transition whoosh
  | "chime"   // results fanfare
  | "buzz"    // hard wrong-answer buzz
  | "flip"    // tile select
  | "shuffle" // grid shuffle flick
  | "swoosh"  // answer sink/float travel
  | "coin";   // points awarded

interface ToneSpec {
  freq: number;
  to?: number;
  dur: number;
  type: OscillatorType;
  gain: number;
  delay?: number;
}

export const SOUND_PREF_KEY = "gd-sound";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctx) return null;
      ctx = new Ctx();
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function getNoise(audio: AudioContext): AudioBuffer {
  if (noiseBuf && noiseBuf.sampleRate === audio.sampleRate) return noiseBuf;
  const len = audio.sampleRate * 1.2;
  const buf = audio.createBuffer(1, len, audio.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  noiseBuf = buf;
  return buf;
}

function tone(audio: AudioContext, spec: ToneSpec, at = 0) {
  const t = audio.currentTime + at;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = spec.type;
  osc.frequency.setValueAtTime(spec.freq, t);
  if (spec.to) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, spec.to), t + spec.dur);
  }
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(spec.gain, t + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + spec.dur);
  osc.connect(gain);
  gain.connect(master ?? audio.destination);
  osc.start(t);
  osc.stop(t + spec.dur + 0.06);
}

function noise(
  audio: AudioContext,
  opts: {
    dur: number;
    gain: number;
    filter: BiquadFilterType;
    from: number;
    to?: number;
    at?: number;
    q?: number;
  }
) {
  const t = audio.currentTime + (opts.at ?? 0);
  const src = audio.createBufferSource();
  src.buffer = getNoise(audio);
  src.loop = true;
  const filter = audio.createBiquadFilter();
  filter.type = opts.filter;
  filter.Q.value = opts.q ?? 1;
  filter.frequency.setValueAtTime(opts.from, t);
  if (opts.to) {
    filter.frequency.exponentialRampToValueAtTime(Math.max(20, opts.to), t + opts.dur);
  }
  const gain = audio.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(opts.gain, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + opts.dur);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(master ?? audio.destination);
  src.start(t);
  src.stop(t + opts.dur + 0.1);
}

/* ------------------------------------------------------------------
   One-shot SFX — the whole vocabulary of the arcade.
   ------------------------------------------------------------------ */

export function playBlip(kind: SoundKind, enabled: boolean) {
  if (!enabled) return;
  const audio = getCtx();
  if (!audio) return;
  try {
    switch (kind) {
      case "click":
        tone(audio, { freq: 620, to: 520, dur: 0.07, type: "square", gain: 0.055 });
        break;
      case "pop":
        tone(audio, { freq: 340, to: 700, dur: 0.1, type: "triangle", gain: 0.12 });
        break;
      case "good":
        // quick major-third blip up
        tone(audio, { freq: 523.25, dur: 0.09, type: "triangle", gain: 0.11 });
        tone(audio, { freq: 659.25, dur: 0.12, type: "triangle", gain: 0.11, delay: 0.08 });
        tone(audio, { freq: 783.99, dur: 0.16, type: "triangle", gain: 0.1, delay: 0.16 });
        break;
      case "bad":
        tone(audio, { freq: 200, to: 130, dur: 0.22, type: "sawtooth", gain: 0.07 });
        break;
      case "buzz":
        tone(audio, { freq: 130, dur: 0.28, type: "square", gain: 0.09 });
        tone(audio, { freq: 98, to: 80, dur: 0.3, type: "sawtooth", gain: 0.06, delay: 0.03 });
        break;
      case "tick":
        tone(audio, { freq: 1100, dur: 0.045, type: "sine", gain: 0.07 });
        break;
      case "type":
        tone(audio, { freq: 1400 + Math.random() * 500, dur: 0.03, type: "square", gain: 0.03 });
        break;
      case "flip":
        tone(audio, { freq: 700, to: 940, dur: 0.06, type: "triangle", gain: 0.08 });
        break;
      case "shuffle":
        noise(audio, { dur: 0.16, gain: 0.1, filter: "bandpass", from: 1800, to: 600, q: 2 });
        tone(audio, { freq: 500, to: 320, dur: 0.1, type: "triangle", gain: 0.06, delay: 0.02 });
        break;
      case "splash":
        // noise burst + descending body + droplet blips
        noise(audio, { dur: 0.5, gain: 0.22, filter: "lowpass", from: 3200, to: 260 });
        tone(audio, { freq: 300, to: 70, dur: 0.4, type: "sine", gain: 0.14 });
        tone(audio, { freq: 900, to: 1500, dur: 0.12, type: "sine", gain: 0.05, delay: 0.18 });
        tone(audio, { freq: 1200, to: 1800, dur: 0.1, type: "sine", gain: 0.04, delay: 0.28 });
        break;
      case "bubble":
        tone(audio, {
          freq: 420 + Math.random() * 260,
          to: 900 + Math.random() * 500,
          dur: 0.14,
          type: "sine",
          gain: 0.05,
        });
        break;
      case "whoosh":
        noise(audio, { dur: 0.34, gain: 0.12, filter: "bandpass", from: 500, to: 2400, q: 1.4 });
        break;
      case "swoosh":
        noise(audio, { dur: 0.24, gain: 0.08, filter: "bandpass", from: 2200, to: 400, q: 1.6 });
        break;
      case "coin":
        tone(audio, { freq: 987.77, dur: 0.07, type: "square", gain: 0.06 });
        tone(audio, { freq: 1318.51, dur: 0.22, type: "square", gain: 0.06, delay: 0.07 });
        break;
      case "chime":
        // little victory fanfare
        [
          [523.25, 0],
          [659.25, 0.11],
          [783.99, 0.22],
          [1046.5, 0.34],
        ].forEach(([f, d]) =>
          tone(audio, { freq: f, dur: 0.3, type: "triangle", gain: 0.1, delay: d })
        );
        break;
    }
  } catch {
    // audio unsupported — the game works silently
  }
}

/* ------------------------------------------------------------------
   Ambience beds — start/stop, persisted across phases.
   ------------------------------------------------------------------ */

interface AmbientHandle {
  stop: () => void;
}

let ambient: AmbientHandle | null = null;

/**
 * Start a looping ambience bed. "ocean" = filtered underwater hum with a
 * slow LFO and a randomized bubble stream; "forest" = warm breeze with
 * occasional synthesized birdsong. Starting a new bed stops the old one.
 */
export function startAmbience(kind: "ocean" | "forest", enabled: boolean): void {
  stopAmbience();
  if (!enabled) return;
  const audio = getCtx();
  if (!audio) return;
  try {
    const nodes: AudioNode[] = [];
    const timers: number[] = [];

    // --- bed: filtered noise ---
    const src = audio.createBufferSource();
    src.buffer = getNoise(audio);
    src.loop = true;
    const filter = audio.createBiquadFilter();
    const bedGain = audio.createGain();
    bedGain.gain.value = 0.0001;
    bedGain.gain.linearRampToValueAtTime(
      kind === "ocean" ? 0.035 : 0.02,
      audio.currentTime + 1.2
    );
    if (kind === "ocean") {
      filter.type = "lowpass";
      filter.frequency.value = 320;
      filter.Q.value = 0.7;
      // slow LFO on the filter — the deep-water swell
      const lfo = audio.createOscillator();
      const lfoGain = audio.createGain();
      lfo.frequency.value = 0.09;
      lfoGain.gain.value = 120;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
      nodes.push(lfo, lfoGain);
    } else {
      filter.type = "bandpass";
      filter.frequency.value = 950;
      filter.Q.value = 0.4;
    }
    src.connect(filter);
    filter.connect(bedGain);
    bedGain.connect(master ?? audio.destination);
    src.start();
    nodes.push(src, filter, bedGain);

    if (kind === "ocean") {
      // randomized bubble stream
      const tick = () => {
        playBlip("bubble", true);
        timers.push(window.setTimeout(tick, 900 + Math.random() * 2600));
      };
      timers.push(window.setTimeout(tick, 1400));
    } else {
      // occasional birdsong — two quick descending chirps
      const chirp = () => {
        const base = 2100 + Math.random() * 900;
        tone(audio, { freq: base, to: base * 1.35, dur: 0.09, type: "sine", gain: 0.045 });
        tone(audio, { freq: base * 1.2, to: base * 0.85, dur: 0.11, type: "sine", gain: 0.04, delay: 0.12 });
        if (Math.random() > 0.5) {
          tone(audio, { freq: base * 0.9, to: base * 1.25, dur: 0.08, type: "sine", gain: 0.035, delay: 0.3 });
        }
        timers.push(window.setTimeout(chirp, 2600 + Math.random() * 5200));
      };
      timers.push(window.setTimeout(chirp, 900));
    }

    ambient = {
      stop: () => {
        try {
          timers.forEach((t) => window.clearTimeout(t));
          bedGain.gain.cancelScheduledValues(audio.currentTime);
          bedGain.gain.setValueAtTime(bedGain.gain.value, audio.currentTime);
          bedGain.gain.linearRampToValueAtTime(0.0001, audio.currentTime + 0.5);
          window.setTimeout(() => {
            try {
              nodes.forEach((n) => {
                if ("stop" in n && typeof n.stop === "function") n.stop();
                n.disconnect();
              });
            } catch {
              /* already gone */
            }
          }, 650);
        } catch {
          /* context gone */
        }
      },
    };
  } catch {
    // ambience is garnish too
  }
}

export function stopAmbience(): void {
  ambient?.stop();
  ambient = null;
}

/* ------------------------------------------------------------------
   Preference plumbing (unchanged API)
   ------------------------------------------------------------------ */

export function readSoundPref(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(SOUND_PREF_KEY) !== "off";
  } catch {
    return true;
  }
}

export function writeSoundPref(on: boolean) {
  try {
    window.localStorage.setItem(SOUND_PREF_KEY, on ? "on" : "off");
  } catch {
    // private mode — preference simply is not persisted
  }
  if (!on) stopAmbience();
}
