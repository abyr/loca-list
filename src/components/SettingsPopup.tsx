import React, { useEffect, useState } from 'react';
import { useSettingsDB } from '../hooks/useSettingsDB';
import { Setting } from '../models/Setting';
import settingsDAO from '../db/SettingsDAO';
import './Settings.css';

interface SettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const SettingsPopup: React.FC<SettingsPopupProps> = ({ isOpen, onClose, onSave }) => {
  const {
    settings,
    loadSettings,
    saveSetting
  } = useSettingsDB();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const [localSettings, setLocalSettings] = useState<Setting[]>(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const defaultSettings = [
    {
      key: 'theme',
      title: 'Theme',
      type: 'select',
      options: ['light', 'dark'],
      value: 'light',
    } as Setting
  ];

    setLocalSettings(settings.length ? settings : defaultSettings);
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const s of localSettings) {
        await settingsDAO.saveSetting(s);
      }
      onSave();
      await loadSettings();
      window.location.reload();

    } catch (err) {
      // keep simple: log error
      // in a real app we'd surface this to the user
      // eslint-disable-next-line no-console
      console.error('Failed to save settings', err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='popup-container'>
      <div className='popup-content'>
        <h2>Settings</h2>

        <div className='settings-list'>

          {localSettings.map((setting) => (
            <div className='setting-item' key={setting.key}>

                <div className='setting-box'>
                  <strong className='setting-name'>{setting.title}</strong>

                  {setting.type === 'string' && (
                    <span className='setting-value'>{setting.value}</span>
                  )}

                  {setting.type === 'select' && setting.options && (
                    <select
                      value={String(setting.value)}
                      onChange={(e) => {
                        const newVal = e.target.value;
                        setLocalSettings(prev => prev.map(s => s.key === setting.key ? { ...s, value: newVal } : s));
                      }}
                    >
                      {setting.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}

                  {setting.type === 'toggle' && (
                    <span className='setting-value'>{setting.value ? 'ON' : 'OFF'}</span>
                  )}

                </div>
            </div>
          ))}
        </div>

        <div className='box-actions'>
          <button onClick={onClose}>Close</button>
          <button className='accent' onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}

export default SettingsPopup;