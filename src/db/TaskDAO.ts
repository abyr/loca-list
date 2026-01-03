import DbCoordinator from './DbCoordinator';
import { Task } from '../models/Task';

/**
 * Simple DAO that encapsulates task-related IndexedDB operations.
 * It wraps the existing `LocaListDB` implementation and exposes
 * a concise API: initDB, createTask, updateTask, deleteTask, moveTasksToGroup.
 */
export class TaskDAO {
  private db = new DbCoordinator();

  async initDB(): Promise<void> {
    // Ensure the underlying DB is initialized by invoking a harmless call
    await this.db.getAllTasks();
  }

  async createTask(task: Omit<Task, 'id'>): Promise<number> {
    return this.db.addTask(task as Task);
  }

  async updateTask(task: Task): Promise<void> {
    return this.db.updateTask(task);
  }

  async deleteTask(id: number): Promise<void> {
    return this.db.deleteTask(id);
  }

  /**
   * Move a set of tasks to a named group (e.g. change `context`).
   * This loads current tasks and updates matching ones.
   */
  async moveTasksToGroup(taskIds: number[], groupId: string): Promise<void> {
    const all = await this.db.getAllTasks();
    const toUpdate = all.filter(t => t.id !== undefined && taskIds.indexOf(t.id) !== -1);
    await Promise.all(
      toUpdate.map(t => this.db.updateTask({ ...t, context: groupId, updatedDate: Date.now() }))
    );
  }

  // Convenience passthrough for callers that need to list tasks
  async getAllTasks(): Promise<Task[]> {
    return this.db.getAllTasks();
  }
}

const taskDAO = new TaskDAO();
export default taskDAO;
