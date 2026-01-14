import React, { useEffect } from 'react';
import { useTaskTimeEntriesDB } from '../hooks/useTaskTimeEntriesDB';
import { TaskTimeEntry } from '../models/TaskTimeEntry';

interface TimeEntriesListProps {
    taskId?: number; // Optional taskId parameter
}

const TimeEntriesList: React.FC<TimeEntriesListProps> = ({ taskId }) => {
    const { timeEntries, loadTimeEntries } = useTaskTimeEntriesDB();

    useEffect(() => {
        loadTimeEntries();
    }, [loadTimeEntries]);

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();

        const isToday = date.getDate() === now.getDate() &&
                        date.getMonth() === now.getMonth() &&
                        date.getFullYear() === now.getFullYear();

        return isToday ? date.toLocaleTimeString() : date.toLocaleString();
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
        const totalSpent = filteredEntries.reduce((total, entry) => {
            if (entry.stopped) {
                const startTime = new Date(entry.started).getTime();
                const stopTime = new Date(entry.stopped).getTime();
                return total + (stopTime - startTime);
            }
            return total;
        }, 0); // Total time in milliseconds

        // Convert totalSpent to hours and minutes
        const hours = Math.floor(totalSpent / 3600000);
        const minutes = Math.floor((totalSpent % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    }

    return (
        <div className='time-entries-container card'>
            <div>
                <strong>Spent Time</strong>
            </div>
            <ul className='box-list time-entry-list'>
                {filteredEntries.map((entry: TaskTimeEntry) => (
                    <li key={entry.id} className='box-list-item'>
                        {!taskId && (<span>[{entry.taskId}]</span>)}

                        {entry.stopped && (
                            <div className='time-entry-text'>
                                <strong>{getTimeSpent(entry)}</strong>
                                <span>({formatDate(entry.started)} - {formatDate(entry.stopped)})</span>
                            </div>
                        )}

                        {!entry.stopped && (
                            <span>{formatDate(entry.started)} - Ongoing</span>
                        )}
                    </li>
                ))}
            </ul>
            <div>
                <strong>Total Time Spent: </strong>{getSummaryTimeSpent()}
            </div>
        </div>
    );
};

export default TimeEntriesList;
