import React, { useEffect, useState, useCallback } from 'react';
import { Task } from '../models/Task';
import { useTaskDB } from '../hooks/useTaskDB';
import { useTaskForm } from '../hooks/useTaskForm';
import { useTaskFilter } from '../hooks/useTaskFilter';
import { useScreenWidth } from '../hooks/useScreenWidth';
import { useTaskTimeEntriesDB } from '../hooks/useTaskTimeEntriesDB';
import Sidebar from './Sidebar';
import TaskList from './TaskList';
import TaskDetails from './TaskDetails';
import CompletedTasksSection from './CompletedTasksSection';
import AddTask from './AddTask';
import MenuIcon from './icons/MenuIcon';
import './TaskManager.css';
import settingsDAO from '../db/SettingsDAO';
import contexts from '../models/Contexts';

const TaskManager: React.FC = () => {
  const {
    tasks,
    loadTasks,
    addTask,
    updateTask,
    deleteTask,
  } = useTaskDB();

  const { timeEntries, loadTimeEntries, deleteTimeEntry } = useTaskTimeEntriesDB();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [selectedBox, setSelectedBox] = useState<'inbox' | 'starred' | 'done' | 'started' | null>('inbox');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedContext, setSelectedContext] = useState<string>('anywhere');
  const [timeEntriesUpdateTrigger, setTimeEntriesUpdateTrigger] = useState(0);
  const { isMobile } = useScreenWidth();
  const isMobileLayout = isMobile;

  useEffect(() => {
    loadTasks();
    loadTimeEntries();
  }, [loadTasks, loadTimeEntries]);

  useEffect(() => {
    let mounted = true;

    const loadInitialContext = async () => {
      try {
        const allSettings = await settingsDAO.getAllSettings();
        const activateLastUsedContextSetting = allSettings.find((setting) => setting.key === 'activateLastUsedContext');
        const lastUsedContextSetting = allSettings.find((setting) => setting.key === 'lastUsedContext');
        const canRestoreLastUsedContext = activateLastUsedContextSetting?.value === 'on';
        const savedContext = typeof lastUsedContextSetting?.value === 'string' ? lastUsedContextSetting.value : null;
        const isValidContext = !!savedContext && contexts.some((context) => context.id === savedContext);

        if (mounted && canRestoreLastUsedContext && isValidContext) {
          setSelectedContext(savedContext);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadInitialContext();

    return () => {
      mounted = false;
    };
  }, []);

  const {
    title: newTitle,
    setTitle: setNewTitle,
    reset: resetAddTaskForm,
    onSubmit: onSubmitNewTask,
  } = useTaskForm(null, async ({ title, description }) => {
    const priorityMatch = title.match(/(?:priority|pri):([HML])/i);
    const priorityMap: {
      [key: string]: 'high' | 'medium' | 'low'
    } = { 'H': 'high', 'M': 'medium', 'L': 'low' };
    const priority = (priorityMatch ? priorityMap[priorityMatch[1].toUpperCase()] : '') as '' | 'high' | 'medium' | 'low';
    const cleanTitle = removeMetaTags(title);
    const newTitle = addSelectedTagToTitle(cleanTitle);
    const finalDescription = priorityMatch ? `Origin task: ${title}.\n\n${description}` : description;

    closeDetails();

    await addTask({
      title: newTitle,
      description: finalDescription,
      createdDate: Date.now(),
      updatedDate: Date.now(),
      completed: false,
      deleted: false,
      starred: false,
      priority: priority,
      context: selectedContext || 'anywhere',
    });
    resetAddTaskForm();
  });

  const removeMetaTags = (title: string) => {
    return title.replace(/\s*(?:priority|pri):[HML]\s*/gi, ' ')
                .replace(/\s+/g, ' ')
                .trim();
  }

  const addSelectedTagToTitle = (title: string) => {
    if (!selectedTag || selectedTag === 'no-tags' || selectedTag === 'no-context') {
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
    priority: editPriority,
    setPriority: setEditPriority,
    context: editContext,
    setContext: setEditContext,
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
      priority: editPriority ?? original?.priority ?? '',
      context: editContext || 'anywhere',
    });
    setEditingTaskId(null);
    setSelectedTask(null);
    resetEditForm();
  });

  useEffect(() => {
    if (selectedTask) {
      setEditContext(selectedTask.context || 'anywhere');
    }
  }, [selectedTask, setEditContext]);

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

    for (const timeEntry of timeEntries.filter(entry => entry.taskId === selectedTask.id)) {
      await deleteTimeEntry(timeEntry.id as number);
    }

    await deleteTask(selectedTask.id!);
    setSelectedTask(null);
  }

  const deleteAllCompleted = async () => {
    const confirmed = window.confirm('Are you sure you want to delete all completed tasks? This action cannot be undone.');
    if (!confirmed) return;

    for (const task of completedTasks) {
      if (task.id) {
        for (const timeEntry of timeEntries.filter(entry => entry.taskId === task.id)) {
          await deleteTimeEntry(timeEntry.id as number);
        }

        await deleteTask(task.id);
      }
    }
    if (selectedTask?.completed) {
      setSelectedTask(null);
    }
  };

  const filteredTasks = selectedContext === 'anywhere' ? tasks : tasks.filter(task => task.context === selectedContext);

  const {
    active: activeTasks,
    completed: completedTasks
  } = useTaskFilter(filteredTasks, searchTerm);

  const starredTasks = filteredTasks.filter(t => t.starred && !t.deleted);

  const startedTasks = filteredTasks.filter(task => {
    return timeEntries.some(entry => entry.taskId === task.id && !entry.stopped);
  });

  const filterTasksByTag = (taskList: Task[]) => {
    if (!selectedTag) return taskList;
    if (selectedTag === 'no-tags') {
      return taskList.filter(task => !task.title.match(/#\w+/));
    } else if (selectedTag === 'no-context') {
      return taskList.filter(task => {
        return (!task.context || task.context === 'anywhere');
      });
    }
    return taskList.filter(task => task.title.includes(`#${selectedTag}`));
  };

  const displayedActiveTasks = (selectedBox === 'done') ?
    [] :
    (selectedBox === 'starred') ?
      filterTasksByTag(starredTasks) :
      (selectedBox === 'started') ?
        filterTasksByTag(startedTasks) :
        filterTasksByTag(activeTasks.sort((a, b) => {
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

  const onBoxSelect = (box: 'inbox' | 'starred' | 'done' | 'started') => {
    closeDetails();
    setSelectedBox(box);
  }

  const handleContextChange = (context: string) => {
    closeDetails();
    setSelectedContext(context);
    selectedTag && setSelectedTag(null);
    selectedBox !== 'inbox' && setSelectedBox('inbox');
    loadTasks();

    settingsDAO.saveSetting({
      key: 'lastUsedContext',
      title: 'Last Used Context Value',
      type: 'string',
      value: context,
    }).catch((err) => {
      console.error(err);
    });
  };

  const handleTimeEntriesChange = useCallback(() => {
    loadTimeEntries();
    setTimeEntriesUpdateTrigger(prev => prev + 1);
  }, [loadTimeEntries]);

  return (
    <div className='tm-container'>
      <div className={`tm-content ${sidebarOpen ? 'sidebar-open' : ''} ${isMobileLayout ? 'phone' : 'desktop'
        }`}
        onClick={() => setSidebarOpen(false)}
      >
        <Sidebar
          tasks={filteredTasks}
          activeTasks={activeTasks}
          completedTasks={completedTasks}
          starredTasks={starredTasks}
          selectedContext={selectedContext}
          onContextChange={handleContextChange}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedBox={selectedBox}
          onBoxSelect={onBoxSelect}
          selectedTag={selectedTag}
          onTagSelect={onTagSelect}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={toggleSidebar}
          timeEntriesUpdateTrigger={timeEntriesUpdateTrigger}
        />

        <div className={`tm-tasks ${!isMobileLayout ? 'two-column' : 'one-column'
          }`}>
          <div className="columns">
            <aside className={`col left ${(selectedTask && isMobileLayout) ? 'hidden' : ''}`}>
              <div className="left-navigation-bar">
              </div>

              <div className="left-header">

                {isMobileLayout && (
                    <span className='menu-icon-trigger'
                          onClick={(e) => { e.stopPropagation(); toggleSidebar(e); }}
                          onKeyDown={(e) => onToggleKeyDown(e, toggleSidebar)}>
                    <MenuIcon
                        title=""
                        ariaLabel="Toggle Sidebar"
                    />
                  </span>
                )}

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
                    selectedContext={selectedContext}
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
              editPriority={editPriority}
              editContext={editContext}
              onClose={closeDetails}
              onEdit={startEditFromDetails}
              onDelete={onDeleteTask}
              onEditTitleChange={setEditTitle}
              onEditDescChange={setEditDesc}
              onEditCompletedChange={setEditCompleted}
              onEditPriorityChange={setEditPriority}
              onEditContextChange={setEditContext}
              onSave={submitEdit}
              onTimeEntriesChange={handleTimeEntriesChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskManager;
