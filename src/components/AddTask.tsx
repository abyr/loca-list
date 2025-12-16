import React from 'react';
import './TaskManager.css';

interface AddTaskProps {
  title: string;
  setTitle: (t: string) => void;
  onSubmit: () => void;
}



const AddTask: React.FC<AddTaskProps> = ({ title, setTitle, onSubmit }) => {
  return (
    <div className="add-task-block">
      <input
        type="text"
        placeholder="New task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSubmit();
          }
        }}
      />
      <button onClick={onSubmit}>Add</button>
    </div>
  );
};

export default AddTask;
