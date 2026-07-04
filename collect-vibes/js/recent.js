var RecentModule = (function (Constants, Utils, Data, State) {
  'use strict';

  var recentSection = document.getElementById('recentSection');
  var recentList = document.getElementById('recentList');
  var emptyHint = document.getElementById('emptyHint');

  function renderRecent(renderCallback) {
    var recent = State.entries.slice(0, 3);
    recentSection.hidden = recent.length === 0;
    emptyHint.hidden = State.entries.length !== 0;
    recentList.textContent = '';

    recent.forEach(function (entry) {
      var row = document.createElement('div');
      row.className = 'recent-row' + (entry.id === State.lastAddedId ? ' row-enter' : '');

      var dot = document.createElement('span');
      dot.className = 'dot ' + entry.sentiment;
      row.appendChild(dot);

      var body = document.createElement('div');
      body.className = 'recent-body';

      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'recent-text';
      input.maxLength = 280;
      input.value = entry.text;
      input.addEventListener('blur', function () {
        if (Data.commitText(State.entries, entry, input.value)) renderCallback();
      });
      body.appendChild(input);

      var meta = document.createElement('div');
      meta.className = 'meta-row';
      var time = document.createElement('span');
      time.className = 'time';
      time.textContent = Utils.relativeTime(entry.ts);
      meta.appendChild(time);

      Constants.TAG_ORDER.forEach(function (tag) {
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'chip' + ((entry.tags || []).indexOf(tag) !== -1 ? ' active' : '');
        chip.dataset.tag = tag;
        chip.textContent = Constants.TAG_LABELS[tag];
        Utils.holdFocus(chip);
        chip.addEventListener('click', function () {
          Data.commitText(State.entries, entry, input.value);
          if (Data.toggleEntryTag(State.entries, entry.id, tag)) renderCallback();
        });
        meta.appendChild(chip);
      });

      [['like', '♡ Like'], ['dislike', '✕ Dislike']].forEach(function (def) {
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'chip' + (entry.sentiment === def[0] ? ' active' : '');
        chip.dataset.sent = def[0];
        chip.textContent = def[1];
        Utils.holdFocus(chip);
        chip.addEventListener('click', function () {
          Data.commitText(State.entries, entry, input.value);
          if (Data.setEntrySentiment(State.entries, entry.id, def[0])) renderCallback();
        });
        meta.appendChild(chip);
      });

      body.appendChild(meta);
      row.appendChild(body);

      var del = document.createElement('button');
      del.type = 'button';
      del.className = 'row-del';
      del.title = 'Delete';
      del.textContent = '✕';
      del.addEventListener('click', function () {
        State.entries = Data.deleteEntry(State.entries, entry.id);
        renderCallback();
      });
      row.appendChild(del);

      recentList.appendChild(row);
    });

    State.lastAddedId = null;
  }

  return {
    renderRecent: renderRecent
  };
})(Constants, Utils, Data, State);
