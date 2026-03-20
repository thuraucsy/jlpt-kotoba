import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Quiz.css';

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateQuestion(words, allWords) {
  if (words.length === 0) return null;

  const correctWord = words[Math.floor(Math.random() * words.length)];
  const distractors = allWords
    .filter((w) => w.no !== correctWord.no && w.meaning_mm && w.meaning_mm !== correctWord.meaning_mm)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  if (distractors.length < 3) return null;

  const options = shuffleArray([correctWord, ...distractors]);

  return {
    word: correctWord,
    options,
    correctNo: correctWord.no,
  };
}

const QUIZ_LENGTH = 10;

export default function Quiz({ filteredWords, allWords }) {
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const timerRef = useRef(null);

  const startQuiz = useCallback(() => {
    const pool = filteredWords.length >= 4 ? filteredWords : allWords;
    const qs = [];
    for (let i = 0; i < QUIZ_LENGTH; i++) {
      const q = generateQuestion(pool, allWords.length > 0 ? allWords : pool);
      if (q) qs.push(q);
    }
    setQuestions(qs);
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setScore(0);
    setFinished(false);
    setAnswers([]);
    setStreak(0);
    setBestStreak(0);
  }, [filteredWords, allWords]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    startQuiz();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [filteredWords]);

  const handleAnswer = useCallback((option) => {
    if (selectedAnswer !== null) return;

    const current = questions[currentIdx];
    const isCorrect = option.no === current.correctNo;

    setSelectedAnswer(option.no);
    setAnswers((prev) => [...prev, { isCorrect, word: current.word, chosen: option }]);

    if (isCorrect) {
      setScore((s) => s + 1);
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
    } else {
      setStreak(0);
    }

    timerRef.current = setTimeout(() => {
      if (currentIdx + 1 >= questions.length) {
        setFinished(true);
      } else {
        setCurrentIdx((i) => i + 1);
        setSelectedAnswer(null);
      }
    }, 1200);
  }, [selectedAnswer, questions, currentIdx]);

  if (filteredWords.length < 4) {
    return (
      <div className="quiz-empty">
        <div className="quiz-empty-icon">⚠️</div>
        <h3>Not enough words</h3>
        <p>Please select a level with at least 4 words to start the quiz.</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="quiz-loading">
        <div className="loading-spinner"></div>
        <p>Generating quiz...</p>
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    let grade, gradeClass;
    if (pct >= 90) { grade = '優秀！'; gradeClass = 'grade-s'; }
    else if (pct >= 70) { grade = 'よくできました！'; gradeClass = 'grade-a'; }
    else if (pct >= 50) { grade = 'がんばりました！'; gradeClass = 'grade-b'; }
    else { grade = 'もう一度！'; gradeClass = 'grade-c'; }

    return (
      <div className="quiz-result">
        <div className={`result-grade ${gradeClass}`}>{grade}</div>
        <div className="result-score-circle">
          <span className="result-score-num">{score}</span>
          <span className="result-score-den">/{questions.length}</span>
        </div>
        <div className="result-pct">{pct}%</div>

        <div className="result-stats">
          <div className="result-stat">
            <span className="stat-val correct">{score}</span>
            <span className="stat-lbl">Correct</span>
          </div>
          <div className="result-stat">
            <span className="stat-val wrong">{questions.length - score}</span>
            <span className="stat-lbl">Wrong</span>
          </div>
          <div className="result-stat">
            <span className="stat-val streak">{bestStreak}</span>
            <span className="stat-lbl">Best streak</span>
          </div>
        </div>

        <div className="result-review">
          <h4>Review</h4>
          {answers.map((a, i) => (
            <div key={i} className={`review-item ${a.isCorrect ? 'correct' : 'wrong'}`}>
              <span className="review-icon">{a.isCorrect ? '✓' : '✗'}</span>
              <span className="review-kana">{a.word.kana}</span>
              {a.word.kanji && <span className="review-kanji">({a.word.kanji})</span>}
              <span className="review-meaning">{a.word.meaning_mm}</span>
              {!a.isCorrect && (
                <span className="review-chosen">→ {a.chosen.meaning_mm}</span>
              )}
            </div>
          ))}
        </div>

        <button className="quiz-restart-btn" onClick={startQuiz}>
          もう一度 (Play Again)
        </button>
      </div>
    );
  }

  const current = questions[currentIdx];
  if (!current) return null;

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <div className="quiz-progress-text">
          Question {currentIdx + 1} / {questions.length}
        </div>
        <div className="quiz-score-display">
          <span className="score-label">Score: </span>
          <span className="score-value">{score}</span>
          {streak > 1 && (
            <span className="streak-badge">🔥 {streak}</span>
          )}
        </div>
      </div>

      <div className="quiz-progress-bar">
        <div
          className="quiz-progress-fill"
          style={{ width: `${((currentIdx) / questions.length) * 100}%` }}
        />
      </div>

      <div className="quiz-card">
        <div className="quiz-question-label">次の言葉の意味は？</div>
        <div className="quiz-kana">{current.word.kana}</div>
        {current.word.kanji && current.word.kanji !== current.word.kana && (
          <div className="quiz-kanji">{current.word.kanji}</div>
        )}
        <div className="quiz-romaji">{current.word.romaji}</div>
      </div>

      <div className="quiz-options">
        {current.options.map((option, i) => {
          let optClass = 'quiz-option';
          if (selectedAnswer !== null) {
            if (option.no === current.correctNo) optClass += ' correct';
            else if (option.no === selectedAnswer) optClass += ' wrong';
            else optClass += ' dim';
          }
          return (
            <button
              key={option.no}
              className={optClass}
              onClick={() => handleAnswer(option)}
              disabled={selectedAnswer !== null}
            >
              <span className="option-letter">{String.fromCharCode(65 + i)}</span>
              <span className="option-text">{option.meaning_mm}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
