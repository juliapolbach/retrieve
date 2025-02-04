/* global chrome */

document.addEventListener('mouseup', function () {
  const selectedText = window.getSelection().toString().trim()
  if (selectedText) {
    chrome.storage.local.set({ selectedText })
  }
})
