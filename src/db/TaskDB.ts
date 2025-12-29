import { Task } from '../models/Task';

export class TaskDB {
    private dbName: string = 'LocaListDB';
    private storeName: string = 'Tasks';
    private db: IDBDatabase | null = null;
    private ready: Promise<void>;

    constructor() {
        this.ready = this.init();
    }

    private async init() {
        return new Promise<void>((resolve, reject) => {
            const request = indexedDB.open(this.dbName);

            request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                const db = request.result;
                db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
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

    public async addTask(task: Task): Promise<number> {
        await this.ready;
        return new Promise<number>((resolve, reject) => {
            if (this.db) {
                const transaction = this.db.transaction(this.storeName, 'readwrite');
                const store = transaction.objectStore(this.storeName);
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

    public async getAllTasks(): Promise<Task[]> {
        await this.ready;
        return new Promise<Task[]>((resolve, reject) => {
            if (this.db) {
                const transaction = this.db.transaction(this.storeName, 'readonly');
                const store = transaction.objectStore(this.storeName);
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

    public async updateTask(task: Task): Promise<void> {
        await this.ready;
        return new Promise<void>((resolve, reject) => {
            if (this.db) {
                const transaction = this.db.transaction(this.storeName, 'readwrite');
                const store = transaction.objectStore(this.storeName);
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
                const transaction = this.db.transaction(this.storeName, 'readwrite');
                const store = transaction.objectStore(this.storeName);
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
                const transaction = this.db.transaction(this.storeName, 'readwrite');
                const store = transaction.objectStore(this.storeName);
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
}
