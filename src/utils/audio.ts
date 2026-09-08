// Procedural Web Audio API sound generator - no external mp3 assets required!
class SoundController {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

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

  // Attack hit sound
  playAttack(element: string = 'normal') {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    if (element === 'fire') {
      // Noise / crackling fire hit
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);
    } else if (element === 'thunder') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.18);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.2);
    }

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  // Cleave / Splash whoosh
  playCleave() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.3);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.31);
  }

  // Burn tick / fire sizzle
  playBurn() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.2);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.21);
  }

  // Heal sound
  playHeal() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.15, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.26);
    });
  }

  // Capture Attempt (mystic rising chime)
  playCaptureAttempt() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.4);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.42);
  }

  // Capture Success fanfare
  playCaptureSuccess() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    [440, 554.37, 659.25, 880].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0.22, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.36);
    });
  }

  // Card click / selection
  playCardSelect() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Generic UI click
  playClick() {
    this.playCardSelect();
  }

  // Coins / Gold jingle
  playCoin() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    [987.77, 1318.51].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.15, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.21);
    });
  }

  // End Turn start sound (gong/horn)
  playEndTurn() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.35);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  // Victory fanfare
  playVictory() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.14);

      gain.gain.setValueAtTime(0.25, now + idx * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.14 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.14);
      osc.stop(now + idx * 0.14 + 0.42);
    });
  }

  // Defeat sound
  playDefeat() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const notes = [400, 350, 300, 220];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.18);

      gain.gain.setValueAtTime(0.2, now + idx * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.18 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.18);
      osc.stop(now + idx * 0.18 + 0.36);
    });
  }

  // Card draw / deal whoosh (swish from deck)
  playCardDraw() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(250, now + 0.12);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  // Card Slam onto Table (meaty wood/stone thud with bass resonance)
  playCardSlam() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Sub-bass thump
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.22);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.23);

    // Cardboard surface slap (quick noise snap)
    const slap = ctx.createOscillator();
    const slapGain = ctx.createGain();
    slap.type = 'triangle';
    slap.frequency.setValueAtTime(320, now);
    slap.frequency.exponentialRampToValueAtTime(80, now + 0.08);

    slapGain.gain.setValueAtTime(0.2, now);
    slapGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    slap.connect(slapGain);
    slapGain.connect(ctx.destination);
    slap.start(now);
    slap.stop(now + 0.09);
  }

  // Heavy Impact / Violent Attack strike
  playHeavyImpact(isCrit: boolean = false) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1. Deep sub-bass punch
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(isCrit ? 150 : 120, now);
    sub.frequency.exponentialRampToValueAtTime(25, now + 0.35);

    subGain.gain.setValueAtTime(isCrit ? 0.55 : 0.42, now);
    subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    sub.connect(subGain);
    subGain.connect(ctx.destination);
    sub.start(now);
    sub.stop(now + 0.36);

    // 2. Heavy crunch & distortion
    const crunch = ctx.createOscillator();
    const crunchGain = ctx.createGain();
    crunch.type = 'sawtooth';
    crunch.frequency.setValueAtTime(isCrit ? 280 : 200, now);
    crunch.frequency.exponentialRampToValueAtTime(45, now + 0.2);

    crunchGain.gain.setValueAtTime(isCrit ? 0.35 : 0.25, now);
    crunchGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    crunch.connect(crunchGain);
    crunchGain.connect(ctx.destination);
    crunch.start(now);
    crunch.stop(now + 0.21);

    // 3. Crit resonance chime
    if (isCrit) {
      const bell = ctx.createOscillator();
      const bellGain = ctx.createGain();
      bell.type = 'triangle';
      bell.frequency.setValueAtTime(880, now);
      bell.frequency.exponentialRampToValueAtTime(440, now + 0.3);

      bellGain.gain.setValueAtTime(0.2, now);
      bellGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      bell.connect(bellGain);
      bellGain.connect(ctx.destination);
      bell.start(now);
      bell.stop(now + 0.31);
    }
  }

  // Monster Defeat / Shatter & Elimination
  playMonsterDeath() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Shattering stone / hollow doom crunch
    const deathOsc = ctx.createOscillator();
    const deathGain = ctx.createGain();
    deathOsc.type = 'sawtooth';
    deathOsc.frequency.setValueAtTime(140, now);
    deathOsc.frequency.exponentialRampToValueAtTime(20, now + 0.6);

    deathGain.gain.setValueAtTime(0.45, now);
    deathGain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

    deathOsc.connect(deathGain);
    deathGain.connect(ctx.destination);
    deathOsc.start(now);
    deathOsc.stop(now + 0.62);

    // Crackle / disintegration crack
    [0.05, 0.15, 0.28].forEach((offset, idx) => {
      const crack = ctx.createOscillator();
      const crackGain = ctx.createGain();
      crack.type = 'square';
      crack.frequency.setValueAtTime(380 - idx * 70, now + offset);
      crack.frequency.exponentialRampToValueAtTime(60, now + offset + 0.12);

      crackGain.gain.setValueAtTime(0.25 - idx * 0.05, now + offset);
      crackGain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.12);

      crack.connect(crackGain);
      crackGain.connect(ctx.destination);
      crack.start(now + offset);
      crack.stop(now + offset + 0.13);
    });
  }

  // Capture suspense rattle tick (steps 1, 2, 3)
  playCaptureRattle(rattleNum: number = 1) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const baseFreq = rattleNum === 1 ? 400 : rattleNum === 2 ? 540 : 720;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, now + 0.1);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  // Capture break / failure explosion
  playCaptureBreak() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Glass / seal shatter
    const shatter = ctx.createOscillator();
    const shatterGain = ctx.createGain();
    shatter.type = 'sawtooth';
    shatter.frequency.setValueAtTime(750, now);
    shatter.frequency.exponentialRampToValueAtTime(90, now + 0.35);

    shatterGain.gain.setValueAtTime(0.4, now);
    shatterGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    shatter.connect(shatterGain);
    shatterGain.connect(ctx.destination);
    shatter.start(now);
    shatter.stop(now + 0.36);

    // Low roar of broke-out beast
    const roar = ctx.createOscillator();
    const roarGain = ctx.createGain();
    roar.type = 'square';
    roar.frequency.setValueAtTime(110, now + 0.05);
    roar.frequency.exponentialRampToValueAtTime(40, now + 0.4);

    roarGain.gain.setValueAtTime(0.3, now + 0.05);
    roarGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    roar.connect(roarGain);
    roarGain.connect(ctx.destination);
    roar.start(now + 0.05);
    roar.stop(now + 0.41);
  }

  // Wooden pawn clack / thud onto map table
  playWoodThud() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(75, now + 0.09);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }
}

export const sound = new SoundController();
