chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-as-prompt",
    title: "Save to Vibesfolio as prompt",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "save-as-prompt" && info.selectionText) {
    // Store selected text so the popup can read it on open
    chrome.storage.session.set({
      pendingPrompt: info.selectionText.trim(),
    });
  }
});
