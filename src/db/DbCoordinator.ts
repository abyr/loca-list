/**
 * DbCoordinator.ts
 *
 * Role & motivation:
 * This module centralizes the low-level IndexedDB access for the app.
 * It provides a single internal class (`DbCoordinator`) that manages the
 * database connection, object store creation, and primitive CRUD
 * operations for the data stores. The intention is to keep direct
 * IndexedDB usage confined here and accessed only via higher-level
 * DAO wrappers (e.g. `TaskDAO`, `SettingsDAO`).
 *
 * Why: IndexedDB APIs are imperative, environment-sensitive, and can
 * vary in test mocks. By centralizing the logic and keeping it internal
 * we can:
 * - isolate database schema and upgrade logic in one place
 * - adapt behavior for test environments (mocks) centrally
 * - prevent accidental direct imports elsewhere in the codebase
 * - replace or evolve the storage layer without changing DAOs
 */

import { Task } from '../models/Task';
import { Setting } from '../models/Setting';

export default class DbCoordinator {
    private dbName: string = 'LocaListDB';
    private dbVersion: number = 2;

    private storeNameTasks: string = 'Tasks';
    private storeKeyTask: string = 'id';
    private storeNameSettings: string = 'Settings';
    private storeKeySetting: string = 'key';

    private db: IDBDatabase | null = null;
    private ready: Promise<void>;

    constructor() {
        this.ready = this.init();
    }

    private async init() {
        return new Promise<void>((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                const db = request.result as any;
                // Some test environments provide a minimal mock that doesn't
                // implement `objectStoreNames`. Try creating stores and ignore
                // errors if they already exist.
                try {
                    db.createObjectStore(this.storeNameTasks, { keyPath: this.storeKeyTask, autoIncrement: true });
                } catch (e) {
                    // Store may already exist in real environments or mocks
                }
                try {
                    db.createObjectStore(this.storeNameSettings, { keyPath: this.storeKeySetting });
                } catch (e) {
                    // ignore
                }
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onerror = () => {
                reject('Database error: ' + request.error);
            };
        });
    }

    public async getAllTasks(): Promise<Task[]> {
        await this.ready;
        return new Promise<Task[]>((resolve, reject) => {
            if (this.db) {
                const transaction = this.db.transaction(this.storeNameTasks, 'readonly');
                const store = transaction.objectStore(this.storeNameTasks);
                const request = store.getAll();

                request.onsuccess = () => {
                    resolve(request.result as Task[]);
                };

                request.onerror = () => {
                    reject('Get Tasks error: ' + request.error);
                };
            } else {
                reject('Database is not initialized.');
            }
        });
    }

    public async addTask(task: Task): Promise<number> {
        await this.ready;
        return new Promise<number>((resolve, reject) => {
            if (this.db) {
                const transaction = this.db.transaction(this.storeNameTasks, 'readwrite');
                const store = transaction.objectStore(this.storeNameTasks);
                const request = store.add({ ...task, createdDate: Date.now(), updatedDate: Date.now() });

                request.onsuccess = () => {
                    resolve(request.result as number);
                };

                request.onerror = () => {
                    reject('Add Task error: ' + request.error);
                };
            } else {
                reject('Database is not initialized.');
            }
        });
    }

    public async updateTask(task: Task): Promise<void> {
        await this.ready;
        return new Promise<void>((resolve, reject) => {
            if (this.db) {
                const transaction = this.db.transaction(this.storeNameTasks, 'readwrite');
                const store = transaction.objectStore(this.storeNameTasks);
                task.updatedDate = Date.now();
                const request = store.put(task);

                request.onsuccess = () => {
                    resolve();
                };

                request.onerror = () => {
                    reject('Update Task error: ' + request.error);
                };
            } else {
                reject('Database is not initialized.');
            }
        });
    }

    public async deleteTask(id: number): Promise<void> {
        await this.ready;
        return new Promise<void>((resolve, reject) => {
            if (this.db) {
                const transaction = this.db.transaction(this.storeNameTasks, 'readwrite');
                const store = transaction.objectStore(this.storeNameTasks);
                const request = store.delete(id);

                request.onsuccess = () => {
                    resolve();
                };

                request.onerror = () => {
                    reject('Delete Task error: ' + request.error);
                };
            } else {
                reject('Database is not initialized.');
            }
        });
    }

    public async deleteAllTasks(): Promise<void> {
        await this.ready;
        return new Promise<void>((resolve, reject) => {
            if (this.db) {
                const transaction = this.db.transaction(this.storeNameTasks, 'readwrite');
                const store = transaction.objectStore(this.storeNameTasks);
                const request = store.clear();

                request.onsuccess = () => {
                    resolve();
                };

                request.onerror = () => {
                    reject('Delete All Tasks error: ' + request.error);
                };
            } else {
                reject('Database is not initialized.');
            }
        });
    }

    public async getAllSettings(): Promise<Setting[]> {
        await this.ready;
        return new Promise<Setting[]>((resolve, reject) => {
            if (this.db) {
                const transaction = this.db.transaction(this.storeNameSettings, 'readonly');
                const store = transaction.objectStore(this.storeNameSettings);
                const request = store.getAll();

                request.onsuccess = () => {
                    resolve(request.result as Setting[]);
                };

                request.onerror = () => {
                    reject('Get Settings error: ' + request.error);
                };
            } else {
                reject('Database is not initialized.');
            }
        });
    }

    public async saveSetting(setting: Setting): Promise<void> {
        await this.ready;
        return new Promise<void>((resolve, reject) => {
            if (this.db) {
                const transaction = this.db.transaction(this.storeNameSettings, 'readwrite');
                const store = transaction.objectStore(this.storeNameSettings);
                const request = store.put(setting);

                request.onsuccess = () => {
                    resolve();
                };

                request.onerror = () => {
                    reject('Save Setting error: ' + request.error);
                };
            } else {
                reject('Database is not initialized.');
            }
        });
    }

}
