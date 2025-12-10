import React from 'react';
import { Task } from '../models/Task';
import './TaskManager.css';

interface TaskListProps {
  displayedActiveTasks: Task[];
  selectedTask: Task | null;
  selectedBox: 'inbox' | 'starred' | 'done' | null;
  selectedTag: string | null;
  onTaskClick: (task: Task) => void;
  onToggleCompleted: (task: Task) => void;
  onToggleStarred: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  displayedActiveTasks,
  selectedTask,
  selectedBox,
  selectedTag,
  onTaskClick,
  onToggleCompleted,
  onToggleStarred,
}) => {
  return (
    <>
      <h2 className="box-title">
        {selectedTag ?
            `#${selectedTag}` :
            (selectedBox === 'inbox') ? 'Inbox' : selectedBox === 'starred' ? 'Starred' : ''
        }
      </h2>
      <ul className="task-list">
        {displayedActiveTasks.length === 0 && <li className="empty">No active tasks</li>}
        {displayedActiveTasks.map((task) => (
          <li
            key={task.id}
            className={`task-item ${selectedTask?.id === task.id ? 'selected' : ''}`}
            onClick={() => onTaskClick(task)}
          >
            <div className="task-main">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={(e) => {
                  e.stopPropagation();
                  onToggleCompleted(task);
                }}
              />
              <span className="task-title">{task.title}</span>
              {task.description && <span className="task-desc">...</span>}

              <span className="task-actions">
                <button
                  className="star-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStarred(task);
                  }}
                  aria-label={task.starred ? 'Unstar task' : 'Star task'}
                >
                  {task.starred ? '⭐' : '☆'}
                </button>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};

export default TaskList;
