/**
 * Web Speech API helper for Korean text-to-speech for 1st grade students
 */

export function speakText(text: string, onEnd?: () => void): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any ongoing speech

    const cleanText = text.replace(/[🟥🟦🟡🟢🔺🍎🍌⭐🐻]/g, ''); // strip complex emojis for cleaner speech
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.88; // Slightly slower, clear pace for 1st graders
    utterance.pitch = 1.15; // Friendly, slightly higher friendly teacher tone

    // Try finding a Korean voice
    const voices = window.speechSynthesis.getVoices();
    const koVoice = voices.find((v) => v.lang.includes('ko') || v.lang.includes('KR'));
    if (koVoice) {
      utterance.voice = koVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = () => onEnd();
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (e) {
    console.warn('Speech synthesis failed:', e);
    return false;
  }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
