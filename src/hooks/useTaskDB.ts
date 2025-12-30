import { useState, useCallback } from 'react';
import { TaskDB } from '../db/TaskDB';
import { Task } from '../models/Task';

const taskDB = new TaskDB();

export const useTaskDB = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const loadTasks = useCallback(async () => {
    try {
      const loaded = await taskDB.getAllTasks();
      setTasks(loaded);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const addTask = useCallback(
    async (task: Omit<Task, 'id'>) => {
      try {
        await taskDB.addTask(task);
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
        await taskDB.updateTask(task);
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
        await taskDB.deleteTask(taskId);
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
        await taskDB.deleteAllTasks();
        await loadTasks();
      } catch (e) {
        console.error(e);
      }
    },
    [loadTasks]
  );

  return { tasks, loadTasks, addTask, updateTask, deleteTask, deleteAllTasks };
};
