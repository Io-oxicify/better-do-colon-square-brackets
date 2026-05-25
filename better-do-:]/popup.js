const toggle = document.getElementById("toggle");

// load saved state
chrome.storage.sync.get(["enabled"], (data) => {
  toggle.checked = data.enabled ?? true;
});

// update state
toggle.addEventListener("change", () => {
  chrome.storage.sync.set({ enabled: toggle.checked });
});
