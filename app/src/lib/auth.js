const AUTH_KEY = 'tracker135.auth.v1';

function toB64(bytes) {
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin);
}
function fromB64(str) {
  const bin = atob(str);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function hashWithSalt(passphrase, saltBytes) {
  const enc = new TextEncoder().encode(passphrase);
  const combined = new Uint8Array(saltBytes.length + enc.length);
  combined.set(saltBytes, 0);
  combined.set(enc, saltBytes.length);
  const digest = await crypto.subtle.digest('SHA-256', combined);
  return toB64(new Uint8Array(digest));
}

function loadRecord() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}
function saveRecord(record) {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(record));
  } catch (e) {
    /* storage unavailable */
  }
}

export function hasPassphrase() {
  return !!loadRecord();
}

export async function setPassphrase(passphrase) {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const hashB64 = await hashWithSalt(passphrase, saltBytes);
  saveRecord({ saltB64: toB64(saltBytes), hashB64 });
}

export async function verifyPassphrase(passphrase) {
  const record = loadRecord();
  if (!record) return false;
  const saltBytes = fromB64(record.saltB64);
  const hashB64 = await hashWithSalt(passphrase, saltBytes);
  return hashB64 === record.hashB64;
}

export function clearPassphrase() {
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch (e) {
    /* storage unavailable */
  }
}
