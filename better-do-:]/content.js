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
function isSkippable(node) {
  if (!node || !node.parentElement) return false;

  const badTags = [
    "SCRIPT",
    "STYLE",
    "TEXTAREA",
    "CODE",
    "PRE",
    "NOSCRIPT"
  ];

  return badTags.includes(node.parentElement.tagName);
}
function replaceText(node) {
  if (!enabled) return;

  // skip unsafe areas
  if (node.nodeType === Node.TEXT_NODE) {
    if (isSkippable(node)) return;

    const original = node.textContent;

    const replaced = original
      .replaceAll(":)", ":]")
      .replaceAll(":3", ":]")
      .replaceAll(":(", ":[")
      .replaceAll("3:", ":["); // optional risky line

    if (replaced !== original) {
      node.textContent = replaced;
    }

  } else {
    node.childNodes.forEach(replaceText);
  }
}

// initial run
function start() {
  if (document.body) {
    replaceText(document.body);
  }
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
