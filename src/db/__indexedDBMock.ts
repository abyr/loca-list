type Key = number;

interface Record {
  [prop: string]: any;
}

class MockRequest<T> {
  result!: T;
  error: any = null;
  onsuccess: ((this: MockRequest<T>, ev: Event) => any) | null = null;
  onerror: ((this: MockRequest<T>, ev: Event) => any) | null = null;
  onupgradeneeded: ((this: MockRequest<T>, ev: Event) => any) | null = null;

  _resolve(value: T) {
    this.result = value;
    if (this.onsuccess) this.onsuccess.call(this, new Event('success'));
  }

  _reject(err: any) {
    this.error = err;
    if (this.onerror) this.onerror.call(this, new Event('error'));
  }
}

class MockObjectStore {
  private records = new Map<Key, Record>();
  private autoKey = 1;
  constructor(public keyPath: string) {}

  add(value: Record) {
    const req = new MockRequest<number>();
    const key = (value[this.keyPath] as number) ?? this.autoKey++;
    const stored = { ...value, [this.keyPath]: key };
    this.records.set(key, stored);
    setTimeout(() => req._resolve(key), 0);
    return req;
  }

  getAll() {
    const req = new MockRequest<Record[]>();
    const all = Array.from(this.records.values());
    setTimeout(() => req._resolve(all), 0);
    return req;
  }

  put(value: Record) {
    const req = new MockRequest<void>();
    const key = value[this.keyPath] as number;
    if (key == null) {
      req._reject(new Error('Missing key for put'));
    } else {
      this.records.set(key, value);
      setTimeout(() => req._resolve(undefined), 0);
    }
    return req;
  }

  delete(key: Key) {
    const req = new MockRequest<void>();
    this.records.delete(key);
    setTimeout(() => req._resolve(undefined), 0);
    return req;
  }
}

class MockTransaction {
  constructor(private store: MockObjectStore) {}
  objectStore() {
    return this.store;
  }
}

class MockIDBDatabase {
  private stores = new Map<string, MockObjectStore>();

  createObjectStore(name: string, options: { keyPath: string; autoIncrement: boolean }) {
    const store = new MockObjectStore(options.keyPath);
    this.stores.set(name, store);
    return store;
  }

  transaction(storeName: string, mode: IDBTransactionMode) {
    const store = this.stores.get(storeName);
    if (!store) throw new Error(`Store ${storeName} does not exist`);
    return new MockTransaction(store);
  }
}

class MockIDBFactory {
  open(name: string) {
    const request = new MockRequest<MockIDBDatabase>();

    setTimeout(() => {
      const db = new MockIDBDatabase();

      if (request.onupgradeneeded) {
        request.result = db;
        request.onupgradeneeded({ target: request } as any);
      }

      request._resolve(db);
    }, 0);

    return request as any;
  }

  __reset() {
  }
}

export const indexedDB = new MockIDBFactory();
