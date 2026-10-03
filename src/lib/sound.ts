/**
 * Professional alert audio synthesizer using Web Audio API
 * Plays a subtle, pleasant enterprise chime for new alerts
 */

const STORAGE_SOUND_KEY = 'vyomix_alert_sound_enabled';
const SEEN_ALERTS_KEY = 'vyomix_seen_alert_ids';

class AlertSoundService {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private seenAlertIds: Set<string> = new Set();

  constructor() {
    const savedSetting = localStorage.getItem(STORAGE_SOUND_KEY);
    if (savedSetting !== null) {
      this.soundEnabled = savedSetting === 'true';
    }

    // Load previously seen alerts so reloads don't replay sounds
    try {
      const stored = localStorage.getItem(SEEN_ALERTS_KEY);
      if (stored) {
        const arr = JSON.parse(stored);
        if (Array.isArray(arr)) {
          this.seenAlertIds = new Set(arr);
        }
      }
    } catch (e) {
      // ignore
    }
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    localStorage.setItem(STORAGE_SOUND_KEY, enabled ? 'true' : 'false');
  }

  public toggleSound(): boolean {
    this.setSoundEnabled(!this.soundEnabled);
    if (this.soundEnabled) {
      this.playChime(true); // brief test ping when enabled
    }
    return this.soundEnabled;
  }

  private initAudio() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  /**
   * Plays a subtle, non-intrusive 2-tone harmonic chime
   */
  public playChime(isTest: boolean = false): void {
    if (!this.soundEnabled && !isTest) return;

    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;

      // Primary tone
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880.0, now + 0.12); // A5

      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.exponentialRampToValueAtTime(0.08, now + 0.03);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);

      osc1.start(now);
      osc1.stop(now + 0.35);

      // Subtle sub-harmonic warmth
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(440.0, now); // A4
      osc2.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5

      gain2.gain.setValueAtTime(0.001, now);
      gain2.gain.exponentialRampToValueAtTime(0.04, now + 0.03);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);

      osc2.start(now);
      osc2.stop(now + 0.3);
    } catch (e) {
      // Audio autoplay policy blocked or not allowed yet
    }
  }

  /**
   * Plays a tactical audible chime for critical escalation
   */
  public playCriticalBuzzer(): void {
    if (!this.soundEnabled) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.15);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.09, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.42);
    } catch (e) {}
  }

  /**
   * Checks a batch of incoming alerts and plays sound ONLY if a genuinely NEW alert is found
   */
  public checkAndNotifyNewAlerts(alerts: Array<{ id: string; severity?: string; status?: string }>): boolean {
    if (!this.soundEnabled) return false;

    let hasGenuineNewAlert = false;
    const newIds: string[] = [];

    for (const a of alerts) {
      if (!a.id) continue;
      if (!this.seenAlertIds.has(a.id)) {
        this.seenAlertIds.add(a.id);
        newIds.push(a.id);
        // Only trigger sound for active/unresolved alerts
        if (a.status !== 'RESOLVED') {
          hasGenuineNewAlert = true;
        }
      }
    }

    if (newIds.length > 0) {
      // Persist up to last 100 seen alert ids
      const idsArray = Array.from(this.seenAlertIds).slice(-100);
      try {
        localStorage.setItem(SEEN_ALERTS_KEY, JSON.stringify(idsArray));
      } catch (e) {}
    }

    if (hasGenuineNewAlert) {
      this.playChime();
      return true;
    }

    return false;
  }
}

export const alertSoundService = new AlertSoundService();
