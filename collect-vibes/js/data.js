var Data = (function (Constants, Utils) {
  'use strict';

  function load() {
    try {
      var raw = localStorage.getItem(Constants.STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed.map(function (entry) {
        var tags = Array.isArray(entry.tags) ? entry.tags : [];
        var mapped = tags.map(function (tag) {
          return tag === 'inspiration' ? 'aspiration' : tag;
        });
        return Object.assign({}, entry, { tags: mapped });
      });
    } catch (e) {
      return [];
    }
  }

  function persist(entries) {
    try {
      localStorage.setItem(Constants.STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {}
  }

  function findEntry(entries, id) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].id === id) return entries[i];
    }
    return null;
  }

  function addEntry(entries, sentiment, text, selectedTags) {
    if (!text.trim()) return null;
    var id = Date.now() + '-' + Math.random().toString(36).slice(2, 7);
    entries.unshift({
      id: id,
      text: text,
      sentiment: sentiment,
      tags: selectedTags.slice(),
      ts: Date.now()
    });
    persist(entries);
    return id;
  }

  function deleteEntry(entries, id) {
    entries = entries.filter(function (e) { return e.id !== id; });
    persist(entries);
    return entries;
  }

  function toggleEntryTag(entries, id, tag) {
    var entry = findEntry(entries, id);
    if (!entry) return false;
    entry.tags = entry.tags || [];
    var i = entry.tags.indexOf(tag);
    if (i === -1) {
      entry.tags.push(tag);
    } else {
      entry.tags.splice(i, 1);
    }
    persist(entries);
    return true;
  }

  function setEntrySentiment(entries, id, sentiment) {
    var entry = findEntry(entries, id);
    if (!entry || entry.sentiment === sentiment) return false;
    entry.sentiment = sentiment;
    persist(entries);
    return true;
  }

  function commitText(entries, entry, text) {
    var trimmed = text.trim();
    if (!trimmed) return false;
    if (trimmed === entry.text) return false;
    entry.text = trimmed;
    persist(entries);
    return true;
  }

  function loadUiState() {
    try {
      var raw = localStorage.getItem(Constants.UI_STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : {};
      var activeTab = parsed.activeTab === 'dislike' ? 'dislike' : 'like';
      var view = parsed.view === 'overview' ? 'overview' : 'capture';
      var selectedTags = Array.isArray(parsed.selectedTags)
        ? parsed.selectedTags.filter(function (tag) {
            return Constants.TAG_ORDER.indexOf(tag) !== -1;
          })
        : [];
      return {
        activeTab: activeTab,
        view: view,
        selectedTags: selectedTags,
        draftText: typeof parsed.draftText === 'string' ? parsed.draftText : ''
      };
    } catch (e) {
      return {
        activeTab: 'like',
        view: 'capture',
        selectedTags: [],
        draftText: ''
      };
    }
  }

  function persistUiState(state, draftText) {
    try {
      localStorage.setItem(Constants.UI_STORAGE_KEY, JSON.stringify({
        activeTab: state.activeTab === 'dislike' ? 'dislike' : 'like',
        view: state.view === 'overview' ? 'overview' : 'capture',
        selectedTags: Constants.TAG_ORDER.filter(function (tag) {
          return state.selectedTags.indexOf(tag) !== -1;
        }),
        draftText: typeof draftText === 'string' ? draftText : ''
      }));
    } catch (e) {}
  }

  return {
    load: load,
    loadUiState: loadUiState,
    persist: persist,
    persistUiState: persistUiState,
    findEntry: findEntry,
    addEntry: addEntry,
    deleteEntry: deleteEntry,
    toggleEntryTag: toggleEntryTag,
    setEntrySentiment: setEntrySentiment,
    commitText: commitText
  };
})(Constants, Utils);
