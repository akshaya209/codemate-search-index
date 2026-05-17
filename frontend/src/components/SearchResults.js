// src/components/SearchResults.js
import React from 'react';

export default function SearchResults({
  results = [],
  page = 1,
  setPage = () => {},
  totalPages = 1
}) {
  return (
    <div style={{ marginTop: 24 }}>
      <h2>📑 Ranked Results</h2>

      {results.length === 0 ? (
        <p>No results.</p>
      ) : (
        <>
          <div>
            {results.map((r, idx) => (
              <div
                key={r._id || r.id || idx}
                style={{
                  background: '#f9f9f9',
                  border: '1px solid #ddd',
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 10
                }}
              >
                {/* File Title */}
                <div style={{ fontWeight: 700 }}>
                  {r.filename || r.fileName || r.title || 'Untitled'}
                </div>

                {/* TF-IDF Score */}
                <div style={{ fontSize: 13, color: '#555' }}>
                  Score: {typeof r.score === 'number' ? r.score.toFixed(3) : r.score || '—'}
                </div>

                {/* Snippet with Highlighting */}
                {r.snippet && (
                  <p
                    style={{ marginTop: 8 }}
                    dangerouslySetInnerHTML={{ __html: r.snippet }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              justifyContent: 'center',
              marginTop: 12
            }}
          >
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
            >
              ◀ Prev
            </button>

            <span>
              Page {page} / {totalPages}
            </span>

            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
            >
              Next ▶
            </button>
          </div>
        </>
      )}
    </div>
  );
}
