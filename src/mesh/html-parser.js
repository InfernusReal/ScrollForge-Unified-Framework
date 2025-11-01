/**
 * ScrollMesh HTML Parser
 * Converts HTML strings to DOM elements
 * Supports template literals with state interpolation
 */

export class HTMLParser {
  constructor() {
    this.template = document.createElement('template');
  }

  /**
   * Parse HTML string to DOM element
   */
  parse(htmlString) {
    if (!htmlString || typeof htmlString !== 'string') {
      return document.createDocumentFragment();
    }

    // Clean and trim
    const cleaned = htmlString.trim();
    
    if (!cleaned) {
      return document.createDocumentFragment();
    }

    // Use template element for parsing
    this.template.innerHTML = cleaned;
    const content = this.template.content.cloneNode(true);

    // If single element, return it directly
    if (content.children.length === 1) {
      return content.children[0];
    }

    // Multiple elements, return fragment
    return content;
  }

  /**
   * Interpolate state values into HTML template
   */
  interpolate(templateString, state) {
    if (!templateString || typeof templateString !== 'string') {
      return '';
    }

    // Replace ${...} with state values
    return templateString.replace(/\$\{([^}]+)\}/g, (match, expr) => {
      try {
        // Create function to evaluate expression in state context
        const fn = new Function('state', `with(state) { return ${expr}; }`);
        const result = fn(state);
        return result !== undefined && result !== null ? result : '';
      } catch (error) {
        console.warn(`Failed to interpolate: ${expr}`, error);
        return match;
      }
    });
  }

  /**
   * Parse HTML template with state
   */
  parseTemplate(templateString, state) {
    const interpolated = this.interpolate(templateString, state);
    return this.parse(interpolated);
  }

}

// Global parser instance
export const globalParser = new HTMLParser();

