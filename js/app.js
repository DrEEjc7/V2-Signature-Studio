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
      size: localStorage.getItem('signature-size') || 'medium',
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

    // Size configurations for responsive signatures
    this.sizeConfigs = {
      small: {
        nameSize: { minimal: '16px', modern: '18px', classic: '16px', corporate: '18px', professional: '20px', executive: '22px' },
        titleSize: '12px',
        companySize: { minimal: '13px', modern: '14px', classic: '14px', corporate: '14px', professional: '15px', executive: '16px' },
        contactSize: '12px',
        socialSize: '11px',
        imageSize: { corporate: '70px', default: '60px' },
        spacing: { small: 'margin-bottom: 4px; line-height: 1.3;', medium: 'margin-bottom: 6px; line-height: 1.4;', large: 'margin-bottom: 8px; line-height: 1.5;' },
        borderWidth: { modern: '1px', professional: '1px', executive: '2px' },
        padding: { corporate: '15px', professional: '10px', executive: '12px', default: '12px' }
      },
      medium: {
        nameSize: { minimal: '18px', modern: '22px', classic: '20px', corporate: '20px', professional: '24px', executive: '26px' },
        titleSize: '14px',
        companySize: { minimal: '14px', modern: '16px', classic: '16px', corporate: '16px', professional: '18px', executive: '19px' },
        contactSize: '14px',
        socialSize: '13px',
        imageSize: { corporate: '90px', default: '80px' },
        spacing: { small: 'margin-bottom: 6px; line-height: 1.4;', medium: 'margin-bottom: 10px; line-height: 1.5;', large: 'margin-bottom: 14px; line-height: 1.6;' },
        borderWidth: { modern: '2px', professional: '2px', executive: '3px' },
        padding: { corporate: '20px', professional: '15px', executive: '15px', default: '16px' }
      },
      large: {
        nameSize: { minimal: '20px', modern: '26px', classic: '24px', corporate: '24px', professional: '28px', executive: '30px' },
        titleSize: '16px',
        companySize: { minimal: '16px', modern: '18px', classic: '18px', corporate: '18px', professional: '20px', executive: '22px' },
        contactSize: '16px',
        socialSize: '15px',
        imageSize: { corporate: '110px', default: '100px' },
        spacing: { small: 'margin-bottom: 8px; line-height: 1.4;', medium: 'margin-bottom: 12px; line-height: 1.6;', large: 'margin-bottom: 16px; line-height: 1.7;' },
        borderWidth: { modern: '3px', professional: '3px', executive: '4px' },
        padding: { corporate: '25px', professional: '18px', executive: '18px', default: '20px' }
      }
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
      custom1Name: document.getElementById('custom1Name'),
      custom1Url: document.getElementById('custom1Url'),
      custom2Name: document.getElementById('custom2Name'),
      custom2Url: document.getElementById('custom2Url'),
      
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
      sizeBtns: document.querySelectorAll('.size-btn'),
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

    // Template and Size selection
    this.els.templateBtns.forEach(btn => {
      if (btn.dataset.template) {
        btn.addEventListener('click', () => this.selectTemplate(btn.dataset.template));
      }
      if (btn.dataset.size) {
        btn.addEventListener('click', () => this.selectSize(btn.dataset.size));
      }
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

  selectSize(size) {
    this.state.size = size;
    
    // Update all size buttons
    document.querySelectorAll('.size-btn').forEach(btn => {
      const isActive = btn.dataset.size === size;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-checked', isActive);
    });
    
    localStorage.setItem('signature-size', size);
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
      tiktok: this.els.tiktok.value.trim(),
      custom1Name: this.els.custom1Name.value.trim(),
      custom1Url: this.els.custom1Url.value.trim(),
      custom2Name: this.els.custom2Name.value.trim(),
      custom2Url: this.els.custom2Url.value.trim()
    };
  }

  generateSignature(data, template) {
    const fullName = `${data.firstName} ${data.lastName}`.trim() || 'John Doe';
    const imageHtml = this.getImageHtml(template);
    const socialHtml = this.getSocialHtml(data);
    const config = this.sizeConfigs[this.state.size];

    switch (this.state.template) {
      case 'minimal':
        return `
          <div style="font-family: Arial, sans-serif; font-size: ${config.contactSize}; line-height: 1.6; color: #333;">
            <div style="font-size: ${config.nameSize.minimal}; font-weight: bold; color: ${data.color}; ${config.spacing.medium}">${fullName}</div>
            <div style="${config.spacing.medium}">
              ${this.getMinimalContactHtml(data, config)}
            </div>
            ${socialHtml}
          </div>`;

      case 'modern':
        return `
          <table style="border-collapse: collapse; font-family: Arial, sans-serif; font-size: ${config.contactSize}; line-height: 1.6;">
            <tr>
              ${imageHtml ? `<td style="padding-right: 20px; vertical-align: top;">${imageHtml}</td>` : ''}
              <td style="vertical-align: top; position: relative;">
                <div style="border-left: ${config.borderWidth.modern} solid ${data.color}; padding-left: ${config.padding.default};">
                  <div style="font-size: ${config.nameSize.modern}; font-weight: bold; color: ${data.color}; ${config.spacing.medium}">${fullName}</div>
                  ${template.showTitle && data.title ? 
                    `<div style="font-size: ${config.titleSize}; color: #666; font-style: italic; ${config.spacing.small}">${data.title}</div>` : ''}
                  ${template.showCompany && data.company ? 
                    `<div style="font-size: ${config.companySize.modern}; font-weight: bold; color: #333; ${config.spacing.medium}">${data.company}</div>` : ''}
                  <div style="${config.spacing.medium}">
                    ${this.getContactHtml(data, config)}
                  </div>
                  ${socialHtml}
                </div>
              </td>
            </tr>
          </table>`;

      case 'classic':
        return `
          <table style="border-collapse: collapse; font-family: 'Times New Roman', serif; font-size: ${config.contactSize}; line-height: 1.6;">
            <tr>
              ${imageHtml ? `<td style="padding-right: 20px; vertical-align: top;">${imageHtml}</td>` : ''}
              <td style="vertical-align: top;">
                <div style="font-size: ${config.nameSize.classic}; font-weight: bold; color: ${data.color}; ${config.spacing.medium}">${fullName}</div>
                ${template.showTitle && data.title ? 
                  `<div style="font-size: ${config.titleSize}; color: #666; font-style: italic; ${config.spacing.small}">${data.title}</div>` : ''}
                ${template.showCompany && data.company ? 
                  `<div style="font-size: ${config.companySize.classic}; font-weight: bold; color: #333; ${config.spacing.medium}">${data.company}</div>` : ''}
                <div style="${config.spacing.medium}">
                  ${this.getContactHtml(data, config)}
                </div>
                ${socialHtml}
              </td>
            </tr>
          </table>`;

      case 'corporate':
        return `
          <div style="font-family: Arial, sans-serif; text-align: center; border: 2px solid ${data.color}; padding: ${config.padding.corporate}; border-radius: 8px; max-width: 400px;">
            ${imageHtml}
            <div style="font-size: ${config.nameSize.corporate}; font-weight: bold; color: ${data.color}; text-transform: uppercase; ${config.spacing.medium}">${fullName}</div>
            ${template.showTitle && data.title ? 
              `<div style="font-size: ${config.titleSize}; color: #666; ${config.spacing.small}">${data.title}</div>` : ''}
            ${template.showCompany && data.company ? 
              `<div style="font-size: ${config.companySize.corporate}; font-weight: bold; color: #333; text-transform: uppercase; ${config.spacing.medium}">${data.company}</div>` : ''}
            <div style="${config.spacing.medium}">
              ${this.getContactHtml(data, config)}
            </div>
            ${socialHtml}
          </div>`;

      case 'professional':
        return `
          <table style="border-collapse: collapse; font-family: Arial, sans-serif; font-size: ${config.contactSize}; line-height: 1.6;">
            <tr>
              ${imageHtml ? `<td style="padding-right: 20px; vertical-align: top;">${imageHtml}</td>` : ''}
              <td style="vertical-align: top;">
                <div style="border-bottom: ${config.borderWidth.professional} solid ${data.color}; padding-bottom: ${config.padding.professional}; margin-bottom: ${config.padding.professional};">
                  <div style="font-size: ${config.nameSize.professional}; font-weight: bold; color: ${data.color}; letter-spacing: 1px; ${config.spacing.small}">${fullName}</div>
                  ${template.showTitle && data.title ? 
                    `<div style="font-size: ${config.titleSize}; color: #555; font-weight: 600; text-transform: capitalize; ${config.spacing.small}">${data.title}</div>` : ''}
                </div>
                ${template.showCompany && data.company ? 
                  `<div style="font-size: ${config.companySize.professional}; font-weight: bold; color: #333; ${config.spacing.medium}">${data.company}</div>` : ''}
                <div style="${config.spacing.medium}">
                  ${this.getContactHtml(data, config)}
                </div>
                ${socialHtml}
              </td>
            </tr>
          </table>`;

      case 'executive':
        return `
          <table style="border-collapse: collapse; font-family: 'Georgia', serif; font-size: ${config.contactSize}; line-height: 1.7;">
            <tr>
              ${imageHtml ? `<td style="padding-right: 25px; vertical-align: top;">${imageHtml}</td>` : ''}
              <td style="vertical-align: top;">
                <div style="border-top: ${config.borderWidth.executive} solid ${data.color}; border-bottom: 1px solid ${data.color}; padding: ${config.padding.executive} 0; margin-bottom: ${config.padding.executive};">
                  <div style="font-size: ${config.nameSize.executive}; font-weight: bold; color: ${data.color}; text-transform: uppercase; letter-spacing: 2px; ${config.spacing.small}">${fullName}</div>
                  ${template.showTitle && data.title ? 
                    `<div style="font-size: ${config.titleSize}; color: #444; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; ${config.spacing.small}">${data.title}</div>` : ''}
                </div>
                ${template.showCompany && data.company ? 
                  `<div style="font-size: ${config.companySize.executive}; font-weight: bold; color: #222; ${config.spacing.medium}">${data.company}</div>` : ''}
                <div style="${config.spacing.medium}">
                  ${this.getContactHtml(data, config)}
                </div>
                ${socialHtml}
              </td>
            </tr>
          </table>`;

      default:
        return `
          <table style="border-collapse: collapse; font-family: Arial, sans-serif; font-size: ${config.contactSize}; line-height: 1.6;">
            <tr>
              ${imageHtml ? `<td style="padding-right: 20px; vertical-align: top;">${imageHtml}</td>` : ''}
              <td style="vertical-align: top;">
                <div style="font-size: ${config.nameSize.modern}; font-weight: bold; color: ${data.color}; ${config.spacing.medium}">${fullName}</div>
                ${template.showTitle && data.title ? 
                  `<div style="font-size: ${config.titleSize}; color: #666; font-style: italic; ${config.spacing.small}">${data.title}</div>` : ''}
                ${template.showCompany && data.company ? 
                  `<div style="font-size: ${config.companySize.modern}; font-weight: bold; color: #333; ${config.spacing.medium}">${data.company}</div>` : ''}
                <div style="${config.spacing.medium}">
                  ${this.getContactHtml(data, config)}
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
    const config = this.sizeConfigs[this.state.size];
    const size = this.state.template === 'corporate' ? config.imageSize.corporate : config.imageSize.default;
    const margin = this.state.template === 'corporate' ? 'margin-bottom: 15px;' : '';
    
    return `<img src="${imageSrc}" 
            style="width: ${size}; height: ${size}; object-fit: cover; 
            border-radius: ${borderRadius}; ${margin}" alt="Profile">`;
  }

  getContactHtml(data, config) {
    const items = [];
    const contactStyle = `font-size: ${config.contactSize}; color: #666; margin-bottom: 5px; display: block;`;
    
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

  getMinimalContactHtml(data, config) {
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
    const config = this.sizeConfigs[this.state.size];
    const socialStyle = `color: #666; text-decoration: none; margin-right: 15px; font-size: ${config.socialSize};`;
    
    // Existing platform links
    Object.entries(this.socialPlatforms).forEach(([platform, platformConfig]) => {
      if (data[platform]) {
        const url = this.cleanUrl(data[platform], platformConfig.baseUrl);
        
        links.push(`
          <a href="${url}" target="_blank" rel="noopener" style="${socialStyle}">
            ${platformConfig.name}
          </a>
        `);
      }
    });
    
    // Add custom links
    if (data.custom1Name && data.custom1Url) {
      const url = data.custom1Url.startsWith('http') ? data.custom1Url : `https://${data.custom1Url}`;
      links.push(`
        <a href="${url}" target="_blank" rel="noopener" style="${socialStyle}">
          ${data.custom1Name}
        </a>
      `);
    }
    
    if (data.custom2Name && data.custom2Url) {
      const url = data.custom2Url.startsWith('http') ? data.custom2Url : `https://${data.custom2Url}`;
      links.push(`
        <a href="${url}" target="_blank" rel="noopener" style="${socialStyle}">
          ${data.custom2Name}
        </a>
      `);
    }
    
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
    const optional = ['title', 'company', 'phone', 'website', 'linkedin', 'twitter', 'github', 'instagram', 'facebook', 'tiktok', 'custom1Name', 'custom1Url', 'custom2Name', 'custom2Url'];
    
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
    
    // Add custom links
    if (data.custom1Name && data.custom1Url) {
      const url = data.custom1Url.startsWith('http') ? data.custom1Url : `https://${data.custom1Url}`;
      socialLinks.push(`${data.custom1Name}: ${url}`);
    }
    
    if (data.custom2Name && data.custom2Url) {
      const url = data.custom2Url.startsWith('http') ? data.custom2Url : `https://${data.custom2Url}`;
      socialLinks.push(`${data.custom2Name}: ${url}`);
    }
    
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

      const savedSize = localStorage.getItem('signature-size');
      if (savedSize && this.sizeConfigs[savedSize]) {
        this.selectSize(savedSize);
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
