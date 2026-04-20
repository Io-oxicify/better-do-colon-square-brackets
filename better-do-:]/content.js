let enabled = true;

// load initial state
chrome.storage.sync.get(["enabled"], (data) => {
  enabled = data.enabled ?? true;
  if (enabled) start();
});

// listen for toggle changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) {
    enabled = changes.enabled.newValue;
    if (enabled) start();
  }
});

function replaceText(node) {
  if (!enabled) return;

  if (node.nodeType === Node.TEXT_NODE) {
    node.textContent = node.textContent
      .replaceAll(":)", ":]")
      .replaceAll(":3", ":]")
      .replaceAll(":(", ":[")
      .replaceAll("3:", ":[");
  } else {
    node.childNodes.forEach(replaceText);
  }
}

// initial run
function start() {
  replaceText(document.body);
}

// LIVE updates (this is the magic)
const observer = new MutationObserver((mutations) => {
  if (!enabled) return;

  for (const m of mutations) {
    for (const node of m.addedNodes) {
      replaceText(node);
    }
  }
});

// start observing page changes
observer.observe(document.body, {
  childList: true,
  subtree: true
});
