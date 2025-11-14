import '@testing-library/jest-dom';

import { indexedDB } from './db/__indexedDBMock';

(global as any).indexedDB = indexedDB;