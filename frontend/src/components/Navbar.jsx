import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, BookOpen } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="navbar">
      <div className="container flex items-center justify-between">
        <Link to="/" className="nav-logo flex items-center gap-2">
          <BookOpen size={24} />
          <span>CourseSpace</span>
        </Link>
        
        <div className="nav-links flex items-center gap-4">
          <Link to="/" className="nav-link">Courses</Link>
          <Link to="/login" className="btn-secondary">Sign In</Link>
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
