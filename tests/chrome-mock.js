// Mock Chrome extension APIs for testing

const storage = {};

const chrome = {
  runtime: {
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

module.exports = { chrome, resetStorage };
