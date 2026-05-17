// src/components/UploadFile.js
import React, { useRef, useState } from 'react';
import { uploadFile, extract, normalize, tokenize, buildIndex } from '../api';

export default function UploadFile({ onUploaded, setUploadStatus }) {
  const inputRef = useRef();
  const [localStatus, setLocalStatus] = useState('');

  async function handleUploadClick() {
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setLocalStatus('⚠ Please select a file first.');
      return;
    }

    try {
      setLocalStatus('⏳ Uploading...');
      setUploadStatus?.('⏳ Uploading...');

      const data = await uploadFile(file);
      const fileDoc = data?.file;

      const ingestionId =
        fileDoc?.ingestionId ||
        fileDoc?._id ||
        fileDoc?.filename ||
        fileDoc?.id;

      setLocalStatus('📄 Uploaded. Running pipeline...');
      setUploadStatus?.('📄 Uploaded. Running pipeline...');

      if (ingestionId) {
        await extract(ingestionId);
        await normalize(ingestionId);
        await tokenize(ingestionId);
        await buildIndex();
      }

      setLocalStatus('✅ File processed and indexed successfully!');
      setUploadStatus?.('✅ File processed and indexed successfully!');

      if (onUploaded) onUploaded(fileDoc);
    } catch (e) {
      console.error(e);
      const msg = e?.message || 'Upload failed';
      setLocalStatus('❌ ' + msg);
      setUploadStatus?.('❌ ' + msg);
    } finally {
      if (inputRef.current) inputRef.current.value = null;
      setTimeout(() => setLocalStatus(''), 5000);
    }
  }

  return (
    <div>
      <h3>📤 Upload Document</h3>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,.csv,.xml,.json,.docx"
          style={{ padding: 6 }}
        />

        <button
          onClick={handleUploadClick}
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: 'none',
            background: '#0b76ff',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Upload & Index
        </button>
      </div>

      <div style={{ marginTop: 8, color: '#333' }}>
        {localStatus}
      </div>
    </div>
  );
}
