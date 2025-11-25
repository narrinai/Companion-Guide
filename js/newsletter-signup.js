/**
 * Newsletter Signup Handler
 * Handles email subscription form submissions
 */

class NewsletterSignup {
  constructor(formId = 'newsletter-form') {
    this.form = document.getElementById(formId);
    if (this.form) {
      this.init();
    }
  }

  init() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  async handleSubmit(event) {
    event.preventDefault();

    const emailInput = this.form.querySelector('input[type="email"]');
    const submitButton = this.form.querySelector('button[type="submit"]');
    const email = emailInput.value.trim();

    if (!email) {
      this.showMessage('Please enter your email address', 'error');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.showMessage('Please enter a valid email address', 'error');
      return;
    }

    // Disable form during submission
    submitButton.disabled = true;
    submitButton.textContent = 'Subscribing...';

    try {
      const response = await fetch('/.netlify/functions/send-newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        this.showMessage('✅ Thank you for subscribing! Check your email.', 'success');
        emailInput.value = '';

        // Track subscription event (optional - for analytics)
        if (typeof gtag !== 'undefined') {
          gtag('event', 'newsletter_signup', {
            'event_category': 'engagement',
            'event_label': email
          });
        }
      } else {
        this.showMessage(data.error || 'Failed to subscribe. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Newsletter signup error:', error);
      this.showMessage('An error occurred. Please try again later.', 'error');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Subscribe';
    }
  }

  showMessage(message, type) {
    // Remove any existing message
    const existingMessage = this.form.querySelector('.newsletter-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `newsletter-message newsletter-message-${type}`;
    messageEl.textContent = message;

    // Add styles
    messageEl.style.marginTop = '15px';
    messageEl.style.padding = '12px 16px';
    messageEl.style.borderRadius = '8px';
    messageEl.style.fontSize = '14px';
    messageEl.style.textAlign = 'center';
    messageEl.style.fontWeight = '500';

    if (type === 'success') {
      messageEl.style.backgroundColor = '#d4edda';
      messageEl.style.color = '#155724';
      messageEl.style.border = '1px solid #c3e6cb';
    } else {
      messageEl.style.backgroundColor = '#f8d7da';
      messageEl.style.color = '#721c24';
      messageEl.style.border = '1px solid #f5c6cb';
    }

    // Insert message after form
    this.form.appendChild(messageEl);

    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        messageEl.style.transition = 'opacity 0.3s';
        messageEl.style.opacity = '0';
        setTimeout(() => messageEl.remove(), 300);
      }, 5000);
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new NewsletterSignup();
  });
} else {
  new NewsletterSignup();
}
