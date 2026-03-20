import React from 'react';

// Converts "愛(あい)より尊(とうと)い" → <ruby> elements
export default function RubyText({ text }) {
  if (!text) return null;

  const parts = [];
  const regex = /([^\s(（]+)\(([^)）]+)\)/g;
  let last = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    parts.push(
      <ruby key={match.index}>
        {match[1]}
        <rt>{match[2]}</rt>
      </ruby>
    );
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    parts.push(text.slice(last));
  }

  return <>{parts}</>;
}
