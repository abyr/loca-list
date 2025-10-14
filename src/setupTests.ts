import '@testing-library/jest-dom';

const indexedDBMock = {
  open: jest.fn().mockImplementation(() => ({
    onsuccess: null,
    onerror: null,
    result: {
      transaction: jest.fn(),
    },
  })),
};

(global as any).indexedDB = indexedDBMock;