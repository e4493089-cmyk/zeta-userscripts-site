(() => {
  'use strict';

  // Backward-compatibility shim for old saved Room Manager bookmarklets.
  // New bookmarklets no longer use a helper tab. If an old bookmarklet opens one,
  // close it immediately and report that no controller is needed.
  window.__zrmBookmarkletControllerInstall = function (helper) {
    try {
      if (helper && !helper.closed) {
        helper.document.open();
        helper.document.write('<!doctype html><meta charset="utf-8"><title>Room Manager</title>');
        helper.document.close();
        helper.close();
      }
    } catch (_) {}
    try { window.__zrmBookmarkletControllerReady = false; } catch (_) {}
    return false;
  };
})();