import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import './AuthPages.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.login(email, password);
      
      // Store token in localStorage
      localStorage.setItem('token', response.token);
      
      // Redirect to home page
      navigate('/');
      
      // Reload the page to update the navbar state
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <h1 className="text-center mb-4">Login</h1>
        
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary auth-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
      
      <div className="auth-info">
        <h2>Welcome Back!</h2>
        <p>
          Log in to access your saved content analyses and track your insights over time.
        </p>
        <p>
          With a free account, you can:
        </p>
        <ul>
          <li>Save and organize your content analyses</li>
          <li>Track content insights over time</li>
          <li>Export summaries and keywords</li>
          <li>Access premium AI features</li>
        </ul>
      </div>
    </div>
  );
};

export default LoginPage;
