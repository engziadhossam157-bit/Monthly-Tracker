import { useState } from 'react';
import { AppProvider, useApp } from './lib/AppContext';
import LockScreen from './components/LockScreen';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SearchResults from './components/SearchResults';
import Modal from './components/Modal';
import Toast from './components/Toast';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Today from './pages/Today';
import Habits from './pages/Habits';
import Tasks from './pages/Tasks';
import Challenges from './pages/Challenges';
import Review from './pages/Review';
import Analytics from './pages/Analytics';
import Planning from './pages/Planning';
import Settings from './pages/Settings';

const PAGES = {
  dashboard: Dashboard,
  calendar: Calendar,
  today: Today,
  habits: Habits,
  tasks: Tasks,
  challenges: Challenges,
  review: Review,
  analytics: Analytics,
  planning: Planning,
  settings: Settings,
};

function Shell() {
  const { data, state } = useApp();
  if (!data) return null;
  const Page = PAGES[state.page] || Dashboard;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '246px minmax(0,1fr)', minHeight: '100vh', background: '#fff' }}>
      <Sidebar />
      <main style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header />
        <SearchResults />
        <div style={{ flex: 1, padding: 28, minWidth: 0 }}>
          <Page />
          <Footer />
        </div>
      </main>
      <Modal />
      <Toast />
    </div>
  );
}

export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  if (!unlocked) return <LockScreen onUnlock={() => setUnlocked(true)} />;
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
