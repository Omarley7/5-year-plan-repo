var State = (function () {
  'use strict';

  return {
    entries: [],
    selectedTags: [],
    view: 'capture',
    activeTab: 'like',
    selectedId: null,
    lastAddedId: null,
    mapPills: {},
    untaggedPills: {}
  };
})();
