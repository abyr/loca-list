import React, { useEffect, useState } from 'react';
import { Task } from '../models/Task';
import TimeEntriesList from './TimeEntriesList';
import { useTaskTimeEntriesDB } from '../hooks/useTaskTimeEntriesDB';
import PlayIcon from './icons/PlayIcon';
import PauseIcon from './icons/PauseIcon';

interface TaskTimeEntriesProps {
  selectedTask: Task;
  onTimeEntriesChange: () => void;
}

const TaskTimeEntries: React.FC<TaskTimeEntriesProps> = ({
  selectedTask,
  onTimeEntriesChange,
}) => {
  const {
    timeEntries,
    loadTimeEntries,
    startTask,
    pauseTask,
    isTaskStarted
  } = useTaskTimeEntriesDB();

  const [isBodyOpen, setIsBodyOpen] = useState(false);

  useEffect(() => {
    loadTimeEntries();
  }, [loadTimeEntries]);

  const filteredEntries = timeEntries.filter(entry => entry.taskId === selectedTask.id).sort((a, b) => b.started - a.started);

  const started = !!filteredEntries.find(x => !x.stopped);

  const toggleStarted = async (task: Task) => {
    if (!task || !task.id) {
      return;
    }

    const isStarted = await isTaskStarted(task.id);

    if (isStarted) {
      await pauseTask(task.id);
      onTimeEntriesChange();
    } else {
      await startTask(task.id);
      onTimeEntriesChange();
    }
  };

  return (
    <div className='task-time-entries'>

        <h3>
            <strong>Time entries</strong>
            <button onClick={() => setIsBodyOpen(!isBodyOpen)}>
                {isBodyOpen ? 'Hide' : 'Show'}
            </button>
        </h3>


      {isBodyOpen && (
        <div className='time-entries-body'>
          {started &&
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleStarted(selectedTask);
              }}
              aria-label='Pause task'
            >
              <PauseIcon ariaLabel='Pause task' title="Pause" size={16} />
            </button>
          }

          {!started &&
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleStarted(selectedTask);
              }}
              aria-label='Start task'
            >
              <PlayIcon ariaLabel='Start task' title="Start" size={16} />
            </button>
          }

          {filteredEntries.length ?
            <TimeEntriesList taskId={selectedTask.id} /> :
            null }
        </div>
      )}


    </div>
  );
};

export default TaskTimeEntries;
