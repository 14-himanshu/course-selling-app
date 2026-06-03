import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Dashboard.css';

export default function Dashboard() {
  const { isAuthenticated, role, token } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);

  // Lesson State
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');
  const [lessonLoading, setLessonLoading] = useState(false);

  const fetchCourses = () => {
    fetch('http://localhost:3000/admin/course/all', {
      headers: { 'token': token }
    })
      .then(res => res.json())
      .then(data => setCourses(data.courses || []))
      .catch(console.error);
  };

  useEffect(() => {
    if (!isAuthenticated || role !== 'admin') {
      navigate('/');
      return;
    }

    fetchCourses();
  }, [isAuthenticated, role, navigate, token]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error("Please select an image file.");
      return;
    }
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('image', imageFile);

      const res = await fetch('http://localhost:3000/admin/course', {
        method: 'POST',
        headers: {
          'token': token
          // Note: DO NOT set 'Content-Type' when using FormData, the browser sets it automatically with the boundary!
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create course');

      toast.success('Course created successfully!');
      fetchCourses();
      setTitle('');
      setDescription('');
      setPrice('');
      setImageFile(null);
      // clear the file input visually
      const fileInput = document.getElementById('image-upload');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    setLessonLoading(true);

    try {
      const res = await fetch(`http://localhost:3000/admin/course/${selectedCourse._id}/lesson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({
          title: lessonTitle,
          videoUrl: lessonVideoUrl
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add lesson');

      toast.success('Lesson added successfully!');
      setSelectedCourse(null);
      setLessonTitle('');
      setLessonVideoUrl('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLessonLoading(false);
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
            <textarea className="input-field" rows="3" value={description} onChange={e => setDescription(e.target.value)} required></textarea>
          </div>
          <div className="input-group">
            <label>Price ($)</label>
            <input type="number" step="0.01" className="input-field" value={price} onChange={e => setPrice(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Course Thumbnail (Image)</label>
            <input 
              id="image-upload"
              type="file" 
              accept="image/*"
              className="input-field" 
              onChange={e => setImageFile(e.target.files[0])} 
              required 
              style={{padding: '0.5rem'}}
            />
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
              <div className="course-content flex flex-col justify-between h-full">
                <div>
                  <h3 className="course-title" style={{fontSize: '1rem'}}>{course.title}</h3>
                  <span className="course-price">${course.price}</span>
                </div>
                <button 
                  className="btn-secondary" 
                  style={{marginTop: '1rem', width: '100%'}}
                  onClick={() => setSelectedCourse(course)}
                >
                  Add Lesson
                </button>
              </div>
            </div>
          ))}
          {courses.length === 0 && <p style={{color: 'var(--text-secondary)'}}>You haven't created any courses yet.</p>}
        </div>
      </div>

      {selectedCourse && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', 
          justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="card" style={{width: '400px', padding: '2rem'}}>
            <h3 style={{marginBottom: '1.5rem'}}>Add Lesson to "{selectedCourse.title}"</h3>
            <form className="flex flex-col gap-4" onSubmit={handleAddLesson}>
              <div className="input-group">
                <label>Lesson Title</label>
                <input type="text" className="input-field" value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Video URL</label>
                <input type="url" className="input-field" placeholder="https://youtube.com/..." value={lessonVideoUrl} onChange={e => setLessonVideoUrl(e.target.value)} required />
              </div>
              <div className="flex gap-4 mt-4">
                <button type="button" className="btn-secondary flex-1" onClick={() => setSelectedCourse(null)}>Cancel</button>
                <button type="submit" className="btn-primary flex-1" disabled={lessonLoading}>
                  {lessonLoading ? 'Saving...' : 'Save Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
