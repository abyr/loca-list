import React from 'react';
import { Task } from '../models/Task';
import { useTaskDB } from '../hooks/useTaskDB';
import FolderIcon from './icons/FolderIcon';
import TagIcon from './icons/TagIcon';
import StarIcon from './icons/StarIcon';
import CheckIcon from './icons/CheckIcon';
import MinusIcon from './icons/MinusIcon';
import './TaskManager.css';

interface SidebarProps {
  tasks: Task[];
  activeTasks: Task[];
  completedTasks: Task[];
  starredTasks: Task[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedBox: 'inbox' | 'starred' | 'done' | null;
  onBoxSelect: (box: 'inbox' | 'starred' | 'done') => void;
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  tasks,
  activeTasks,
  completedTasks,
  starredTasks,
  searchTerm,
  onSearchChange,
  selectedBox,
  onBoxSelect,
  selectedTag,
  onTagSelect,
  sidebarOpen,
  onToggleSidebar,
}) => {
  const extractHashtags = (text: string) => {
    const matches = text.match(/#\w+/g) || [];
    return matches.map(tag => tag.substring(1));
  };

  const {
      addTask,
      deleteAllTasks,
    } = useTaskDB();

  const allTags = new Set<string>();
  tasks.forEach(task => {
    extractHashtags(task.title).forEach(tag => allTags.add(tag));
  });
  const uniqueTags = Array.from(allTags).sort();

  const getTagCount = (tag: string) => {
    return tasks.filter(task => task.title.includes(`#${tag}`) && !task.deleted && !task.completed).length;
  };

  const getNoTagsCount = () => {
    return tasks.filter(task => !task.title.match(/#\w+/) && !task.deleted && !task.completed).length;
  };

  const importTasks = () => {
    const input = document.createElement('input');

    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const importedTasks: Task[] = JSON.parse(event.target?.result as string);

          await deleteAllTasks();

          importedTasks.forEach(task => {
            addTask(task);
          });

          window.location.reload();

        } catch (error) {
          console.error('Error parsing imported tasks:', error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  const exportTasks = (tasks: Task[]) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchorNode = document.createElement('a');
    const isoDateTime = new Date().toISOString().slice(0,19).replace(/:/g,"-");

    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `loca-list-tasks-${isoDateTime}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  return (
    <div className={`sidebar`} onClick={(e) => e.stopPropagation()}>

      <div className="sidebar-header">
        <div className="search-block">
          <input
            id="search-tasks-input"
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      <div className="sidebar-body">
        <ul className="box-list">
          <li
            className={`box-item ${selectedBox === 'inbox' && !selectedTag ? 'active' : ''}`}
            onClick={() => { onBoxSelect('inbox'); onTagSelect(null); }}
          >
            <FolderIcon title="Inbox" />
            {activeTasks.length > 0 && <span className="badge">{activeTasks.length}</span>}
          </li>
          <li
            className={`box-item ${selectedBox === 'starred' && !selectedTag ? 'active' : ''}`}
            onClick={() => { onBoxSelect('starred'); onTagSelect(null); }}
          >
            <StarIcon title="Starred" isFilled={true} />
            {starredTasks.length > 0 && <span className="badge">{starredTasks.length}</span>}
          </li>
          <li
            className={`box-item ${selectedBox === 'done' && !selectedTag ? 'active' : ''}`}
            onClick={() => { onBoxSelect('done'); onTagSelect(null); }}
          >
            <CheckIcon title="Done" isChecked={true} />
            {completedTasks.length > 0 && <span className="badge">{completedTasks.length}</span>}
          </li>

          {uniqueTags.length > 0 && <li className="tag-divider"></li>}

          {uniqueTags.map(tag => (
            <li
              key={tag}
              className={`box-item tag-item ${selectedTag === tag ? 'active' : ''}`}
              onClick={() => { onTagSelect(tag); onBoxSelect('inbox'); }}
            >
              <TagIcon title={tag} />
              {getTagCount(tag) > 0 && <span className="badge">{getTagCount(tag)}</span>}
            </li>
          ))}

          {uniqueTags.length > 0 && <li className="tag-divider"></li>}

          <li
            className={`box-item tag-missed ${selectedTag === 'no-tags' ? 'active' : ''}`}
            onClick={() => { onTagSelect('no-tags'); onBoxSelect('inbox'); }}
          >
            <MinusIcon title="No tags" />
            {getNoTagsCount() > 0 && <span className="badge">{getNoTagsCount()}</span>}
          </li>
        </ul>
      </div>
      <div className='sidebar-divider'></div>
      <div className='sidebar-footer'>
        <ul>
          <li>
            <button className="export-tasks-btn" onClick={() => { exportTasks(tasks); }}>
              Export Tasks
            </button>
          </li>
          <li>
            <button className="import-tasks-btn" onClick={() => {
              const confirmed = window.confirm('Importing tasks will DELETE ALL your current tasks. Continue?')

              if (confirmed) {
                importTasks();
              }
            }}>
              Import Tasks
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
