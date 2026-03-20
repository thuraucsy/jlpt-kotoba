import { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';

const LEVELS = ['All', 'Fav', '1', '2', '3', '4', '5', '外', '留'];

const LEVEL_REMAP = { '': '3', '3': '4', '4': '5' };

function parseExampleSentences(jpRaw, enRaw) {
  if (!jpRaw && !enRaw) return [];
  const jpSentences = jpRaw ? jpRaw.split('\t').filter(Boolean) : [];
  const enSentences = enRaw ? enRaw.split('\t').filter(Boolean) : [];
  const count = Math.max(jpSentences.length, enSentences.length);
  const pairs = [];
  for (let i = 0; i < count; i++) {
    pairs.push({
      jp: jpSentences[i] || '',
      en: enSentences[i] || '',
    });
  }
  return pairs;
}

function parseCSVRow(row) {
  return {
    no: parseInt(row.no, 10) || 0,
    romaji: (row.romaji || '').trim(),
    kana: (row.kana || '').trim(),
    kanji: (row.kanji || '').trim(),
    meaning_mm: (row.meaning_mm || '').trim(),
    meaning_en: (row.meaning_en || '').trim(),
    is_tran: (row.is_tran || '').trim(),
    level: (() => { const l = (row.level || '').trim(); return LEVEL_REMAP[l] ?? l; })(),
    part_of_speech: (row.part_of_speech || '').trim(),
    examples: parseExampleSentences(row.example_sentence_jp, row.example_sentence_en),
  };
}

export function useVocabulary() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [favorites, setFavorites] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('kotoba-favs') || '[]')); }
    catch { return new Set(); }
  });

  function toggleFavorite(no) {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(no) ? next.delete(no) : next.add(no);
      localStorage.setItem('kotoba-favs', JSON.stringify([...next]));
      return next;
    });
  }

  useEffect(() => {
    const csvUrl = import.meta.env.BASE_URL + 'kotoba.csv';

    fetch(csvUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch CSV: ${res.status} ${res.statusText}`);
        return res.text();
      })
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsed = results.data.map(parseCSVRow).filter((w) => w.kana || w.kanji);
            setWords(parsed);
            setLoading(false);
          },
          error: (err) => {
            setError('Failed to parse CSV: ' + err.message);
            setLoading(false);
          },
        });
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredWords = useMemo(() => {
    let result = words;

    if (selectedLevel === 'Fav') {
      result = result.filter((w) => favorites.has(w.no));
    } else if (selectedLevel !== 'All') {
      result = result.filter((w) => w.level === selectedLevel);
    }

    return result;
  }, [words, selectedLevel, favorites]);

  const levelCounts = useMemo(() => {
    const counts = {};
    words.forEach((w) => {
      counts[w.level] = (counts[w.level] || 0) + 1;
    });
    return counts;
  }, [words]);

  function getRandomWords(pool, count) {
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  return {
    words,
    filteredWords,
    loading,
    error,
    selectedLevel,
    setSelectedLevel,
    levelCounts,
    levels: LEVELS,
    getRandomWords,
    favorites,
    toggleFavorite,
  };
}
