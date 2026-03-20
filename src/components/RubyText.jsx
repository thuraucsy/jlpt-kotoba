import React from 'react';

// Converts "愛(あい)より尊(とうと)い" → <ruby> elements
export default function RubyText({ text }) {
  if (!text) return null;

  const parts = [];
  // Match only kanji/katakana as the ruby base (not hiragana or kana prefixes)
  const regex = /([\u3400-\u9fff\u30a0-\u30ff\uff66-\uff9f\u3005]+)\(([^)）]+)\)/g;
  let last = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    parts.push(
      <ruby key={match.index}>
        {match[1]}<rt>{match[2]}</rt>
      </ruby>
    );
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    parts.push(text.slice(last));
  }

  return <>{parts}</>;
}
