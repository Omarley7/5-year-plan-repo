var App = (function (Constants, Utils, Data, State, CaptureModule, RecentModule, OverviewModule, OverlayModule) {
  'use strict';

  var navBtn = document.getElementById('navBtn');
  var captureView = document.getElementById('captureView');
  var overviewView = document.getElementById('overviewView');
  var tabLike = document.getElementById('tabLike');
  var tabDislike = document.getElementById('tabDislike');
  var captureInput = document.getElementById('captureInput');
  var reloadingForUpdate = false;

  function persistUiState() {
    Data.persistUiState(State, captureInput.value);
  }

  function reloadForUpdate() {
    if (reloadingForUpdate) return;
    reloadingForUpdate = true;
    window.location.reload();
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;

    navigator.serviceWorker.addEventListener('controllerchange', reloadForUpdate);
    navigator.serviceWorker.register('sw.js').then(function (registration) {
      function requestUpdate() {
        registration.update().catch(function () {});
      }

      requestUpdate();
      window.addEventListener('focus', requestUpdate);
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') requestUpdate();
      });
      window.setInterval(requestUpdate, 60000);
    }).catch(function () {});
  }

  function render() {
    var overview = State.view === 'overview';
    navBtn.textContent = overview ? '← Capture' : 'View all';
    captureView.hidden = overview;
    overviewView.hidden = !overview;
    CaptureModule.renderPicker();
    RecentModule.renderRecent(render);
    if (overview) OverviewModule.renderTagMap();
    persistUiState();
  }

  function init() {
    State.entries = Data.load();
    var savedUiState = Data.loadUiState();
    State.activeTab = savedUiState.activeTab;
    State.view = savedUiState.view;
    State.selectedTags = savedUiState.selectedTags;
    captureInput.value = savedUiState.draftText;

    if (captureInput.value) CaptureModule.autosize();
    CaptureModule.updateCaptureControls();
    CaptureModule.init(render, persistUiState);
    OverlayModule.init(render);
    OverviewModule.init(render);

    tabLike.addEventListener('click', function () {
      if (State.activeTab === 'like') return;
      State.activeTab = 'like';
      OverviewModule.renderTagMap();
      persistUiState();
    });

    tabDislike.addEventListener('click', function () {
      if (State.activeTab === 'dislike') return;
      State.activeTab = 'dislike';
      OverviewModule.renderTagMap();
      persistUiState();
    });

    navBtn.addEventListener('click', function () {
      State.view = State.view === 'capture' ? 'overview' : 'capture';
      render();
      var incoming = State.view === 'overview' ? overviewView : captureView;
      incoming.classList.remove('anim-left', 'anim-right');
      void incoming.offsetWidth;
      incoming.classList.add(State.view === 'overview' ? 'anim-right' : 'anim-left');
      if (State.view === 'capture') captureInput.focus();
    });

    render();
    registerServiceWorker();
  }

  return {
    init: init
  };
})(Constants, Utils, Data, State, CaptureModule, RecentModule, OverviewModule, OverlayModule);

document.addEventListener('DOMContentLoaded', function () {
  App.init();
});
