import { useState, useCallback } from 'react';
import taskDAO from '../db/TaskDAO';
import { Task } from '../models/Task';


export const useTaskDB = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const loadTasks = useCallback(async () => {
    try {
      const loaded = await taskDAO.getAllTasks();
      setTasks(loaded);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const addTask = useCallback(
    async (task: Omit<Task, 'id'>) => {
      try {
        await taskDAO.createTask(task as Omit<Task, 'id'>);
        await loadTasks();
      } catch (e) {
        console.error(e);
      }
    },
    [loadTasks]
  );

  const updateTask = useCallback(
    async (task: Task) => {
      try {
        await taskDAO.updateTask(task);
        await loadTasks();
      } catch (e) {
        console.error(e);
      }
    },
    [loadTasks]
  );

  const deleteTask = useCallback(
    async (taskId: number) => {
      try {
        await taskDAO.deleteTask(taskId);
        await loadTasks();
      } catch (e) {
        console.error(e);
      }
    },
    [loadTasks]
  );

  const deleteAllTasks = useCallback(
    async () => {
      try {
        // No DAO method for deleteAllTasks on purpose; use getAllTasks + delete
        const all = await taskDAO.getAllTasks();
        await Promise.all(all.map(t => t.id ? taskDAO.deleteTask(t.id) : Promise.resolve()));
        await loadTasks();
      } catch (e) {
        console.error(e);
      }
    },
    [loadTasks]
  );

  return { tasks, loadTasks, addTask, updateTask, deleteTask, deleteAllTasks };
};
