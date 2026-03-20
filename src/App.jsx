import React, { useState } from 'react';
import './App.css';
import Header from './components/Header.jsx';
import Flashcard from './components/Flashcard.jsx';
import Quiz from './components/Quiz.jsx';
import WordList from './components/WordList.jsx';
import { useVocabulary } from './hooks/useVocabulary.js';

const MODES = [
  { id: 'flashcard', label: 'Flashcard', icon: '🃏' },
  { id: 'quiz', label: 'Quiz', icon: '🧠' },
  { id: 'search', label: 'Search', icon: '🔍' },
];

export default function App() {
  const [mode, setMode] = useState('flashcard');
  const [searchQuery, setSearchQuery] = useState('');
  const {
    words,
    filteredWords,
    loading,
    error,
    selectedLevel,
    setSelectedLevel,
    levelCounts,
    levels,
    favorites,
    toggleFavorite,
  } = useVocabulary();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-kanji">言葉</div>
        <div className="loading-spinner" />
        <p className="loading-text">Loading vocabulary…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Header wordCount={filteredWords.length} totalCount={words.length} />

      <main className="app-main">
        {/* Mode Tabs */}
        <div className="mode-tabs">
          {MODES.map((m) => (
            <button
              key={m.id}
              className={`mode-tab${mode === m.id ? ' active' : ''}`}
              onClick={() => setMode(m.id)}
            >
              <span className="tab-icon">{m.icon}</span>
              <span className="tab-label">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Level Filter — hidden on search tab since WordList has its own search */}
        {mode !== 'search' && (
          <div className="level-filter">
            <span className="level-label">Level:</span>
            {levels.map((lvl) => (
              <button
                key={lvl}
                data-level={lvl}
                className={`level-btn${selectedLevel === lvl ? ' active' : ''}`}
                onClick={() => setSelectedLevel(lvl)}
                title={lvl === 'All' ? `All (${words.length})` : `(${levelCounts[lvl] || 0})`}
              >
                {lvl === 'All' ? 'All' : lvl === 'Fav' ? '★ Fav' : (lvl === '外' || lvl === '留') ? lvl : `N${lvl}`}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {mode === 'flashcard' && (
          <Flashcard
            filteredWords={filteredWords}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
          />
        )}
        {mode === 'quiz' && (
          <Quiz filteredWords={filteredWords} allWords={words} />
        )}
        {mode === 'search' && (
          <WordList allWords={words} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        )}
      </main>
    </div>
  );
}
