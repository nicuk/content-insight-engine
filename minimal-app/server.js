const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

// Load environment variables
// Try multiple possible locations for the .env file
let envFound = false;

// First try the root directory
if (require('fs').existsSync(path.join(__dirname, '..', '.env'))) {
  dotenv.config({ path: path.join(__dirname, '..', '.env') });
  envFound = true;
  console.log('Found .env file in root directory');
}

// Then try the current directory
if (!envFound && require('fs').existsSync(path.join(__dirname, '.env'))) {
  dotenv.config({ path: path.join(__dirname, '.env') });
  envFound = true;
  console.log('Found .env file in minimal-app directory');
}

// Log the API key status (without revealing the key)
console.log('GEMINI_API_KEY found:', !!process.env.GEMINI_API_KEY);

// Initialize Gemini API
let geminiModel = null;
try {
  const API_KEY = process.env.GEMINI_API_KEY;
  if (API_KEY) {
    // Import the GoogleGenerativeAI class directly
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(API_KEY);
    geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log('Gemini model initialized successfully');
  } else {
    console.error('GEMINI_API_KEY not found in environment variables');
  }
} catch (error) {
  console.error(`Error initializing Gemini model: ${error.message}`);
}

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse JSON
app.use(express.json());

// Function to extract main content from a URL
async function extractContentFromUrl(url) {
  try {
    console.log(`Fetching content from URL: ${url}`);
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    
    // Remove common non-content elements
    $('nav, header, footer, aside, script, style, iframe, .ads, .advertisement, .sidebar, .comments').remove();
    
    // Find the main content element (heuristic approach)
    let mainContent = '';
    let mainContentElement = null;
    let maxTextLength = 0;
    
    // Look for common content containers
    const potentialContainers = ['article', 'main', '.content', '.post', '.article', '#content', '.main-content'];
    
    // Try to find the container with the most text content
    potentialContainers.forEach(selector => {
      $(selector).each((i, element) => {
        const text = $(element).text().trim();
        if (text.length > maxTextLength) {
          maxTextLength = text.length;
          mainContentElement = element;
        }
      });
    });
    
    // If we found a main content container, use it
    if (mainContentElement) {
      mainContent = $(mainContentElement).text().trim();
    } else {
      // Otherwise, look for the element with the most text content
      $('body *').each((i, element) => {
        if ($(element).children().length > 0) {
          const text = $(element).text().trim();
          if (text.length > maxTextLength) {
            maxTextLength = text.length;
            mainContentElement = element;
          }
        }
      });
      
      if (mainContentElement) {
        mainContent = $(mainContentElement).text().trim();
      } else {
        // Fallback to body content
        mainContent = $('body').text().trim();
      }
    }
    
    // Clean up the text
    mainContent = mainContent.replace(/\s+/g, ' ').trim();
    
    return mainContent;
  } catch (error) {
    console.error(`Error extracting content from URL: ${error.message}`);
    throw new Error(`Failed to extract content: ${error.message}`);
  }
}

// Function to generate summary using Gemini
async function generateSummary(text) {
  try {
    if (!geminiModel) {
      return 'Unable to generate summary: AI model not initialized';
    }
    
    const prompt = `Summarize the following text in a concise way, keeping the most important information. Keep the summary under 200 words:\n\n${text.substring(0, 10000)}`;
    
    const result = await geminiModel.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });
    
    return result.response.text().trim();
  } catch (error) {
    console.error(`Error generating summary: ${error.message}`);
    return `Unable to generate summary: ${error.message}`;
  }
}

// Function to extract keywords using Gemini
async function extractKeywords(text) {
  try {
    if (!geminiModel) {
      return ['Error: AI model not initialized'];
    }
    
    const prompt = `Extract the 10 most important keywords or phrases from the following text. Return only the keywords as a comma-separated list, with no additional text:\n\n${text.substring(0, 10000)}`;
    
    const result = await geminiModel.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 256,
      },
    });
    
    const response = result.response.text().trim();
    return response.split(',').map(keyword => keyword.trim());
  } catch (error) {
    console.error(`Error extracting keywords: ${error.message}`);
    return [`Error extracting keywords: ${error.message}`];
  }
}

// API endpoint to get the Gemini API key
app.get('/api/config', (req, res) => {
  res.json({
    geminiApiKey: process.env.GEMINI_API_KEY || ''
  });
});

// API endpoint to analyze content from a URL
app.post('/content/analyze', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    // Extract content from the URL
    const content = await extractContentFromUrl(url);
    
    // Generate summary and extract keywords
    const summary = await generateSummary(content);
    const keywords = await extractKeywords(content);
    
    // Create a content preview (first 200 characters)
    const contentPreview = content.substring(0, 200) + '...';
    
    res.json({
      summary,
      keywords,
      contentPreview
    });
  } catch (error) {
    console.error(`Error analyzing content: ${error.message}`);
    res.status(500).json({ error: `Failed to analyze content: ${error.message}` });
  }
});

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
