chrome.storage.local.get(["trackingData"], (data) => {
  let trackingData = data.trackingData || {};
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    let domain = new URL(tabs[0].url).hostname;
    document.getElementById("time").innerText = `Time on ${domain}: ${(trackingData[domain] || 0).toFixed(2)}s`;
  });
});
