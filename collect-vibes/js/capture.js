var CaptureModule = (function (Constants, Utils, Data, State) {
  'use strict';

  var pickerRow = document.getElementById('pickerRow');
  var captureInput = document.getElementById('captureInput');
  var likeBtn = document.getElementById('likeBtn');
  var dislikeBtn = document.getElementById('dislikeBtn');

  function renderPicker() {
    pickerRow.textContent = '';
    Constants.TAG_ORDER.forEach(function (tag) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tagcard' + (State.selectedTags.indexOf(tag) !== -1 ? ' active' : '');
      btn.dataset.tag = tag;
      var label = document.createElement('div');
      label.className = 't-label';
      label.textContent = Constants.TAG_LABELS[tag];
      var desc = document.createElement('div');
      desc.className = 't-desc';
      desc.textContent = Constants.TAG_DESCS[tag];
      btn.appendChild(label);
      btn.appendChild(desc);
      btn.addEventListener('click', function () {
        var i = State.selectedTags.indexOf(tag);
        if (i === -1) {
          State.selectedTags.push(tag);
        } else {
          State.selectedTags.splice(i, 1);
        }
        renderPicker();
      });
      pickerRow.appendChild(btn);
    });
  }

  function updateCaptureControls() {
    var disabled = captureInput.value.trim().length === 0;
    likeBtn.disabled = disabled;
    dislikeBtn.disabled = disabled;
  }

  function autosize() {
    captureInput.style.height = 'auto';
    captureInput.style.height = Math.min(Math.max(captureInput.scrollHeight, 46), 200) + 'px';
  }

  function addEntry(sentiment, renderCallback) {
    var text = captureInput.value.trim();
    if (!text) return;
    var id = Data.addEntry(State.entries, sentiment, text, State.selectedTags);
    State.lastAddedId = id;
    Utils.btnPop(sentiment === 'like' ? likeBtn : dislikeBtn);
    State.selectedTags = [];
    captureInput.value = '';
    captureInput.style.height = '46px';
    updateCaptureControls();
    renderCallback();
    captureInput.focus();
  }

  function init(renderCallback) {
    captureInput.addEventListener('input', function () {
      autosize();
      updateCaptureControls();
    });

    captureInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        addEntry('like', renderCallback);
      }
    });

    likeBtn.addEventListener('click', function () {
      addEntry('like', renderCallback);
    });

    dislikeBtn.addEventListener('click', function () {
      addEntry('dislike', renderCallback);
    });
  }

  return {
    renderPicker: renderPicker,
    updateCaptureControls: updateCaptureControls,
    init: init
  };
})(Constants, Utils, Data, State);
