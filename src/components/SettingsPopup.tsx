import React from 'react';
import { Setting } from '../models/Setting';
import './Settings.css';

interface SettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  settings: Setting[]
}

const SettingsPopup: React.FC<SettingsPopupProps> = ({ isOpen, onClose, onSave, settings }) => {
  if (!isOpen) return null;

  return (
    <div className='popup-container'>
      <div className='popup-content'>
        <h2>Settings</h2>

        <div className='settings-list'>

          {settings.map((setting) => (
            <div className='setting-item' key={setting.key}>

                <div className='setting-box'>
                  <strong className='setting-name'>{setting.title}</strong>

                  {setting.type === 'string' && (
                    <span className='setting-value'>{setting.value}</span>
                  )}

                  {setting.type === 'select' && (
                    <span className='setting-value'>{setting.value}</span>
                  )}

                  {setting.type === 'toggle' && (
                    <span className='setting-value'>{setting.value ? 'ON' : 'OFF'}</span>
                  )}

                </div>
            </div>
          ))}
        </div>

        <div className='box-actions'>
          <button className='' onClick={onClose}>Close</button>
          <button className='accent' onClick={onSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default SettingsPopup;