import DbCoordinator from './DbCoordinator';
import { TaskTimeEntry } from '../models/TaskTimeEntry';

/**
 * Simple DAO that encapsulates task time entry-related IndexedDB operations.
 * It wraps the existing `LocaListDB` implementation and exposes
 * a concise API: initDB, createTimeEntry, updateTimeEntry, deleteTimeEntry, getAllTimeEntries.
 */
export class TaskTimeEntryDAO {
    private db = new DbCoordinator();

    async initDB(): Promise<void> {
        // Ensure the underlying DB is initialized by invoking a harmless call
        await this.db.getAllTimeEntries();
    }

    async createTimeEntry(timeEntry: Omit<TaskTimeEntry, 'id'>): Promise<number> {
        return this.db.addTimeEntry(timeEntry as TaskTimeEntry);
    }

    async updateTimeEntry(timeEntry: TaskTimeEntry): Promise<void> {
        return this.db.updateTimeEntry(timeEntry);
    }

    async deleteTimeEntry(id: number): Promise<void> {
        return this.db.deleteTimeEntry(id);
    }

    // Convenience passthrough for callers that need to list time entries
    async getAllTimeEntries(): Promise<TaskTimeEntry[]> {
        return this.db.getAllTimeEntries();
    }
}

const taskTimeEntryDAO = new TaskTimeEntryDAO();
export default taskTimeEntryDAO;
