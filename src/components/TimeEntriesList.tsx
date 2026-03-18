import React, { useEffect, useState } from 'react';
import {useTaskTimeEntriesDB} from '../hooks/useTaskTimeEntriesDB';
import {TaskTimeEntry} from '../models/TaskTimeEntry';
import DeleteIcon from './icons/DeleteIcon';

interface TimeEntriesListProps {
  taskId?: number;
  lastUpdated?: number;
}

const getTimeSpentParts = (timeEntry: TaskTimeEntry, now: Date = new Date()) => {
  const startTime = new Date(timeEntry.started);
  const endTime = timeEntry.stopped ? new Date(timeEntry.stopped) : now;

  const diffMs = endTime.getTime() - startTime.getTime();
  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);

  return { hours, minutes, seconds };
};

const formatTimeSpent = (timeEntry: TaskTimeEntry, now?: Date) => {
  const { hours, minutes, seconds } = getTimeSpentParts(timeEntry, now);
  return `${hours}h ${minutes}m ${seconds}s`;
};

const OngoingTimeLabel: React.FC<{ entry: TaskTimeEntry }> = ({ entry }) => {
  const [now, setNow] = useState<Date>(new Date());
  const isStarted = !entry.stopped;

  useEffect(() => {
    if (!isStarted) {
      return;
    }

    const id = setInterval(() => setNow(new Date()), 1000);

    return () => clearInterval(id);
  }, [isStarted]);

  const label = formatTimeSpent(entry, now);

  return (<span>{label}</span>);
};

const TimeEntriesList: React.FC<TimeEntriesListProps> = ({taskId, lastUpdated}) => {
  const {timeEntries, loadTimeEntries, deleteTimeEntry} = useTaskTimeEntriesDB();

  useEffect(() => {
    loadTimeEntries();
  }, [loadTimeEntries, lastUpdated]);

  const formatISODate = (timestamp: number) => {
    const date = new Date(timestamp);

    return date.toISOString().substring(0, 10);
  }

  const getTimeSpent = (timeEntry: TaskTimeEntry) => {
    if (timeEntry.stopped) {
      const startTime = new Date(timeEntry.started);
      const stopTime = new Date(timeEntry.stopped);
      const timeSpent = stopTime.getTime() - startTime.getTime(); // in milliseconds
      const hours = Math.floor(timeSpent / 3600000); // Convert to hours
      const minutes = Math.floor((timeSpent % 3600000) / 60000); // Convert to minutes
      return `${hours}h ${minutes}m`;
    } else {
      return 'Ongoing';
    }
  }

  const filteredEntries = (taskId
          ? timeEntries.filter(entry => entry.taskId === taskId)
          : timeEntries
  ).sort((a, b) => b.started - a.started);

  const getSummaryTimeSpent = () => {
    const totalSpentMs = filteredEntries.reduce((total, entry) => {
      if (entry.stopped) {
        const startTime = new Date(entry.started).getTime();
        const stopTime = new Date(entry.stopped).getTime();
        return total + (stopTime - startTime);
      }
      return total;
    }, 0);

    const hours = Math.floor(totalSpentMs / 3600000);
    const minutes = Math.floor((totalSpentMs % 3600000) / 60000);

    return `${hours}h ${minutes}m`;
  }

  const handleDelete = async (entryId?: number) => {
    if (!entryId) {
      return;
    }
    const confirmed = window.confirm('Delete time entry?');
    if (!confirmed) return;
    await deleteTimeEntry(entryId);
    loadTimeEntries();
  };

  return (
    <div className='time-entries-container'>

      <ul className='box-list time-entry-list'>
        {filteredEntries.map((entry: TaskTimeEntry) => (
          <li key={entry.id} className='box-list-item'>
            {!taskId && (<span>[{entry.taskId}]</span>)}

            {entry.stopped && (
              <div className='time-entry-text'>
                <span>{formatISODate(entry.started)} : <strong>{getTimeSpent(entry)}</strong> </span>

                <button onClick={() => handleDelete(entry.id)} aria-label="Delete time entry"
                        className="danger">
                  <DeleteIcon size={16}/>
                </button>
              </div>
            )}

            {!entry.stopped && (
                <div className='time-entry-text'>
                  <span>{formatISODate(entry.started)} : <strong><OngoingTimeLabel entry={entry} /></strong></span>
                </div>
            )}
          </li>
        ))}
      </ul>

      <div>
        <strong>Total: </strong> <span>{getSummaryTimeSpent()} </span>
      </div>
    </div>
  );
};

export default TimeEntriesList;
