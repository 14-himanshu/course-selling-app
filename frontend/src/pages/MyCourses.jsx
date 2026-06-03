import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookX } from 'lucide-react';
import CourseSkeleton from '../components/CourseSkeleton';
import './MyCourses.css';

export default function MyCourses() {
  const { isAuthenticated, role, token } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || role !== 'user') {
      navigate('/');
      return;
    }

    fetch('http://localhost:3000/user/purchase', {
      headers: { 'token': token }
    })
      .then(res => res.json())
      .then(data => {
        // The backend returns { purchases: [...], coursesData: [...] }
        setCourses(data.coursesData || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch purchased courses:", err);
        setLoading(false);
      });
  }, [isAuthenticated, role, navigate, token]);

  return (
    <div className="container">
      <div className="my-courses-header">
        <h1 className="hero-title" style={{ fontSize: '2.5rem', textAlign: 'left' }}>My Learning</h1>
        <div className="header-section text-center mb-4">
        <h2>My Learning Journey</h2>
        <p className="text-muted">Continue where you left off.</p>
      </div>
      </div>

      {loading ? (
        <div className="course-grid">
          {[1, 2, 3].map(n => <CourseSkeleton key={n} />)}
        </div>
      ) : courses.length === 0 ? (
        <div className="empty-state text-center" style={{ padding: '6rem 0' }}>
          <BookX size={80} style={{ color: 'var(--text-muted)', margin: '0 auto 1.5rem', opacity: 0.5 }} />
          <h3>You haven't enrolled in any courses yet</h3>
          <p className="text-muted mb-4">Discover your next passion in our library.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>Browse Courses</button>
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map(course => (
              <div key={course._id} className="card course-card">
                <img src={course.imageUrl} alt={course.title} className="course-img" />
                <div className="course-content flex flex-col justify-between">
                  <div>
                    <h3 className="course-title">{course.title}</h3>
                    <p className="course-description">{course.description}</p>
                  </div>
                  <div className="course-footer flex items-center justify-between">
                    <button className="btn-primary" style={{ width: '100%' }} onClick={() => navigate(`/course/${course._id}`)}>Start Learning</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
