import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const { isAuthenticated, role, token } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (!isAuthenticated || role !== 'admin') {
      navigate('/');
      return;
    }

    // Fetch admin's courses
    fetch('http://localhost:3000/admin/course/all', {
      headers: { 'token': token }
    })
      .then(res => res.json())
      .then(data => setCourses(data.courses || []))
      .catch(console.error);
  }, [isAuthenticated, role, navigate, token]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/admin/course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({
          title,
          description,
          price: parseFloat(price),
          imageUrl
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error?.[0]?.message || 'Failed to create course');

      alert('Course created successfully!');
      
      // Refresh course list and clear form
      setCourses([...courses, { _id: data.courseId, title, description, price: parseFloat(price), imageUrl }]);
      setTitle('');
      setDescription('');
      setPrice('');
      setImageUrl('');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container dashboard-container flex gap-4">
      <div className="card dashboard-sidebar">
        <h2 className="section-title">Admin Dashboard</h2>
        <form className="flex flex-col gap-4" onSubmit={handleCreateCourse}>
          <div className="input-group">
            <label>Course Title</label>
            <input type="text" className="input-field" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Description</label>
            <textarea className="input-field" rows="3" value={description} onChange={e => setDescription(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Price ($)</label>
            <input type="number" step="0.01" className="input-field" value={price} onChange={e => setPrice(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Image URL</label>
            <input type="url" className="input-field" value={imageUrl} onChange={e => setImageUrl(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Course'}
          </button>
        </form>
      </div>

      <div className="dashboard-content flex-1">
        <h2 className="section-title">Your Courses</h2>
        <div className="courses-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
          {courses.map(course => (
            <div key={course._id} className="card course-card">
              <img src={course.imageUrl} alt={course.title} className="course-img" style={{height: '150px'}} />
              <div className="course-content">
                <h3 className="course-title" style={{fontSize: '1rem'}}>{course.title}</h3>
                <span className="course-price">${course.price}</span>
              </div>
            </div>
          ))}
          {courses.length === 0 && <p style={{color: 'var(--text-secondary)'}}>You haven't created any courses yet.</p>}
        </div>
      </div>
    </div>
  );
}
