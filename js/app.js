/**
 * Signature Studio - Professional Email Signature Generator
 * Best-in-class JavaScript application with modern architecture
 * Version: 2.0
 * Author: Dee7 Studio
 */

'use strict';

/* ========================================
   SIGNATURE GENERATOR CLASS
======================================== */

class SignatureGenerator {
  constructor() {
    // Application state
    this.state = {
      theme: 'light',
      currentTemplate: 'modern',
      currentView: 'desktop',
      imageDataUrl: null,
      formData: {},
      isLoading: false,
      isDirty: false
    };

    // Template configurations
    this.templates = {
      modern: {
        imageStyle: 'rounded',
        layout: 'horizontal',
        showTitle: true,
        showCompany: true,
        companyWeight: 'normal',
        style: 'modern',
        description: 'Clean lines with colored accent border'
      },
      classic: {
        imageStyle: 'square',
        layout: 'horizontal',
        showTitle: true,
        showCompany: true,
        companyWeight: 'normal',
        style: 'classic',
        description: 'Traditional professional layout'
      },
      minimal: {
        imageStyle: 'hidden',
        layout: 'text-only',
        showTitle: false,
        showCompany: false,
        companyWeight: 'normal',
        style: 'minimal',
        description: 'Clean, distraction-free text design'
      },
      corporate: {
        imageStyle: 'square',
        layout: 'vertical',
        showTitle: true,
        showCompany: true,
        companyWeight: 'bold',
        style: 'corporate',
        description: 'Formal business-focused with border'
      },
      professional: {
        imageStyle: 'rounded',
        layout: 'horizontal',
        showTitle: true,
        showCompany: true,
        companyWeight: 'semibold',
        style: 'professional',
        description: 'Elegant with gradient background'
      },
      executive: {
        imageStyle: 'rounded',
        layout: 'horizontal',
        showTitle: true,
        showCompany: true,
        companyWeight: 'bold',
        style: 'executive',
        description: 'Premium design with shadows'
      }
    };

    // Social media platform configurations
    this.socialPlatforms = {
      linkedin: {
        icon: 'https://ik.imagekit.io/dee7studio/Icons/LinkedIn.svg?updatedAt=1751101326668',
        name: 'LinkedIn',
        placeholder: 'linkedin.com/in/username',
        baseUrl: 'https://linkedin.com'
      },
      twitter: {
        icon: 'https://ik.imagekit.io/dee7studio/Icons/Reddit.svg?updatedAt=1751102199116',
        name: 'Twitter/X',
        placeholder: 'twitter.com/username',
        baseUrl: 'https://twitter.com'
      },
      github: {
        icon: 'https://ik.imagekit.io/dee7studio/Icons/GitHub.svg?updatedAt=1751618331133',
        name: 'GitHub',
        placeholder: 'github.com/username',
        baseUrl: 'https://github.com'
      },
      instagram: {
        icon: 'https://ik.imagekit.io/dee7studio/Icons/Instagram.svg?updatedAt=1751100484264',
        name: 'Instagram',
        placeholder: 'instagram.com/username',
        baseUrl: 'https://instagram.com'
      },
      facebook: {
        icon: 'https://ik.imagekit.io/dee7studio/Icons/Facebook.svg?updatedAt=1751101326689',
        name: 'Facebook',
        placeholder: 'facebook.com/username',
        baseUrl: 'https://facebook.com'
      },
      tiktok: {
        icon: 'https://ik.imagekit.io/dee7studio/Icons/Tok%20Tok.svg?updatedAt=1751101326673',
        name: 'TikTok',
        placeholder: 'tiktok.com/@username',
        baseUrl: 'https://tiktok.com'
      }
    };

    // Contact icons
    this.contactIcons = {
      phone: 'https://ik.imagekit.io/dee7studio/Icons/Phone.svg?updatedAt=1751618330969',
      website: 'https://ik.imagekit.io/dee7studio/Icons/Website.svg?updatedAt=1751618331133',
      email: 'https://ik.imagekit.io/dee7studio/Icons/Website.svg?updatedAt=1751618331133'
    };

    // Performance optimizations
    this.debounceTimer = null;
    this.rafId = null;
    
    // Placeholder image
    this.placeholderImage = this.generatePlaceholderSVG();

    // Initialize application
    this.init();
  }

  /* ========================================
     INITIALIZATION METHODS
  ======================================== */

  /**
   * Initialize the application
   */
  init() {
    try {
      this.cacheElements();
      this.loadSavedSettings();
      this.bindEvents();
      this.updatePreview();
      this.updateProgress();
      this.setCurrentYear();
      this.addInitialAnimations();
      
      // Performance monitoring
      this.logPerformanceMetrics();
      
      console.log('🚀 Signature Studio initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Signature Studio:', error);
      this.showNotification('Failed to initialize application', 'error');
    }
  }

  /**
   * Cache DOM elements for performance
   */
  cacheElements() {
    // Create elements cache
    this.elements = {};
    
    // Essential elements
    const essentialSelectors = {
      // Theme
      themeToggle: '#themeToggle',
      
      // Form inputs
      firstName: '#firstName',
      lastName: '#lastName',
      title: '#title',
      company: '#company',
      email: '#email',
      phone: '#phone',
      website: '#website',
      colorPicker: '#colorPicker',
      colorText: '#colorText',
      
      // Social media inputs
      linkedin: '#linkedin',
      twitter: '#twitter',
      github: '#github',
      instagram: '#instagram',
      facebook: '#facebook',
      tiktok: '#tiktok',
      
      // Image upload
      imageInput: '#imageInput',
      imageUpload: '#imageUpload',
      
      // Preview elements
      signaturePreview: '#signaturePreview',
      signatureContent: '#signatureContent',
      progressFill: '#progressFill',
      progressText: '#progressText',
      
      // Action buttons
      copyHtmlBtn: '#copyHtmlBtn',
      copyTextBtn: '#copyTextBtn',
      downloadBtn: '#downloadBtn',
      
      // Footer
      currentYear: '#currentYear'
    };

    // Cache elements with error handling
    Object.entries(essentialSelectors).forEach(([key, selector]) => {
      const element = document.querySelector(selector);
      if (element) {
        this.elements[key] = element;
      } else {
        console.warn(`⚠️ Element not found: ${selector}`);
      }
    });

    // Cache element collections
    this.elements.templateBtns = document.querySelectorAll('.template-btn');
    this.elements.viewBtns = document.querySelectorAll('.view-btn');
    this.elements.formInputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="url"]');

    // Validate critical elements
    this.validateCriticalElements();
  }

  /**
   * Validate that critical elements exist
   */
  validateCriticalElements() {
    const critical = ['signatureContent', 'progressFill'];
    const missing = critical.filter(key => !this.elements[key]);
    
    if (missing.length > 0) {
      throw new Error(`Critical elements missing: ${missing.join(', ')}`);
    }
  }

  /**
   * Load saved settings from localStorage
   */
  loadSavedSettings() {
    try {
      // Load theme
      const savedTheme = localStorage.getItem('signature-studio-theme') || 'light';
      this.state.theme = savedTheme;
      document.documentElement.setAttribute('data-theme', savedTheme);
      this.updateThemeToggle();

      // Load form data
      const savedFormData = localStorage.getItem('signature-studio-form-data');
      if (savedFormData) {
        const formData = JSON.parse(savedFormData);
        this.restoreFormData(formData);
      }

      // Load selected template
      const savedTemplate = localStorage.getItem('signature-studio-template');
      if (savedTemplate && this.templates[savedTemplate]) {
        this.state.currentTemplate = savedTemplate;
        this.updateTemplateSelection();
      }
    } catch (error) {
      console.warn('⚠️ Failed to load saved settings:', error);
    }
  }

  /**
   * Restore form data from saved state
   */
  restoreFormData(formData) {
    Object.entries(formData).forEach(([key, value]) => {
      const element = this.elements[key];
      if (element && value) {
        element.value = value;
        this.updateCharCount(element);
      }
    });
  }

  /**
   * Update theme toggle button state
   */
  updateThemeToggle() {
    const icon = this.elements.themeToggle?.querySelector('.theme-icon');
    if (icon) {
      icon.textContent = this.state.theme === 'dark' ? '🌞' : '🌙';
    }
  }

  /**
   * Update template selection visual state
   */
  updateTemplateSelection() {
    this.elements.templateBtns?.forEach(btn => {
      const isActive = btn.dataset.template === this.state.currentTemplate;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-checked', isActive.toString());
    });
  }

  /* ========================================
     EVENT HANDLING
  ======================================== */

  /**
   * Bind all event listeners
   */
  bindEvents() {
    // Theme toggle
    this.elements.themeToggle?.addEventListener('click', () => this.toggleTheme());

    // Form inputs with optimized debouncing
    this.bindFormInputEvents();

    // Color inputs
    this.bindColorInputEvents();

    // Image upload
    this.bindImageUploadEvents();

    // Template selection
    this.bindTemplateEvents();

    // View controls
    this.bindViewEvents();

    // Export buttons
    this.bindExportEvents();

    // Keyboard shortcuts
    this.bindKeyboardEvents();

    // Window events
    this.bindWindowEvents();

    console.log('✅ Event listeners bound successfully');
  }

  /**
   * Bind form input events with optimized performance
   */
  bindFormInputEvents() {
    const inputFields = [
      'firstName', 'lastName', 'title', 'company',
      'email', 'phone', 'website', 'linkedin', 'twitter', 
      'github', 'instagram', 'facebook', 'tiktok'
    ];

    inputFields.forEach(fieldName => {
      const element = this.elements[fieldName];
      if (element) {
        // Input event with debouncing
        element.addEventListener('input', (e) => this.handleInputChange(e));
        
        // Blur event for validation
        element.addEventListener('blur', () => this.validateInput(element));
        
        // Focus event for analytics
        element.addEventListener('focus', () => this.handleInputFocus(element));
      }
    });
  }

  /**
   * Bind color input events
   */
  bindColorInputEvents() {
    this.elements.colorPicker?.addEventListener('input', (e) => {
      this.elements.colorText.value = e.target.value;
      this.schedulePreviewUpdate();
    });

    this.elements.colorText?.addEventListener('input', (e) => {
      const color = e.target.value;
      if (this.isValidHexColor(color)) {
        this.elements.colorPicker.value = color;
        this.schedulePreviewUpdate();
      }
    });
  }

  /**
   * Bind template selection events
   */
  bindTemplateEvents() {
    this.elements.templateBtns?.forEach(btn => {
      btn.addEventListener('click', () => {
        const template = btn.dataset.template;
        if (template && this.templates[template]) {
          this.switchTemplate(template);
        }
      });

      // Keyboard navigation
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });
  }

  /**
   * Bind view control events
   */
  bindViewEvents() {
    this.elements.viewBtns?.forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        if (view) {
          this.switchView(view);
        }
      });
    });
  }

  /**
   * Bind export button events
   */
  bindExportEvents() {
    this.elements.copyHtmlBtn?.addEventListener('click', () => this.copySignature('html'));
    this.elements.copyTextBtn?.addEventListener('click', () => this.copySignature('text'));
    this.elements.downloadBtn?.addEventListener('click', () => this.downloadSignature());
  }

  /**
   * Bind keyboard shortcuts
   */
  bindKeyboardEvents() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K to focus first input
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.elements.firstName?.focus();
      }

      // Ctrl/Cmd + Enter to copy HTML signature
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        this.copySignature('html');
      }

      // Escape to clear focus
      if (e.key === 'Escape') {
        document.activeElement?.blur();
      }

      // Ctrl/Cmd + S to save (prevent default)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.saveFormData();
        this.showNotification('Progress saved locally', 'success');
      }
    });
  }

  /**
   * Bind window events
   */
  bindWindowEvents() {
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.updatePreview();
      }
    });

    // Handle window resize with debouncing
    window.addEventListener('resize', this.debounce(() => {
      this.updatePreview();
    }, 250));

    // Handle beforeunload for unsaved changes
    window.addEventListener('beforeunload', (e) => {
      if (this.state.isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    });
  }

  /* ========================================
     INPUT HANDLING METHODS
  ======================================== */

  /**
   * Handle input change with optimized debouncing
   */
  handleInputChange(event) {
    const { target } = event;
    
    // Update character count immediately
    this.updateCharCount(target);
    
    // Mark as dirty
    this.state.isDirty = true;
    
    // Schedule preview update with debouncing
    this.schedulePreviewUpdate();
    
    // Auto-save form data
    this.scheduleAutoSave();
  }

  /**
   * Handle input focus for analytics
   */
  handleInputFocus(element) {
    // Track field interaction for analytics
    const fieldName = element.id;
    console.log(`📊 Field focused: ${fieldName}`);
  }

  /**
   * Schedule preview update with optimized debouncing
   */
  schedulePreviewUpdate() {
    // Cancel previous update
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    
    // Clear existing timer
    clearTimeout(this.debounceTimer);
    
    // Schedule new update
    this.debounceTimer = setTimeout(() => {
      this.rafId = requestAnimationFrame(() => {
        this.updateFormData();
        this.updatePreview();
        this.updateProgress();
      });
    }, 150);
  }

  /**
   * Schedule auto-save with debouncing
   */
  scheduleAutoSave() {
    clearTimeout(this.autoSaveTimer);
    this.autoSaveTimer = setTimeout(() => {
      this.saveFormData();
    }, 2000);
  }

  /**
   * Update character count display
   */
  updateCharCount(input) {
    const charCount = input.nextElementSibling;
    if (charCount?.classList.contains('char-count')) {
      const current = input.value.length;
      const max = input.maxLength || 0;
      charCount.textContent = `${current}/${max}`;
      
      // Add warning styling if near limit
      charCount.classList.toggle('warning', current > max * 0.8);
    }
  }

  /**
   * Validate input field
   */
  validateInput(input) {
    const isValid = input.checkValidity();
    input.classList.toggle('error', !isValid);
    
    if (!isValid) {
      this.showInputError(input);
    }
    
    return isValid;
  }

  /**
   * Show input validation error
   */
  showInputError(input) {
    const fieldName = input.id;
    const message = this.getValidationMessage(input);
    this.showNotification(message, 'error');
  }

  /**
   * Get validation message for input
   */
  getValidationMessage(input) {
    const fieldName = input.id;
    const value = input.value;
    
    if (input.validity.valueMissing) {
      return `${this.formatFieldName(fieldName)} is required`;
    }
    
    if (input.validity.typeMismatch) {
      return `Please enter a valid ${this.formatFieldName(fieldName)}`;
    }
    
    if (input.validity.tooLong) {
      return `${this.formatFieldName(fieldName)} is too long`;
    }
    
    return `Please check your ${this.formatFieldName(fieldName)}`;
  }

  /**
   * Format field name for display
   */
  formatFieldName(fieldName) {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }

  /**
   * Validate hex color
   */
  isValidHexColor(color) {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
  }

  /* ========================================
     IMAGE HANDLING METHODS
  ======================================== */

  /**
   * Bind image upload events
   */
  bindImageUploadEvents() {
    const { imageUpload, imageInput } = this.elements;
    
    if (!imageUpload || !imageInput) return;

    // Click to upload
    imageUpload.addEventListener('click', () => imageInput.click());

    // File input change
    imageInput.addEventListener('change', (e) => {
      if (e.target.files.length) {
        this.handleImageFile(e.target.files[0]);
      }
    });

    // Drag and drop events
    this.bindDragDropEvents(imageUpload);

    // Keyboard accessibility
    imageUpload.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        imageInput.click();
      }
    });
  }

  /**
   * Bind drag and drop events for image upload
   */
  bindDragDropEvents(uploadElement) {
    uploadElement.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadElement.classList.add('dragover');
    });

    uploadElement.addEventListener('dragleave', (e) => {
      if (!uploadElement.contains(e.relatedTarget)) {
        uploadElement.classList.remove('dragover');
      }
    });

    uploadElement.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadElement.classList.remove('dragover');

      const files = Array.from(e.dataTransfer.files);
      const imageFile = files.find(file => file.type.startsWith('image/'));
      
      if (imageFile) {
        this.handleImageFile(imageFile);
      } else {
        this.showNotification('Please drop an image file', 'error');
      }
    });
  }

  /**
   * Handle image file upload with validation and optimization
   */
  async handleImageFile(file) {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file (PNG, JPG, WebP)');
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('Image size must be less than 5MB');
      }

      // Show loading state
      this.setImageUploadLoading(true);

      // Process image
      const processedDataUrl = await this.processImage(file);
      
      // Update state and preview
      this.state.imageDataUrl = processedDataUrl;
      this.updatePreview();
      
      this.showNotification('Image uploaded successfully', 'success');
      
    } catch (error) {
      this.showNotification(error.message, 'error');
      console.error('Image upload error:', error);
    } finally {
      this.setImageUploadLoading(false);
    }
  }

  /**
   * Process image with optimization
   */
  async processImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          // Create canvas for optimization
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate optimal dimensions (max 400x400)
          const maxSize = 400;
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress image
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to optimized data URL
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
          resolve(optimizedDataUrl);
        };
        
        img.onerror = () => reject(new Error('Failed to process image'));
        img.src = e.target.result;
      };
      
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Set image upload loading state
   */
  setImageUploadLoading(loading) {
    const uploadElement = this.elements.imageUpload;
    if (uploadElement) {
      uploadElement.classList.toggle('loading', loading);
      
      const icon = uploadElement.querySelector('.upload-icon');
      if (icon) {
        icon.textContent = loading ? '⏳' : '📸';
      }
    }
  }

  /* ========================================
     TEMPLATE & VIEW SWITCHING
  ======================================== */

  /**
   * Switch template with smooth transition
   */
  switchTemplate(templateName) {
    if (!this.templates[templateName]) {
      console.error(`Template not found: ${templateName}`);
      return;
    }

    const previousTemplate = this.state.currentTemplate;
    this.state.currentTemplate = templateName;

    // Update UI state
    this.updateTemplateSelection();
    
    // Save selection
    localStorage.setItem('signature-studio-template', templateName);
    
    // Update preview with animation
    this.updatePreviewWithTransition();
    
    // Analytics
    this.trackTemplateChange(previousTemplate, templateName);
    
    this.showNotification(`Switched to ${templateName} template`, 'info');
  }

  /**
   * Switch view mode (desktop/mobile)
   */
  switchView(viewName) {
    this.state.currentView = viewName;

    // Update active button state
    this.elements.viewBtns?.forEach(btn => {
      const isActive = btn.dataset.view === viewName;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive.toString());
    });

    // Update preview container
    this.elements.signaturePreview?.classList.toggle('mobile-view', viewName === 'mobile');

    this.showNotification(`Switched to ${viewName} view`, 'info');
  }

  /**
   * Update preview with smooth transition
   */
  updatePreviewWithTransition() {
    const content = this.elements.signatureContent;
    if (!content) return;

    // Add transition class
    content.classList.add('updating');
    
    // Update content after brief delay for smooth transition
    setTimeout(() => {
      this.updatePreview();
      content.classList.remove('updating');
      content.classList.add('fade-in');
    }, 150);
  }

  /* ========================================
     SIGNATURE GENERATION
  ======================================== */

  /**
   * Update form data state
   */
  updateFormData() {
    this.state.formData = {
      firstName: this.elements.firstName?.value?.trim() || '',
      lastName: this.elements.lastName?.value?.trim() || '',
      title: this.elements.title?.value?.trim() || '',
      company: this.elements.company?.value?.trim() || '',
      email: this.elements.email?.value?.trim() || '',
      phone: this.elements.phone?.value?.trim() || '',
      website: this.elements.website?.value?.trim() || '',
      color: this.elements.colorPicker?.value || '#000000',
      linkedin: this.elements.linkedin?.value?.trim() || '',
      twitter: this.elements.twitter?.value?.trim() || '',
      github: this.elements.github?.value?.trim() || '',
      instagram: this.elements.instagram?.value?.trim() || '',
      facebook: this.elements.facebook?.value?.trim() || '',
      tiktok: this.elements.tiktok?.value?.trim() || ''
    };
  }

  /**
   * Update signature preview
   */
  updatePreview() {
    try {
      this.updateFormData();
      const template = this.templates[this.state.currentTemplate];
      const html = this.generateSignatureHTML(template);

      if (this.elements.signatureContent) {
        this.elements.signatureContent.innerHTML = html;
        this.elements.signatureContent.setAttribute('aria-label', 'Email signature preview');
      }
    } catch (error) {
      console.error('Failed to update preview:', error);
      this.showNotification('Failed to update preview', 'error');
    }
  }

  /**
   * Generate signature HTML with advanced styling
   */
  generateSignatureHTML(template) {
    const { formData, imageDataUrl } = this.state;
    const imageSrc = imageDataUrl || (template.imageStyle !== 'hidden' ? this.placeholderImage : null);
    const fullName = `${formData.firstName} ${formData.lastName}`.trim() || 'John Doe';

    // Generate social links with proper icons
    const socialHtml = this.generateSocialLinksHTML();
    
    // Generate contact information with icons
    const contactHtml = this.generateContactHTML();

    // Get template-specific styles
    const styles = this.getTemplateStyles(template);

    // Generate signature based on template
    return this.generateTemplateHTML(template, {
      fullName,
      imageSrc,
      socialHtml,
      contactHtml,
      styles
    });
  }

  /**
   * Generate social links HTML
   */
  generateSocialLinksHTML() {
    const socialLinks = [];
    
    Object.entries(this.socialPlatforms).forEach(([platform, config]) => {
      const url = this.state.formData[platform];
      if (url) {
        const cleanUrl = this.cleanSocialUrl(url, platform);
        socialLinks.push(`
          <a href="${cleanUrl}" 
             class="social-link" 
             target="_blank" 
             rel="noopener noreferrer"
             style="margin-right: 8px; text-decoration: none;"
             title="${config.name}">
            <img src="${config.icon}" 
                 alt="${config.name}" 
                 style="width: 20px; height: 20px; object-fit: contain; vertical-align: middle;">
          </a>
        `);
      }
    });

    return socialLinks.length > 0 ? `
      <div style="margin-top: 12px; display: flex; align-items: center; gap: 6px;">
        ${socialLinks.join('')}
      </div>
    ` : '';
  }

  /**
   * Generate contact information HTML
   */
  generateContactHTML() {
    const { formData } = this.state;
    const contactItems = [];

    if (formData.email) {
      contactItems.push(`
        <div style="margin-bottom: 4px; display: flex; align-items: center; font-size: 14px; color: #666666;">
          <img src="${this.contactIcons.email}" 
               style="width: 14px; height: 14px; margin-right: 8px; opacity: 0.8;" 
               alt="Email">
          <span>${formData.email}</span>
        </div>
      `);
    }

    if (formData.phone) {
      contactItems.push(`
        <div style="margin-bottom: 4px; display: flex; align-items: center; font-size: 14px; color: #666666;">
          <img src="${this.contactIcons.phone}" 
               style="width: 14px; height: 14px; margin-right: 8px; opacity: 0.8;" 
               alt="Phone">
          <span>${formData.phone}</span>
        </div>
      `);
    }

    const website = formData.website || 'www.company.com';
    contactItems.push(`
      <div style="margin-bottom: 4px; display: flex; align-items: center; font-size: 14px; color: #666666;">
        <img src="${this.contactIcons.website}" 
             style="width: 14px; height: 14px; margin-right: 8px; opacity: 0.8;" 
             alt="Website">
        <span>${website}</span>
      </div>
    `);

    return contactItems.join('');
  }

  /**
   * Get template-specific styles
   */
  getTemplateStyles(template) {
    const { formData } = this.state;
    const color = formData.color || '#000000';

    const styleMap = {
      modern: {
        nameStyle: `font-size: 22px; font-weight: 700; color: ${color}; margin-bottom: 6px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;`,
        titleStyle: `font-size: 15px; color: #666666; font-weight: 500; margin-bottom: 8px;`,
        companyStyle: `font-size: 17px; font-weight: 600; color: ${color}; margin-bottom: 8px;`,
        containerStyle: `border-left: 4px solid ${color}; padding-left: 20px; background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);`
      },
      classic: {
        nameStyle: `font-size: 20px; font-weight: 600; color: ${color}; margin-bottom: 5px; font-family: Georgia, serif;`,
        titleStyle: `font-size: 14px; color: #666666; font-style: italic; margin-bottom: 6px;`,
        companyStyle: `font-size: 16px; font-weight: 600; color: #333333; margin-bottom: 6px;`,
        containerStyle: `padding: 4px 0;`
      },
      minimal: {
        nameStyle: `font-size: 18px; font-weight: 600; color: ${color}; margin-bottom: 3px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;`,
        titleStyle: ``,
        companyStyle: ``,
        containerStyle: `text-align: left; line-height: 1.4;`
      },
      corporate: {
        nameStyle: `font-size: 20px; font-weight: 700; color: ${color}; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.8px; font-family: Arial, sans-serif;`,
        titleStyle: `font-size: 14px; color: #666666; font-weight: 500; margin-bottom: 8px;`,
        companyStyle: `font-size: 18px; font-weight: 700; color: #333333; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;`,
        containerStyle: `text-align: center; border: 2px solid ${color}; padding: 24px; border-radius: 8px; background: #fafafa;`
      },
      professional: {
        nameStyle: `font-size: 24px; font-weight: 700; color: ${color}; margin-bottom: 8px; font-family: Georgia, serif;`,
        titleStyle: `font-size: 16px; color: #555555; font-weight: 500; margin-bottom: 10px; font-style: italic;`,
        companyStyle: `font-size: 18px; font-weight: 600; color: #333333; margin-bottom: 10px;`,
        containerStyle: `background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 28px; border-radius: 12px; border: 1px solid #dee2e6; box-shadow: 0 2px 8px rgba(0,0,0,0.05);`
      },
      executive: {
        nameStyle: `font-size: 26px; font-weight: 800; color: ${color}; margin-bottom: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;`,
        titleStyle: `font-size: 17px; color: #444444; font-weight: 600; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1.2px;`,
        companyStyle: `font-size: 19px; font-weight: 700; color: #222222; margin-bottom: 12px;`,
        containerStyle: `background: linear-gradient(45deg, #ffffff 0%, #f8f9fa 100%); padding: 32px; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); border: 1px solid #e9ecef;`
      }
    };

    return styleMap[this.state.currentTemplate] || styleMap.modern;
  }

  /**
   * Generate template-specific HTML
   */
  generateTemplateHTML(template, { fullName, imageSrc, socialHtml, contactHtml, styles }) {
    const { formData } = this.state;

    switch (this.state.currentTemplate) {
      case 'minimal':
        return this.generateMinimalTemplate(fullName, contactHtml, socialHtml, styles);
      
      case 'corporate':
        return this.generateCorporateTemplate(template, fullName, imageSrc, contactHtml, socialHtml, styles);
      
      case 'professional':
        return this.generateProfessionalTemplate(template, fullName, imageSrc, contactHtml, socialHtml, styles);
      
      case 'executive':
        return this.generateExecutiveTemplate(template, fullName, imageSrc, contactHtml, socialHtml, styles);
      
      default:
        return this.generateHorizontalTemplate(template, fullName, imageSrc, contactHtml, socialHtml, styles);
    }
  }

  /**
   * Generate minimal template HTML
   */
  generateMinimalTemplate(fullName, contactHtml, socialHtml, styles) {
    const { formData } = this.state;
    
    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; ${styles.containerStyle}">
        <div style="${styles.nameStyle}">${fullName}</div>
        <div style="font-size: 13px; color: #666666; margin: 6px 0;">
          ${formData.email ? `${formData.email}` : ''}
          ${formData.email && formData.phone ? ' • ' : ''}
          ${formData.phone ? `${formData.phone}` : ''}
          ${(formData.email || formData.phone) && (formData.website || 'www.company.com') ? ' • ' : ''}
          ${formData.website || 'www.company.com'}
        </div>
        ${socialHtml}
      </div>
    `;
  }

  /**
   * Generate corporate template HTML
   */
  generateCorporateTemplate(template, fullName, imageSrc, contactHtml, socialHtml, styles) {
    const { formData } = this.state;
    
    return `
      <div style="font-family: Arial, sans-serif; ${styles.containerStyle}">
        ${imageSrc && template.imageStyle !== 'hidden' ? `
          <div style="margin-bottom: 16px;">
            <img src="${imageSrc}"
                 style="width: 90px; height: 90px; object-fit: cover; ${template.imageStyle === 'rounded' ? 'border-radius: 50%;' : 'border-radius: 8px;'} border: 3px solid ${formData.color};"
                 alt="Profile Picture">
          </div>
        ` : ''}
        <div style="${styles.nameStyle}">${fullName}</div>
        ${template.showTitle && formData.title ? `<div style="${styles.titleStyle}">${formData.title}</div>` : ''}
        ${template.showCompany && formData.company ? `<div style="${styles.companyStyle}">${formData.company}</div>` : ''}
        <div style="margin-top: 16px;">
          ${contactHtml}
        </div>
        ${socialHtml}
      </div>
    `;
  }

  /**
   * Generate professional template HTML
   */
  generateProfessionalTemplate(template, fullName, imageSrc, contactHtml, socialHtml, styles) {
    const { formData } = this.state;
    
    return `
      <div style="font-family: Georgia, serif; ${styles.containerStyle}">
        <table style="border-collapse: collapse; width: 100%;">
          <tbody>
            <tr>
              ${imageSrc ? `
                <td style="vertical-align: top; padding: 0 24px 0 0; width: 100px;">
                  <img src="${imageSrc}"
                       style="width: 85px; height: 85px; object-fit: cover; border-radius: 50%; border: 4px solid ${formData.color}; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"
                       alt="Profile Picture">
                </td>
              ` : ''}
              <td style="vertical-align: top; padding: 0;">
                <div style="${styles.nameStyle}">${fullName}</div>
                ${template.showTitle && formData.title ? `<div style="${styles.titleStyle}">${formData.title}</div>` : ''}
                ${template.showCompany && formData.company ? `<div style="${styles.companyStyle}">${formData.company}</div>` : ''}
                <div style="margin-top: 12px;">
                  ${contactHtml}
                </div>
                ${socialHtml}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * Generate executive template HTML
   */
  generateExecutiveTemplate(template, fullName, imageSrc, contactHtml, socialHtml, styles) {
    const { formData } = this.state;
    
    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; ${styles.containerStyle}">
        <table style="border-collapse: collapse; width: 100%;">
          <tbody>
            <tr>
              <td style="vertical-align: top; padding: 0;">
                <div style="${styles.nameStyle}">${fullName}</div>
                ${template.showTitle && formData.title ? `<div style="${styles.titleStyle}">${formData.title}</div>` : ''}
                ${template.showCompany && formData.company ? `<div style="${styles.companyStyle}">${formData.company}</div>` : ''}
                <div style="margin-top: 16px;">
                  ${contactHtml}
                </div>
                ${socialHtml}
              </td>
              ${imageSrc ? `
                <td style="vertical-align: top; padding: 0 0 0 28px; width: 110px; text-align: right;">
                  <img src="${imageSrc}"
                       style="width: 95px; height: 95px; object-fit: cover; border-radius: 50%; border: 5px solid ${formData.color}; box-shadow: 0 6px 20px rgba(0,0,0,0.15);"
                       alt="Profile Picture">
                </td>
              ` : ''}
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * Generate horizontal template HTML (modern/classic)
   */
  generateHorizontalTemplate(template, fullName, imageSrc, contactHtml, socialHtml, styles) {
    const { formData } = this.state;
    
    const imageCell = imageSrc ? `
      <td style="vertical-align: top; padding: 0 20px 0 0; width: 95px;">
        <img src="${imageSrc}"
             style="width: 80px; height: 80px; object-fit: cover; ${template.imageStyle === 'rounded' ? 'border-radius: 50%;' : 'border-radius: 8px;'} ${this.state.currentTemplate === 'modern' ? `border: 3px solid ${formData.color};` : ''}"
             alt="Profile Picture">
      </td>
    ` : '';

    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; ${styles.containerStyle}">
        <table style="border-collapse: collapse;">
          <tbody>
            <tr>
              ${imageCell}
              <td style="vertical-align: top; padding: 0; line-height: 1.5;">
                <div style="${styles.nameStyle}">${fullName}</div>
                ${template.showTitle && formData.title ? `<div style="${styles.titleStyle}">${formData.title}</div>` : ''}
                ${template.showCompany && formData.company ? `<div style="${styles.companyStyle}">${formData.company}</div>` : ''}
                <div style="margin-top: 8px;">
                  ${contactHtml}
                </div>
                ${socialHtml}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  /* ========================================
     UTILITY METHODS
  ======================================== */

  /**
   * Clean social media URL
   */
  cleanSocialUrl(url, platform) {
    // Remove protocol if present
    url = url.replace(/^https?:\/\//, '');
    
    // Remove www if present
    url = url.replace(/^www\./, '');
    
    // Ensure it starts with the platform domain
    const config = this.socialPlatforms[platform];
    if (config && !url.includes(config.baseUrl.replace('https://', ''))) {
      return `${config.baseUrl}/${url}`;
    }
    
    return `https://${url}`;
  }

  /**
   * Update progress bar
   */
  updateProgress() {
    const requiredFields = ['firstName', 'lastName', 'email'];
    const optionalFields = ['title', 'company', 'phone', 'website', 'linkedin', 'twitter', 'github', 'instagram', 'facebook', 'tiktok'];

    const filledRequired = requiredFields.filter(field => {
      const element = this.elements[field];
      return element && element.value.trim();
    }).length;

    const filledOptional = optionalFields.filter(field => {
      const element = this.elements[field];
      return element && element.value.trim();
    }).length;

    // Calculate progress (60% for required, 40% for optional)
    const progress = ((filledRequired / requiredFields.length) * 60) +
                    ((filledOptional / optionalFields.length) * 40);

    // Update progress bar
    if (this.elements.progressFill) {
      this.elements.progressFill.style.width = `${Math.min(progress, 100)}%`;
    }

    // Update progress text
    if (this.elements.progressText) {
      this.elements.progressText.textContent = `${Math.round(progress)}% Complete`;
    }
  }

  /* ========================================
     EXPORT METHODS
  ======================================== */

  /**
   * Copy signature to clipboard
   */
  async copySignature(format) {
    try {
      let content;

      if (format === 'html') {
        const template = this.templates[this.state.currentTemplate];
        content = this.generateSignatureHTML(template);
      } else {
        content = this.generateTextSignature();
      }

      await navigator.clipboard.writeText(content);
      
      const button = format === 'html' ? this.elements.copyHtmlBtn : this.elements.copyTextBtn;
      this.showCopySuccess(button);
      this.showNotification(`${format.toUpperCase()} signature copied!`, 'success');

      // Track export action
      this.trackExportAction(format);

    } catch (error) {
      // Fallback for older browsers
      this.fallbackCopyToClipboard(content);
      this.showNotification('Failed to copy to clipboard', 'error');
      console.error('Copy error:', error);
    }
  }

  /**
   * Generate plain text signature
   */
  generateTextSignature() {
    const { formData } = this.state;
    const fullName = `${formData.firstName} ${formData.lastName}`.trim() || 'John Doe';

    let text = `${fullName}\n`;
    if (formData.title) text += `${formData.title}\n`;
    if (formData.company) text += `${formData.company}\n`;
    text += '\n---\n\n';
    
    if (formData.email) text += `📧 ${formData.email}\n`;
    if (formData.phone) text += `📱 ${formData.phone}\n`;
    text += `🌐 ${formData.website || 'www.company.com'}\n`;
    
    // Add social links
    Object.entries(this.socialPlatforms).forEach(([platform, config]) => {
      if (formData[platform]) {
        text += `${config.name}: ${formData[platform]}\n`;
      }
    });

    return text;
  }

  /**
   * Fallback copy to clipboard for older browsers
   */
  fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      this.showNotification('Copied to clipboard', 'success');
    } catch (err) {
      this.showNotification('Failed to copy', 'error');
    }
    
    document.body.removeChild(textArea);
  }

  /**
   * Show copy success animation
   */
  showCopySuccess(button) {
    if (!button) return;

    const originalHtml = button.innerHTML;
    const originalClass = button.className;

    button.innerHTML = '<span class="btn-icon">✅</span><span>Copied!</span>';
    button.classList.add('copied');
    button.disabled = true;

    setTimeout(() => {
      button.innerHTML = originalHtml;
      button.className = originalClass;
      button.disabled = false;
    }, 2000);
  }

  /**
   * Download signature as vCard
   */
  downloadSignature() {
    try {
      const { formData } = this.state;
      const fullName = `${formData.firstName} ${formData.lastName}`.trim() || 'John Doe';

      const vCard = this.generateVCard(formData, fullName);
      
      const blob = new Blob([vCard], { type: 'text/vcard;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fullName.replace(/\s+/g, '_')}_signature.vcf`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);

      this.showNotification('vCard downloaded successfully', 'success');
      this.trackExportAction('vcard');

    } catch (error) {
      this.showNotification('Failed to download vCard', 'error');
      console.error('Download error:', error);
    }
  }

  /**
   * Generate vCard content
   */
  generateVCard(formData, fullName) {
    let vCard = `BEGIN:VCARD\nVERSION:3.0\n`;
    vCard += `FN:${fullName}\n`;
    vCard += `N:${formData.lastName};${formData.firstName};;;\n`;
    
    if (formData.company) vCard += `ORG:${formData.company}\n`;
    if (formData.title) vCard += `TITLE:${formData.title}\n`;
    if (formData.email) vCard += `EMAIL:${formData.email}\n`;
    if (formData.phone) vCard += `TEL:${formData.phone}\n`;
    if (formData.website) vCard += `URL:${formData.website}\n`;
    
    // Add social media URLs
    Object.entries(this.socialPlatforms).forEach(([platform, config]) => {
      if (formData[platform]) {
        vCard += `URL:${this.cleanSocialUrl(formData[platform], platform)}\n`;
      }
    });
    
    vCard += `END:VCARD`;
    return vCard;
  }

  /* ========================================
     THEME & SETTINGS
  ======================================== */

  /**
   * Toggle application theme
   */
  toggleTheme() {
    this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
    
    // Apply theme
    document.documentElement.setAttribute('data-theme', this.state.theme);
    
    // Save preference
    localStorage.setItem('signature-studio-theme', this.state.theme);
    
    // Update toggle button
    this.updateThemeToggle();
    
    // Show feedback
    this.showNotification(`Switched to ${this.state.theme} mode`, 'info');
    
    // Track theme change
    this.trackThemeChange(this.state.theme);
  }

  /**
   * Save form data to localStorage
   */
  saveFormData() {
    try {
      this.updateFormData();
      localStorage.setItem('signature-studio-form-data', JSON.stringify(this.state.formData));
      this.state.isDirty = false;
    } catch (error) {
      console.error('Failed to save form data:', error);
    }
  }

  /**
   * Set current year in footer
   */
  setCurrentYear() {
    const currentYear = new Date().getFullYear();
    if (this.elements.currentYear) {
      this.elements.currentYear.textContent = currentYear;
    }
  }

  /* ========================================
     NOTIFICATION SYSTEM
  ======================================== */

  /**
   * Show notification with advanced styling
   */
  showNotification(message, type = 'info', duration = 3000) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');

    // Create content
    const icon = this.getNotificationIcon(type);
    notification.innerHTML = `
      <span class="notification-icon">${icon}</span>
      <span class="notification-message">${message}</span>
      <button class="notification-close" aria-label="Close notification">×</button>
    `;

    // Style notification
    this.styleNotification(notification, type);

    // Add to DOM
    document.body.appendChild(notification);

    // Handle close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => this.removeNotification(notification));

    // Animate in
    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(0)';
      notification.style.opacity = '1';
    });

    // Auto remove
    setTimeout(() => {
      this.removeNotification(notification);
    }, duration);

    // Store reference for potential removal
    this.currentNotification = notification;
  }

  /**
   * Get notification icon based on type
   */
  getNotificationIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || icons.info;
  }

  /**
   * Style notification element
   */
  styleNotification(notification, type) {
    const colors = {
      success: { bg: '#10b981', border: '#059669' },
      error: { bg: '#ef4444', border: '#dc2626' },
      warning: { bg: '#f59e0b', border: '#d97706' },
      info: { bg: '#3b82f6', border: '#2563eb' }
    };

    const color = colors[type] || colors.info;

    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      minWidth: '300px',
      maxWidth: '400px',
      padding: '16px 20px',
      borderRadius: '12px',
      background: color.bg,
      border: `1px solid ${color.border}`,
      color: 'white',
      fontSize: '14px',
      fontWeight: '500',
      zIndex: '10000',
      transform: 'translateX(400px)',
      opacity: '0',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      backdropFilter: 'blur(8px)'
    });

    // Style close button
    const closeBtn = notification.querySelector('.notification-close');
    Object.assign(closeBtn.style, {
      background: 'rgba(255, 255, 255, 0.2)',
      border: 'none',
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      color: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      marginLeft: 'auto'
    });
  }

  /**
   * Remove notification with animation
   */
  removeNotification(notification) {
    if (!notification || !notification.parentNode) return;

    notification.style.transform = 'translateX(400px)';
    notification.style.opacity = '0';

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  /* ========================================
     ANIMATION & VISUAL EFFECTS
  ======================================== */

  /**
   * Add initial page load animations
   */
  addInitialAnimations() {
    const animatableElements = [
      { selector: '.form-section', delay: 0, animation: 'fade-in' },
      { selector: '.preview-section', delay: 100, animation: 'fade-in' },
      { selector: '.template-btn', delay: 200, animation: 'scale-in' },
      { selector: '.form-group', delay: 300, animation: 'slide-up' }
    ];

    animatableElements.forEach(({ selector, delay, animation }) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = this.getInitialTransform(animation);

        setTimeout(() => {
          el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
          el.style.opacity = '1';
          el.style.transform = 'none';
          el.classList.add(animation);
        }, delay + (index * 50));
      });
    });
  }

  /**
   * Get initial transform for animation
   */
  getInitialTransform(animation) {
    const transforms = {
      'fade-in': 'translateY(20px)',
      'scale-in': 'scale(0.9)',
      'slide-up': 'translateY(30px)',
      'slide-in': 'translateX(-20px)'
    };
    return transforms[animation] || 'translateY(20px)';
  }

  /* ========================================
     ANALYTICS & TRACKING
  ======================================== */

  /**
   * Track template change for analytics
   */
  trackTemplateChange(from, to) {
    console.log(`📊 Template changed: ${from} → ${to}`);
    // Add your analytics tracking here
  }

  /**
   * Track export action
   */
  trackExportAction(format) {
    console.log(`📊 Signature exported: ${format}`);
    // Add your analytics tracking here
  }

  /**
   * Track theme change
   */
  trackThemeChange(theme) {
    console.log(`📊 Theme changed: ${theme}`);
    // Add your analytics tracking here
  }

  /**
   * Log performance metrics
   */
  logPerformanceMetrics() {
    if ('performance' in window) {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
        console.log(`⚡ Page load time: ${loadTime}ms`);
      }, 0);
    }
  }

  /* ========================================
     UTILITY METHODS
  ======================================== */

  /**
   * Generate placeholder SVG for image
   */
  generatePlaceholderSVG() {
    const svg = `
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="80" height="80" fill="#f1f5f9" rx="12"/>
        <circle cx="40" cy="30" r="14" fill="#cbd5e1"/>
        <path d="M40 50c-10 0-18 8-18 18h36c0-10-8-18-18-18z" fill="#94a3b8"/>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  /**
   * Debounce function for performance optimization
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttle function for performance optimization
   */
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Check if device is mobile
   */
  isMobile() {
    return window.innerWidth <= 768;
  }

  /**
   * Get user's preferred color scheme
   */
  getPreferredColorScheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  /**
   * Check if browser supports modern features
   */
  checkBrowserSupport() {
    const features = {
      clipboard: 'clipboard' in navigator,
      webp: this.supportsWebP(),
      customProperties: CSS.supports('color', 'var(--test)'),
      grid: CSS.supports('display', 'grid')
    };

    Object.entries(features).forEach(([feature, supported]) => {
      if (!supported) {
        console.warn(`⚠️ ${feature} not supported`);
      }
    });

    return features;
  }

  /**
   * Check WebP support
   */
  supportsWebP() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
}

/* ========================================
   APPLICATION INITIALIZATION
======================================== */

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Create global instance
    window.signatureGenerator = new SignatureGenerator();
    
    // Add to global scope for debugging
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      window.SG = window.signatureGenerator;
      console.log('🔧 Debug mode: Access via window.SG');
    }
    
  } catch (error) {
    console.error('🚨 Critical error during initialization:', error);
    
    // Show fallback error message
    document.body.innerHTML = `
      <div style="
        position: fixed; 
        top: 50%; 
        left: 50%; 
        transform: translate(-50%, -50%);
        text-align: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        color: #ef4444;
        max-width: 400px;
        padding: 2rem;
      ">
        <h2>⚠️ Application Error</h2>
        <p>Signature Studio failed to load. Please refresh the page and try again.</p>
        <button onclick="window.location.reload()" style="
          background: #ef4444;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          margin-top: 1rem;
        ">Reload Page</button>
      </div>
    `;
  }
});

// Handle page lifecycle events
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && window.signatureGenerator) {
    // Resume operations when page becomes visible
    window.signatureGenerator.updatePreview();
  }
});

// Handle window resize with debouncing
window.addEventListener('resize', () => {
  if (window.signatureGenerator) {
    clearTimeout(window.signatureGenerator.resizeTimer);
    window.signatureGenerator.resizeTimer = setTimeout(() => {
      window.signatureGenerator.updatePreview();
    }, 250);
  }
});

// Service Worker registration (if available)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('🔧 ServiceWorker registered:', registration.scope);
      })
      .catch(error => {
        console.log('🔧 ServiceWorker registration failed:', error);
      });
  });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SignatureGenerator;
}

// AMD support
if (typeof define === 'function' && define.amd) {
  define([], () => SignatureGenerator);
}
