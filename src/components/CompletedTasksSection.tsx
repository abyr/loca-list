import React from 'react';
import { Task } from '../models/Task';
import './TaskManager.css';

interface CompletedTasksSectionProps {
  displayedCompletedTasks: Task[];
  completedTasks: Task[];
  selectedBox: 'inbox' | 'starred' | 'done' | null;
  onTaskSelect: (task: Task) => void;
  onDeleteAll: () => void;
}

const CompletedTasksSection: React.FC<CompletedTasksSectionProps> = ({
  displayedCompletedTasks,
  completedTasks,
  selectedBox,
  onTaskSelect,
  onDeleteAll,
}) => {
  if (selectedBox === 'done') {
    return (
      <div className="done-block">
        <h2 className="box-title">Done</h2>
        <div className='box-actions'>
          <button
            className="delete-all-btn"
            onClick={onDeleteAll}
            disabled={completedTasks.length === 0}
          >
            Delete all completed tasks
          </button>
        </div>
        <div className="completed-list">
          {completedTasks.length === 0 ? (
            <div className="empty">No completed tasks</div>
          ) : (
            <ul>
              {completedTasks.map(ct => (
                <li
                  key={ct.id}
                  className="completed-item"
                  onClick={() => onTaskSelect(ct)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onTaskSelect(ct);
                    }
                  }}
                >
                  <div className="completed-title">{ct.title}</div>
                  {ct.description && <div className="completed-desc">{ct.description}</div>}
                  <div className="completed-meta">Completed: {new Date(ct.updatedDate).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  if (displayedCompletedTasks.length === 0) return null;

  return (
    <div className="completed-block">
      <div className="completed-list">
        <ul>
          {displayedCompletedTasks.map(ct => (
            <li
              key={ct.id}
              className="completed-item"
              onClick={() => onTaskSelect(ct)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onTaskSelect(ct);
                }
              }}
            >
              <div className="completed-title">{ct.title}</div>
              {ct.description && <div className="completed-desc">{ct.description}</div>}
              <div className="completed-meta">Completed: {new Date(ct.updatedDate).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CompletedTasksSection;
