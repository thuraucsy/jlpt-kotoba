import { useState, useEffect } from 'react';

const MIN = 12;
const MAX = 24;
const STEP = 1;
const DEFAULT = 16;
const KEY = 'kotoba-font-size';

export function useFontSize() {
  const [size, setSize] = useState(() => {
    const saved = parseInt(localStorage.getItem(KEY));
    return isNaN(saved) ? DEFAULT : Math.min(MAX, Math.max(MIN, saved));
  });

  useEffect(() => {
    document.documentElement.style.setProperty('font-size', `${size}px`);
    localStorage.setItem(KEY, size);
  }, [size]);

  const increase = () => setSize(s => Math.min(MAX, s + STEP));
  const decrease = () => setSize(s => Math.max(MIN, s - STEP));
  const reset    = () => setSize(DEFAULT);

  return { size, increase, decrease, reset, isMin: size <= MIN, isMax: size >= MAX };
}
