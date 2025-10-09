import React from 'react';
import TaskManager from './components/TaskManager';
import './App.css';

const App: React.FC = () => {
  return (
    <div id="app">
      <TaskManager />
    </div>
  );
};

export default App;