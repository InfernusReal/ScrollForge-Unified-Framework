/**
 * ScrollWeave Core Engine
 * Logic-reactive styling system
 * 
 * "Style is not separate from behavior"
 * CSS becomes runtime-controlled based on state
 */

export class ScrollWeaveCore {
  constructor(config = {}) {
    this.config = {
      debugMode: false,
      useAnimations: true,
      preferGPU: true,
      ...config,
    };

    this.rules = new Map();
    this.styleCache = new Map();
    this.activeStyles = new Map();
    this.styleSheet = null;
    this.tokens = new Map();
    
    this._initializeStyleSheet();
  }

  /**
   * Initialize dynamic stylesheet
   */
  _initializeStyleSheet() {
    if (typeof document === 'undefined') return;

    const style = document.createElement('style');
    style.setAttribute('data-scrollweave', '');
    document.head.appendChild(style);
    this.styleSheet = style.sheet;
  }

  /**
   * Define a design token
   */
  token(name, value) {
    this.tokens.set(name, value);

    if (this.config.debugMode) {
      console.log(`[ScrollWeave] Token defined: ${name} =`, value);
    }
  }

  /**
   * Get token value
   */
  getToken(name) {
    return this.tokens.get(name);
  }

  /**
   * Create a conditional style rule
   */
  rule(selector, config) {
    if (!this.rules.has(selector)) {
      this.rules.set(selector, []);
    }

    this.rules.get(selector).push(config);

    if (this.config.debugMode) {
      console.log(`[ScrollWeave] Rule created for: ${selector}`);
    }
  }

  /**
   * Apply styles directly to element(s)
   */
  apply(selector, styles, transition = null) {
    const elements =
      typeof selector === 'string'
        ? Array.from(document.querySelectorAll(selector))
        : [selector];

    elements.forEach((el) => {
      // Apply transition if specified
      if (transition && this.config.useAnimations) {
        this._applyTransition(el, transition);
      }

      // Apply styles using camelCase property names for el.style
      Object.entries(styles).forEach(([prop, value]) => {
        el.style[prop] = value;
      });

      // Cache applied styles
      const key = this._getElementKey(el);
      this.activeStyles.set(key, styles);
    });

    if (this.config.debugMode) {
      console.log(`[ScrollWeave] Applied styles to:`, selector, styles);
    }
  }

  /**
   * Conditional styling (if-then-else)
   */
  when(selector, condition, thenStyles, elseStyles = {}) {
    const shouldApply = typeof condition === 'function' ? condition() : condition;

    const stylesToApply = shouldApply ? thenStyles : elseStyles;
    this.apply(selector, stylesToApply);

    return shouldApply;
  }

  /**
   * Multiple conditions (switch-like)
   */
  switch(selector, cases, defaultStyles = {}) {
    let applied = false;

    for (const { condition, styles } of cases) {
      const shouldApply = typeof condition === 'function' ? condition() : condition;
      
      if (shouldApply) {
        this.apply(selector, styles);
        applied = true;
        break;
      }
    }

    if (!applied) {
      this.apply(selector, defaultStyles);
    }
  }

  /**
   * Animate element with transition
   */
  animate(selector, keyframes, options = {}) {
    const elements =
      typeof selector === 'string'
        ? Array.from(document.querySelectorAll(selector))
        : [selector];

    const animations = [];

    elements.forEach((el) => {
      const animation = el.animate(keyframes, {
        duration: options.duration || 300,
        easing: options.easing || 'ease',
        fill: options.fill || 'forwards',
        ...options,
      });

      animations.push(animation);
    });

    return animations;
  }

  /**
   * Spring animation helper
   */
  spring(selector, targetStyles, config = {}) {
    const {
      stiffness = 200,
      damping = 20,
      mass = 1,
    } = config;

    // Simplified spring physics
    const duration = Math.sqrt(mass / stiffness) * damping * 100;
    const easing = `cubic-bezier(0.34, 1.56, 0.64, 1)`;

    return this.animate(selector, [targetStyles], {
      duration,
      easing,
      fill: 'forwards',
    });
  }

  /**
   * Fade in/out helpers
   */
  fadeIn(selector, duration = 300) {
    return this.animate(
      selector,
      [{ opacity: 0 }, { opacity: 1 }],
      { duration, easing: 'ease-in' }
    );
  }

  fadeOut(selector, duration = 300) {
    return this.animate(
      selector,
      [{ opacity: 1 }, { opacity: 0 }],
      { duration, easing: 'ease-out' }
    );
  }

  /**
   * Slide animations
   */
  slideIn(selector, direction = 'down', duration = 300) {
    const transforms = {
      up: ['translateY(100%)', 'translateY(0)'],
      down: ['translateY(-100%)', 'translateY(0)'],
      left: ['translateX(100%)', 'translateX(0)'],
      right: ['translateX(-100%)', 'translateX(0)'],
    };

    const [from, to] = transforms[direction];

    return this.animate(
      selector,
      [{ transform: from }, { transform: to }],
      { duration, easing: 'ease-out' }
    );
  }

  /**
   * Scale animation
   */
  scale(selector, from, to, duration = 300) {
    return this.animate(
      selector,
      [{ transform: `scale(${from})` }, { transform: `scale(${to})` }],
      { duration, easing: 'ease-out' }
    );
  }

  /**
   * Responsive helper (media query as function)
   */
  responsive(breakpoints) {
    const width = window.innerWidth;
    
    for (const [maxWidth, styles] of Object.entries(breakpoints)) {
      if (width <= parseInt(maxWidth)) {
        return styles;
      }
    }
    
    return breakpoints.default || {};
  }

  /**
   * Theme system
   */
  theme(name, tokens) {
    tokens.forEach((value, key) => {
      this.token(`${name}.${key}`, value);
    });
  }

  /**
   * Apply theme
   */
  applyTheme(name) {
    const themeTokens = Array.from(this.tokens.entries())
      .filter(([key]) => key.startsWith(`${name}.`));

    themeTokens.forEach(([key, value]) => {
      const prop = key.replace(`${name}.`, '');
      document.documentElement.style.setProperty(`--${prop}`, value);
    });
  }

  /**
   * Apply transition to element
   */
  _applyTransition(el, transition) {
    if (typeof transition === 'string') {
      el.style.transition = transition;
    } else if (typeof transition === 'object') {
      const { property = 'all', duration = 300, easing = 'ease' } = transition;
      el.style.transition = `${property} ${duration}ms ${easing}`;
    }
  }

  /**
   * Convert camelCase to kebab-case
   */
  _camelToKebab(str) {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }

  /**
   * Get unique key for element
   */
  _getElementKey(el) {
    if (!el._scrollweaveId) {
      el._scrollweaveId = `sw_${Math.random().toString(36).substr(2, 9)}`;
    }
    return el._scrollweaveId;
  }

  /**
   * Get currently applied styles for element
   */
  getStyles(selector) {
    const el = typeof selector === 'string' 
      ? document.querySelector(selector) 
      : selector;
    
    if (!el) return null;
    
    const key = this._getElementKey(el);
    return this.activeStyles.get(key);
  }

  /**
   * Remove all styles from element
   */
  clear(selector) {
    const elements =
      typeof selector === 'string'
        ? Array.from(document.querySelectorAll(selector))
        : [selector];

    elements.forEach((el) => {
      el.style.cssText = '';
      const key = this._getElementKey(el);
      this.activeStyles.delete(key);
    });
  }

  /**
   * Reset everything
   */
  reset() {
    this.rules.clear();
    this.styleCache.clear();
    this.activeStyles.clear();
    this.tokens.clear();
  }
}

