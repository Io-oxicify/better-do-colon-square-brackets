const toggle = document.getElementById("toggle");

// load saved state
chrome.storage.sync.get(["enabled"], (data) => {
  toggle.checked = data.enabled ?? true;
});

// update state
toggle.addEventListener("change", () => {
  if (!toggle.checked) {
    const confirmDisable = confirm("Would you like to disable this effect? (Requires page reload)");
    
    if (!confirmDisable) {
      toggle.checked = true; 
      return;
    }
  }

  // i think this is save?
  chrome.storage.sync.set({ enabled: toggle.checked });
});
