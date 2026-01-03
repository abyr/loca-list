import { useState, useCallback } from 'react';
import { LocaListDB } from '../db/LocaListDB';
import { Task } from '../models/Task';

const locaListDB = new LocaListDB();

export const useTaskDB = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const loadTasks = useCallback(async () => {
    try {
      const loaded = await locaListDB.getAllTasks();
      setTasks(loaded);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const addTask = useCallback(
    async (task: Omit<Task, 'id'>) => {
      try {
        await locaListDB.addTask(task);
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
        await locaListDB.updateTask(task);
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
        await locaListDB.deleteTask(taskId);
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
        await locaListDB.deleteAllTasks();
        await loadTasks();
      } catch (e) {
        console.error(e);
      }
    },
    [loadTasks]
  );

  return { tasks, loadTasks, addTask, updateTask, deleteTask, deleteAllTasks };
};
