import React, { useState, useMemo, useCallback } from 'react';
import './WordList.css';
import RubyText from './RubyText.jsx';
import AudioPlayer from './AudioPlayer.jsx';

const PAGE_SIZE = 50;

function LevelBadge({ level }) {
  return (
    <span className={`wl-level-badge level-${level}`}>
      {level === '外' ? '外' : level === '留' ? '留' : `N${level}`}
    </span>
  );
}

function ExpandableExamples({ examples }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? examples : examples.slice(0, 2);
  return (
    <div className="detail-examples">
      <div className="detail-label examples-label">例文:</div>
      {visible.map((ex, i) => (
        <div key={i} className="example-pair">
          {ex.jp && <div className="ex-jp"><RubyText text={ex.jp} /></div>}
          {ex.en && <div className="ex-en">{ex.en}</div>}
        </div>
      ))}
      {examples.length > 2 && (
        <button
          className="examples-toggle"
          onClick={(e) => { e.stopPropagation(); setShowAll((s) => !s); }}
        >
          {showAll ? '▲ Hide' : `▼ +${examples.length - 2} more examples`}
        </button>
      )}
    </div>
  );
}

function WordRow({ word, expanded, onToggle }) {
  return (
    <div
      className={`word-row ${expanded ? 'expanded' : ''}`}
      onClick={() => onToggle(word.no)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onToggle(word.no)}
    >
      <div className="word-row-main">
        <div className="word-row-left">
          <span className="word-kana">{word.kana}</span>
          {word.kanji && word.kanji !== word.kana && (
            <span className="word-kanji">{word.kanji}</span>
          )}
          <span className="word-romaji">{word.romaji}</span>
        </div>
        <div className="word-row-right">
          <span className="word-meaning">{word.meaning_mm}</span>
          <LevelBadge level={word.level} />
          <span className="word-expand-icon">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className="word-row-detail" onClick={(e) => e.stopPropagation()}>
          <AudioPlayer wordId={word.no} />
          {word.meaning_en && (
            <div className="detail-row">
              <span className="detail-label">English:</span>
              <span className="detail-value">{word.meaning_en}</span>
            </div>
          )}
          {word.part_of_speech && (
            <div className="detail-row">
              <span className="detail-label">品詞:</span>
              <span className="detail-value pos-tag">{word.part_of_speech}</span>
            </div>
          )}
          {word.examples && word.examples.length > 0 && (
            <ExpandableExamples examples={word.examples} />
          )}
        </div>
      )}
    </div>
  );
}

export default function WordList({ filteredWords, searchQuery, setSearchQuery }) {
  const [expandedNo, setExpandedNo] = useState(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('default');

  const handleToggle = useCallback((no) => {
    setExpandedNo((prev) => (prev === no ? null : no));
  }, []);

  const handleSearch = useCallback((e) => {
    setSearchQuery(e.target.value);
    setPage(1);
    setExpandedNo(null);
  }, [setSearchQuery]);

  const sorted = useMemo(() => {
    if (sortBy === 'kana') {
      return [...filteredWords].sort((a, b) => a.kana.localeCompare(b.kana, 'ja'));
    }
    if (sortBy === 'level') {
      const levelOrder = { '1': 1, '2': 2, '3': 3, '4': 4, '外': 5, '留': 6 };
      return [...filteredWords].sort((a, b) => (levelOrder[a.level] || 9) - (levelOrder[b.level] || 9));
    }
    return filteredWords; // default = CSV order
  }, [filteredWords, sortBy]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageWords = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handlePageChange(p) {
    setPage(p);
    setExpandedNo(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="word-list-container">
      <div className="word-list-toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="search"
            className="search-input"
            placeholder="Search kana, kanji, romaji, meaning..."
            value={searchQuery}
            onChange={handleSearch}
            aria-label="Search vocabulary"
          />
          {searchQuery && (
            <button
              className="search-clear"
              onClick={() => { setSearchQuery(''); setPage(1); }}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="sort-control">
          <label className="sort-label" htmlFor="sort-select">並び替え</label>
          <select
            id="sort-select"
            className="sort-select"
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
          >
            <option value="default">Default</option>
            <option value="kana">Kana (A-Z)</option>
            <option value="level">Level</option>
          </select>
        </div>
      </div>

      <div className="word-list-meta">
        <span className="wl-count">
          {filteredWords.length.toLocaleString()} words
          {searchQuery && <span className="wl-search-tag"> for "{searchQuery}"</span>}
        </span>
        {totalPages > 1 && (
          <span className="wl-page-info">Page {page}/{totalPages}</span>
        )}
      </div>

      <div className="word-list">
        {pageWords.length === 0 ? (
          <div className="wl-empty">
            <span className="wl-empty-icon">🔍</span>
            <p>No words found. Try a different search.</p>
          </div>
        ) : (
          pageWords.map((word) => (
            <WordRow
              key={word.no}
              word={word}
              expanded={expandedNo === word.no}
              onToggle={handleToggle}
            />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => handlePageChange(1)}
            disabled={page === 1}
          >
            «
          </button>
          <button
            className="page-btn"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            ‹
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let p;
            if (totalPages <= 5) p = i + 1;
            else if (page <= 3) p = i + 1;
            else if (page >= totalPages - 2) p = totalPages - 4 + i;
            else p = page - 2 + i;
            return (
              <button
                key={p}
                className={`page-btn ${p === page ? 'active' : ''}`}
                onClick={() => handlePageChange(p)}
              >
                {p}
              </button>
            );
          })}

          <button
            className="page-btn"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            ›
          </button>
          <button
            className="page-btn"
            onClick={() => handlePageChange(totalPages)}
            disabled={page === totalPages}
          >
            »
          </button>
        </div>
      )}
    </div>
  );
}
