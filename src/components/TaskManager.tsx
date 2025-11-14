import React, { useEffect, useState } from 'react';
import { TaskDB } from '../db/TaskDB';
import { Task } from '../models/Task';
import './TaskManager.css';

const taskDB = new TaskDB();

const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
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
  }, []);

  const loadTasks = async () => {
    try {
      const loadedTasks = await taskDB.getAllTasks();
      setTasks(loadedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setFeedback('Failed to load tasks. Please try again.');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (searchTerm.trim() === '') {
      return true;
    }

    return task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setEditingTaskId(null);
    setFeedback(null);
  };

  const handleAddTask = async () => {
    if (!title.trim()) return;
    const newTask: Task = {
      title: title.trim(),
      description: description.trim(),
      createdDate: Date.now(),
      updatedDate: Date.now(),
      completed: false,
      deleted: false,
    };
    try {
      await taskDB.addTask(newTask);
      resetForm();
      await loadTasks();
      setFeedback('Task added successfully!');
    } catch (error) {
      console.error('Error adding task:', error);
      setFeedback('Failed to add task. Please try again.');
    }
  };

  const startEditing = (task: Task) => {
    setTitle(task.title);
    setDescription(task.description ?? '');
    setEditingTaskId(task.id ?? null);
    setSelectedTask(task);
  };

  const handleEditTask = async () => {
    if (editingTaskId === null || !title.trim()) return;
    const original = selectedTask ?? tasks.find(t => t.id === editingTaskId);
    const updatedTask: Task = {
      id: editingTaskId,
      title: title.trim(),
      description: description.trim(),
      createdDate: original?.createdDate ?? Date.now(),
      updatedDate: Date.now(),
      completed: original?.completed ?? false,
      deleted: original?.deleted ?? false,
    };
    try {
      await taskDB.updateTask(updatedTask);
      resetForm();
      await loadTasks();
      setFeedback('Task updated successfully!');
    } catch (error) {
      console.error('Error editing task:', error);
      setFeedback('Failed to update task. Please try again.');
    }
  };

  const toggleCompleted = async (task: Task) => {
    const updated = { ...task, completed: !task.completed, updatedDate: Date.now() };
    try {
      await taskDB.updateTask(updated);
      await loadTasks();
      if (selectedTask && selectedTask.id === updated.id) setSelectedTask(updated);
    } catch (error) {
      console.error('Error toggling task:', error);
      setFeedback('Failed to update task. Please try again.');
    }
  };

  const selectTask = (task: Task) => {
    setSelectedTask(task);
    resetForm();
  };

  const startEditFromDetails = () => {
    if (!selectedTask) return;
    startEditing(selectedTask);
  };

  const handleCloseDetails = () => {
    setSelectedTask(null);
    resetForm();
  }

  const activeTasks = filteredTasks.filter(t => !t.completed);
  const completedTasks = filteredTasks.filter(t => t.completed).sort((a,b)=> (b.updatedDate||0) - (a.updatedDate||0));

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
