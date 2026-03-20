import React, { useState, useCallback, useEffect } from 'react';
import './Flashcard.css';
import RubyText from './RubyText.jsx';

function LevelBadge({ level }) {
  return (
    <span className={`level-badge level-${level}`}>
      {level === '外' ? '外' : level === '留' ? '留' : `N${level}`}
    </span>
  );
}

function CardFront({ word }) {
  return (
    <div className="card-face card-front">
      <div className="card-hint">タップしてめくる</div>
      <div className="card-kana">{word.kana}</div>
      {word.kanji && word.kanji !== word.kana && (
        <div className="card-kanji">{word.kanji}</div>
      )}
      {word.part_of_speech && (
        <div className="card-pos">{word.part_of_speech}</div>
      )}
      <div className="card-level-row">
        <LevelBadge level={word.level} />
        <span className="card-no">#{word.no}</span>
      </div>
    </div>
  );
}

function CardBack({ word }) {
  const [showAll, setShowAll] = useState(false);
  const examples = word.examples || [];
  const visible = showAll ? examples : examples.slice(0, 1);

  return (
    <div className="card-face card-back">
      <div className="card-hint">タップしてもどる</div>
      <div className="card-romaji">{word.romaji}</div>
      <div className="card-meaning-mm">{word.meaning_mm}</div>
      {word.meaning_en && (
        <div className="card-meaning-en">{word.meaning_en}</div>
      )}
      {visible.map((ex, i) => (
        <div key={i} className="card-example">
          <div className="example-jp"><RubyText text={ex.jp} /></div>
          {ex.en && <div className="example-en">{ex.en}</div>}
        </div>
      ))}
      {examples.length > 1 && (
        <button
          className="examples-toggle"
          onClick={(e) => { e.stopPropagation(); setShowAll((s) => !s); }}
        >
          {showAll ? `▲ Hide` : `▼ +${examples.length - 1} more examples`}
        </button>
      )}
    </div>
  );
}

export default function Flashcard({ filteredWords, favorites, toggleFavorite }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState(null);
  const [animating, setAnimating] = useState(false);

  const total = filteredWords.length;
  const word = filteredWords[index] || null;

  useEffect(() => {
    setIndex(0);
    setFlipped(false);
  }, [filteredWords]);

  const navigate = useCallback((dir) => {
    if (animating || total === 0) return;
    setDirection(dir);
    setAnimating(true);
    setFlipped(false);

    setTimeout(() => {
      setIndex((prev) => {
        if (dir === 'next') return (prev + 1) % total;
        return (prev - 1 + total) % total;
      });
      setDirection(null);
      setAnimating(false);
    }, 200);
  }, [animating, total]);

  const handleFlip = useCallback(() => {
    if (animating) return;
    setFlipped((f) => !f);
  }, [animating]);

  const handleShuffle = useCallback(() => {
    setIndex(Math.floor(Math.random() * total));
    setFlipped(false);
  }, [total]);

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'ArrowRight' || e.key === 'l') navigate('next');
      else if (e.key === 'ArrowLeft' || e.key === 'h') navigate('prev');
      else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleFlip();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [navigate, handleFlip]);

  if (total === 0) {
    return (
      <div className="flashcard-empty">
        <span>該当する単語がありません</span>
        <p>No words match the current filter.</p>
      </div>
    );
  }

  return (
    <div className="flashcard-container">
      <div className="flashcard-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
        <span className="progress-text">{index + 1} / {total}</span>
      </div>

      <div
        className={`flashcard-scene ${animating ? `slide-${direction}` : ''}`}
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        aria-label={flipped ? 'Click to see front' : 'Click to see back'}
        onKeyDown={(e) => e.key === 'Enter' && handleFlip()}
      >
        <div className={`flashcard-card ${flipped ? 'is-flipped' : ''}`}>
          {word && <CardFront word={word} />}
          {word && <CardBack word={word} />}
        </div>
      </div>

      <div className="flashcard-controls">
        <button
          className={`fc-btn fc-btn-fav${word && favorites && favorites.has(word.no) ? ' is-fav' : ''}`}
          onClick={(e) => { e.stopPropagation(); word && toggleFavorite && toggleFavorite(word.no); }}
          aria-label="Toggle favorite"
          title="Favorite"
        >
          {word && favorites && favorites.has(word.no) ? '★' : '☆'}
        </button>
        <button
          className="fc-btn fc-btn-nav"
          onClick={(e) => { e.stopPropagation(); navigate('prev'); }}
          aria-label="Previous card"
          disabled={animating}
        >
          ←
        </button>
        <button
          className="fc-btn fc-btn-flip"
          onClick={(e) => { e.stopPropagation(); handleFlip(); }}
          aria-label="Flip card"
        >
          {flipped ? '表へ' : '裏へ'}
        </button>
        <button
          className="fc-btn fc-btn-shuffle"
          onClick={(e) => { e.stopPropagation(); handleShuffle(); }}
          aria-label="Random card"
          title="Random"
        >
          🔀
        </button>
        <button
          className="fc-btn fc-btn-nav"
          onClick={(e) => { e.stopPropagation(); navigate('next'); }}
          aria-label="Next card"
          disabled={animating}
        >
          →
        </button>
      </div>

      <div className="flashcard-keyboard-hint">
        <span>← → arrow keys to navigate</span>
        <span>Space to flip</span>
      </div>
    </div>
  );
}
