import React from 'react';
import './Header.css';
import { useInstallPrompt } from '../hooks/useInstallPrompt.js';
import { useFontSize } from '../hooks/useFontSize.js';

export default function Header({ wordCount, totalCount }) {
  const { canInstall, installed, triggerInstall } = useInstallPrompt();
  const { size, increase, decrease, reset, isMin, isMax } = useFontSize();

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
          <div className="font-size-ctrl">
            <button className="fs-btn" onClick={decrease} disabled={isMin} aria-label="Decrease font size">A−</button>
            <button className="fs-btn fs-reset" onClick={reset} aria-label="Reset font size">{size}</button>
            <button className="fs-btn" onClick={increase} disabled={isMax} aria-label="Increase font size">A+</button>
          </div>
          {installed && (
            <span className="install-badge" title="Installed">✓ App</span>
          )}
          {canInstall && (
            <button className="install-btn" onClick={triggerInstall} title="Install app">
              ⬇ Install
            </button>
          )}
        </div>
      </div>
      <div className="header-stripe" aria-hidden="true"></div>
    </header>
  );
}
