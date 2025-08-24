const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function buildUrl(path, params){
  const url = new URL(API_URL + path);
  if (params) Object.entries(params).forEach(([k,v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });
  return url;
}

export async function apiGetList(path, params) {
  const res = await fetch(buildUrl(path, params));
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  const total = Number(res.headers.get('X-Total-Count') || '0');
  const data = await res.json();
  return { data, total };
}

export async function apiCreate(path, body) {
  const res = await fetch(API_URL + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return await res.json();
}

export async function apiUpdate(path, body) {
  const res = await fetch(API_URL + path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return await res.json();
}

export async function apiDelete(path) {
  const res = await fetch(API_URL + path, { method: 'DELETE' });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return true;
}