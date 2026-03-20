import React from 'react';
import './Header.css';

export default function Header({ wordCount, totalCount }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <span className="header-logo" aria-hidden="true">言葉</span>
          <div className="header-title-group">
            <h1 className="header-title">JLPT Kotoba</h1>
            <p className="header-subtitle">Japanese Vocabulary</p>
          </div>
        </div>
        <div className="header-meta">
          {wordCount !== totalCount ? (
            <span className="header-count">
              <span className="count-filtered">{wordCount.toLocaleString()}</span>
              <span className="count-sep"> / </span>
              <span className="count-total">{totalCount.toLocaleString()}</span>
              <span className="count-label"> words</span>
            </span>
          ) : (
            <span className="header-count">
              <span className="count-total">{totalCount.toLocaleString()}</span>
              <span className="count-label"> words</span>
            </span>
          )}
        </div>
      </div>
      <div className="header-stripe" aria-hidden="true"></div>
    </header>
  );
}
