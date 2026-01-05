import { useState, useCallback } from 'react';
import taskTimeEntryDAO from '../db/TaskTimeEntryDAO';
import { TaskTimeEntry } from '../models/TaskTimeEntry';

export const useTaskTimeEntriesDB = () => {
  const [timeEntries, setTimeEntries] = useState<TaskTimeEntry[]>([]);

  const loadTimeEntries = useCallback(async () => {
    try {
      const loaded = await taskTimeEntryDAO.getAllTimeEntries();
      setTimeEntries(loaded);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const startTask = useCallback(async (taskId: number) => {
    const newTimeEntry: Omit<TaskTimeEntry, 'id'> = {
      taskId,
      started: Date.now(),
      // stopped is omitted as the task is starting
    };
    try {
      await taskTimeEntryDAO.createTimeEntry(newTimeEntry);
      await loadTimeEntries();
    } catch (e) {
      console.error(e);
    }
  }, [loadTimeEntries]);

  const pauseTask = useCallback(async (taskId: number) => {
    try {
      const entries = await taskTimeEntryDAO.getAllTimeEntries();
      const ongoingEntry = entries.find(entry => entry.taskId === taskId && !entry.stopped);

      if (ongoingEntry) {
        ongoingEntry.stopped = Date.now();
        await taskTimeEntryDAO.updateTimeEntry(ongoingEntry);
      }
      await loadTimeEntries();
    } catch (e) {
      console.error(e);
    }
  }, [loadTimeEntries]);

  const isTaskStarted = useCallback(async (taskId: number): Promise<boolean> => {
    try {
      const entries = await taskTimeEntryDAO.getAllTimeEntries();
      return entries.some(entry => entry.taskId === taskId && !entry.stopped);
    } catch (e) {
      console.error(e);
      return false;
    }
  }, []);

  return { timeEntries, loadTimeEntries, startTask, pauseTask, isTaskStarted };
};
