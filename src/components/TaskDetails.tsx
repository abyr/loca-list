import React from 'react';
import { Task } from '../models/Task';
import './TaskManager.css';

interface TaskDetailsProps {
  selectedTask: Task | null;
  editingTaskId: number | null;
  editTitle: string;
  editDesc: string;
  editCompleted: boolean;
  editPriority: '' | 'low' | 'medium' | 'high';
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onEditTitleChange: (title: string) => void;
  onEditDescChange: (desc: string) => void;
  onEditCompletedChange: (completed: boolean) => void;
  onEditPriorityChange: (priority: '' | 'low' | 'medium' | 'high') => void;
  onSave: () => void;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({
  selectedTask,
  editingTaskId,
  editTitle,
  editDesc,
  editCompleted,
  editPriority,
  onClose,
  onEdit,
  onDelete,
  onEditTitleChange,
  onEditDescChange,
  onEditCompletedChange,
  onEditPriorityChange,
  onSave,
}) => {
  if (!selectedTask) return null;

  return (
    <section className="col right">
      <div className="details card">
        <div className="detail-row"><strong>Title:</strong> {selectedTask.title}</div>
        <div className="detail-row"><strong>Starred:</strong> {selectedTask.starred ? 'Yes' : 'No'}</div>
        <div className="detail-row"><strong>Priority:</strong> {selectedTask.priority || 'None'}</div>
        <div className="detail-row"><strong>Description:</strong> {selectedTask.description || <em>No description</em>}</div>
        <div className="detail-row"><strong>Created:</strong> {new Date(selectedTask.createdDate).toLocaleString()}</div>
        <div className="detail-row"><strong>Updated:</strong> {new Date(selectedTask.updatedDate).toLocaleString()}</div>

        <div className="details-actions">
          <button onClick={onClose}>Close</button>
          <button onClick={onEdit}>Edit</button>
          <button className="danger" onClick={onDelete}>Delete</button>
        </div>

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
              <option value="low" selected={editPriority === 'low'}>Low Priority</option>
              <option value="medium" selected={editPriority === 'medium'}>Medium Priority</option>
              <option value="high" selected={editPriority === 'high'}>High Priority</option>
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
