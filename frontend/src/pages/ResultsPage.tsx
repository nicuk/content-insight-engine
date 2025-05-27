import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { contentApi, ContentResponse } from '../services/api';
import './ResultsPage.css';

const ResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState<ContentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        if (!id) {
          setError('Content ID not provided');
          setLoading(false);
          return;
        }

        const contentData = await contentApi.getContent(id);
        setContent(contentData);

        // If content is still processing, set up polling
        if (contentData.status === 'PROCESSING') {
          const interval = setInterval(async () => {
            try {
              const updatedContent = await contentApi.getContent(id);
              setContent(updatedContent);

              if (updatedContent.status !== 'PROCESSING') {
                if (pollingInterval) clearInterval(pollingInterval);
                setPollingInterval(null);
              }
            } catch (err: any) {
              console.error('Error polling content:', err);
            }
          }, 3000); // Poll every 3 seconds

          setPollingInterval(interval);
        }

        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch content analysis');
        setLoading(false);
      }
    };

    fetchContent();

    // Clean up polling interval on unmount
    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p className="loading-text">Analyzing content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card error-card">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="card error-card">
        <h2>Content Not Found</h2>
        <p>The requested content analysis could not be found.</p>
      </div>
    );
  }

  return (
    <div className="results-page">
      <h1 className="text-center mb-4">Content Analysis Results</h1>

      <div className="source-info card">
        <h2>Source</h2>
        <a href={content.url} target="_blank" rel="noopener noreferrer" className="source-url">
          {content.url}
        </a>
        <div className="status-badge" data-status={content.status.toLowerCase()}>
          {content.status}
        </div>
      </div>

      {content.status === 'PROCESSING' ? (
        <div className="processing-card card">
          <div className="loading-spinner"></div>
          <h2>Processing Content</h2>
          <p>
            Our AI is currently analyzing the content. This typically takes 10-15 seconds
            depending on the size of the content.
          </p>
        </div>
      ) : content.status === 'FAILED' ? (
        <div className="failed-card card">
          <h2>Processing Failed</h2>
          <p>
            We encountered an error while processing this content. This could be due to:
          </p>
          <ul>
            <li>The URL is not accessible</li>
            <li>The content is behind a paywall</li>
            <li>The page structure is not supported</li>
          </ul>
          <p>Please try a different URL.</p>
        </div>
      ) : (
        <>
          <div className="summary-card card">
            <h2>AI-Generated Summary</h2>
            <div className="summary-content">
              {content.summary || 'No summary available'}
            </div>
          </div>

          <div className="keywords-card card">
            <h2>Key Topics & Keywords</h2>
            {content.keywords && content.keywords.length > 0 ? (
              <div className="keywords-list">
                {content.keywords.map((keyword, index) => (
                  <span key={index} className="keyword-badge">
                    {keyword}
                  </span>
                ))}
              </div>
            ) : (
              <p>No keywords available</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ResultsPage;
