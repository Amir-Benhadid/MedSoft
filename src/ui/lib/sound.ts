/**
 * Sound Utilities
 * 
 * Generates client-side beep sounds using Web Audio API
 */

export function playBeep(frequency = 440, duration = 0.2, type: OscillatorType = 'sine') {
    try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = type;
        oscillator.frequency.value = frequency;
        
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // volume
        // Smooth exponential decay
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
        console.warn('Failed to play beep sound:', e);
    }
}
