let activeTab = null;
let startTime = null;

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  if (activeTab) {
    logTimeSpent(activeTab);
  }
  activeTab = await getCurrentTab();
  startTime = new Date().getTime();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.status === "complete") {
    if (activeTab) logTimeSpent(activeTab);
    activeTab = tab;
    startTime = new Date().getTime();
  }
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE && activeTab) {
    logTimeSpent(activeTab);
    activeTab = null;
  }
});

async function getCurrentTab() {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

function logTimeSpent(tab) {
  let timeSpent = (new Date().getTime() - startTime) / 1000;
  if (tab) {
    chrome.storage.local.get(["trackingData"], (data) => {
      let trackingData = data.trackingData || {};
      let domain = new URL(tab.url).hostname;

      trackingData[domain] = (trackingData[domain] || 0) + timeSpent;
      chrome.storage.local.set({ trackingData });

      // Send data to backend
      fetch("http://localhost:5000/logTime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, timeSpent }),
      });
    });
  }
}
