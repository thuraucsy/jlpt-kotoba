import React, { useState, useRef, useCallback } from 'react';
import './AudioPlayer.css';

const AUDIO_SOURCES = {
  jp: (id) => `https://thuraucsy.github.io/jlpt_kotoba_jp/tts/jp/${id}.mp3`,
  mm: (id) => `https://thuraucsy.github.io/jlpt_kotoba/tts/mm/${id}.mp3`,
};

const LABELS = { jp: '🇯🇵', mm: '🇲🇲' };

// Single shared Audio instance across all players
let currentAudio = null;

export default function AudioPlayer({ wordId }) {
  const [playing, setPlaying] = useState(null); // 'jp' | 'mm' | null
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  const play = useCallback((lang) => {
    // Stop any currently playing audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = '';
    }

    setError(null);
    setPlaying(null);
    setLoading(lang);

    const audio = new Audio(AUDIO_SOURCES[lang](wordId));
    audioRef.current = audio;
    currentAudio = audio;

    audio.addEventListener('canplaythrough', () => {
      setLoading(null);
      setPlaying(lang);
      audio.play().catch(() => {
        setLoading(null);
        setError(lang);
      });
    }, { once: true });

    audio.addEventListener('ended', () => {
      setPlaying(null);
    }, { once: true });

    audio.addEventListener('error', () => {
      setLoading(null);
      setPlaying(null);
      setError(lang);
    }, { once: true });

    audio.load();
  }, [wordId]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setPlaying(null);
    setLoading(null);
  }, []);

  return (
    <div className="audio-player" onClick={(e) => e.stopPropagation()}>
      {Object.keys(AUDIO_SOURCES).map((lang) => {
        const isPlaying = playing === lang;
        const isLoading = loading === lang;
        const isError = error === lang;

        return (
          <button
            key={lang}
            className={`audio-btn${isPlaying ? ' is-playing' : ''}${isError ? ' is-error' : ''}`}
            onClick={() => isPlaying ? stop() : play(lang)}
            title={isError ? 'Audio not available' : `Play ${lang.toUpperCase()}`}
            disabled={isLoading}
          >
            {isLoading
              ? <span className="audio-spinner" />
              : isPlaying
                ? '⏹'
                : LABELS[lang]}
          </button>
        );
      })}
    </div>
  );
}
