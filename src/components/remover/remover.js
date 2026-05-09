const HOME_PATH = '/home';
const CHECK_INTERVAL = 500;
const LOCATION_CHECK_INTERVAL = 500;
const TAB_LABELS = {
  recommendations: ['おすすめ', 'For you', 'For You'],
  following: ['フォロー中', 'Following'],
};

let observer = null;
let retryTimer = null;
let previousUrl = window.location.href;

initialize();

function initialize() {
  patchHistoryEvents();
  window.addEventListener('locationchange', handleLocationChange);
  window.addEventListener('popstate', handleLocationChange);

  window.setInterval(handleLocationChange, LOCATION_CHECK_INTERVAL);

  if (isHomeTimeline()) {
    startRecommendationRemoval();
  }
}

function handleLocationChange() {
  if (window.location.href === previousUrl) {
    return;
  }

  previousUrl = window.location.href;

  if (isHomeTimeline()) {
    startRecommendationRemoval();
  } else {
    stopRecommendationRemoval();
  }
}

function startRecommendationRemoval() {
  removeRecommendationTab();

  if (!observer) {
    observer = new MutationObserver(removeRecommendationTab);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  if (!retryTimer) {
    retryTimer = window.setInterval(removeRecommendationTab, CHECK_INTERVAL);
  }
}

function stopRecommendationRemoval() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  if (retryTimer) {
    window.clearInterval(retryTimer);
    retryTimer = null;
  }
}

function removeRecommendationTab() {
  const tabs = getTimelineTabs();
  const recommendationTab = findTabByLabels(tabs, TAB_LABELS.recommendations);
  const followingTab = findTabByLabels(tabs, TAB_LABELS.following);

  if (!recommendationTab || !followingTab) {
    return;
  }

  if (recommendationTab.getAttribute('aria-selected') === 'true') {
    followingTab.click();
  }

  hideTab(recommendationTab);
}

function getTimelineTabs() {
  return Array.from(document.querySelectorAll('a[role="tab"]'))
    .filter(isVisible)
    .filter(tab => matchTabLabels(tab, TAB_LABELS.recommendations) || matchTabLabels(tab, TAB_LABELS.following));
}

function findTabByLabels(tabs, labels) {
  return tabs.find(tab => matchTabLabels(tab, labels));
}

function matchTabLabels(tab, labels) {
  const text = normalizeText(tab.textContent);
  return labels.some(label => text.includes(normalizeText(label)));
}

function hideTab(tab) {
  const presentationWrapper = tab.closest('div[role="presentation"]');
  const target = presentationWrapper || tab;

  target.style.display = 'none';
  target.setAttribute('aria-hidden', 'true');
}

function normalizeText(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

function isVisible(element) {
  return element.getClientRects().length > 0;
}

function isHomeTimeline() {
  return window.location.hostname === 'x.com' && window.location.pathname === HOME_PATH;
}

function patchHistoryEvents() {
  if (window.__hideTwitterRecommendationsHistoryPatched) {
    return;
  }

  window.__hideTwitterRecommendationsHistoryPatched = true;

  ['pushState', 'replaceState'].forEach(type => {
    const original = history[type];

    history[type] = function patchedHistoryState(...args) {
      const result = original.apply(this, args);
      window.dispatchEvent(new Event('locationchange'));
      return result;
    };
  });
}
