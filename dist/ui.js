(function (root) {
  'use strict';
  const $ = (selector, el = document) => el.querySelector(selector);
  const $$ = (selector, el = document) => [...el.querySelectorAll(selector)];
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
  const base = new URL('.', document.currentScript.src);
  const scripts = new Map();
  function load(path) {
    if (scripts.has(path)) return scripts.get(path);
    const pending = new Promise((resolve, reject) => {
      const tag = document.createElement('script');
      tag.src = new URL(path, base).href;
      tag.onload = resolve;
      tag.onerror = () => { tag.remove(); reject(new Error('자료를 불러오지 못했어요. 다시 시도해 주세요.')); };
      document.head.append(tag);
    }).catch(error => { scripts.delete(path); throw error; });
    scripts.set(path, pending);
    return pending;
  }
  let toastTimer;
  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 3200);
  }
  function dialog(markup) {
    const el = $('#detail-dialog');
    $('#detail-content').innerHTML = markup;
    if (!el.open) el.showModal();
  }
  function kst() {
    const date = new Date(Date.now() + 9 * 3600000);
    return {year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate()};
  }
  const pad = n => String(n).padStart(2, '0');
  root.SajuUI = {$, $$, escape, load, toast, dialog, kst, pad};
})(window);
