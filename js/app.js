/**
 * Signature Studio - Professional Email Signature Generator
 * Fixed for email client compatibility - no external images
 * Version: 2.1
 */

'use strict';

class SignatureStudio {
  constructor() {
    this.state = {
      theme: localStorage.getItem('signature-theme') || 'light',
      template: localStorage.getItem('signature-template') || 'modern',
      view: 'desktop',
      imageData: null,
      formData: {}
    };

    this.templates = {
      modern: { image: 'rounded', showTitle: true, showCompany: true },
      classic: { image: 'square', showTitle: true, showCompany: true },
      minimal: { image: 'hidden', showTitle: false, showCompany: false },
      corporate: { image: 'square', showTitle: true, showCompany: true },
      professional: { image: 'rounded', showTitle: true, showCompany: true },
      executive: { image: 'rounded', showTitle: true, showCompany: true }
    };

    // Contact icons as emojis for email client compatibility
    this.contactIcons = {
      email: '📧',
      phone: '📱',
      website: '🌐'
    };

    // Social platform names for text links
    this.socialPlatforms = {
      linkedin: { name: 'LinkedIn', baseUrl: 'https://linkedin.com/in' },
      twitter: { name: 'Twitter', baseUrl: 'https://twitter.com' },
      github: { name: 'GitHub', baseUrl: 'https://github.com' },
      instagram: { name: 'Instagram', baseUrl: 'https://instagram.com' },
      facebook: { name: 'Facebook', baseUrl: 'https://facebook.com' },
      tiktok: { name: 'TikTok', baseUrl: 'https://tiktok.com' }
    };

    // Placeholder image
    this.placeholderImage = this.generatePlaceholderSVG();

    this.init();
  }

  init() {
    this.cacheElements();
    this.bindEvents();
    this.loadSavedData();
    this.applyTheme();
    this.updatePreview();
    this.updateProgress();
    document.getElementById('currentYear').textContent = new Date().getFullYear();
  }

  cacheElements() {
    this.els = {
      // Form inputs
      firstName: document.getElementById('firstName'),
      lastName: document.getElementById('lastName'),
      title: document.getElementById('title'),
      company: document.getElementById('company'),
      email: document.getElementById('email'),
      phone: document.getElementById('phone'),
      website: document.getElementById('website'),
      colorPicker: document.getElementById('colorPicker'),
      colorText: document.getElementById('colorText'),
      
      // Social inputs
      linkedin: document.getElementById('linkedin'),
      twitter: document.getElementById('twitter'),
      github: document.getElementById('github'),
      instagram: document.getElementById('instagram'),
      facebook: document.getElementById('facebook'),
      tiktok: document.getElementById('tiktok'),
      
      // UI elements
      imageInput: document.getElementById('imageInput'),
      imageUpload: document.getElementById('imageUpload'),
      signatureContent: document.getElementById('signatureContent'),
      signaturePreview: document.getElementById('signaturePreview'),
      progressFill: document.getElementById('progressFill'),
      progressText: document.getElementById('progressText'),
      themeToggle: document.getElementById('themeToggle'),
      
      // Buttons
      copyHtmlBtn: document.getElementById('copyHtmlBtn'),
      copyTextBtn: document.getElementById('copyTextBtn'),
      downloadBtn: document.getElementById('downloadBtn'),
      
      // Collections
      templateBtns: document.querySelectorAll('.template-btn'),
      viewBtns: document.querySelectorAll('.view-btn'),
      inputs: document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="url"]')
    };
  }

  bindEvents() {
    // Theme toggle
    this.els.themeToggle.addEventListener('click', () => this.toggleTheme());

    // Form inputs
    this.els.inputs.forEach(input => {
      input.addEventListener('input', e => this.handleInput(e));
      input.addEventListener('blur', () => this.saveData());
    });

    // Color inputs
    this.els.colorPicker.addEventListener('input', e => {
      this.els.colorText.value = e.target.value;
      this.updatePreview();
    });

    this.els.colorText.addEventListener('input', e => {
      if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
        this.els.colorPicker.value = e.target.value;
        this.updatePreview();
      }
    });

    // Image upload
    this.els.imageUpload.addEventListener('click', () => this.els.imageInput.click());
    this.els.imageInput.addEventListener('change', e => this.handleImage(e));
    this.setupDragDrop();

    // Template selection
    this.els.templateBtns.forEach(btn => {
      btn.addEventListener('click', () => this.selectTemplate(btn.dataset.template));
    });

    // View controls
    this.els.viewBtns.forEach(btn => {
      btn.addEventListener('click', () => this.switchView(btn.dataset.view));
    });

    // Export buttons
    this.els.copyHtmlBtn.addEventListener('click', () => this.copySignature('html'));
    this.els.copyTextBtn.addEventListener('click', () => this.copySignature('text'));
    this.els.downloadBtn.addEventListener('click', () => this.downloadVCard());

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        this.copySignature('html');
      }
    });
  }

  handleInput(e) {
    const input = e.target;
    
    // Update character count
    const counter = input.nextElementSibling;
    if (counter?.classList.contains('char-count')) {
      const current = input.value.length;
      const max = input.maxLength;
      counter.textContent = `${current}/${max}`;
      counter.classList.toggle('warning', current > max * 0.8);
    }

    // Update preview with debounce
    clearTimeout(this.updateTimer);
    this.updateTimer = setTimeout(() => {
      this.updatePreview();
      this.updateProgress();
    }, 300);
  }

  setupDragDrop() {
    const upload = this.els.imageUpload;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
      upload.addEventListener(event, e => e.preventDefault());
    });

    upload.addEventListener('dragover', () => upload.classList.add('dragover'));
    upload.addEventListener('dragleave', () => upload.classList.remove('dragover'));
    upload.addEventListener('drop', e => {
      upload.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file?.type.startsWith('image/')) {
        this.processImage(file);
      }
    });
  }

  async handleImage(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.processImage(file);
    }
  }

  async processImage(file) {
    if (file.size > 5 * 1024 * 1024) {
      this.showToast('Image must be less than 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Resize to max 400x400
        let { width, height } = img;
        const maxSize = 400;
        
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        this.state.imageData = canvas.toDataURL('image/jpeg', 0.9);
        this.updatePreview();
        this.saveData();
        this.showToast('Image uploaded successfully', 'success');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  selectTemplate(template) {
    this.state.template = template;
    
    this.els.templateBtns.forEach(btn => {
      const isActive = btn.dataset.template === template;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-checked', isActive);
    });
    
    localStorage.setItem('signature-template', template);
    this.updatePreview();
  }

  switchView(view) {
    this.state.view = view;
    
    this.els.viewBtns.forEach(btn => {
      const isActive = btn.dataset.view === view;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive);
    });
    
    this.els.signaturePreview.classList.toggle('mobile-view', view === 'mobile');
  }

  toggleTheme() {
    this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
    this.applyTheme();
    localStorage.setItem('signature-theme', this.state.theme);
  }

  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.state.theme);
    this.els.themeToggle.querySelector('.theme-icon').textContent = 
      this.state.theme === 'dark' ? '🌞' : '🌙';
  }

  updatePreview() {
    const data = this.getFormData();
    const template = this.templates[this.state.template];
    const html = this.generateSignature(data, template);
    this.els.signatureContent.innerHTML = html;
  }

  getFormData() {
    return {
      firstName: this.els.firstName.value.trim(),
      lastName: this.els.lastName.value.trim(),
      title: this.els.title.value.trim(),
      company: this.els.company.value.trim(),
      email: this.els.email.value.trim(),
      phone: this.els.phone.value.trim(),
      website: this.els.website.value.trim(),
      color: this.els.colorPicker.value,
      linkedin: this.els.linkedin.value.trim(),
      twitter: this.els.twitter.value.trim(),
      github: this.els.github.value.trim(),
      instagram: this.els.instagram.value.trim(),
      facebook: this.els.facebook.value.trim(),
      tiktok: this.els.tiktok.value.trim()
    };
  }

  generateSignature(data, template) {
    const fullName = `${data.firstName} ${data.lastName}`.trim() || 'John Doe';
    const imageHtml = this.getImageHtml(template);
    const socialHtml = this.getSocialHtml(data);

    // Add proper spacing for email clients
    const spacing = {
      small: 'margin-bottom: 6px; line-height: 1.4;',
      medium: 'margin-bottom: 10px; line-height: 1.5;',
      large: 'margin-bottom: 14px; line-height: 1.6;'
    };

    switch (this.state.template) {
      case 'minimal':
        return `
          <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333;">
            <div style="font-size: 18px; font-weight: bold; color: ${data.color}; ${spacing.medium}">${fullName}</div>
            <div style="${spacing.medium}">
              ${this.getMinimalContactHtml(data)}
            </div>
            ${socialHtml}
          </div>`;

      case 'modern':
        return `
          <table style="border-collapse: collapse; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">
            <tr>
              ${imageHtml ? `<td style="padding-right: 20px; vertical-align: top;">${imageHtml}</td>` : ''}
              <td style="vertical-align: top; position: relative;">
                <div style="border-left: 4px solid ${data.color}; padding-left: 16px;">
                  <div style="font-size: 22px; font-weight: bold; color: ${data.color}; ${spacing.medium}">${fullName}</div>
                  ${template.showTitle && data.title ? 
                    `<div style="font-size: 14px; color: #666; font-style: italic; ${spacing.small}">${data.title}</div>` : ''}
                  ${template.showCompany && data.company ? 
                    `<div style="font-size: 16px; font-weight: bold; color: #333; ${spacing.medium}">${data.company}</div>` : ''}
                  <div style="${spacing.medium}">
                    ${this.getContactHtml(data)}
                  </div>
                  ${socialHtml}
                </div>
              </td>
            </tr>
          </table>`;

      case 'classic':
        return `
          <table style="border-collapse: collapse; font-family: 'Times New Roman', serif; font-size: 14px; line-height: 1.6;">
            <tr>
              ${imageHtml ? `<td style="padding-right: 20px; vertical-align: top;">${imageHtml}</td>` : ''}
              <td style="vertical-align: top;">
                <div style="font-size: 20px; font-weight: bold; color: ${data.color}; ${spacing.medium}">${fullName}</div>
                ${template.showTitle && data.title ? 
                  `<div style="font-size: 14px; color: #666; font-style: italic; ${spacing.small}">${data.title}</div>` : ''}
                ${template.showCompany && data.company ? 
                  `<div style="font-size: 16px; font-weight: bold; color: #333; ${spacing.medium}">${data.company}</div>` : ''}
                <div style="${spacing.medium}">
                  ${this.getContactHtml(data)}
                </div>
                ${socialHtml}
              </td>
            </tr>
          </table>`;

      case 'corporate':
        return `
          <div style="font-family: Arial, sans-serif; text-align: center; border: 2px solid ${data.color}; padding: 20px; border-radius: 8px; max-width: 400px;">
            ${imageHtml}
            <div style="font-size: 20px; font-weight: bold; color: ${data.color}; text-transform: uppercase; ${spacing.medium}">${fullName}</div>
            ${template.showTitle && data.title ? 
              `<div style="font-size: 14px; color: #666; ${spacing.small}">${data.title}</div>` : ''}
            ${template.showCompany && data.company ? 
              `<div style="font-size: 16px; font-weight: bold; color: #333; text-transform: uppercase; ${spacing.medium}">${data.company}</div>` : ''}
            <div style="${spacing.medium}">
              ${this.getContactHtml(data)}
            </div>
            ${socialHtml}
          </div>`;

      case 'professional':
        return `
          <table style="border-collapse: collapse; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">
            <tr>
              ${imageHtml ? `<td style="padding-right: 20px; vertical-align: top;">${imageHtml}</td>` : ''}
              <td style="vertical-align: top;">
                <div style="border-bottom: 2px solid ${data.color}; padding-bottom: 12px; margin-bottom: 12px;">
                  <div style="font-size: 24px; font-weight: bold; color: ${data.color}; letter-spacing: 1px; ${spacing.small}">${fullName}</div>
                  ${template.showTitle && data.title ? 
                    `<div style="font-size: 16px; color: #555; font-weight: 600; text-transform: capitalize; ${spacing.small}">${data.title}</div>` : ''}
                </div>
                ${template.showCompany && data.company ? 
                  `<div style="font-size: 18px; font-weight: bold; color: #333; ${spacing.medium}">${data.company}</div>` : ''}
                <div style="${spacing.medium}">
                  ${this.getContactHtml(data)}
                </div>
                ${socialHtml}
              </td>
            </tr>
          </table>`;

      case 'executive':
        return `
          <table style="border-collapse: collapse; font-family: 'Georgia', serif; font-size: 14px; line-height: 1.7;">
            <tr>
              ${imageHtml ? `<td style="padding-right: 25px; vertical-align: top;">${imageHtml}</td>` : ''}
              <td style="vertical-align: top;">
                <div style="border-top: 3px solid ${data.color}; border-bottom: 1px solid ${data.color}; padding: 15px 0; margin-bottom: 15px;">
                  <div style="font-size: 26px; font-weight: bold; color: ${data.color}; text-transform: uppercase; letter-spacing: 2px; ${spacing.small}">${fullName}</div>
                  ${template.showTitle && data.title ? 
                    `<div style="font-size: 17px; color: #444; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; ${spacing.small}">${data.title}</div>` : ''}
                </div>
                ${template.showCompany && data.company ? 
                  `<div style="font-size: 19px; font-weight: bold; color: #222; ${spacing.medium}">${data.company}</div>` : ''}
                <div style="${spacing.medium}">
                  ${this.getContactHtml(data)}
                </div>
                ${socialHtml}
              </td>
            </tr>
          </table>`;

      default:
        return `
          <table style="border-collapse: collapse; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">
            <tr>
              ${imageHtml ? `<td style="padding-right: 20px; vertical-align: top;">${imageHtml}</td>` : ''}
              <td style="vertical-align: top;">
                <div style="font-size: 22px; font-weight: bold; color: ${data.color}; ${spacing.medium}">${fullName}</div>
                ${template.showTitle && data.title ? 
                  `<div style="font-size: 14px; color: #666; font-style: italic; ${spacing.small}">${data.title}</div>` : ''}
                ${template.showCompany && data.company ? 
                  `<div style="font-size: 16px; font-weight: bold; color: #333; ${spacing.medium}">${data.company}</div>` : ''}
                <div style="${spacing.medium}">
                  ${this.getContactHtml(data)}
                </div>
                ${socialHtml}
              </td>
            </tr>
          </table>`;
    }
  }

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

  getImageHtml(template) {
    if (template.image === 'hidden') return '';
    
    const imageSrc = this.state.imageData || this.placeholderImage;
    const borderRadius = template.image === 'rounded' ? '50%' : '8px';
    const size = this.state.template === 'corporate' ? '90px' : '80px';
    const margin = this.state.template === 'corporate' ? 'margin-bottom: 15px;' : '';
    
    return `<img src="${imageSrc}" 
            style="width: ${size}; height: ${size}; object-fit: cover; 
            border-radius: ${borderRadius}; ${margin}" alt="Profile">`;
  }

  getContactHtml(data) {
    const items = [];
    const contactStyle = 'font-size: 14px; color: #666; margin-bottom: 5px; display: block;';
    
    if (data.email) {
      items.push(`
        <div style="${contactStyle}">
          <span style="margin-right: 8px;">${this.contactIcons.email}</span>
          <a href="mailto:${data.email}" style="color: #666; text-decoration: none;">${data.email}</a>
        </div>
      `);
    }
    if (data.phone) {
      items.push(`
        <div style="${contactStyle}">
          <span style="margin-right: 8px;">${this.contactIcons.phone}</span>
          <a href="tel:${data.phone}" style="color: #666; text-decoration: none;">${data.phone}</a>
        </div>
      `);
    }
    if (data.website) {
      const cleanWebsite = data.website.replace(/^https?:\/\//, '').replace(/^www\./, '');
      const websiteUrl = data.website.startsWith('http') ? data.website : `https://${data.website}`;
      items.push(`
        <div style="${contactStyle}">
          <span style="margin-right: 8px;">${this.contactIcons.website}</span>
          <a href="${websiteUrl}" style="color: #666; text-decoration: none;" target="_blank">${cleanWebsite}</a>
        </div>
      `);
    }
    
    return items.join('');
  }

  getMinimalContactHtml(data) {
    const items = [];
    
    if (data.email) {
      items.push(`${this.contactIcons.email} <a href="mailto:${data.email}" style="color: #666; text-decoration: none;">${data.email}</a>`);
    }
    if (data.phone) {
      items.push(`${this.contactIcons.phone} <a href="tel:${data.phone}" style="color: #666; text-decoration: none;">${data.phone}</a>`);
    }
    if (data.website) {
      const cleanWebsite = data.website.replace(/^https?:\/\//, '').replace(/^www\./, '');
      const websiteUrl = data.website.startsWith('http') ? data.website : `https://${data.website}`;
      items.push(`${this.contactIcons.website} <a href="${websiteUrl}" style="color: #666; text-decoration: none;" target="_blank">${cleanWebsite}</a>`);
    }
    
    return items.join(' &nbsp;•&nbsp; ');
  }

  getSocialHtml(data) {
    const links = [];
    const socialStyle = 'color: #666; text-decoration: none; margin-right: 15px; font-size: 13px;';
    
    Object.entries(this.socialPlatforms).forEach(([platform, config]) => {
      if (data[platform]) {
        const url = this.cleanUrl(data[platform], config.baseUrl);
        
        links.push(`
          <a href="${url}" target="_blank" rel="noopener" style="${socialStyle}">
            ${config.name}
          </a>
        `);
      }
    });
    
    return links.length ? `<div style="margin-top: 12px; border-top: 1px solid #eee; padding-top: 10px;">${links.join('')}</div>` : '';
  }

  cleanUrl(url, baseUrl) {
    url = url.replace(/^https?:\/\//, '').replace(/^www\./, '');
    if (!url.includes(baseUrl.replace('https://', ''))) {
      // Handle usernames for platforms that need it (like tiktok)
      if (baseUrl.includes('tiktok')) {
         return `${baseUrl}/@${url.replace('@','')}`;
      }
      return `${baseUrl}/${url}`;
    }
    return `https://${url}`;
  }

  getTemplateStyles(color) {
    // Simplified styles - main styling now in generateSignature method
    return {
      modern: { accent: color },
      classic: { accent: color },
      minimal: { accent: color },
      corporate: { accent: color },
      professional: { accent: color },
      executive: { accent: color }
    };
  }

  updateProgress() {
    const required = ['firstName', 'lastName', 'email'];
    const optional = ['title', 'company', 'phone', 'website', 'linkedin', 'twitter', 'github', 'instagram', 'facebook', 'tiktok'];
    
    const filledRequired = required.filter(field => this.els[field]?.value.trim()).length;
    const filledOptional = optional.filter(field => this.els[field]?.value.trim()).length;
    
    const progress = Math.round(
      (filledRequired / required.length) * 60 + 
      (filledOptional / optional.length) * 40
    );
    
    this.els.progressFill.style.width = `${progress}%`;
    this.els.progressText.textContent = `${progress}% Complete`;
  }

  async copySignature(format) {
    try {
      const content = format === 'html' 
        ? this.els.signatureContent.innerHTML 
        : this.generateTextSignature();
      
      await navigator.clipboard.writeText(content);
      this.showCopySuccess(format === 'html' ? this.els.copyHtmlBtn : this.els.copyTextBtn);
      this.showToast(`${format.toUpperCase()} signature copied!`, 'success');
    } catch (err) {
      this.fallbackCopy(content);
    }
  }

  generateTextSignature() {
    const data = this.getFormData();
    const fullName = `${data.firstName} ${data.lastName}`.trim() || 'John Doe';
    
    let text = `${fullName}\n`;
    if (data.title) text += `${data.title}\n`;
    if (data.company) text += `${data.company}\n\n`;
    if (data.email) text += `📧 ${data.email}\n`;
    if (data.phone) text += `📱 ${data.phone}\n`;
    if (data.website) text += `🌐 ${data.website}\n`;
    
    // Add social links
    const socialLinks = [];
    Object.entries(this.socialPlatforms).forEach(([platform, config]) => {
      if (data[platform]) {
        const url = this.cleanUrl(data[platform], config.baseUrl);
        socialLinks.push(`${config.name}: ${url}`);
      }
    });
    
    if (socialLinks.length) {
      text += `\n${socialLinks.join('\n')}`;
    }
    
    return text;
  }

  fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  showCopySuccess(button) {
    const original = button.innerHTML;
    button.innerHTML = '<span class="btn-icon">✅</span><span>Copied!</span>';
    button.classList.add('copied');
    
    setTimeout(() => {
      button.innerHTML = original;
      button.classList.remove('copied');
    }, 2000);
  }

  downloadVCard() {
    const data = this.getFormData();
    const fullName = `${data.firstName} ${data.lastName}`.trim() || 'John Doe';
    
    let vcard = `BEGIN:VCARD\nVERSION:3.0\n`;
    vcard += `FN:${fullName}\n`;
    vcard += `N:${data.lastName};${data.firstName};;;\n`;
    if (data.company) vcard += `ORG:${data.company}\n`;
    if (data.title) vcard += `TITLE:${data.title}\n`;
    if (data.email) vcard += `EMAIL:${data.email}\n`;
    if (data.phone) vcard += `TEL:${data.phone}\n`;
    if (data.website) vcard += `URL:${data.website}\n`;
    vcard += `END:VCARD`;
    
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fullName.replace(/\s+/g, '_')}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
    
    this.showToast('vCard downloaded successfully', 'success');
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${message}</span>
      <button onclick="this.parentElement.remove()">×</button>
    `;
    
    Object.assign(toast.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '16px 20px',
      borderRadius: '8px',
      background: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6',
      color: 'white',
      fontSize: '14px',
      fontWeight: '500',
      zIndex: '10000',
      transform: 'translateX(400px)',
      transition: 'transform 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
    });
    
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(0)';
    });
    
    setTimeout(() => {
      toast.style.transform = 'translateX(400px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  saveData() {
    const data = this.getFormData();
    localStorage.setItem('signature-data', JSON.stringify(data));
    if (this.state.imageData) {
      localStorage.setItem('signature-image', this.state.imageData);
    }
  }

  loadSavedData() {
    try {
      const savedData = localStorage.getItem('signature-data');
      if (savedData) {
        const data = JSON.parse(savedData);
        Object.entries(data).forEach(([key, value]) => {
          if (this.els[key] && value) {
            this.els[key].value = value;
            this.handleInput({ target: this.els[key] });
          }
        });
      }
      
      const savedImage = localStorage.getItem('signature-image');
      if (savedImage) {
        this.state.imageData = savedImage;
      }
      
      const savedTemplate = localStorage.getItem('signature-template');
      if (savedTemplate && this.templates[savedTemplate]) {
        this.selectTemplate(savedTemplate);
      }
    } catch (err) {
      console.error('Error loading saved data:', err);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.signatureStudio = new SignatureStudio();
});
