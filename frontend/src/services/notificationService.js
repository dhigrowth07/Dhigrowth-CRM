/**
 * Notification Service: Audio Chime & Browser Push Notifications
 */

// 1. Play clean 2-tone chime using Web Audio API (No external audio file dependency)
export const playNotificationSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Tone 1: High crisp bell note (E5 = 659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.18);

    // Tone 2: Harmonic resolving note (A5 = 880.00 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.00, now + 0.12);
    gain2.gain.setValueAtTime(0.25, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.40);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.40);
  } catch (e) {
    // Autoplay or browser policy fallback
  }
};

// 2. Request permission for native system notifications
export const requestNotificationPermission = async () => {
  try {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        return await Notification.requestPermission();
      }
      return Notification.permission;
    }
  } catch {}
  return 'denied';
};

// 3. Show native desktop notification
export const showDesktopNotification = (senderName, messageText) => {
  try {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      const notif = new Notification(`💬 ${senderName || 'New Message'}`, {
        body: messageText ? messageText.slice(0, 100) : 'New WhatsApp message received',
        icon: '/logo.webp',
        badge: '/logo.webp',
        tag: 'crm-new-message',
        renotify: true,
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } else if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  } catch {}
};
