export {};

console.log("Background script loaded");

// handle external message
chrome.runtime.onMessageExternal.addListener(
  (message, sender, sendResponse) => {
    console.log("Received external message:", message);

    if (message.type === "PING") {
      sendResponse({ type: "PONG" });
      return true;
    }

    if (message.type === "SET_TOKEN") {
      // use Promise to ensure the token is saved
      const saveToken = async () => {
        try {
          await chrome.storage.local.set({
            tifoo_token: message.token,
            tokenOrigin: message.origin,
          });
          console.log("Token saved successfully:", message.token);
          // verify the storage
          const result = await chrome.storage.local.get(["tifoo_token"]);
          console.log("Token verification:", result);
          sendResponse({ success: true });
        } catch (error) {
          console.error("Error saving token:", error);
          sendResponse({ success: false, error });
        }
      };

      saveToken();
      return true;
    }
  }
);

// handle internal message
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "setToken") {
    chrome.storage.local.set({ tifoo_token: message.token }, () => {
      console.log("Token saved:", message.token);
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.action === "getToken") {
    chrome.storage.local.get(["tifoo_token"], (result) => {
      console.log("Token retrieved:", result.tifoo_token);
      sendResponse({ token: result.tifoo_token });
    });
    return true;
  }

  if (message.action === "toggleTifoo") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, message);
      }
    });
  }

  if (message.action === "getState") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, message, sendResponse);
      }
    });
    return true;
  }
});
