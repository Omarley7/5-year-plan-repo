var OverlayModule = (function (Constants, Utils, Data, State) {
  'use strict';

  var entryOverlay = document.getElementById('entryOverlay');
  var moodToggle = document.getElementById('moodToggle');
  var moodLikeBtn = document.getElementById('moodLikeBtn');
  var moodDislikeBtn = document.getElementById('moodDislikeBtn');
  var overlayCard = document.getElementById('overlayCard');
  var overlayDelBtn = document.getElementById('overlayDelBtn');
  var overlayText = document.getElementById('overlayText');
  var bubbleRow = document.getElementById('bubbleRow');
  var tagBubbles = Array.prototype.slice.call(bubbleRow.querySelectorAll('.tag-bubble'));

  function syncOverlay() {
    var entry = Data.findEntry(State.entries, State.selectedId);
    if (!entry) return;
    overlayText.textContent = entry.text;
    moodLikeBtn.classList.toggle('active', entry.sentiment === 'like');
    moodDislikeBtn.classList.toggle('active', entry.sentiment !== 'like');
    tagBubbles.forEach(function (b) {
      b.classList.toggle('active', (entry.tags || []).indexOf(b.dataset.tag) !== -1);
    });
  }

  function closeOverlay(renderCallback) {
    State.selectedId = null;
    entryOverlay.hidden = true;
    renderCallback();
  }

  function openOverlay(renderCallback) {
    syncOverlay();
    entryOverlay.hidden = false;
    renderCallback();
  }

  function init(renderCallback) {
    entryOverlay.addEventListener('click', function () {
      closeOverlay(renderCallback);
    });

    [moodToggle, overlayCard, bubbleRow].forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.stopPropagation();
      });
    });

    moodLikeBtn.addEventListener('click', function () {
      if (Data.setEntrySentiment(State.entries, State.selectedId, 'like')) {
        syncOverlay();
        renderCallback();
      }
    });

    moodDislikeBtn.addEventListener('click', function () {
      if (Data.setEntrySentiment(State.entries, State.selectedId, 'dislike')) {
        syncOverlay();
        renderCallback();
      }
    });

    tagBubbles.forEach(function (b) {
      b.addEventListener('click', function () {
        if (Data.toggleEntryTag(State.entries, State.selectedId, b.dataset.tag)) {
          syncOverlay();
          renderCallback();
        }
      });
    });

    overlayDelBtn.addEventListener('click', function () {
      var id = State.selectedId;
      State.selectedId = null;
      entryOverlay.hidden = true;
      State.entries = Data.deleteEntry(State.entries, id);
      renderCallback();
    });
  }

  return {
    openOverlay: openOverlay,
    closeOverlay: closeOverlay,
    syncOverlay: syncOverlay,
    init: init
  };
})(Constants, Utils, Data, State);
