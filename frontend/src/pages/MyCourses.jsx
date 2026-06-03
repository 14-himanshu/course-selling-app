import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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
        <p className="hero-subtitle" style={{ textAlign: 'left', marginLeft: 0 }}>Courses you have enrolled in.</p>
      </div>

      {loading ? (
        <div className="loading-state">Loading your courses...</div>
      ) : (
        <div className="courses-grid">
          {courses.length === 0 ? (
            <div className="empty-state card">
              <h3>No courses yet!</h3>
              <p>Explore our library and enroll in your first course.</p>
              <button className="btn-primary" onClick={() => navigate('/')}>Browse Courses</button>
            </div>
          ) : (
            courses.map(course => (
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
