import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const { isAuthenticated, role, token } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  
  // Course Form State
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Lesson Form State
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');
  const [lessonLoading, setLessonLoading] = useState(false);

  const fetchCourses = () => {
    fetch(`\${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/admin/course/all`, {
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

  const openCreateModal = () => {
    setEditingCourseId(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setImageFile(null);
    setIsCourseModalOpen(true);
  };

  const openEditModal = (course) => {
    setEditingCourseId(course._id);
    setTitle(course.title);
    setDescription(course.description);
    setPrice(course.price);
    setImageFile(null);
    setIsCourseModalOpen(true);
  };

  const closeCourseModal = () => {
    setIsCourseModalOpen(false);
    setEditingCourseId(null);
  };

  const handleSubmitCourse = async (e) => {
    e.preventDefault();
    if (!editingCourseId && !imageFile) {
      toast.error("Please select an image file.");
      return;
    }
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', price);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const url = editingCourseId 
        ? `\${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/admin/course/${editingCourseId}` 
        : `\${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/admin/course`;
        
      const method = editingCourseId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'token': token },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save course');

      toast.success(editingCourseId ? 'Course updated!' : 'Course created successfully!');
      fetchCourses();
      closeCourseModal();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to permanently delete this course?")) return;
    
    try {
      const res = await fetch(`\${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/admin/course/${courseId}`, {
        method: 'DELETE',
        headers: { 'token': token }
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete course');
      
      toast.success('Course deleted successfully');
      fetchCourses();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    setLessonLoading(true);

    try {
      const res = await fetch(`\${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/admin/course/${selectedCourse._id}/lesson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({ title: lessonTitle, videoUrl: lessonVideoUrl })
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
    <div className="container dashboard-container">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title" style={{marginBottom: 0}}>Admin Dashboard</h2>
        <button className="btn-primary flex items-center gap-2" onClick={openCreateModal}>
          <Plus size={18} /> Create New Course
        </button>
      </div>

      <div className="course-grid">
        {courses.map(course => (
          <div key={course._id} className="card course-card">
            <img src={course.imageUrl} alt={course.title} className="course-img" style={{height: '200px', objectFit: 'cover'}} />
            <div className="course-content flex flex-col justify-between h-full">
              <div>
                <h3 className="course-title">{course.title}</h3>
                <span className="course-price">${course.price}</span>
              </div>
              <div className="flex items-center justify-between mt-4">
                <button 
                  className="btn-secondary flex-1 mr-2" 
                  onClick={() => setSelectedCourse(course)}
                >
                  Add Lesson
                </button>
                <div className="flex gap-2">
                  <button 
                    onClick={() => openEditModal(course)}
                    style={{padding: '0.5rem', background: 'transparent', color: 'var(--text-secondary)'}}
                    title="Edit Course"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDeleteCourse(course._id)}
                    style={{padding: '0.5rem', background: 'transparent', color: '#ef4444'}}
                    title="Delete Course"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {courses.length === 0 && (
          <div className="text-center" style={{gridColumn: '1 / -1', padding: '4rem', color: 'var(--text-secondary)'}}>
            <p>You haven't created any courses yet.</p>
          </div>
        )}
      </div>

      {/* Create/Edit Course Modal */}
      {isCourseModalOpen && (
        <div className="modal-overlay">
          <div className="card modal-content">
            <div className="flex justify-between items-center mb-4">
              <h3>{editingCourseId ? 'Edit Course' : 'Create New Course'}</h3>
              <button onClick={closeCourseModal} style={{background: 'transparent', color: 'var(--text-secondary)'}}><X size={20}/></button>
            </div>
            <form className="flex flex-col gap-4" onSubmit={handleSubmitCourse}>
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
                  type="file" 
                  accept="image/*"
                  className="input-field" 
                  onChange={e => setImageFile(e.target.files[0])} 
                  required={!editingCourseId}
                  style={{padding: '0.5rem'}}
                />
                {editingCourseId && <small style={{color: 'var(--text-tertiary)'}}>Leave blank to keep existing image</small>}
              </div>
              <div className="flex gap-4 mt-2">
                <button type="button" className="btn-secondary flex-1" onClick={closeCourseModal}>Cancel</button>
                <button type="submit" className="btn-primary flex-1" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Lesson Modal */}
      {selectedCourse && (
        <div className="modal-overlay">
          <div className="card modal-content">
             <div className="flex justify-between items-center mb-4">
              <h3>Add Lesson to "{selectedCourse.title}"</h3>
              <button onClick={() => setSelectedCourse(null)} style={{background: 'transparent', color: 'var(--text-secondary)'}}><X size={20}/></button>
            </div>
            <form className="flex flex-col gap-4" onSubmit={handleAddLesson}>
              <div className="input-group">
                <label>Lesson Title</label>
                <input type="text" className="input-field" value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Video URL (YouTube/Vimeo/MP4)</label>
                <input type="url" className="input-field" placeholder="https://youtube.com/..." value={lessonVideoUrl} onChange={e => setLessonVideoUrl(e.target.value)} required />
              </div>
              <div className="flex gap-4 mt-2">
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
