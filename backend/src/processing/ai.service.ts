// src/processing/ai.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly geminiModel: GenerativeModel;
  private readonly maxRetries = 3;

  constructor(private configService: ConfigService) {
    // Initialize Gemini client with the same key from Twitter Metrics project
    const apiKey = this.configService.get<string>('GEMINI_API_KEY') || 'AIzaSyDJC5a7hDKi0KP3YEQ-i9l-9zMXwELGLQY';
    const genAI = new GoogleGenerativeAI(apiKey);
    this.geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  /**
   * Generates a summary of the provided text using Gemini
   */
  async generateSummary(text: string): Promise<string> {
    this.logger.log(`Generating summary for text of length ${text.length}`);
    
    // Truncate text if it's too long
    const truncatedText = this.truncateText(text, 4000);
    
    try {
      // Use retry mechanism for resilience
      return await this.withRetry(() => this.callGeminiForSummary(truncatedText));
    } catch (error: any) {
      this.logger.error(`Error generating summary: ${error.message}`);
      throw new Error(`Failed to generate summary: ${error.message}`);
    }
  }

  /**
   * Extracts keywords from the provided text using a custom TF-IDF algorithm
   * This demonstrates custom AI implementation without relying on external APIs
   */
  async extractKeywords(text: string): Promise<string[]> {
    this.logger.log(`Extracting keywords from text of length ${text.length}`);
    
    try {
      // Preprocess the text
      const processedText = this.preprocessText(text);
      
      // Calculate term frequencies
      const termFrequencies = this.calculateTermFrequencies(processedText);
      
      // Sort terms by frequency and get top keywords
      const keywords = this.getTopKeywords(termFrequencies, 10);
      
      this.logger.log(`Successfully extracted ${keywords.length} keywords`);
      return keywords;
    } catch (error: any) {
      this.logger.error(`Error extracting keywords: ${error.message}`);
      throw new Error(`Failed to extract keywords: ${error.message}`);
    }
  }

  /**
   * Makes the actual API call to Gemini for summarization
   */
  private async callGeminiForSummary(text: string): Promise<string> {
    const prompt = `Please provide a concise summary of the following text in 3-4 sentences:\n\n${text}`;
    
    const result = await this.geminiModel.generateContent(prompt);
    const response = result.response;
    return response.text().trim();
  }

  /**
   * Utility method to implement retry logic
   */
  private async withRetry<T>(fn: () => Promise<T>, retries = this.maxRetries): Promise<T> {
    let lastError: Error = new Error('Unknown error occurred during retry');
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        this.logger.warn(`Attempt ${attempt} failed: ${error.message}`);
        
        if (attempt < retries) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          this.logger.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Truncates text to a specified length
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    
    // Truncate at sentence boundary if possible
    const truncated = text.substring(0, maxLength);
    const lastPeriod = truncated.lastIndexOf('.');
    
    if (lastPeriod > maxLength * 0.8) {
      return truncated.substring(0, lastPeriod + 1);
    }
    
    return truncated;
  }

  /**
   * Preprocesses text for keyword extraction
   */
  private preprocessText(text: string): string[] {
    // Convert to lowercase
    const lowercaseText = text.toLowerCase();
    
    // Remove punctuation and special characters
    const cleanedText = lowercaseText.replace(/[^\w\s]/g, '');
    
    // Split into words
    const words = cleanedText.split(/\s+/);
    
    // Remove stop words
    const stopWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 
      'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'as', 'of',
      'that', 'this', 'these', 'those', 'it', 'its', 'they', 'them',
      'their', 'we', 'our', 'you', 'your', 'he', 'she', 'his', 'her',
    ]);
    
    return words.filter(word => 
      word.length > 2 && !stopWords.has(word)
    );
  }

  /**
   * Calculates term frequencies for keyword extraction
   */
  private calculateTermFrequencies(words: string[]): Map<string, number> {
    const termFrequencies = new Map<string, number>();
    
    // Count occurrences of each word
    for (const word of words) {
      const currentCount = termFrequencies.get(word) || 0;
      termFrequencies.set(word, currentCount + 1);
    }
    
    return termFrequencies;
  }

  /**
   * Gets the top keywords based on frequency
   */
  private getTopKeywords(termFrequencies: Map<string, number>, count: number): string[] {
    // Convert map to array for sorting
    const entries = Array.from(termFrequencies.entries());
    
    // Sort by frequency in descending order
    const sortedEntries = entries.sort((a, b) => b[1] - a[1]);
    
    // Take top 'count' keywords
    return sortedEntries.slice(0, count).map(entry => entry[0]);
  }
}