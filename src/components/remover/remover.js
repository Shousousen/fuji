const RECOMMENDATION_TEXT = 'おすすめ';
const FOLLOWING_TEXT = 'フォロー中';
const INTERVAL = 750;
const MAX_ATTEMPTS = 10;

let currentTab = null;

initializeRecommendationRemoval();

let previousUrl = window.location.href;
setInterval(() => {
  if (window.location.href !== previousUrl) {
    console.log('URL has changed:', window.location.href);
    previousUrl = window.location.href;
    if (window.location.href.startsWith('https://x.com/home')) {
      initializeRecommendationRemoval();
    }
  }
}, INTERVAL);

function initializeRecommendationRemoval() {
  removeRecommendationTab(INTERVAL, MAX_ATTEMPTS);
}

function removeRecommendationTab(interval, maxAttempts) {
  waitForTargetDivs(interval, maxAttempts)
    .then(tabDivs => {
      tabDivs.forEach(div => {
        const tabSpan = div.querySelector('span');
        const underlineDiv = tabSpan?.nextElementSibling;

        if (underlineDiv?.style.backgroundColor !== '') {
          currentTab = tabSpan.textContent;
        }
      });

      tabDivs.forEach(div => {
        const tabSpan = div.querySelector('span');

        if (tabSpan) {
          const tabText = tabSpan.textContent;
          if (tabText.includes(RECOMMENDATION_TEXT)) {
            div.style.display = 'none';
          }
          if (tabText.includes(FOLLOWING_TEXT) && currentTab === RECOMMENDATION_TEXT) {
            div.querySelector('a[role="tab"]').click();
          }
        }
      });
    })
    .catch(error => {
      console.error('Error in removeRecommendationTab:', error);
    });
}

function waitForTargetDivs(interval, maxAttempts) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const timer = setInterval(() => {
      const presentationDivs = document.querySelectorAll('div[role="presentation"]');
      const tabDivs = Array.from(presentationDivs).filter(div => div.querySelector('a[role="tab"]'));

      if (tabDivs.length > 0) {
        clearInterval(timer);
        resolve(tabDivs);
      } else if (attempts >= maxAttempts) {
        clearInterval(timer);
        reject(new Error('Failed to find target divs within the specified attempts'));
      }
      attempts++;
    }, interval);
  });
}
