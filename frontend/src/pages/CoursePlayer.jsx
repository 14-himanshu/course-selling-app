import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PlayCircle, ArrowLeft } from 'lucide-react';
import ReactPlayer from 'react-player/lazy';
import './CoursePlayer.css';

export default function CoursePlayer() {
  const { courseId } = useParams();
  const { token, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const [lessons, setLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated || role !== 'user') {
      navigate('/');
      return;
    }

    fetch(`http://localhost:3000/user/course/${courseId}/lessons`, {
      headers: { 'token': token }
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load lessons');
        return data;
      })
      .then(data => {
        setLessons(data.lessons || []);
        if (data.lessons && data.lessons.length > 0) {
          setActiveLesson(data.lessons[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [courseId, isAuthenticated, role, navigate, token]);

  if (loading) return <div className="container" style={{padding: '4rem', textAlign: 'center'}}>Loading Course Player...</div>;
  
  if (error) return (
    <div className="container" style={{padding: '4rem', textAlign: 'center'}}>
      <h2 style={{color: 'var(--accent-color)'}}>Access Denied</h2>
      <p style={{margin: '1rem 0'}}>{error}</p>
      <button className="btn-secondary" onClick={() => navigate('/my-courses')}>Go Back to My Learning</button>
    </div>
  );

  return (
    <div className="course-player-layout">
      <div className="player-sidebar">
        <button className="back-btn flex items-center gap-2" onClick={() => navigate('/my-courses')}>
          <ArrowLeft size={18} /> Back to Courses
        </button>
        <h2 className="sidebar-title">Course Content</h2>
        
        {lessons.length === 0 ? (
          <p className="no-lessons">No lessons published yet.</p>
        ) : (
          <ul className="lesson-list">
            {lessons.map((lesson, idx) => (
              <li 
                key={lesson._id} 
                className={`lesson-item flex items-center gap-3 ${activeLesson?._id === lesson._id ? 'active' : ''}`}
                onClick={() => setActiveLesson(lesson)}
              >
                <PlayCircle size={18} className="lesson-icon" />
                <span className="lesson-name">{idx + 1}. {lesson.title}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="player-main">
        {activeLesson ? (
          <div className="video-container">
            <h1 className="video-title">{activeLesson.title}</h1>
            <div className="video-wrapper card">
              <ReactPlayer 
                url={activeLesson.videoUrl} 
                controls={true}
                width="100%"
                height="100%"
                className="embedded-video"
              />
            </div>
            {activeLesson.description && (
              <div className="lesson-description card">
                <h3>About this lesson</h3>
                <p>{activeLesson.description}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="video-container flex justify-center items-center h-full">
            <p style={{color: 'var(--text-secondary)'}}>Select a lesson to start watching.</p>
          </div>
        )}
      </div>
    </div>
  );
}
