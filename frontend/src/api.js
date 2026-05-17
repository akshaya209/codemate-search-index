// src/api.js
const BASE = process.env.REACT_APP_API_BASE_URL || ''; // '' uses proxy from package.json

async function request(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, opts);
  const text = await res.text();
  let body;

  try {
    body = text ? JSON.parse(text) : {};
  } catch (e) {
    body = text;
  }

  if (!res.ok) {
    const msg = (body && body.message) || res.statusText || 'Request failed';
    const err = new Error(msg);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

export async function uploadFile(file) {
  const fd = new FormData();
  fd.append('file', file);
  return request('/api/upload', { method: 'POST', body: fd });
}

export async function extract(id) {
  return request(`/api/extract/${encodeURIComponent(id)}`, { method: 'POST' });
}

export async function normalize(id) {
  return request(`/api/normalize/${encodeURIComponent(id)}`, { method: 'POST' });
}

export async function tokenize(id) {
  return request(`/api/tokenize/${encodeURIComponent(id)}`, { method: 'POST' });
}

export async function buildIndex() {
  return request('/api/index/build', { method: 'POST' });
}

export async function search(q, opts = {}) {
  const params = new URLSearchParams();

  if (q !== undefined && q !== null) params.append('q', q);
  if (opts.page) params.append('page', opts.page);
  if (opts.limit) params.append('limit', opts.limit);
  if (opts.type) params.append('type', opts.type);
  if (opts.startDate) params.append('startDate', opts.startDate);
  if (opts.endDate) params.append('endDate', opts.endDate);

  const path = `/api/search?${params.toString()}`;
  return request(path, { method: 'GET' });
}

export async function getFiles() {
  return request('/api/files', { method: 'GET' });
}

export async function deleteFile(id) {
  return request(`/api/files/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
