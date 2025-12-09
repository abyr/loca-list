import React, { useEffect, useState } from 'react';
import { Task } from '../models/Task';
import { useTaskDB } from '../hooks/useTaskDB';
import { useTaskForm } from '../hooks/useTaskForm';
import { useTaskFilter } from '../hooks/useTaskFilter';
import './TaskManager.css';


const TaskManager: React.FC = () => {

  const {
    tasks,
    feedback,
    loadTasks,
    addTask,
    updateTask,
    deleteTask,
  } = useTaskDB();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [visibleFeedback, setVisibleFeedback] = useState<string | null>(null);
  const [selectedBox, setSelectedBox] = useState<'inbox' | 'starred' | 'done' | null>('inbox');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    if (!feedback) {
      setVisibleFeedback(null);
      return;
    }
    setVisibleFeedback(feedback);
    const t = setTimeout(() => setVisibleFeedback(null), 10 * 1000);
    return () => clearTimeout(t);
  }, [feedback]);

  const {
    title: addTitle,
    setTitle: setAddTitle,
    reset: resetAddForm,
    handleSubmit: submitAdd,
  } = useTaskForm(null, async ({ title, description }) => {
    await addTask({
      title,
      description,
      createdDate: Date.now(),
      updatedDate: Date.now(),
      completed: false,
      deleted: false,
      starred: false, // Ensure starred is set to false when adding a new task
    });
    resetAddForm();
  });

  const {
    title: editTitle,
    setTitle: setEditTitle,
    description: editDesc,
    setDescription: setEditDesc,
    reset: resetEditForm,
    handleSubmit: submitEdit,
  } = useTaskForm(selectedTask, async ({ title, description }) => {
    if (editingTaskId === null) return;
    const original = selectedTask ?? tasks.find(t => t.id === editingTaskId);
    await updateTask({
      id: editingTaskId,
      title,
      description,
      createdDate: original?.createdDate ?? Date.now(),
      updatedDate: Date.now(),
      completed: original?.completed ?? false,
      deleted: original?.deleted ?? false,
      starred: original?.starred ?? false, // Preserve starred status
    });
    setEditingTaskId(null);
    setSelectedTask(null);
    resetEditForm();
  });

  const toggleCompleted = async (task: Task) => {
    await updateTask({ ...task, completed: !task.completed, updatedDate: Date.now() });
    if (selectedTask?.id === task.id) {
      setSelectedTask({ ...task, completed: !task.completed });
    }
  };

  const toggleStarred = async (task: Task) => {
    await updateTask({ ...task, starred: !task.starred, updatedDate: Date.now() });
    if (selectedTask?.id === task.id) {
      setSelectedTask({ ...task, starred: !task.starred });
    }
  };

  const startEditFromDetails = () => {
    if (!selectedTask) return;
    setEditingTaskId(selectedTask.id ?? null);
  };

  const handleClickTask = (task: Task) => {
    if (editingTaskId !== null) return;
    if (selectedTask?.id === task.id) {
      setSelectedTask(null);
    } else {
      setSelectedTask(task);
    }
  }

  const handleCloseDetails = () => {
    resetEditForm();
    setEditingTaskId(null);
    setSelectedTask(null);
  }

  const deleteAllCompleted = async () => {
    const confirmed = window.confirm('Are you sure you want to delete all completed tasks? This action cannot be undone.');
    if (!confirmed) return;

    for (const task of completedTasks) {
      if (task.id) {
        await deleteTask(task.id);
      }
    }
    if (selectedTask?.completed) {
      setSelectedTask(null);
    }
  };

  const {
    active: activeTasks,
    completed: completedTasks
  } = useTaskFilter(tasks, searchTerm);

  // Determine which tasks to display based on selected box
  const starredTasks = tasks.filter(t => t.starred && !t.deleted);

  const filterTasksByTag = (taskList: Task[]) => {
    if (!selectedTag) return taskList;
    if (selectedTag === 'no-tags') {
      return taskList.filter(task => !task.title.match(/#\w+/));
    }
    return taskList.filter(task => task.title.includes(`#${selectedTag}`));
  };

  const displayedActiveTasks = selectedBox === 'done' ? [] : selectedBox === 'starred' ? filterTasksByTag(starredTasks) : filterTasksByTag(activeTasks.sort((a, b) => {
    if (a.starred === b.starred) return 0;
    return a.starred ? -1 : 1;
  }));
  const displayedCompletedTasks = selectedBox === 'done' ? filterTasksByTag(completedTasks) : [];

  // Extract unique hashtags from all tasks
  const extractHashtags = (text: string) => {
    const matches = text.match(/#\w+/g) || [];
    return matches.map(tag => tag.substring(1)); // Remove the # symbol
  };

  const allTags = new Set<string>();
  tasks.forEach(task => {
    extractHashtags(task.title).forEach(tag => allTags.add(tag));
  });
  const uniqueTags = Array.from(allTags).sort();

  const getTagCount = (tag: string) => {
    return tasks.filter(task => task.title.includes(`#${tag}`) && !task.deleted).length;
  };

  const getNoTagsCount = () => {
    return tasks.filter(task => !task.title.match(/#\w+/) && !task.deleted).length;
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSidebarOpen(s => !s);
  };

  const handleToggleKeyDown = (e: React.KeyboardEvent, fn: (e?: React.MouseEvent) => void) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    fn((e as unknown) as React.MouseEvent);
  }
};

  return (
    <div className={`wrapper ${sidebarOpen ? 'sidebar-open' : ''}`} onClick={() => setSidebarOpen(false)}>
      <div className={`sidebar`} onClick={(e) => e.stopPropagation()}>
        <div className="search-block">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span> {/* Unicode character for magnifying glass */}
        </div>
        <ul className="box-list">
          <li
            className={`box-item ${selectedBox === 'inbox' && !selectedTag ? 'active' : ''}`}
            onClick={() => { setSelectedBox('inbox'); setSelectedTag(null); }}
          >
            Inbox {activeTasks.length > 0 && <span className="badge">{activeTasks.length}</span>}
          </li>
          <li
            className={`box-item ${selectedBox === 'starred' && !selectedTag ? 'active' : ''}`}
            onClick={() => { setSelectedBox('starred'); setSelectedTag(null); }}
          >
            Starred {starredTasks.length > 0 && <span className="badge">{starredTasks.length}</span>}
          </li>
          <li
            className={`box-item ${selectedBox === 'done' && !selectedTag ? 'active' : ''}`}
            onClick={() => { setSelectedBox('done'); setSelectedTag(null); }}
          >
            Done {completedTasks.length > 0 && <span className="badge">{completedTasks.length}</span>}
          </li>

          {uniqueTags.length > 0 && <li className="tag-divider"></li>}

          {uniqueTags.map(tag => (
            <li
              key={tag}
              className={`box-item tag-item ${selectedTag === tag ? 'active' : ''}`}
              onClick={() => { setSelectedTag(tag); setSelectedBox('inbox'); }}
            >
              #{tag} {getTagCount(tag) > 0 && <span className="badge">{getTagCount(tag)}</span>}
            </li>
          ))}

          {uniqueTags.length > 0 && <li className="tag-divider"></li>}

          <li
            className={`box-item tag-missed ${selectedTag === 'no-tags' ? 'active' : ''}`}
            onClick={() => { setSelectedTag('no-tags'); setSelectedBox('inbox'); }}
          >
            No tags {getNoTagsCount() > 0 && <span className="badge">{getNoTagsCount()}</span>}
          </li>
        </ul>
      </div>

      <div className={`task-manager ${selectedTask ? 'two-column' : 'one-column'}`}>

        <div className="columns">
          <aside className="col left">
            <div className="left-navigation-bar">
              <li>
                <button
                  className="nav-sidebar"
                  onClick={(e) => { e.stopPropagation(); toggleSidebar(e); }}
                  onKeyDown={(e) => handleToggleKeyDown(e, toggleSidebar)}
                  aria-expanded={sidebarOpen}
                  aria-controls="sidebar"
                  aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                  type="button"
                >
                  Sidebar
                </button>

              </li>

            </div>
            <div className="left-header">

              <div className="add-task-block">
                <input
                  type="text"
                  placeholder="New task title"
                  value={addTitle}
                  onChange={e => setAddTitle(e.target.value)}
                />
                <button onClick={submitAdd}>Add</button>
              </div>

            </div>

            {selectedBox === 'done' && (
              <div className="done-block">
                <h2 className="box-title">Done</h2>
                <button
                  className="delete-all-btn"
                  onClick={deleteAllCompleted}
                  disabled={completedTasks.length === 0}
                >
                  Delete all completed tasks
                </button>
                <div className="completed-list">
                  {completedTasks.length === 0 ? (
                    <div className="empty">No completed tasks</div>
                  ) : (
                    <ul>
                      {completedTasks.map(ct => (
                        <li
                          key={ct.id}
                          className="completed-item"
                          onClick={() => {
                            setSelectedTask(ct);
                            setEditingTaskId(null);
                          }}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setSelectedTask(ct);
                              setEditingTaskId(null);
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
            )}

            {selectedBox !== 'done' && (
              <>
                <h2 className="box-title">
                  {selectedBox === 'inbox' ? 'Inbox' : selectedBox === 'starred' ? 'Starred' : 'Active Tasks'}
                </h2>
                <ul className="task-list">
                  {displayedActiveTasks.length === 0 && <li className="empty">No active tasks</li>}
                  {displayedActiveTasks.map((task) => (
                    <li
                      key={task.id}
                      className={`task-item ${selectedTask?.id === task.id ? 'selected' : ''}`}
                      onClick={() => handleClickTask(task)}

                    >
                      <div className="task-main">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleCompleted(task);
                          }}
                        />
                        <span className="task-title">{task.title}</span>
                        {task.description && <span className="task-desc">...</span>}
                        <span className="task-actions">
                          <button
                            className="star-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStarred(task);
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
            )}

            <div className="completed-block">
              {selectedBox !== 'done' && displayedCompletedTasks.length > 0 && (
                <div className="completed-list">
                  <ul>
                    {displayedCompletedTasks.map(ct => (
                      <li
                        key={ct.id}
                        className="completed-item"
                        onClick={() => {
                          setSelectedTask(ct);
                          setEditingTaskId(null);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedTask(ct);
                            setEditingTaskId(null);
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
              )}
            </div>
          </aside>

          {selectedTask ? (
            <section className="col right">
              <div className="details">
                <div className="detail-row"><strong>Title:</strong> {selectedTask.title}</div>
                <div className="detail-row"><strong>Description:</strong> {selectedTask.description || <em>No description</em>}</div>
                <div className="detail-row"><strong>Completed:</strong> {selectedTask.completed ? 'Yes' : 'No'}</div>
                <div className="detail-row"><strong>Starred:</strong> {selectedTask.starred ? 'Yes' : 'No'}</div>
                <div className="detail-row"><strong>Created:</strong> {new Date(selectedTask.createdDate).toLocaleString()}</div>
                <div className="detail-row"><strong>Updated:</strong> {new Date(selectedTask.updatedDate).toLocaleString()}</div>

                <div className="details-actions">
                  <button onClick={() => handleCloseDetails()}>Close</button>
                  <button onClick={startEditFromDetails}>Edit</button>
                </div>

                {editingTaskId !== null && (
                  <div className="edit-form">
                    <h3>Edit Task</h3>
                    <input
                      type="text"
                      placeholder="Title"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <textarea
                      placeholder="Description"
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                    />
                    <div className="edit-buttons">
                      <button onClick={submitEdit}>Save</button>
                      <button
                        onClick={() => {
                          handleCloseDetails()
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          ) : ''}
        </div>

        {visibleFeedback && <div className="feedback">{visibleFeedback}</div>}

      </div>
    </div>
  );
};

export default TaskManager;