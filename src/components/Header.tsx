import { Link } from '@tanstack/react-router';
import { useTheme } from '@/context/ThemeContext';

export default function Header() {
  const { darkMode, setDarkMode } = useTheme();

  return (
    <header className={`p-2 flex gap-2 justify-between ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <nav className="flex items-center gap-4">
        <div className="px-2 font-bold">
          <Link to="/">Create Form, click here.</Link>
        </div>
      </nav>
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="w-8 h-8 border rounded-lg "
      >
        {darkMode ? '☀️' : '🌙'}
      </button>
    </header>
  );
}
