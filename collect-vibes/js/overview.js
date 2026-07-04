var OverviewModule = (function (Constants, Utils, Data, State) {
  'use strict';

  var tabLike = document.getElementById('tabLike');
  var tabDislike = document.getElementById('tabDislike');
  var tabLikeCount = document.getElementById('tabLikeCount');
  var tabDislikeCount = document.getElementById('tabDislikeCount');
  var tagMap = document.getElementById('tagMap');
  var untaggedLabel = document.getElementById('untaggedLabel');
  var untaggedRow = document.getElementById('untaggedRow');
  var overviewView = document.getElementById('overviewView');

  var renderCallback = null;

  function makePill(id, untagged) {
    var pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'vpill' + (untagged ? ' untagged' : '');
    var seed = Utils.hashStr(id);
    pill.style.animationDuration = (5 + (seed % 400) / 100).toFixed(2) + 's';
    pill.style.animationDelay = ((seed % 500) / 100).toFixed(2) + 's';
    pill.addEventListener('click', function () {
      State.selectedId = id;
      OverlayModule.openOverlay(renderCallback);
    });
    return pill;
  }

  function syncPill(pill, entry) {
    pill.textContent = entry.text;
    pill.style.background = Utils.pillBackground(entry);
    pill.classList.toggle('is-selected', entry.id === State.selectedId);
  }

  function renderTagMap() {
    var wantLike = State.activeTab === 'like';
    var inTab = State.entries.filter(function (e) {
      return (e.sentiment === 'like') === wantLike;
    });
    var tagged = inTab.filter(function (e) {
      return Utils.entryTags(e).length > 0;
    });
    var untagged = inTab.filter(function (e) {
      return Utils.entryTags(e).length === 0;
    });

    tabLikeCount.textContent = State.entries.filter(function (e) {
      return e.sentiment === 'like';
    }).length;
    tabDislikeCount.textContent = State.entries.filter(function (e) {
      return e.sentiment !== 'like';
    }).length;
    tabLike.classList.toggle('active', wantLike);
    tabDislike.classList.toggle('active', !wantLike);

    var groups = {};
    tagged.forEach(function (e) {
      var key = Utils.entryTags(e).join('+');
      (groups[key] = groups[key] || []).push(e);
    });

    var placed = {};
    Object.keys(groups).forEach(function (key) {
      var region = Constants.REGIONS[key];
      if (!region) return;
      var arr = groups[key];
      arr.forEach(function (e, i) {
        placed[e.id] = {
          x: region.x,
          y: region.y,
          offX: (i - (arr.length - 1) / 2) * 46,
          offY: (i % 2 === 0 ? -1 : 1) * (8 + i * 3)
        };
      });
    });

    Object.keys(State.mapPills).forEach(function (id) {
      if (!placed[id]) {
        tagMap.removeChild(State.mapPills[id]);
        delete State.mapPills[id];
      }
    });

    Object.keys(placed).forEach(function (id) {
      var entry = Data.findEntry(State.entries, id);
      var pos = placed[id];
      var wrap = State.mapPills[id];
      if (!wrap) {
        wrap = document.createElement('div');
        wrap.className = 'vpill-wrap';
        wrap.appendChild(makePill(id, false));
        tagMap.appendChild(wrap);
        State.mapPills[id] = wrap;
      }
      var rot = ((Utils.hashStr(id) % 100) / 100 - 0.5) * 10;
      wrap.style.left = pos.x + '%';
      wrap.style.top = pos.y + '%';
      wrap.style.transform = 'translate(-50%,-50%) translate(' + pos.offX + 'px,' + pos.offY + 'px) rotate(' + rot.toFixed(1) + 'deg)';
      syncPill(wrap.firstChild, entry);
    });

    untaggedLabel.hidden = untagged.length === 0;
    untaggedRow.hidden = untagged.length === 0;
    var want = {};
    untagged.forEach(function (e) { want[e.id] = true; });
    Object.keys(State.untaggedPills).forEach(function (id) {
      if (!want[id]) {
        untaggedRow.removeChild(State.untaggedPills[id]);
        delete State.untaggedPills[id];
      }
    });

    untagged.forEach(function (e) {
      var pill = State.untaggedPills[e.id];
      if (!pill) {
        pill = makePill(e.id, true);
        untaggedRow.appendChild(pill);
        State.untaggedPills[e.id] = pill;
      }
      syncPill(pill, e);
    });

    overviewView.classList.toggle('dimmed', !!State.selectedId);
  }

  function init(callback) {
    renderCallback = callback;
  }

  return {
    renderTagMap: renderTagMap,
    init: init
  };
})(Constants, Utils, Data, State);
