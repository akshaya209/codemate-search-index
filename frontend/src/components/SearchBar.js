// src/components/SearchBar.js
import React, { useState } from 'react';

export default function SearchBar({ onSearch, loading }) {
  const [q, setQ] = useState('');
  const [type, setType] = useState('');      
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  function submit(e) {
    if (e) e.preventDefault();
    if (!q.trim()) return;

    const filters = {
      type: type || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };

    onSearch(q.trim(), filters);
  }

  return (
    <form
      onSubmit={submit}
      style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
    >
      {/* Search Bar */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="🔍 Search indexed documents..."
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 6,
            border: '1px solid #ccc',
            fontSize: 16,
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 14px',
            borderRadius: 6,
            border: 'none',
            background: '#0b76ff',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ padding: 8, borderRadius: 6 }}
        >
          <option value="">All types</option>
          <option value="pdf">PDF</option>
          <option value="txt">Text</option>
          <option value="csv">CSV</option>
          <option value="json">JSON</option>
          <option value="xml">XML</option>
          <option value="docx">DOCX</option>
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ padding: 8, borderRadius: 6 }}
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{ padding: 8, borderRadius: 6 }}
        />
      </div>
    </form>
  );
}
