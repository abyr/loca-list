import { useState, useCallback } from 'react';
import { TaskDB } from '../db/TaskDB';
import { Task } from '../models/Task';

const taskDB = new TaskDB();

export const useTaskDB = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      const loaded = await taskDB.getAllTasks();
      setTasks(loaded);
    } catch (e) {
      console.error(e);
      setFeedback('Failed to load tasks.');
    }
  }, []);

  const addTask = useCallback(
    async (task: Omit<Task, 'id'>) => {
      try {
        await taskDB.addTask(task);
        setFeedback('Task added successfully!');
        await loadTasks();
      } catch (e) {
        console.error(e);
        setFeedback('Failed to add task.');
      }
    },
    [loadTasks]
  );

  const updateTask = useCallback(
    async (task: Task) => {
      try {
        await taskDB.updateTask(task);
        setFeedback('Task updated successfully!');
        await loadTasks();
      } catch (e) {
        console.error(e);
        setFeedback('Failed to update task.');
      }
    },
    [loadTasks]
  );

  const deleteTask = useCallback(
    async (taskId: number) => {
      try {
        await taskDB.deleteTask(taskId);
        setFeedback('Task deleted successfully!');
        await loadTasks();
      } catch (e) {
        console.error(e);
        setFeedback('Failed to delete task.');
      }
    },
    [loadTasks]
  );

  const deleteAllTasks = useCallback(
    async () => {
      try {
        await taskDB.deleteAllTasks();
        setFeedback('All tasks deleted successfully!');
        await loadTasks();
      } catch (e) {
        console.error(e);
        setFeedback('Failed to delete all tasks.');
      }
    },
    [loadTasks]
  );

  return { tasks, feedback, loadTasks, addTask, updateTask, deleteTask, deleteAllTasks, setFeedback };
};
