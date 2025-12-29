import React from 'react';
import contexts from '../models/Contexts';

interface ContextTabsProps {
  selectedContext: string;
  setSelectedContext: (context: string) => void;
}

const ContextTabs: React.FC<ContextTabsProps> = ({ selectedContext, setSelectedContext }) => {
  return (
    <div className='context-tabs'>
      <ul>
        {contexts.map((ctx) => (
          <li key={ctx.id} className='context-tab'>
            <button
              className={`context-button ${selectedContext === ctx.id ? 'active' : ''}`}
              onClick={() => setSelectedContext(ctx.id)}
            >
              {ctx.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContextTabs;