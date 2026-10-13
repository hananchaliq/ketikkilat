// Synthesized Web Audio API keyboard sound engine
// Multiple sound profiles: mechanical, thock, typewriter, bubble
// Zero external assets, instant zero-latency feedback

export type SoundProfile = 'mechanical' | 'thock' | 'typewriter' | 'bubble';

class SoundEngine {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play normal key press with selected profile
  playKey(volume: number = 0.5, profile: SoundProfile = 'mechanical') {
    if (volume <= 0) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      if (profile === 'thock') {
        // Deep low-frequency tactile switch thock
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180 + Math.random() * 20, now);
        osc.frequency.exponentialRampToValueAtTime(55, now + 0.05);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.6 * volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.07);
        return;
      }

      if (profile === 'typewriter') {
        // Vintage typewriter metal strike
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1400 + Math.random() * 200, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.025);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.5 * volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
        return;
      }

      if (profile === 'bubble') {
        // Playful bubble pop
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        const startFreq = 400 + Math.random() * 300;
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(startFreq * 2.2, now + 0.035);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.4 * volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
        return;
      }

      // Default: Crisp mechanical switch click (Cherry MX Blue style)
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.45 * volume, now + 0.002);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.038);
      gainNode.connect(ctx.destination);

      const bufferSize = ctx.sampleRate * 0.025;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.004));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2300 + Math.random() * 300, now);
      filter.Q.setValueAtTime(3.8, now);

      noise.connect(filter);
      filter.connect(gainNode);

      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450 + Math.random() * 60, now);
      osc.frequency.exponentialRampToValueAtTime(130, now + 0.028);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.3 * volume, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.032);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      noise.start(now);
      osc.start(now);
      noise.stop(now + 0.04);
      osc.stop(now + 0.04);
    } catch {
      // Ignore audio error
    }
  }

  // Spacebar: deeper, heavier resonance
  playSpace(volume: number = 0.5, profile: SoundProfile = 'mechanical') {
    if (volume <= 0) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = profile === 'thock' ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(profile === 'thock' ? 140 : 200, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.06);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.6 * volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Ignore audio error
    }
  }

  // Error: subtle muted clack
  playError(volume: number = 0.5) {
    if (volume <= 0) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(95, now + 0.06);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3 * volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // Ignore audio error
    }
  }

  // Streak combo chime: cheerful rising triad
  playStreak(volume: number = 0.5) {
    if (volume <= 0) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const notes = [587.33, 739.99, 880.0]; // D5, F#5, A5
      notes.forEach((freq, idx) => {
        const now = ctx.currentTime + idx * 0.055;
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.25 * volume, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      });
    } catch {
      // Ignore audio error
    }
  }

  // Finish fanfare: celebratory triumphant chord
  playFanfare(volume: number = 0.5) {
    if (volume <= 0) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const chords = [
        { f: 523.25, d: 0 },    // C5
        { f: 659.25, d: 0.08 }, // E5
        { f: 783.99, d: 0.16 }, // G5
        { f: 1046.5, d: 0.24 }, // C6
        { f: 1318.5, d: 0.36 }, // E6
      ];
      chords.forEach(({ f, d }) => {
        const now = ctx.currentTime + d;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3 * volume, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
      });
    } catch {
      // Ignore audio error
    }
  }

  // Completion chime / fanfare
  playComplete(volume: number = 0.5) {
    this.playFanfare(volume);
  }
}

export const soundManager = new SoundEngine();
