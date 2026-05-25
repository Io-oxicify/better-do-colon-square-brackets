const toggle = document.getElementById("toggle");

// load saved state
chrome.storage.sync.get(["enabled"], (data) => {
  toggle.checked = data.enabled ?? true;
});

// update state
toggle.addEventListener("change", async () => {
  // If the user is unchecking the box, run the prompt on the webpage
  if (!toggle.checked) {
    // Get the currently active browser tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab && tab.id) {
      try {
        // Execute the confirm dialog directly inside the web page's window
        const [result] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            return confirm("Would you like to disable this effect? (Requires page reload)");
          }
        });

        // If the user clicked 'Cancel' on the webpage prompt
        if (!result.result) {
          toggle.checked = true; // Re-check the popup toggle
          return; // Exit without saving or reloading
        } else {
          // If they clicked 'OK', save the state AND reload the webpage instantly
          await chrome.storage.sync.set({ enabled: false });
          chrome.tabs.reload(tab.id);
          return;
        }
      } catch (err) {
        // Fallback: If scripting fails (e.g., on internal chrome:// pages), use popup confirm
        console.warn("Could not inject script, falling back to popup dialog:", err);
        if (!confirm("Would you like to disable this effect? (Requires page reload)")) {
          toggle.checked = true;
          return;
        } else {
          await chrome.storage.sync.set({ enabled: false });
          if (tab && tab.id) chrome.tabs.reload(tab.id);
          return;
        }
      }
    }
  }

  // Save state if they are turning it back ON
  chrome.storage.sync.set({ enabled: toggle.checked });
});
