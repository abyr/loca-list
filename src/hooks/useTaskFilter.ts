import { useMemo } from 'react';
import { Task } from '../models/Task';

export const useTaskFilter = (tasks: Task[], searchTerm: string) => {
  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return tasks;
    const term = searchTerm.toLowerCase();
    return tasks.filter(
      t =>
        t.title.toLowerCase().includes(term) ||
        (t.description && t.description.toLowerCase().includes(term))
    );
  }, [tasks, searchTerm]);

  const active = filtered.filter(t => !t.completed);
  const completed = filtered
    .filter(t => t.completed)
    .sort((a, b) => (b.updatedDate ?? 0) - (a.updatedDate ?? 0));

  return { active, completed };
};
