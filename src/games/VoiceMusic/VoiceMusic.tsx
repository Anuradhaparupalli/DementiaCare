import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Mic,
  Music,
  Pause,
  Play,
  Square,
  Volume2,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";

import "./VoiceMusic.css";

type Props = {
  onBack: () => void;
};

const voiceWords = [
  "Hello",
  "Family",
  "Home",
  "Garden",
  "Smile",
];

export default function VoiceMusic({ onBack }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceIndex, setVoiceIndex] = useState(0);
  const [spokenText, setSpokenText] = useState("");
  const [voiceMessage, setVoiceMessage] = useState(
    "Press the microphone and say the word."
  );
  const [voiceSupported, setVoiceSupported] = useState(true);

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

type SpeechRecognitionInstance = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  onresult:
    | ((event: SpeechRecognitionEvent) => void)
    | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

const speechWindow = window as SpeechRecognitionWindow;

const SpeechRecognition =
  speechWindow.SpeechRecognition ||
  speechWindow.webkitSpeechRecognition;

  useEffect(() => {
    if (!SpeechRecognition) {
      setVoiceSupported(false);
    }
  }, [SpeechRecognition]);

  /* ---------------- MUSIC ---------------- */

  const startMusic = () => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }).webkitAudioContext;

      if (!AudioContextClass) return;

      const context =
        audioContextRef.current || new AudioContextClass();

      audioContextRef.current = context;

      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = 261.63;

      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.08,
        context.currentTime + 0.5
      );

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start();

      oscillatorRef.current = oscillator;
      gainRef.current = gain;

      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const stopMusic = () => {
    const oscillator = oscillatorRef.current;
    const gain = gainRef.current;
    const context = audioContextRef.current;

    if (oscillator && gain && context) {
      try {
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          context.currentTime + 0.3
        );

        oscillator.stop(context.currentTime + 0.35);
      } catch {
        // Already stopped
      }
    }

    oscillatorRef.current = null;
    gainRef.current = null;

    setIsPlaying(false);
  };

  const toggleMusic = () => {
    if (isPlaying) {
      stopMusic();
    } else {
      startMusic();
    }
  };

  /* ---------------- VOICE ---------------- */

  const speakTarget = () => {
    const word = voiceWords[voiceIndex];

    const speech = new SpeechSynthesisUtterance(word);
    speech.rate = 0.75;
    speech.pitch = 1;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
  };

  const listenToPatient = () => {
    if (!SpeechRecognition) {
      setVoiceMessage(
        "Voice recognition is not supported in this browser."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setVoiceMessage("Listening... speak now.");
    setSpokenText("");

    recognition.start();

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[0][0].transcript.trim();

      setSpokenText(result);

      const target = voiceWords[voiceIndex].toLowerCase();

      if (result.toLowerCase().includes(target)) {
        setVoiceMessage("Wonderful! You said it correctly. 🌟");
      } else {
        setVoiceMessage(
          `Good try! The word was "${voiceWords[voiceIndex]}".`
        );
      }
    };

    recognition.onerror = () => {
      setVoiceMessage(
        "I couldn't hear that. Please try again gently."
      );
    };

    recognition.onend = () => {
      // Recognition finished.
    };
  };

  const nextVoiceWord = () => {
    setVoiceIndex((previous) => (previous + 1) % voiceWords.length);
    setSpokenText("");
    setVoiceMessage("Press the microphone and say the word.");
  };

  /* ---------------- CLEANUP ---------------- */

  useEffect(() => {
    return () => {
      stopMusic();
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="voice-music-page">
      <div className="voice-music-container">

        {/* BACK */}

        <button
          className="voice-back-button"
          onClick={onBack}
        >
          <ArrowLeft size={25} />
          Back
        </button>

        {/* HEADER */}

        <header className="voice-header">
          <div className="voice-header-icon">
            <Music size={42} />
          </div>

          <div>
            <h1>Voice & Music</h1>
            <p>
              Listen, speak, and enjoy a calm moment.
            </p>
          </div>
        </header>

        {/* MUSIC */}

        <section className="voice-card">
          <div className="voice-card-icon music-icon">
            <Music size={42} />
          </div>

          <h2>🎵 Music Time</h2>

          <p>
            Relax and listen to a gentle sound.
          </p>

          <button
            className={`music-main-button ${
              isPlaying ? "playing" : ""
            }`}
            onClick={toggleMusic}
          >
            {isPlaying ? (
              <>
                <Pause size={36} />
                Pause
              </>
            ) : (
              <>
                <Play size={36} />
                Play
              </>
            )}
          </button>

          {isPlaying && (
            <button
              className="music-stop-button"
              onClick={stopMusic}
            >
              <Square size={20} />
              Stop
            </button>
          )}

          <div className="sound-note">
            <Volume2 size={20} />
            Gentle browser-generated sound
          </div>
        </section>

        {/* VOICE */}

        <section className="voice-card">

          <div className="voice-card-icon mic-icon">
            <Mic size={42} />
          </div>

          <h2>🗣️ Speak & Listen</h2>

          <p className="voice-instruction">
            Say this word:
          </p>

          <div className="voice-word">
            {voiceWords[voiceIndex]}
          </div>

          <div className="voice-actions">

            <button
              className="speak-button"
              onClick={speakTarget}
            >
              <Volume2 size={28} />
              Hear Word
            </button>

            <button
              className="listen-button"
              onClick={listenToPatient}
              disabled={!voiceSupported}
            >
              <Mic size={28} />
              Speak
            </button>

          </div>

          <div className="voice-message">
            {voiceMessage}
          </div>

          {spokenText && (
            <div className="spoken-result">
              <span>You said:</span>
              <strong>{spokenText}</strong>
            </div>
          )}

          <button
            className="next-word-button"
            onClick={nextVoiceWord}
          >
            Next Word →
          </button>

        </section>

        {/* BENEFITS */}

        <section className="voice-benefits">

          <div>
            <Music size={28} />
            <span>Relax</span>
          </div>

          <div>
            <Mic size={28} />
            <span>Speak</span>
          </div>

          <div>
            <Volume2 size={28} />
            <span>Listen</span>
          </div>

          <div>
            <CheckCircle2 size={28} />
            <span>Practice</span>
          </div>

        </section>

        <button
          className="voice-reset-button"
          onClick={() => {
            stopMusic();
            setVoiceIndex(0);
            setSpokenText("");
            setVoiceMessage(
              "Press the microphone and say the word."
            );
          }}
        >
          <RotateCcw size={20} />
          Start Again
        </button>

      </div>
    </div>
  );
}