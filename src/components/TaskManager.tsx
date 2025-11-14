import React, { useEffect, useState } from 'react';
import { Task } from '../models/Task';
import { useTaskDB } from '../hooks/useTaskDB';
import { useTaskForm } from '../hooks/useTaskForm';
import { useTaskFilter } from '../hooks/useTaskFilter';
import { useScreenWidth } from '../hooks/useScreenWidth';
import './TaskManager.css';

const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [completedCollapsed, setCompletedCollapsed] = useState(true);

  // Add near top with other useState
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Add handler (can be inline onClick too)
  const toggleSidebar = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSidebarOpen(s => !s);
  };

  const handleToggleKeyDown = (e: React.KeyboardEvent, fn: (e?: React.MouseEvent) => void) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    // cast to MouseEvent type expected by toggleSidebar
    fn((e as unknown) as React.MouseEvent);
  }
};

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

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

  const {
    active: activeTasks,
    completed: completedTasks
  } = useTaskFilter(tasks, searchTerm);

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
        <ul>
          <li>Inbox <span className="badge">8</span></li>
          <li>Starred</li>
          <li>Done</li>
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

              <div className="input-block">
                <input
                  type="text"
                  placeholder="New task title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <button onClick={handleAddTask}>Add</button>
              </div>

            </div>

            <h2>Active Tasks</h2>
            <ul className="task-list">
              {activeTasks.length === 0 && <li className="empty">No active tasks</li>}
              {activeTasks.map((task) => (
                <li
                  key={task.id}
                  className={`task-item ${selectedTask?.id === task.id ? 'selected' : ''}`}
                  onClick={(e) => {
                        e.stopPropagation();
                        selectTask(task);
                      }}
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
                  </div>
                </li>
              ))}
            </ul>

            <div className="completed-block">
              <button
                className="collapse-toggle"
                onClick={() => setCompletedCollapsed(c => !c)}
                aria-expanded={!completedCollapsed}
              >
                {completedCollapsed ? `Show completed (${completedTasks.length})` : `Hide completed (${completedTasks.length})`}
              </button>

              {!completedCollapsed && (
                <div className="completed-list">
                  {completedTasks.length === 0 ? (
                    <div className="empty">No completed tasks</div>
                  ) : (
                    <ul>
                      {completedTasks.map(ct => (
                        <li
                          key={ct.id}
                          className="completed-item"
                          onClick={() => toggleCompleted(ct)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleCompleted(ct); }}
                        >
                          <div className="completed-title">{ct.title}</div>
                          {ct.description && <div className="completed-desc">{ct.description}</div>}
                                                  <div className="completed-meta">Completed: {new Date(ct.updatedDate).toLocaleString()}</div>
                        </li>
                      ))}
                    </ul>
                  )}
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
                <div className="detail-row"><strong>Created:</strong> {new Date(selectedTask.createdDate).toLocaleString()}</div>
                <div className="detail-row"><strong>Updated:</strong> {new Date(selectedTask.updatedDate).toLocaleString()}</div>

                <div className="details-actions">
                  <button onClick={handleCloseDetails}>Close</button>
                  <button onClick={startEditFromDetails}>Edit</button>
                </div>

                {editingTaskId !== null && (
                  <div className="edit-form">
                    <h3>Edit Task</h3>
                    <input
                      type="text"
                      placeholder="Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                    <textarea
                      placeholder="Description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                    <div className="edit-buttons">
                      <button onClick={handleEditTask}>Save</button>
                      <button onClick={resetForm}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          ) : ''}
        </div>

        {feedback && <div className="feedback">{feedback}</div>}

      </div>
    </div>
  );
};

export default TaskManager;
