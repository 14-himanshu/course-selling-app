import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import './Login.css';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="container flex justify-center items-center auth-container">
      <div className="card auth-card">
        <div className="auth-header flex flex-col items-center">
          <BookOpen size={40} className="auth-icon" />
          <h2>{isLogin ? 'Welcome back' : 'Create an account'}</h2>
          <p className="auth-subtitle">
            {isLogin ? 'Sign in to access your courses' : 'Join us to start learning today'}
          </p>
        </div>

        <form className="auth-form flex flex-col gap-4">
          {!isLogin && (
            <div className="flex gap-4">
              <div className="input-group">
                <label>First Name</label>
                <input type="text" className="input-field" placeholder="John" />
              </div>
              <div className="input-group">
                <label>Last Name</label>
                <input type="text" className="input-field" placeholder="Doe" />
              </div>
            </div>
          )}
          
          <div className="input-group">
            <label>Email address</label>
            <input type="email" className="input-field" placeholder="you@example.com" />
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <input type="password" className="input-field" placeholder="••••••••" />
          </div>

          <button type="button" className="btn-primary auth-submit">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button className="text-btn" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
