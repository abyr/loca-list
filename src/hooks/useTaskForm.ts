import { useState, useEffect } from 'react';
import { Task } from '../models/Task';

export const useTaskForm = (
  initialTask: Task | null,
  doSubmit: (payload: {
    title: string;
    description: string;
    completed?: boolean;
    priority?: '' | 'low' | 'medium' | 'high';
    context?: string
  }) => void
) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [completed, setCompleted] = useState(false);
  const [priority, setPriority] = useState<'' | 'low' | 'medium' | 'high'>('');
  const [context, setContext] = useState('');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description ?? '');
      setCompleted(initialTask.completed ?? false);
      setPriority(initialTask.priority ?? '');
    } else {
      setTitle('');
      setDescription('');
      setCompleted(false);
      setPriority('');
    }
  }, [initialTask]);

  const reset = () => {
    setTitle('');
    setDescription('');
    setCompleted(false);
    setPriority('');
  };

  const onSubmit = () => {
    if (!title.trim()) return;
    doSubmit({
      title: title.trim(),
      description: description.trim(),
      completed,
      priority
    });
    reset();
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    completed,
    setCompleted,
    priority,
    setPriority,
    context,
    setContext,
    reset,
    onSubmit,
  };
};
