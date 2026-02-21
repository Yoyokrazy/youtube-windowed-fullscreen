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
    query: jest.fn(),
    sendMessage: jest.fn(),
  },
};

function resetStorage() {
  for (const key of Object.keys(storage)) delete storage[key];
}

global.chrome = chrome;

module.exports = { chrome, resetStorage };
