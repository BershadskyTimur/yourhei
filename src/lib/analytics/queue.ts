// Usage events are collected for a few seconds and sent together: one request to the server instead of one per event.
// (Every request is a server call on the hosting plan.) The rest is sent when the visitor leaves or hides the tab.
const FLUSH_MS = 4000;
const MAX_BATCH = 10;

const queue: Record<string, unknown>[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let bound = false;

function flush(leaving: boolean) {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  while (queue.length > 0) {
    const events = queue.splice(0, MAX_BATCH);
    const body = JSON.stringify({ events });
    if (leaving && typeof navigator.sendBeacon === 'function' && navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }))) continue;
    fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
  }
}

export function queueEvent(event: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  if (!bound) {
    bound = true;
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush(true);
    });
    window.addEventListener('pagehide', () => flush(true));
  }
  queue.push(event);
  if (queue.length >= MAX_BATCH) flush(false);
  else if (!timer) timer = setTimeout(() => flush(false), FLUSH_MS);
}
