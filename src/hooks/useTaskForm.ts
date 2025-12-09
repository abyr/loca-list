import { useState, useEffect } from 'react';
import { Task } from '../models/Task';

export const useTaskForm = (
  initialTask: Task | null,
  onSubmit: (payload: { title: string; description: string; completed?: boolean }) => void
) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description ?? '');
      setCompleted(initialTask.completed ?? false);
    } else {
      setTitle('');
      setDescription('');
      setCompleted(false);
    }
  }, [initialTask]);

  const reset = () => {
    setTitle('');
    setDescription('');
    setCompleted(false);
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), description: description.trim(), completed });
    reset();
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    completed,
    setCompleted,
    reset,
    handleSubmit,
  };
};
