import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  
  const { isAuthenticated, token, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3000/course/preview')
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
      alert("Admins cannot purchase courses.");
      return;
    }

    setPurchasing(courseId);
    try {
      // 1. Create Razorpay Order
      const res = await fetch(`http://localhost:3000/user/purchase/${courseId}/order`, {
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
              const verifyRes = await fetch(`http://localhost:3000/user/purchase/verify`, {
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
              
              alert('Payment Successful! Course Enrolled.');
              navigate('/my-courses');
            } catch (err) {
              alert(err.message);
            }
          },
          theme: {
            color: "#6366f1" // matches var(--accent-color)
          }
        };
        const rzp1 = new window.Razorpay(options);
        rzp1.on('payment.failed', function (response){
          alert("Payment failed: " + response.error.description);
        });
        rzp1.open();
        setPurchasing(null); // allow clicking again if they close modal
      };
      
      script.onerror = () => {
        alert("Failed to load Razorpay SDK. Are you online?");
        setPurchasing(null);
      };
      
    } catch (err) {
      alert(err.message);
      setPurchasing(null);
    }
  };

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
      </section>
    </div>
  );
}
