import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { contentApi } from '../services/api';
import './SubmitContentPage.css';

const SubmitContentPage: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    // URL validation
    try {
      new URL(url); // This will throw an error if URL is invalid
    } catch (err) {
      setError('Please enter a valid URL');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await contentApi.submitContent({ url });
      navigate(`/results/${response.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit URL for analysis');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="submit-page">
      <div className="card submit-card">
        <h1 className="text-center mb-4">Analyze Content</h1>
        
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="url">Enter URL to analyze</label>
            <input
              type="text"
              id="url"
              className="form-control"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              disabled={isLoading}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Analyze Content'}
          </button>
        </form>
        
        <div className="url-examples">
          <h3>Example URLs to try:</h3>
          <ul>
            <li>
              <button 
                className="url-example-btn"
                onClick={() => setUrl('https://en.wikipedia.org/wiki/Artificial_intelligence')}
                disabled={isLoading}
              >
                Wikipedia: Artificial Intelligence
              </button>
            </li>
            <li>
              <button 
                className="url-example-btn"
                onClick={() => setUrl('https://www.bbc.com/news/technology')}
                disabled={isLoading}
              >
                BBC Technology News
              </button>
            </li>
            <li>
              <button 
                className="url-example-btn"
                onClick={() => setUrl('https://medium.com/topics/artificial-intelligence')}
                disabled={isLoading}
              >
                Medium: AI Articles
              </button>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="card info-card">
        <h2>How it works</h2>
        <p>
          Our AI-powered Content Insight Engine analyzes web pages to extract the main content,
          removing ads, navigation, and other non-essential elements.
        </p>
        <p>
          The system then uses Google's Gemini AI to generate a concise summary and extract
          the most important keywords from the content.
        </p>
        <p>
          This process typically takes 10-15 seconds depending on the size of the content.
        </p>
      </div>
    </div>
  );
};

export default SubmitContentPage;
