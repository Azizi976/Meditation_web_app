import { Outlet } from 'react-router-dom';
import { useLocale } from '../../context/LocaleContext';
import Navbar from './Navbar';
import PersistentPlayer from '../player/PersistentPlayer';

export default function AppShell() {
  const { dir } = useLocale();

  return (
    <div dir={dir} className="min-h-screen flex flex-col bg-calm-gradient">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        <Outlet />
      </main>
      <PersistentPlayer />
    </div>
  );
}
