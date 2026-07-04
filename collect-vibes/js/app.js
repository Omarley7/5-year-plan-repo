var App = (function (Constants, Utils, Data, State, CaptureModule, RecentModule, OverviewModule, OverlayModule) {
  'use strict';

  var navBtn = document.getElementById('navBtn');
  var captureView = document.getElementById('captureView');
  var overviewView = document.getElementById('overviewView');
  var tabLike = document.getElementById('tabLike');
  var tabDislike = document.getElementById('tabDislike');
  var captureInput = document.getElementById('captureInput');

  function render() {
    var overview = State.view === 'overview';
    navBtn.textContent = overview ? '← Capture' : 'View all';
    captureView.hidden = overview;
    overviewView.hidden = !overview;
    CaptureModule.renderPicker();
    RecentModule.renderRecent(render);
    if (overview) OverviewModule.renderTagMap();
  }

  function init() {
    var refreshing = false;
    State.entries = Data.load();

    CaptureModule.updateCaptureControls();
    CaptureModule.init(render);
    OverlayModule.init(render);
    OverviewModule.init(render);

    tabLike.addEventListener('click', function () {
      if (State.activeTab === 'like') return;
      State.activeTab = 'like';
      OverviewModule.renderTagMap();
    });

    tabDislike.addEventListener('click', function () {
      if (State.activeTab === 'dislike') return;
      State.activeTab = 'dislike';
      OverviewModule.renderTagMap();
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

    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });

      navigator.serviceWorker.register('sw.js').then(function (registration) {
        function activateUpdate(worker) {
          if (!worker) return;
          worker.postMessage({ type: 'SKIP_WAITING' });
        }

        if (registration.waiting) activateUpdate(registration.waiting);

        registration.addEventListener('updatefound', function () {
          var installing = registration.installing;
          if (!installing) return;
          installing.addEventListener('statechange', function () {
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              activateUpdate(installing);
            }
          });
        });

        setInterval(function () {
          registration.update().catch(function () {});
        }, 60000);
      }).catch(function () {});
    }
  }

  return {
    init: init
  };
})(Constants, Utils, Data, State, CaptureModule, RecentModule, OverviewModule, OverlayModule);

document.addEventListener('DOMContentLoaded', function () {
  App.init();
});
