import React, { useEffect, useState } from 'react';
import { Task } from '../models/Task';
import { useTaskDB } from '../hooks/useTaskDB';
import { useTaskForm } from '../hooks/useTaskForm';
import { useTaskFilter } from '../hooks/useTaskFilter';
import { useScreenWidth } from '../hooks/useScreenWidth';
import Sidebar from './Sidebar';
import TaskList from './TaskList';
import TaskDetails from './TaskDetails';
import CompletedTasksSection from './CompletedTasksSection';
import AddTask from './AddTask';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isMobile } = useScreenWidth();
  const isMobileLayout = isMobile;

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
    title: newTitle,
    setTitle: setNewTitle,
    reset: resetAddTaskForm,
    onSubmit: onSubmitNewTask,
  } = useTaskForm(null, async ({ title, description }) => {
    const newTitle = addSelectedTagToTitle(title);

    closeDetails();

    await addTask({
      title: newTitle,
      description,
      createdDate: Date.now(),
      updatedDate: Date.now(),
      completed: false,
      deleted: false,
      starred: false,
    });
    resetAddTaskForm();
  });

  const addSelectedTagToTitle = (title: string) => {
    if (!selectedTag) {
      return title;
    }
    const tag = '#' + selectedTag;
    if (title.includes(tag)) {
      return title;
    }

    return title + ` ${tag}`;
  }

  const {
    title: editTitle,
    setTitle: setEditTitle,
    description: editDesc,
    setDescription: setEditDesc,
    completed: editCompleted,
    setCompleted: setEditCompleted,
    reset: resetEditForm,
    onSubmit: submitEdit,
  } = useTaskForm(selectedTask, async ({ title, description, completed }) => {
    if (editingTaskId === null) return;
    const original = selectedTask ?? tasks.find(t => t.id === editingTaskId);
    await updateTask({
      id: editingTaskId,
      title,
      description,
      createdDate: original?.createdDate ?? Date.now(),
      updatedDate: Date.now(),
      completed: completed ?? original?.completed ?? false,
      deleted: original?.deleted ?? false,
      starred: original?.starred ?? false,
    });
    setEditingTaskId(null);
    setSelectedTask(null);
    resetEditForm();
  });

  const toggleCompleted = async (task: Task) => {
    setSelectedTask(null);
    await updateTask({ ...task, completed: !task.completed, updatedDate: Date.now() });
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

  const onClickTask = (task: Task) => {
    if (editingTaskId !== null) return;
    setSelectedTask(selectedTask?.id === task.id ? null : task);
  };

  const closeDetails = () => {
    resetEditForm();
    setEditingTaskId(null);
    setSelectedTask(null);
  };

  const onDeleteTask = async () => {
    if (!selectedTask) return;
    const confirmed = window.confirm('Are you sure you want to delete this task? This action cannot be undone.');
    if (!confirmed) return;
    await deleteTask(selectedTask.id!);
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

  const toggleSidebar = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setSidebarOpen(s => !s);
  };

  const onToggleKeyDown = (e: React.KeyboardEvent, fn: (e?: React.MouseEvent) => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fn((e as unknown) as React.MouseEvent);
    }
  };

  const onTagSelect = (tag: string | null) => {
    closeDetails();
    setSelectedTag(tag);
  }

  const onBoxSelect = (box: 'inbox' | 'starred' | 'done') => {
    closeDetails();
    setSelectedBox(box);
  }

  return (
    <div className={`wrapper ${
      sidebarOpen ? 'sidebar-open' : '' } ${
        isMobileLayout ? 'phone' : 'desktop'
      }`}
      onClick={() => setSidebarOpen(false)}
    >
      <Sidebar
        tasks={tasks}
        activeTasks={activeTasks}
        completedTasks={completedTasks}
        starredTasks={starredTasks}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedBox={selectedBox}
        onBoxSelect={onBoxSelect}
        selectedTag={selectedTag}
        onTagSelect={onTagSelect}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      <div className={`task-manager ${
        !isMobileLayout ? 'two-column' : 'one-column'
      }`}>
        <div className="columns">
          <aside className={`col left ${(selectedTask && isMobileLayout) ? 'hidden' : ''}`}>
            <div className="left-navigation-bar">
              <li>
                <button
                  className="nav-sidebar"
                  onClick={(e) => { e.stopPropagation(); toggleSidebar(e); }}
                  onKeyDown={(e) => onToggleKeyDown(e, toggleSidebar)}
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
              <AddTask
                title={newTitle}
                setTitle={setNewTitle}
                onSubmit={onSubmitNewTask}
              />
            </div>

            {selectedBox === 'done' ? (
              <CompletedTasksSection
                displayedCompletedTasks={displayedCompletedTasks}
                completedTasks={completedTasks}
                selectedBox={selectedBox}
                onTaskSelect={(task) => {
                  setSelectedTask(task);
                  setEditingTaskId(null);
                }}
                onDeleteAll={deleteAllCompleted}
              />
            ) : (
              <>
                <TaskList
                  displayedActiveTasks={displayedActiveTasks}
                  selectedTask={selectedTask}
                  selectedBox={selectedBox}
                  selectedTag={selectedTag}
                  onTaskClick={onClickTask}
                  onToggleCompleted={toggleCompleted}
                  onToggleStarred={toggleStarred}
                />
                <CompletedTasksSection
                  displayedCompletedTasks={displayedCompletedTasks}
                  completedTasks={completedTasks}
                  selectedBox={selectedBox}
                  onTaskSelect={(task) => {
                    setSelectedTask(task);
                    setEditingTaskId(null);
                  }}
                  onDeleteAll={deleteAllCompleted}
                />
              </>
            )}
          </aside>

          <TaskDetails
            selectedTask={selectedTask}
            editingTaskId={editingTaskId}
            editTitle={editTitle}
            editDesc={editDesc}
            editCompleted={editCompleted}
            onClose={closeDetails}
            onEdit={startEditFromDetails}
            onDelete={onDeleteTask}
            onEditTitleChange={setEditTitle}
            onEditDescChange={setEditDesc}
            onEditCompletedChange={setEditCompleted}
            onSave={submitEdit}
          />
        </div>

        {visibleFeedback && <div className="feedback">{visibleFeedback}</div>}
      </div>
    </div>
  );
};

export default TaskManager;