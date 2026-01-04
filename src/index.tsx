import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import useTheme from './hooks/useTheme';
import settingsDAO from './db/SettingsDAO';

function Bootstrap() {
  const [theme, setTheme] = useTheme('light');

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const all = await settingsDAO.getAllSettings();
        const themeSetting = all.find(s => s.key === 'theme');

        if (mounted && themeSetting && typeof themeSetting.value === 'string') {
          setTheme(themeSetting.value as string);
        }
      } catch (err) {
        console.error(err);
      }
    })();
    return () => { mounted = false; };
  }, [setTheme]);

  return <App />;
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Bootstrap />
  </React.StrictMode>
);

reportWebVitals(console.log);
