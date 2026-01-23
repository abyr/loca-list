import React, { useState, useEffect } from 'react';
import { Task } from '../models/Task';
import contexts from '../models/Contexts';
import TimeEntriesList from './TimeEntriesList';
import { useTaskTimeEntriesDB } from '../hooks/useTaskTimeEntriesDB';
import './TaskManager.css';
import StarIcon from './icons/StarIcon';
import PlayIcon from './icons/PlayIcon';
import PauseIcon from './icons/PauseIcon';

interface TaskDetailsProps {
  selectedTask: Task | null;
  editingTaskId: number | null;
  editTitle: string;
  editDesc: string;
  editCompleted: boolean;
  editPriority: '' | 'low' | 'medium' | 'high';
  editContext: string;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onEditTitleChange: (title: string) => void;
  onEditDescChange: (desc: string) => void;
  onEditCompletedChange: (completed: boolean) => void;
  onEditPriorityChange: (priority: '' | 'low' | 'medium' | 'high') => void;
  onSave: () => void;
  onEditContextChange: (context: string) => void;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({
  selectedTask,
  editingTaskId,
  editTitle,
  editDesc,
  editCompleted,
  editPriority,
  editContext,
  onClose,
  onEdit,
  onDelete,
  onEditTitleChange,
  onEditDescChange,
  onEditCompletedChange,
  onEditPriorityChange,
  onEditContextChange,
  onSave,
}) => {

  const [isDescriptionOpen, setDescriptionOpen] = useState(true);

  const {
      timeEntries,
      loadTimeEntries,
      startTask,
      pauseTask,
      isTaskStarted
    } = useTaskTimeEntriesDB();

  useEffect(() => {
          loadTimeEntries();
      }, [loadTimeEntries]);

  if (!selectedTask) return null;

  const filteredEntries = (selectedTask.id
        ? timeEntries.filter(entry => entry.taskId === selectedTask.id)
        : timeEntries
    ).sort((a, b) => b.started - a.started);

    console.log('filteredEntries', filteredEntries);

  let started = !!filteredEntries.find(x => !x.stopped);

  const toggleStarted = async (task: Task) => {
    if (!task || !task.id) {
      return;
    }

    const isStarted = await isTaskStarted(task.id);

    if (isStarted)  {
      console.log('pause');
      await pauseTask(task.id);

    } else {
      console.log('start');
      await startTask(task.id);
    }
  };

  return (
    <section className="col right">
      <div className="details card">
        <div className="detail-row">
          {selectedTask.starred && <StarIcon ariaLabel="Starred Task" isFilled={true} />}

          <strong>{selectedTask.title}</strong>
        </div>
        <div className="detail-row"><strong>Context:</strong> {contexts.find(ctx => ctx.id === selectedTask.context)?.name || 'Anywhere'}</div>
        <div className="detail-row"><strong>Priority:</strong> {selectedTask.priority || 'None'}</div>

        <div className="detail-row details-desc">
          <strong>Description:</strong>
          <button onClick={() => setDescriptionOpen(!isDescriptionOpen)}>
            {isDescriptionOpen ? 'Hide' : 'Show'}
          </button>
          {isDescriptionOpen && (
            <div>
              {selectedTask.description || <em>No description</em>}
            </div>
          )}
        </div>

        <div className="detail-row"><strong>Created:</strong> {new Date(selectedTask.createdDate).toLocaleString()}</div>
        <div className="detail-row"><strong>Updated:</strong> {new Date(selectedTask.updatedDate).toLocaleString()}</div>

        <div className="details-actions">
          <button onClick={onClose}>Close</button>
          <button onClick={onEdit}>Edit</button>
          <button className="danger" onClick={onDelete}>Delete</button>
        </div>

        <div className="details-actions">
          { started &&
            <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleStarted(selectedTask);
                }}
                aria-label='Pause task'
              >
                <PauseIcon ariaLabel='Pause task' size={16} ></PauseIcon>
              </button>
          }

          { !started &&
              <button
              onClick={(e) => {
                e.stopPropagation();
                toggleStarted(selectedTask);
              }}
              aria-label='Start task'
            >
              <PlayIcon ariaLabel='Start task' size={16} ></PlayIcon>
            </button>
          }

        </div>

        <TimeEntriesList taskId={selectedTask.id} />


        {editingTaskId !== null && (
          <div className="edit-form">
            <h3>Edit Task</h3>
            <input
              type="text"
              placeholder="Title"
              value={editTitle}
              onChange={(e) => onEditTitleChange(e.target.value)}
            />
            <textarea
              placeholder="Description"
              value={editDesc}
              onChange={(e) => onEditDescChange(e.target.value)}
            />

            {selectedTask.completed && (
              <label className="edit-checkbox-row">
                <input
                  type="checkbox"
                  aria-label="Change completed"
                  checked={editCompleted}
                  onChange={(e) => onEditCompletedChange(e.target.checked)}
                />
                <span>Completed</span>
              </label>
            )}

            <select className="edit-priority-select"
                    aria-label="Select task priority"
                    value={editPriority}
                    onChange={(e) => { onEditPriorityChange(e.target.value as '' | 'low' | 'medium' | 'high'); }}
            >
              <option value="">No Priority</option>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>

            <select className="edit-context-select"
                    aria-label="Select task context"
                    value={editContext}
                    onChange={(e) => { onEditContextChange(e.target.value); }}
            >
              {contexts.map((ctx) => (
                <option key={ctx.id}
                  value={ctx.id}
                >
                  {ctx.name}
                </option>
              ))}
            </select>

            <div className="edit-buttons">
              <button onClick={onSave}>Save</button>
              <button onClick={onClose}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TaskDetails;
