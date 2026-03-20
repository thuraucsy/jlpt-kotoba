import React, { useState } from 'react';
import './App.css';
import Header from './components/Header.jsx';
import Flashcard from './components/Flashcard.jsx';
import Quiz from './components/Quiz.jsx';
import { useVocabulary } from './hooks/useVocabulary.js';

const MODES = [
  { id: 'flashcard', label: 'Flashcard', icon: '🃏' },
  { id: 'quiz', label: 'Quiz', icon: '🧠' },
];

export default function App() {
  const [mode, setMode] = useState('flashcard');
  const {
    words,
    filteredWords,
    loading,
    error,
    selectedLevel,
    setSelectedLevel,
    searchQuery,
    setSearchQuery,
    levelCounts,
    levels,
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

        {/* Search */}
        <input
          type="search"
          className="search-input"
          placeholder="Search words… (kana, kanji, romaji, meaning)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '0.6rem 1rem',
            marginBottom: '1rem',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />

        {/* Level Filter */}
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
              {lvl === 'All' ? 'All' : lvl === '外' ? '外' : lvl === '留' ? '留' : `N${lvl}`}
            </button>
          ))}
        </div>

        {/* Content */}
        {mode === 'flashcard' && <Flashcard filteredWords={filteredWords} />}
        {mode === 'quiz' && <Quiz filteredWords={filteredWords} allWords={words} />}
      </main>
    </div>
  );
}
