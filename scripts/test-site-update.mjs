import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startSiteUpdates, hasUnfinishedInquiry } from '../lib/site-update.ts';

const current = 'a'.repeat(64), latest = 'b'.repeat(64);
const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };
function environment(t, href = 'https://example.com/skyray-website/portfolio/?project=poker-mars-web#artwork-2') {
  t.mock.timers.enable({ apis: ['Date', 'setTimeout', 'setInterval'], now: 100_000 });
  const win = new EventTarget(), doc = new EventTarget(), storage = new Map();
  const calls = [], navigations = [], restored = [];
  Object.assign(doc, { visibilityState: 'visible', readyState: 'complete', activeElement: null,
    blocked: false, forms: [], querySelector() { return this.blocked ? {} : null; }, querySelectorAll() { return this.forms; } });
  Object.assign(win, { setTimeout, clearTimeout, setInterval, clearInterval,
    navigator: { onLine: true }, scrollY: 820,
    location: { href, origin: 'https://example.com', replace: url => navigations.push(url) },
    history: { state: null, replaceState: (_state, _title, url) => { win.location.href = url; } },
    scrollTo: point => restored.push(point.top),
    sessionStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
    response: { version: latest }, ok: true, error: false,
    fetch: async (url, init) => { calls.push({ url, init }); if (win.error) throw new Error('offline'); return { ok: win.ok, json: async () => win.response }; },
  });
  const start = () => { const stop = startSiteUpdates(current, '/skyray-website/', win, doc); t.after(stop); return stop; };
  const tick = async ms => { t.mock.timers.tick(ms); await flush(); };
  return { win, doc, calls, navigations, restored, storage, start, tick };
}

test('new release navigates once, bypasses cached HTML, keeps project/hash/reading position', async t => {
  const e = environment(t); e.start(); await flush();
  assert.equal(e.navigations.length, 0);
  await e.tick(5000);
  assert.equal(e.navigations.length, 1);
  const destination = new URL(e.navigations[0]);
  assert.equal(destination.searchParams.get('project'), 'poker-mars-web');
  assert.equal(destination.hash, '#artwork-2');
  assert.equal(destination.searchParams.get('__skyray_update'), latest);
  assert.equal(e.calls[0].init.cache, 'no-store');
  assert.match(e.calls[0].url, /version.json\?t=/);
  assert.equal(JSON.parse(e.storage.get('skyray-update-position')).y, 820);
  await e.tick(120000);
  assert.equal(e.navigations.length, 1);
});

test('unchanged, malformed, unavailable and offline releases never navigate', async t => {
  const e = environment(t); e.win.response = { version: current }; e.start(); await flush(); await e.tick(5000);
  for (const value of [null, {}, { version: 42 }, { version: 'not-a-release' }]) {
    e.win.response = value; await e.tick(60000);
  }
  e.win.response = { version: latest }; e.win.ok = false; await e.tick(60000);
  e.win.ok = true; e.win.error = true; await e.tick(60000);
  assert.deepEqual(e.navigations, []);
});

test('drafts, focused fields, open viewers and recent gestures postpone automatic navigation', async t => {
  const e = environment(t);
  e.doc.forms = [{ querySelectorAll: () => [{ tagName: 'INPUT', value: 'unfinished' }] }];
  e.start(); await flush(); await e.tick(5000); assert.equal(e.navigations.length, 0);
  e.doc.forms = []; e.doc.activeElement = { matches: () => true };
  await e.tick(5000); assert.equal(e.navigations.length, 0);
  e.doc.activeElement = null; e.doc.blocked = true;
  await e.tick(5000); assert.equal(e.navigations.length, 0);
  e.doc.blocked = false; await e.tick(4000); e.win.dispatchEvent(new Event('scroll'));
  await e.tick(1000); assert.equal(e.navigations.length, 0);
  await e.tick(5000); assert.equal(e.navigations.length, 1);
});

test('hidden tabs do not check; resuming checks promptly; disposed controller stays stopped', async t => {
  const e = environment(t); e.doc.visibilityState = 'hidden'; const stop = e.start();
  await e.tick(60000); assert.equal(e.calls.length, 0);
  e.doc.visibilityState = 'visible'; e.doc.dispatchEvent(new Event('visibilitychange')); await flush();
  assert.equal(e.calls.length, 1); assert.equal(e.navigations.length, 1);
  stop(); await e.tick(60000); e.win.dispatchEvent(new Event('focus')); await flush();
  assert.equal(e.calls.length, 1);
});

test('same failed deployment target cannot create a reload loop', async t => {
  const e = environment(t, `https://example.com/skyray-website/?__skyray_update=${latest}`);
  e.start(); await flush(); await e.tick(120000);
  assert.equal(e.navigations.length, 0);
});

test('successful update restores position and removes only the update parameter', async t => {
  const e = environment(t, `https://example.com/skyray-website/portfolio/?project=poker-mars-web&__skyray_update=${current}#artwork-2`);
  e.storage.set('skyray-update-position', JSON.stringify({ version: current, path: '/skyray-website/portfolio/?project=poker-mars-web#artwork-2', y: 820, time: 99000 }));
  e.win.response = { version: current }; e.start(); await e.tick(0);
  assert.deepEqual(e.restored, [820]);
  assert.equal(e.win.location.href, 'https://example.com/skyray-website/portfolio/?project=poker-mars-web#artwork-2');
  assert.equal(e.storage.size, 0);
});

test('storage restrictions do not prevent a safe update', async t => {
  const e = environment(t); e.win.sessionStorage.setItem = () => { throw new Error('disabled'); };
  e.start(); await flush(); await e.tick(5000);
  assert.equal(e.navigations.length, 1);
});

test('default service selection is safe; a changed service or autofilled field is unfinished', () => {
  const service = { tagName: 'SELECT', value: '3D', options: [{ value: '3D', defaultSelected: true }] };
  const name = { tagName: 'INPUT', value: '' };
  const doc = { querySelectorAll: () => [{ querySelectorAll: () => [service, name] }] };
  assert.equal(hasUnfinishedInquiry(doc), false);
  service.value = 'Web'; assert.equal(hasUnfinishedInquiry(doc), true);
  service.value = '3D'; name.value = 'Test'; assert.equal(hasUnfinishedInquiry(doc), true);
});
