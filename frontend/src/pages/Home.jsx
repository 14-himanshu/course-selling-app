import { useState, useEffect } from 'react';
import './Home.css';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // In a real scenario, we'd fetch from http://localhost:3000/admin/course/all
  // but since we might not have a token yet, we just show placeholder data for the beautiful UI
  useEffect(() => {
    setTimeout(() => {
      setCourses([
        { _id: '1', title: 'Modern React Bootcamp', description: 'Master React, Hooks, and Context API.', price: 49.99, imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80' },
        { _id: '2', title: 'Advanced Node.js', description: 'Learn Express, MongoDB, and API design.', price: 59.99, imageUrl: 'https://images.unsplash.com/photo-1627398240411-d102e3b2e535?w=800&q=80' },
        { _id: '3', title: 'UI/UX Design Fundamentals', description: 'Create beautiful, user-centered designs.', price: 39.99, imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80' }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="container">
      <header className="hero">
        <h1 className="hero-title">Unlock Your Potential</h1>
        <p className="hero-subtitle">Learn from industry experts and take your skills to the next level with our premium courses.</p>
      </header>

      <section className="courses-section">
        <h2 className="section-title">Available Courses</h2>
        {loading ? (
          <div className="loading-state">Loading amazing courses...</div>
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
                    <span className="course-price">${course.price}</span>
                    <button className="btn-primary">Enroll Now</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
