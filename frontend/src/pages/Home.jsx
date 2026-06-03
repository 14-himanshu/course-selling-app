import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, BookOpen, Clock, PlayCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import CourseSkeleton from '../components/CourseSkeleton';
import { API_URL } from '../config';
import './Home.css';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  
  const { isAuthenticated, token, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/course/preview`)
      .then(res => res.json())
      .then(data => {
        setCourses(data.courses || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch courses:", err);
        setLoading(false);
      });
  }, []);

  const handleEnroll = async (courseId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (role === 'admin') {
      toast.error("Admins cannot purchase courses.");
      return;
    }

    setPurchasing(courseId);
    try {
      // 1. Create Razorpay Order
      const res = await fetch(`${API_URL}/user/purchase/${courseId}/order`, {
        method: 'POST',
        headers: { 'token': token }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to generate order');

      // 2. Load Razorpay Script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          name: "CourseSpace",
          description: "Course Enrollment",
          order_id: data.orderId,
          handler: async function (response) {
            try {
              // 3. Verify Payment
              const verifyRes = await fetch(`${API_URL}/user/purchase/verify`, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'token': token 
                },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  courseId
                })
              });
              const verifyData = await verifyRes.json();
              if (!verifyRes.ok) throw new Error(verifyData.message || 'Payment verification failed');
              
              toast.success('Payment Successful! Course Enrolled.');
              navigate('/my-courses');
            } catch (err) {
              toast.error(err.message);
            }
          },
          theme: {
            color: "#6366f1" // matches var(--accent-color)
          }
        };
        const rzp1 = new window.Razorpay(options);
        rzp1.on('payment.failed', function (response){
          toast.error("Payment failed: " + response.error.description);
        });
        rzp1.open();
        setPurchasing(null); // allow clicking again if they close modal
      };
      
      script.onerror = () => {
        toast.error("Failed to load Razorpay SDK. Are you online?");
        setPurchasing(null);
      };
      
    } catch (err) {
      toast.error(err.message);
      setPurchasing(null);
    }
  };

  return (
    <div className="home-container">
      {/* Dynamic Hero Section */}
      <section className="hero-section">
        <div className="hero-content text-center">
          <h1 className="hero-title">Master your craft with world-class courses</h1>
          <p className="hero-subtitle">
            Join thousands of students learning from top instructors. Upgrade your skills and achieve your goals today.
          </p>
          <div className="hero-buttons">
            <a href="#courses" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Explore Courses</a>
          </div>
        </div>
      </section>

      <div id="courses" className="container" style={{ paddingTop: '4rem' }}>
        <div className="header-section text-center mb-4">
          <h2>Available Courses</h2>
          <p className="text-muted">Explore our library and start learning today.</p>
        </div>

        {loading ? (
          <div className="course-grid">
            {[1, 2, 3, 4, 5, 6].map(n => <CourseSkeleton key={n} />)}
          </div>
        ) : courses.length === 0 ? (
          <div className="empty-state text-center" style={{ padding: '4rem 0' }}>
            <BookOpen size={64} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
            <h3>No courses available yet</h3>
            <p className="text-muted">Check back later for new amazing content!</p>
          </div>
        ) : (
          <div className="course-grid">
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
                    <button 
                      className="btn-primary" 
                      onClick={() => handleEnroll(course._id)}
                      disabled={purchasing === course._id}
                    >
                      {purchasing === course._id ? 'Enrolling...' : 'Enroll Now'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
