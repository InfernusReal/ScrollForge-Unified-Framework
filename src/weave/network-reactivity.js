/**
 * Weave Network Reactivity
 * Offline styles, network event animations
 */

export class NetworkReactivity {
  constructor(weave, script) {
    this.weave = weave;
    this.script = script;
    this.rules = [];
  }

  /**
   * Setup network-reactive styles
   */
  setup() {
    // Watch network status
    this.script.watch('net.status', (status) => {
      this._applyNetworkStyles(status);
    });

    // Watch loading state
    this.script.watch('net.loading', (loading) => {
      this._applyLoadingStyles(loading);
    });

    // Watch errors
    this.script.watch('net.errors', (errors) => {
      if (errors.length > 0) {
        this._showErrorAnimation();
      }
    });
  }

  /**
   * Apply styles based on network status
   */
  _applyNetworkStyles(status) {
    if (status === 'offline') {
      // Grayscale everything when offline
      this.weave.apply('body', {
        filter: 'grayscale(100%)',
        opacity: '0.7',
        transition: 'all 0.5s ease'
      });

      // Show offline banner
      this._showOfflineBanner();
    } else {
      // Remove grayscale when online
      this.weave.apply('body', {
        filter: 'grayscale(0%)',
        opacity: '1',
        transition: 'all 0.5s ease'
      });

      // Hide offline banner
      this._hideOfflineBanner();
    }
  }

  /**
   * Apply loading styles
   */
  _applyLoadingStyles(loading) {
    if (loading) {
      // Show loading indicator
      const _indicator = document.querySelector('.net-loading-indicator') || this._createLoadingIndicator();
      
      this.weave.fadeIn('.net-loading-indicator', 200);
    } else {
      this.weave.fadeOut('.net-loading-indicator', 200);
    }
  }

  /**
   * Show error animation
   */
  _showErrorAnimation() {
    // Shake animation on error
    this.weave.animate('body', [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-10px)' },
      { transform: 'translateX(10px)' },
      { transform: 'translateX(-10px)' },
      { transform: 'translateX(0)' }
    ], {
      duration: 400,
      easing: 'ease-in-out'
    });
  }

  /**
   * Create offline banner
   */
  _showOfflineBanner() {
    let banner = document.querySelector('.net-offline-banner');
    
    if (!banner) {
      banner = document.createElement('div');
      banner.className = 'net-offline-banner';
      banner.textContent = 'You are offline';
      banner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        padding: 1rem;
        background: #ef4444;
        color: white;
        text-align: center;
        font-weight: bold;
        z-index: 99999;
        transform: translateY(-100%);
        transition: transform 0.3s ease;
      `;
      document.body.appendChild(banner);
    }

    setTimeout(() => {
      banner.style.transform = 'translateY(0)';
    }, 10);
  }

  /**
   * Hide offline banner
   */
  _hideOfflineBanner() {
    const banner = document.querySelector('.net-offline-banner');
    if (banner) {
      banner.style.transform = 'translateY(-100%)';
      setTimeout(() => banner.remove(), 300);
    }
  }

  /**
   * Create loading indicator
   */
  _createLoadingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'net-loading-indicator';
    indicator.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #667eea, #764ba2);
      z-index: 99999;
      opacity: 0;
      animation: loading-slide 1.5s ease-in-out infinite;
    `;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes loading-slide {
        0% { transform: translateX(-100%); }
        50% { transform: translateX(0%); }
        100% { transform: translateX(100%); }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(indicator);

    return indicator;
  }

  /**
   * Custom network rule
   */
  when(condition, styles) {
    this.rules.push({ condition, styles });
    
    // Watch for condition changes
    const checkCondition = () => {
      try {
        const fn = new Function('net', `return ${condition}`);
        const netState = {
          status: this.script.get('net.status'),
          loading: this.script.get('net.loading'),
          latency: this.script.get('net.latency'),
          errors: this.script.get('net.errors').length
        };
        
        return fn(netState);
      } catch (error) {
        return false;
      }
    };

    const applyStyles = () => {
      if (checkCondition()) {
        Object.entries(styles).forEach(([selector, rules]) => {
          this.weave.apply(selector, rules);
        });
      }
    };

    // Watch network signals
    ['net.status', 'net.loading', 'net.latency', 'net.errors'].forEach(sig => {
      this.script.watch(sig, applyStyles);
    });

    // Apply initially
    applyStyles();
  }
}

export function createNetworkReactivity(weave, script) {
  return new NetworkReactivity(weave, script);
}

