import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface ContentBlock {
  element: cheerio.Element;
  text: string;
  textLength: number;
  linkCount: number;
  linkDensity: number;
}

interface ScoredBlock extends ContentBlock {
  scores: {
    textDensity: number;
    linkDensity: number;
    headingProximity: number;
    sentenceStructure: number;
    boilerplateMatch: number;
    positionScore: number;
    totalScore: number;
  };
}

@Injectable()
export class ContentExtractorService {
  private readonly logger = new Logger(ContentExtractorService.name);
  
  /**
   * Extracts the main content from a URL using sophisticated heuristics
   * This is a custom implementation that doesn't rely on readability libraries
   */
  async extractContent(url: string): Promise<string> {
    try {
      this.logger.log(`Extracting content from URL: ${url}`);
      const html = await this.fetchHtml(url);
      const $ = cheerio.load(html);
      
      // Remove obvious non-content elements
      this.removeNonContentElements($);
      
      // Identify potential content blocks
      const contentBlocks = this.identifyContentBlocks($);
      
      // Apply multiple scoring heuristics
      const scoredBlocks = this.applyHeuristics(contentBlocks, $);
      
      // Select and combine highest scoring blocks
      const extractedContent = this.assembleContent(scoredBlocks);
      
      this.logger.log(`Successfully extracted ${extractedContent.length} characters of content`);
      return extractedContent;
    } catch (error: any) {
      this.logger.error(`Error extracting content: ${error.message}`);
      throw new Error(`Failed to extract content: ${error.message}`);
    }
  }
  
  /**
   * Fetches HTML content from a URL
   */
  private async fetchHtml(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        timeout: 10000,
      });
      return response.data;
    } catch (error: any) {
      this.logger.error(`Error fetching URL ${url}: ${error.message}`);
      throw new Error(`Failed to fetch URL: ${error.message}`);
    }
  }
  
  /**
   * Removes elements that are unlikely to contain main content
   */
  private removeNonContentElements($: cheerio.Root): void {
    // Remove common non-content elements
    $('nav, header, footer, aside, script, style, iframe, .ads, .comments, .sidebar, .menu, .navigation, .nav, .share, .social').remove();
    
    // Remove elements with common non-content class/id patterns
    $('[id*="nav"], [id*="header"], [id*="footer"], [id*="sidebar"], [id*="menu"], [class*="nav"], [class*="header"], [class*="footer"], [class*="sidebar"], [class*="menu"]').remove();
  }
  
  /**
   * Identifies potential content blocks in the document
   */
  private identifyContentBlocks($: cheerio.Root): ContentBlock[] {
    const contentBlocks: ContentBlock[] = [];
    
    // Consider common content container elements
    const potentialContainers = $('article, section, div, main');
    
    potentialContainers.each((_, element) => {
      const $element = $(element);
      const text = $element.text().trim();
      
      // Skip elements with too little text
      if (text.length < 100) return;
      
      const linkElements = $element.find('a');
      const linkCount = linkElements.length;
      const linkDensity = text.length > 0 ? linkCount / (text.length / 100) : 0;
      
      contentBlocks.push({
        element,
        text,
        textLength: text.length,
        linkCount,
        linkDensity,
      });
    });
    
    return contentBlocks;
  }
  
  /**
   * Applies multiple heuristics to score content blocks
   */
  private applyHeuristics(blocks: ContentBlock[], $: cheerio.Root): ScoredBlock[] {
    return blocks.map(block => {
      const $element = $(block.element);
      
      // Text density score - longer text is better
      const textDensityScore = Math.min(block.textLength / 500, 3);
      
      // Link density score - fewer links per text is better
      const linkDensityScore = block.linkDensity < 0.1 ? 2 : block.linkDensity < 0.25 ? 1 : 0;
      
      // Heading proximity score - content near headings is valuable
      const headingProximityScore = this.calculateHeadingProximity($element, $);
      
      // Sentence structure score - proper sentences indicate content
      const sentenceStructureScore = this.analyzeSentenceStructure(block.text);
      
      // Boilerplate detection - penalize common boilerplate patterns
      const boilerplateScore = this.detectBoilerplate(block.text);
      
      // Position score - content in the middle of the page is more likely to be main content
      const positionScore = this.calculatePositionScore($element);
      
      // Calculate total score
      const totalScore = textDensityScore + linkDensityScore + headingProximityScore + 
                        sentenceStructureScore + boilerplateScore + positionScore;
      
      return {
        ...block,
        scores: {
          textDensity: textDensityScore,
          linkDensity: linkDensityScore,
          headingProximity: headingProximityScore,
          sentenceStructure: sentenceStructureScore,
          boilerplateMatch: boilerplateScore,
          positionScore,
          totalScore,
        }
      };
    });
  }
  
  /**
   * Calculates a score based on proximity to heading elements
   */
  private calculateHeadingProximity($element: cheerio.Cheerio, $: cheerio.Root): number {
    // Check if element contains headings
    const headings = $element.find('h1, h2, h3, h4, h5, h6');
    if (headings.length > 0) return 2;
    
    // Check if element is near headings
    const prevHeading = $element.prev('h1, h2, h3, h4, h5, h6');
    if (prevHeading.length > 0) return 1.5;
    
    return 0;
  }
  
  /**
   * Analyzes text for proper sentence structure
   */
  private analyzeSentenceStructure(text: string): number {
    // Count sentences by looking for periods followed by spaces and capital letters
    const sentencePattern = /\.\s+[A-Z]/g;
    const sentenceMatches = text.match(sentencePattern) || [];
    
    // Count paragraphs by looking for double line breaks
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    // Calculate score based on number of proper sentences and paragraphs
    const sentenceScore = Math.min(sentenceMatches.length / 3, 2);
    const paragraphScore = Math.min(paragraphs.length, 1);
    
    return sentenceScore + paragraphScore;
  }
  
  /**
   * Detects common boilerplate patterns and returns a negative score if found
   */
  private detectBoilerplate(text: string): number {
    const boilerplatePatterns = [
      /copyright/i,
      /all rights reserved/i,
      /terms of service/i,
      /privacy policy/i,
      /contact us/i,
      /sign up for our newsletter/i,
      /share this/i,
      /related articles/i,
    ];
    
    let boilerplateScore = 0;
    
    for (const pattern of boilerplatePatterns) {
      if (pattern.test(text)) {
        boilerplateScore -= 0.5;
      }
    }
    
    return boilerplateScore;
  }
  
  /**
   * Calculates a score based on the position of the element in the document
   */
  private calculatePositionScore($element: cheerio.Cheerio): number {
    // Elements too close to the top are less likely to be main content
    // Note: We can't use offset() directly due to cheerio limitations in a Node environment
    // Instead, we'll use a heuristic based on the element's position in the DOM
    const parents = $element.parents().length;
    if (parents < 3) return 0;
    
    // Middle of the page gets highest score
    return 1;
  }
  
  /**
   * Assembles the final content from the highest scoring blocks
   */
  private assembleContent(scoredBlocks: ScoredBlock[]): string {
    // Sort blocks by score in descending order
    const sortedBlocks = [...scoredBlocks].sort((a, b) => b.scores.totalScore - a.scores.totalScore);
    
    // Take top blocks that score above threshold
    const topBlocks = sortedBlocks.filter(block => block.scores.totalScore > 3);
    
    // If no blocks score high enough, take the highest scoring block
    if (topBlocks.length === 0 && sortedBlocks.length > 0) {
      topBlocks.push(sortedBlocks[0]);
    }
    
    // Extract and clean text from top blocks
    const contentParts = topBlocks.map(block => {
      // Clean the text (remove excessive whitespace, etc.)
      return block.text.replace(/\s+/g, ' ').trim();
    });
    
    return contentParts.join('\n\n');
  }
}