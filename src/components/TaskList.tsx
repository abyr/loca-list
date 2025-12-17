import React from 'react';
import { Task } from '../models/Task';
import './TaskManager.css';
import FolderIcon from './icons/FolderIcon';
import TagIcon from './icons/TagIcon';
import StarIcon from './icons/StarIcon';
import MinusIcon from './icons/MinusIcon';

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
          (selectedTag === 'no-tags') ?
            <MinusIcon title={'No tags'} /> :
            <TagIcon title={selectedTag} /> :
          (selectedBox === 'inbox') ?
            <FolderIcon title="Inbox" /> :
            (selectedBox === 'starred') ?
              <StarIcon title="Starred" isFilled={true} /> :
              ''
        }
      </h2>
      <ul className="task-list card">
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
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStarred(task);
                  }}
                  aria-label={task.starred ? 'Unstar task' : 'Star task'}
                >
                  <StarIcon
                    ariaLabel={task.starred ? 'Unstar task' : 'Star task'}
                    isFilled={task.starred}
                    size={16}
                  />
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
