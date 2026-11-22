const encoder = new TextEncoder();
const COOKIE = 'saloniq_trial';
const DAYS = 3;

function base64Url(bytes) {
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sign(payload, secret) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const body = base64Url(encoder.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  return body + '.' + base64Url(new Uint8Array(sig));
}

async function verify(token, secret) {
  try {
    const [body, sig] = String(token).split('.');
    if (!body || !sig) return null;
    const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const normalized = sig.replace(/-/g, '+').replace(/_/g, '/');
    const padding = normalized.length % 4 ? '='.repeat(4 - normalized.length % 4) : '';
    const signature = Uint8Array.from(atob(normalized + padding), (c) => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('HMAC', key, signature, encoder.encode(body));
    if (!valid) return null;
    const padded = body.replace(/-/g, '+').replace(/_/g, '/');
    const bodyPadding = padded.length % 4 ? '='.repeat(4 - padded.length % 4) : '';
    const payload = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(padded + bodyPadding), (c) => c.charCodeAt(0))));
    return payload && payload.exp > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

function readCookie(header) {
  if (!header) return null;
  for (const part of header.split(';')) {
    const trimmed = part.trim();
    if (trimmed.startsWith(COOKIE + '=')) return decodeURIComponent(trimmed.slice(COOKIE.length + 1));
  }
  return null;
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.pathname.startsWith('/api/')) return context.next();

  const secret = context.env.DEMO_TRIAL_SECRET;
  if (!secret) return context.next();

  const existing = readCookie(context.request.headers.get('cookie'));
  const payload = await verify(existing, secret);
  const response = await context.next();

  if (!payload) {
    const token = await sign({ exp: Date.now() + DAYS * 24 * 60 * 60 * 1000 }, secret);
    const secure = url.protocol === 'https:' ? '; Secure' : '';
    response.headers.set('Set-Cookie', COOKIE + '=' + encodeURIComponent(token) + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=' + (DAYS * 24 * 60 * 60) + secure);
  }
  return response;
}
