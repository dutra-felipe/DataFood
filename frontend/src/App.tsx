import { AnalyticsPage } from './pages/AnalyticsPage';
import './App.css';
import { useTheme } from './hooks/useTheme';

function App() {
  useTheme();
  return (
    <AnalyticsPage />
  );
}

export default App;