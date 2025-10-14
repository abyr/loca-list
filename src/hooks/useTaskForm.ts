import { useState, useEffect } from 'react';
import { Task } from '../models/Task';

export const useTaskForm = (
  initialTask: Task | null,
  onSubmit: (payload: { title: string; description: string }) => void
) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description ?? '');
    } else {
      setTitle('');
      setDescription('');
    }
  }, [initialTask]);

  const reset = () => {
    setTitle('');
    setDescription('');
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), description: description.trim() });
    reset();
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    reset,
    handleSubmit,
  };
};
