import React from 'react';
import { Task } from '../models/Task';
import contexts from '../models/Contexts';
import './TaskManager.css';
import FolderIcon from './icons/FolderIcon';
import TagIcon from './icons/TagIcon';
import StarIcon from './icons/StarIcon';
import MinusIcon from './icons/MinusIcon';
import PriorityBarIcon from './icons/PriorityBar';

interface TaskListProps {
  displayedActiveTasks: Task[];
  selectedTask: Task | null;
  selectedBox: 'inbox' | 'starred' | 'done' | null;
  selectedTag: string | null;
  selectedContext: string | null;
  onTaskClick: (task: Task) => void;
  onToggleCompleted: (task: Task) => void;
  onToggleStarred: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  displayedActiveTasks,
  selectedTask,
  selectedBox,
  selectedTag,
  selectedContext,
  onTaskClick,
  onToggleCompleted,
  onToggleStarred,
}) => {
  const tasks = displayedActiveTasks.sort(taskSortComparator);

  return (
    <>
      <h2 className="box-title">
        {selectedTag ?
          (selectedTag === 'no-tags') ?
            <MinusIcon title={'No tags'} /> :
            (selectedTag === 'no-context') ?
              <MinusIcon title={'No context'} /> :
                <TagIcon title={selectedTag} /> :
              (selectedBox === 'inbox') ?
                <FolderIcon title="Inbox" /> :
                (selectedBox === 'starred') ?
                  <StarIcon title="Starred" isFilled={true} /> :
              ''
        }
      </h2>
      <ul className="task-list card">
        {tasks.length === 0 && <li className="empty">No active tasks</li>}
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`task-item ${selectedTask?.id === task.id ? 'selected' : ''}`}
            onClick={() => onTaskClick(task)}
          >
            <div className="task-main">
              <PriorityBarIcon
                title=""
                priority={task.priority}
                ariaLabel={`${task.priority ?
                  task.priority.charAt(0).toUpperCase() + task.priority.slice(1) + ' Priority Task' :
                  'No Priority Task'}`} />

              <input
                type="checkbox"
                aria-labelledby={`task-label-${task.id}`}
                checked={task.completed}
                onChange={(e) => {
                  e.stopPropagation();
                  onToggleCompleted(task);
                }}
              />

              <span id={`task-label-${task.id}`} className="task-title">{task.title}</span>
              {task.description && <span className="task-desc">...</span>}

              <span className="task-actions">

                {selectedContext === 'anywhere' && task.context && task.context !== 'anywhere' && (
                  <span className="task-context">
                    <span className="context-label badge weak"
                      title={contexts.find(x => x.id === task.context)?.name}
                    >{contexts.find(x => x.id === task.context)?.symbol}</span>
                  </span>
                )}

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


const taskSortComparator = (a: Task, b: Task) => {
  const priorityA = a.priority === 'high' ? 3 :
                    a.priority === 'medium' ? 2 :
                    a.priority === 'low' ? 1 : 0;

  const priorityB = b.priority === 'high' ? 3 :
                    b.priority === 'medium' ? 2 :
                    b.priority === 'low' ? 1 : 0;

  if (priorityA !== priorityB) {
    return priorityB - priorityA;
  }

  const dateA = new Date(a.updatedDate).getTime();
  const dateB = new Date(b.updatedDate).getTime();

  return dateB - dateA;

};

export default TaskList;
