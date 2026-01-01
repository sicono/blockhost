// handleAccessTokens / tb safe stub moved out of index.html
// Tombstone: original inline bundle removed from index.html

(function () {
  try {
    window.tb = window.tb || {};
    window.tb.init = window.tb.init || function (opts) {
      if (opts && opts.fetch && typeof opts.fetch === 'function') {
        window._safeFetch = opts.fetch;
        window._safeFetchHeaders = opts.fetchHeaders || {};
      }
      return { ready: true };
    };

    window.fetchDynamicModel = window.fetchDynamicModel || function () {
      return Promise.resolve({});
    };
    window.dynamicModelPromise = window.dynamicModelPromise || window.fetchDynamicModel();

    window.dispatchEvent(new CustomEvent('tbReady', { detail: { logger: console } }));
  } catch (err) {
    console.warn('handleAccessTokens stub initialization error (non-fatal):', err);
  }
})();

/* Tombstone: handleAccessTokens / tb inline stub removed from index.html and consolidated here.
   // removed original inline tb stub from index.html
*/