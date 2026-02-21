// Mock Chrome extension APIs for testing

const storage = {};

const chrome = {
  runtime: {
    id: "mock-extension-id",
    onMessage: {
      addListener: jest.fn(),
    },
    getManifest: jest.fn(() => ({ version: "1.0.0" })),
    reload: jest.fn(),
  },
  storage: {
    local: {
      get: jest.fn((key, cb) => {
        if (typeof key === "string") {
          cb({ [key]: storage[key] });
        } else {
          cb(storage);
        }
      }),
      set: jest.fn((obj) => {
        Object.assign(storage, obj);
      }),
    },
  },
  tabs: {
    query: jest.fn(() => Promise.resolve([{ id: 1, url: "https://www.youtube.com/watch?v=test" }])),
    sendMessage: jest.fn(() => Promise.resolve({ active: false })),
    create: jest.fn(),
  },
};

function resetStorage() {
  for (const key of Object.keys(storage)) delete storage[key];
}

global.chrome = chrome;
global.fetch = jest.fn(() => Promise.resolve({ ok: false }));

function resetMocks() {
  // Clear all mock call history
  chrome.runtime.onMessage.addListener.mockClear();
  chrome.runtime.getManifest.mockClear();
  chrome.runtime.reload.mockClear();
  chrome.storage.local.get.mockClear();
  chrome.storage.local.set.mockClear();
  chrome.tabs.query.mockClear();
  chrome.tabs.sendMessage.mockClear();
  chrome.tabs.create.mockClear();
  global.fetch.mockClear();

  // Reset storage
  resetStorage();

  // Restore default return values
  chrome.tabs.query.mockImplementation(() =>
    Promise.resolve([{ id: 1, url: "https://www.youtube.com/watch?v=test" }])
  );
  chrome.tabs.sendMessage.mockImplementation(() =>
    Promise.resolve({ active: false })
  );
  chrome.runtime.getManifest.mockImplementation(() => ({ version: "1.0.0" }));
  global.fetch.mockImplementation(() => Promise.resolve({ ok: false }));
}

module.exports = { chrome, resetStorage, resetMocks };
