import React, { useState, useEffect } from 'react';
import { Task } from '../models/Task';
import contexts from '../models/Contexts';
import TaskTimeEntries from './TaskTimeEntries';
import './TaskManager.css';
import StarIcon from './icons/StarIcon';

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
  onTimeEntriesChange: () => void;
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
  onTimeEntriesChange,
}) => {

  const [isDescriptionOpen, setDescriptionOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('general');

  // Reset active tab when selected task changes (optional)
  useEffect(() => {
    setActiveTab('general');
  }, [selectedTask]);

  if (!selectedTask) return null;

  return (
    <section className="col right">
      <div className="details card">

        <div className="detail-row">
          {selectedTask.starred && <StarIcon ariaLabel="Starred Task" isFilled={true} />}
          <strong>{selectedTask.title}</strong>
        </div>

        <div className="tabs-switcher">
          <div className="tabs-switchers" role="tablist">
            <div
              className={`tab-switch ${activeTab === 'general' ? 'active' : ''}`}
              tab-switch-id="general"
              role="tab"
              tabIndex={activeTab === 'general' ? 0 : -1}
              aria-selected={activeTab === 'general'}
              onClick={(e) => setActiveTab((e.currentTarget.getAttribute('tab-switch-id') || ''))}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveTab((e.currentTarget.getAttribute('tab-switch-id') || '')); }}
            >
              Description
            </div>
            <div
              className={`tab-switch ${activeTab === 'time' ? 'active' : ''}`}
              tab-switch-id="time"
              role="tab"
              tabIndex={activeTab === 'time' ? 0 : -1}
              aria-selected={activeTab === 'time'}
              onClick={(e) => setActiveTab((e.currentTarget.getAttribute('tab-switch-id') || ''))}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveTab((e.currentTarget.getAttribute('tab-switch-id') || '')); }}
            >
              Time entries
            </div>
          </div>
          <div className="tabs">
            <div className={`tab-content ${activeTab === 'general' ? 'active' : ''}`} tab-id="general">

              <div className="detail-row"><strong>Context:</strong> {contexts.find(ctx => ctx.id === selectedTask.context)?.name || 'Anywhere'}</div>
              <div className="detail-row"><strong>Priority:</strong> {selectedTask.priority || 'None'}</div>

              {!selectedTask.description && (
                <div className="detail-row">
                  <strong>Description:</strong> <em>No description</em>
                </div>
              )}

              {selectedTask.description && (
                <div className="detail-row details-desc">
                    <div>
                      <strong>Description</strong>
                      <button onClick={() => setDescriptionOpen(!isDescriptionOpen)}>
                        {isDescriptionOpen ? 'Hide' : 'Show'}
                      </button>
                    </div>

                  {isDescriptionOpen && (
                    <div className='details-desc-text'>
                      {selectedTask.description}
                    </div>
                  )}
                </div>
              )}

              {/* <div className="detail-row"><strong>Created:</strong> {new Date(selectedTask.createdDate).toLocaleString()}</div> */}
              {/* <div className="detail-row"><strong>Updated:</strong> {new Date(selectedTask.updatedDate).toLocaleString()}</div> */}

              <div className="box-list box-list-row">
                <div className="box-list-row--auto">
                  <button onClick={onClose}>Close</button>
                  <button className="accent" onClick={onEdit}>Edit</button>

                </div>
                <div className="box-list-row--initial">
                  <button className="danger" onClick={onDelete}>Delete</button>
                </div>

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
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
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

                  <div className="box-actions">
                    <button onClick={onClose}>Cancel</button>
                    <button className='accent' onClick={onSave}>Save</button>
                  </div>
                </div>
              )}

            </div>

            <div className={`tab-content ${activeTab === 'time' ? 'active' : ''}`} tab-id="time">
                {!editingTaskId && (
                  <TaskTimeEntries
                    selectedTask={selectedTask}
                    onTimeEntriesChange={onTimeEntriesChange} />
                )}
            </div>
          </div>
        </div>









      </div>
    </section>
  );
};

export default TaskDetails;
