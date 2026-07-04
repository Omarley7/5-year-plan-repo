var Utils = (function (Constants) {
  'use strict';

  function hashStr(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  function relativeTime(ts) {
    var diff = Date.now() - ts;
    var min = Math.floor(diff / 60000);
    if (min < 1) return 'just now';
    if (min < 60) return min + 'm ago';
    var hr = Math.floor(min / 60);
    if (hr < 24) return hr + 'h ago';
    var day = Math.floor(hr / 24);
    if (day < 7) return day + 'd ago';
    return new Date(ts).toLocaleDateString();
  }

  function entryTags(entry) {
    return Constants.TAG_ORDER.filter(function (t) {
      return (entry.tags || []).indexOf(t) !== -1;
    });
  }

  function pillBackground(entry) {
    var set = entryTags(entry);
    if (set.length === 0) return 'var(--neutral)';
    if (set.length === 1) return Constants.SOFT_VARS[set[0]];
    var stops = set.map(function (t) { return Constants.SOFT_VARS[t]; }).join(', ');
    return 'linear-gradient(135deg, ' + stops + ')';
  }

  function btnPop(btn) {
    btn.classList.remove('btn-pop');
    void btn.offsetWidth;
    btn.classList.add('btn-pop');
  }

  function holdFocus(btn) {
    btn.addEventListener('pointerdown', function (e) { e.preventDefault(); });
    btn.addEventListener('mousedown', function (e) { e.preventDefault(); });
  }

  return {
    hashStr: hashStr,
    relativeTime: relativeTime,
    entryTags: entryTags,
    pillBackground: pillBackground,
    btnPop: btnPop,
    holdFocus: holdFocus
  };
})(Constants);
