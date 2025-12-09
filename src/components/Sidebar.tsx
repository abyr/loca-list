import React from 'react';
import { Task } from '../models/Task';
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

  return (
    <div className={`sidebar`} onClick={(e) => e.stopPropagation()}>
      <div className="search-block">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <span className="search-icon">🔍</span>
      </div>
      <ul className="box-list">
        <li
          className={`box-item ${selectedBox === 'inbox' && !selectedTag ? 'active' : ''}`}
          onClick={() => { onBoxSelect('inbox'); onTagSelect(null); }}
        >
          Inbox {activeTasks.length > 0 && <span className="badge">{activeTasks.length}</span>}
        </li>
        <li
          className={`box-item ${selectedBox === 'starred' && !selectedTag ? 'active' : ''}`}
          onClick={() => { onBoxSelect('starred'); onTagSelect(null); }}
        >
          Starred {starredTasks.length > 0 && <span className="badge">{starredTasks.length}</span>}
        </li>
        <li
          className={`box-item ${selectedBox === 'done' && !selectedTag ? 'active' : ''}`}
          onClick={() => { onBoxSelect('done'); onTagSelect(null); }}
        >
          Done {completedTasks.length > 0 && <span className="badge">{completedTasks.length}</span>}
        </li>

        {uniqueTags.length > 0 && <li className="tag-divider"></li>}

        {uniqueTags.map(tag => (
          <li
            key={tag}
            className={`box-item tag-item ${selectedTag === tag ? 'active' : ''}`}
            onClick={() => { onTagSelect(tag); onBoxSelect('inbox'); }}
          >
            #{tag} {getTagCount(tag) > 0 && <span className="badge">{getTagCount(tag)}</span>}
          </li>
        ))}

        {uniqueTags.length > 0 && <li className="tag-divider"></li>}

        <li
          className={`box-item tag-missed ${selectedTag === 'no-tags' ? 'active' : ''}`}
          onClick={() => { onTagSelect('no-tags'); onBoxSelect('inbox'); }}
        >
          No tags {getNoTagsCount() > 0 && <span className="badge">{getNoTagsCount()}</span>}
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
