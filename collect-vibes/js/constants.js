var Constants = (function () {
  'use strict';

  return {
    STORAGE_KEY: 'livskompas-entries',
    UI_STORAGE_KEY: 'livskompas-ui-state',
    TAG_ORDER: ['relationship', 'aspiration', 'friction'],
    TAG_LABELS: {
      relationship: 'Relationship',
      aspiration: 'Aspiration',
      friction: 'Friction'
    },
    TAG_DESCS: {
      relationship: "someone I don't want to lose",
      aspiration: "I'm reaching for something like that",
      friction: 'this got in the way'
    },
    SOFT_VARS: {
      relationship: 'var(--tag-relationship-soft)',
      aspiration: 'var(--tag-aspiration-soft)',
      friction: 'var(--tag-friction-soft)'
    },
    REGIONS: {
      'relationship': { x: 15, y: 26 },
      'aspiration': { x: 85, y: 26 },
      'friction': { x: 50, y: 92 },
      'relationship+aspiration': { x: 50, y: 21 },
      'relationship+friction': { x: 25, y: 60 },
      'aspiration+friction': { x: 75, y: 60 },
      'relationship+aspiration+friction': { x: 50, y: 49 }
    }
  };
})();
