// Procedural Web Audio API sound generator - Studio quality, zero external mp3 assets required!
class SoundController {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  private noiseBuffer: AudioBuffer | null = null;

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Generate or retrieve cached white noise buffer for realistic paper / air textures
  private getNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (!this.noiseBuffer || this.noiseBuffer.sampleRate !== ctx.sampleRate) {
      const bufferSize = ctx.sampleRate * 2; // 2 seconds of noise
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      this.noiseBuffer = buffer;
    }
    return this.noiseBuffer;
  }

  // 1. Tactile Card Hover Tick (Ultra crisp, unobtrusive subtle glass-paper click)
  playSkillHover() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1450, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.04);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.setValueAtTime(3.0, now);

    gain.gain.setValueAtTime(0.045, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.045);
  }

  // 2. Card Draw from Deck (Flick + paper swoosh)
  playCardDraw() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Filtered noise rustle (paper friction)
    const noise = ctx.createBufferSource();
    noise.buffer = this.getNoiseBuffer(ctx);
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(2200, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(650, now + 0.16);
    noiseFilter.Q.setValueAtTime(1.8, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.01, now);
    noiseGain.gain.linearRampToValueAtTime(0.12, now + 0.03);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.17);

    // Subtle pitch swoosh
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(540, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.14);

    oscGain.gain.setValueAtTime(0.08, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  // 3. Card Slide / Drag across Felt Mat
  playCardSlide() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const noise = ctx.createBufferSource();
    noise.buffer = this.getNoiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(900, now + 0.12);
    filter.Q.setValueAtTime(2.2, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.13);
  }

  // 4. Card Slam onto Wooden Arena Table (Meaty bass thud + resonant wood knock + cardboard slap)
  playCardSlam() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Layer A: Sub-bass body thump
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(110, now);
    subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.24);

    subGain.gain.setValueAtTime(0.42, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.25);

    // Layer B: Resonant wood knock (Bandpassed triangle)
    const woodOsc = ctx.createOscillator();
    const woodFilter = ctx.createBiquadFilter();
    const woodGain = ctx.createGain();

    woodOsc.type = 'triangle';
    woodOsc.frequency.setValueAtTime(280, now);
    woodOsc.frequency.exponentialRampToValueAtTime(95, now + 0.14);

    woodFilter.type = 'lowpass';
    woodFilter.frequency.setValueAtTime(450, now);
    woodFilter.Q.setValueAtTime(2.0, now);

    woodGain.gain.setValueAtTime(0.3, now);
    woodGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    woodOsc.connect(woodFilter);
    woodFilter.connect(woodGain);
    woodGain.connect(ctx.destination);
    woodOsc.start(now);
    woodOsc.stop(now + 0.15);

    // Layer C: Crisp card edge impact snap (Filtered noise)
    const snap = ctx.createBufferSource();
    snap.buffer = this.getNoiseBuffer(ctx);
    const snapFilter = ctx.createBiquadFilter();
    snapFilter.type = 'bandpass';
    snapFilter.frequency.setValueAtTime(1800, now);
    snapFilter.Q.setValueAtTime(2.5, now);

    const snapGain = ctx.createGain();
    snapGain.gain.setValueAtTime(0.18, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    snap.connect(snapFilter);
    snapFilter.connect(snapGain);
    snapGain.connect(ctx.destination);
    snap.start(now);
    snap.stop(now + 0.06);
  }

  // 5. Element Attack Hit
  playAttack(element: string = 'normal') {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    if (element === 'fire') {
      // Crackling fiery whoosh
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.26);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, now);
      filter.frequency.exponentialRampToValueAtTime(200, now + 0.26);

      gain.gain.setValueAtTime(0.32, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.26);
    } else if (element === 'thunder') {
      // Electric crack snap
      osc.type = 'square';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.18);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600, now);
      filter.Q.setValueAtTime(2.5, now);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
    } else if (element === 'water') {
      // Fluid resonant bubble surge
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.22);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(700, now);
      filter.Q.setValueAtTime(4.0, now);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
    } else {
      // Physical impact
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, now);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    }

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.27);
  }

  // 6. Cleave / Splash Attack
  playCleave() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(95, now + 0.32);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.32);
    filter.Q.setValueAtTime(1.5, now);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.32);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.33);
  }

  // 7. Burn tick / Sizzle
  playBurn() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const noise = ctx.createBufferSource();
    noise.buffer = this.getNoiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, now);
    filter.frequency.exponentialRampToValueAtTime(600, now + 0.22);
    filter.Q.setValueAtTime(2.0, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.23);
  }

  // 8. Positive Buff / Stat Boost (Ascending chime arpeggio)
  playBuff() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 - E5 - G5 - C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, now + idx * 0.05);

      gain.gain.setValueAtTime(0.14, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.3);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.31);
    });
  }

  // 9. Negative Debuff / Weaken (Dark downward dissonant surge)
  playDebuff() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const notes = [311.13, 293.66, 246.94]; // Eb4 -> D4 -> B3
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.6, now + idx * 0.07 + 0.3);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now + idx * 0.07);
      filter.Q.setValueAtTime(3.0, now + idx * 0.07);

      gain.gain.setValueAtTime(0.18, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.3);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.31);
    });
  }

  // 10. Ultimate Skill Blast (Dramatic cosmic charge + thundering explosion)
  playUltimate() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Rising energy charge
    const riseOsc = ctx.createOscillator();
    const riseGain = ctx.createGain();
    riseOsc.type = 'sawtooth';
    riseOsc.frequency.setValueAtTime(140, now);
    riseOsc.frequency.exponentialRampToValueAtTime(880, now + 0.35);

    riseGain.gain.setValueAtTime(0.15, now);
    riseGain.gain.linearRampToValueAtTime(0.4, now + 0.35);
    riseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);

    riseOsc.connect(riseGain);
    riseGain.connect(ctx.destination);
    riseOsc.start(now);
    riseOsc.stop(now + 0.56);

    // Boom detonation
    setTimeout(() => {
      this.playHeavyImpact(true);
    }, 340);
  }

  // 11. Heal
  playHeal() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.16, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.32);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.33);
    });
  }

  // 12. Heavy Impact / Violent Attack strike
  playHeavyImpact(isCrit: boolean = false) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Sub-bass punch
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(isCrit ? 160 : 130, now);
    sub.frequency.exponentialRampToValueAtTime(24, now + 0.38);

    subGain.gain.setValueAtTime(isCrit ? 0.6 : 0.45, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    sub.connect(subGain);
    subGain.connect(ctx.destination);
    sub.start(now);
    sub.stop(now + 0.39);

    // Crunch Distortion
    const crunch = ctx.createOscillator();
    const crunchFilter = ctx.createBiquadFilter();
    const crunchGain = ctx.createGain();

    crunch.type = 'sawtooth';
    crunch.frequency.setValueAtTime(isCrit ? 300 : 210, now);
    crunch.frequency.exponentialRampToValueAtTime(35, now + 0.22);

    crunchFilter.type = 'lowpass';
    crunchFilter.frequency.setValueAtTime(800, now);
    crunchFilter.Q.setValueAtTime(2.0, now);

    crunchGain.gain.setValueAtTime(isCrit ? 0.4 : 0.28, now);
    crunchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    crunch.connect(crunchFilter);
    crunchFilter.connect(crunchGain);
    crunchGain.connect(ctx.destination);
    crunch.start(now);
    crunch.stop(now + 0.23);

    // Crit bell shimmer
    if (isCrit) {
      const bell = ctx.createOscillator();
      const bellGain = ctx.createGain();
      bell.type = 'triangle';
      bell.frequency.setValueAtTime(1174.66, now); // D6
      bell.frequency.exponentialRampToValueAtTime(587.33, now + 0.35);

      bellGain.gain.setValueAtTime(0.22, now);
      bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      bell.connect(bellGain);
      bellGain.connect(ctx.destination);
      bell.start(now);
      bell.stop(now + 0.36);
    }
  }

  // 13. Monster Death / Shatter
  playMonsterDeath() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const deathOsc = ctx.createOscillator();
    const deathGain = ctx.createGain();
    deathOsc.type = 'sawtooth';
    deathOsc.frequency.setValueAtTime(160, now);
    deathOsc.frequency.exponentialRampToValueAtTime(18, now + 0.65);

    deathGain.gain.setValueAtTime(0.5, now);
    deathGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    deathOsc.connect(deathGain);
    deathGain.connect(ctx.destination);
    deathOsc.start(now);
    deathOsc.stop(now + 0.66);

    [0.05, 0.16, 0.3].forEach((offset, idx) => {
      const crack = ctx.createOscillator();
      const crackGain = ctx.createGain();
      crack.type = 'square';
      crack.frequency.setValueAtTime(400 - idx * 75, now + offset);
      crack.frequency.exponentialRampToValueAtTime(50, now + offset + 0.12);

      crackGain.gain.setValueAtTime(0.24 - idx * 0.05, now + offset);
      crackGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);

      crack.connect(crackGain);
      crackGain.connect(ctx.destination);
      crack.start(now + offset);
      crack.stop(now + offset + 0.13);
    });
  }

  // 14. Card Select / Button Click
  playCardSelect() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  playClick() {
    this.playCardSelect();
  }

  // 15. Coin / Gold Reward Jingle
  playCoin() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    [1046.5, 1318.51, 1567.98].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.16, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.23);
    });
  }

  // 16. End Turn start sound (Resonant war gong)
  playEndTurn() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(175, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.4);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, now);
    filter.Q.setValueAtTime(3.0, now);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.41);
  }

  // 17. Victory Fanfare
  playVictory() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.13);

      gain.gain.setValueAtTime(0.25, now + idx * 0.13);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.13 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.13);
      osc.stop(now + idx * 0.13 + 0.46);
    });
  }

  // 18. Defeat Sound
  playDefeat() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const notes = [415.3, 370.0, 311.13, 220.0];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.18);

      gain.gain.setValueAtTime(0.22, now + idx * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.18 + 0.38);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.18);
      osc.stop(now + idx * 0.18 + 0.39);
    });
  }

  // 19. Capture Attempt & Resolution
  playCaptureAttempt() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(740, now + 0.4);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.42);
  }

  playCaptureRattle(rattleNum: number = 1) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const baseFreq = rattleNum === 1 ? 420 : rattleNum === 2 ? 560 : 750;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.72, now + 0.1);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  playCaptureSuccess() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    [440, 554.37, 659.25, 880].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0.24, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.38);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.39);
    });
  }

  playCaptureBreak() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const shatter = ctx.createOscillator();
    const shatterGain = ctx.createGain();
    shatter.type = 'sawtooth';
    shatter.frequency.setValueAtTime(780, now);
    shatter.frequency.exponentialRampToValueAtTime(80, now + 0.35);

    shatterGain.gain.setValueAtTime(0.42, now);
    shatterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    shatter.connect(shatterGain);
    shatterGain.connect(ctx.destination);
    shatter.start(now);
    shatter.stop(now + 0.36);
  }

  playWoodThud() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.09);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, now);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }
}

export const sound = new SoundController();
