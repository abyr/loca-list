import { Task } from '../models/Task';
import { Setting } from '../models/Setting';

export class LocaListDB {
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
                const db = request.result;
                if (!db.objectStoreNames.contains(this.storeNameTasks)) {
                    db.createObjectStore(this.storeNameTasks, { keyPath: this.storeKeyTask, autoIncrement: true });
                }
                if (!db.objectStoreNames.contains(this.storeNameSettings)) {
                    db.createObjectStore(this.storeNameSettings, { keyPath: this.storeKeySetting });
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

export default LocaListDB;
