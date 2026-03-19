/*
  Scroll-reactive navigation behavior
  ---------------------------------
  Goals:
  1) Change the header style after a small scroll threshold (e.g., add background/shadow).
  2) Detect scroll direction (up/down) to slightly compact the header when scrolling down.

  Performance considerations:
  - Uses a passive scroll listener so scrolling isn't blocked.
  - Uses requestAnimationFrame to throttle DOM writes to at most 1 per frame.
  - Only updates DOM attributes when state actually changes.

  Accessibility considerations:
  - Uses CSS :focus-visible for keyboard focus.
  - Respects prefers-reduced-motion (handled in CSS).
*/

(() => {
  const header = document.querySelector('[data-js="site-header"]');
  if (!header) return;

  // Threshold (px) after which the header becomes “scrolled” (solid background + shadow)
  const SCROLL_THRESHOLD = 12;

  let lastY = window.scrollY || 0;
  let ticking = false;

  // Internal state to avoid redundant attribute writes
  let isScrolled = false;
  let direction = 'up';

  function applyHeaderState(nextY) {
    const nextIsScrolled = nextY > SCROLL_THRESHOLD;

    // Direction detection with a small deadzone to avoid flicker
    const delta = nextY - lastY;
    const deadzone = 2;
    const nextDirection = delta > deadzone ? 'down' : delta < -deadzone ? 'up' : direction;

    if (nextIsScrolled !== isScrolled) {
      isScrolled = nextIsScrolled;
      header.setAttribute('data-scrolled', String(isScrolled));
    }

    if (nextDirection !== direction) {
      direction = nextDirection;
      header.setAttribute('data-direction', direction);
    }

    lastY = nextY;
  }

  function onScroll() {
    const nextY = window.scrollY || 0;

    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(() => {
        applyHeaderState(nextY);
        ticking = false;
      });
    }
  }

  // Initialize attributes so first paint is correct if the page is reloaded mid-scroll
  applyHeaderState(window.scrollY || 0);

  window.addEventListener('scroll', onScroll, { passive: true });

  // Example: set footer year
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  // --- Scroll Reveal & Scramble Logic ---
  const observerOptions = { threshold: 0.15 };
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // Animate only once per load
        
        // Hacker Scramble Decrypt Logic
        if (entry.target.classList.contains('scramble')) {
          let iterations = 0; 
          const final = entry.target.dataset.value; 
          const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
          let interval = setInterval(() => {
            entry.target.innerText = final.split("").map((l, i) => {
              if (i < Math.floor(iterations)) return l; 
              return letters[Math.floor(Math.random() * letters.length)];
            }).join("");
            if (iterations >= final.length) {
              entry.target.innerText = final; // Ensure perfect match at end
              clearInterval(interval);
            }
            iterations += 1/4;
          }, 30);
        }
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // --- Interactive UI Physics (Next-Level) ---

  // 1. Ambient Mouse Glow
  const cursorGlow = document.createElement('div');
  cursorGlow.id = 'cursorGlow';
  document.body.appendChild(cursorGlow);

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Smooth lerping for glow
  function animateGlow() {
    currentX += (mouseX - currentX) * 0.12;
    currentY += (mouseY - currentY) * 0.12;
    cursorGlow.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateGlow);
  }
  animateGlow();

  // 2. 3D Card Tilt Engine & Spotlight Reflection
  window.handleCardTilt = function(e) {
    if (window.innerWidth <= 860) return; // Disable on mobile
    const card = e.currentTarget;
    card.style.transition = 'none';
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Inject Spotlight CSS Variables directly into the element
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  window.resetCardTilt = function(e) {
    if (window.innerWidth <= 860) return;
    const card = e.currentTarget;
    card.style.transition = 'transform 0.5s var(--ease-elastic)';
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  // Apply to static cards (like the FAQ area or manual cards)
  document.querySelectorAll('.card, .faq').forEach(card => {
    card.addEventListener('mousemove', window.handleCardTilt);
    card.addEventListener('mouseleave', window.resetCardTilt);
  });

  // --- AWWWARDS FEATURES (Super-Max Level) ---
  
  if (window.innerWidth > 860) {
    // 1. Magnetic Custom Cursor
    const customDot = document.createElement('div');
    customDot.className = 'custom-cursor';
    document.body.appendChild(customDot);
    
    let dotX = mouseX, dotY = mouseY;
    function animateCustomCursor() {
      dotX += (mouseX - dotX) * 0.25;
      dotY += (mouseY - dotY) * 0.25;
      customDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(animateCustomCursor);
    }
    animateCustomCursor();

    // Rebind magnetic hovers occasionally for dynamically loaded items
    setInterval(() => {
      document.querySelectorAll('a, button, .card, summary, input, textarea').forEach(el => {
        if(!el.dataset.magnetic) {
          el.dataset.magnetic = 'true';
          el.addEventListener('mouseenter', () => customDot.classList.add('hovering'));
          el.addEventListener('mouseleave', () => customDot.classList.remove('hovering'));
        }
      });
    }, 1000);

    // 2. Interactive Particles Network (Canvas)
    const canvas = document.createElement('canvas');
    canvas.id = 'particleCanvas';
    document.body.prepend(canvas);
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];
    
    function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize); resize();
    
    class Particle {
      constructor() { this.x = Math.random()*w; this.y = Math.random()*h; this.vx = (Math.random()-0.5)*0.6; this.vy = (Math.random()-0.5)*0.6; this.r = Math.random()*1.5+0.5; }
      update() {
        this.x += this.vx; this.y += this.vy;
        if(this.x<0 || this.x>w) this.vx*=-1; if(this.y<0 || this.y>h) this.vy*=-1;
        let dx = mouseX - this.x; let dy = mouseY - this.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        if(dist < 150) { this.x -= dx*0.03; this.y -= dy*0.03; } // Physics: Repel from mouse
      }
      draw() { ctx.fillStyle = 'rgba(0, 240, 255, 0.4)'; ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI*2); ctx.fill(); }
    }
    for(let i=0; i<65; i++) particles.push(new Particle());
    
    function animateParticles() {
      ctx.clearRect(0,0,w,h);
      for(let i=0; i<particles.length; i++) {
        particles[i].update(); particles[i].draw();
        for(let j=i+1; j<particles.length; j++) {
          let dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          let distSq = dx*dx + dy*dy;
          if(distSq < 15000) { 
            ctx.strokeStyle = `rgba(122, 0, 255, ${1 - Math.sqrt(distSq)/122})`; 
            ctx.lineWidth = 0.5; 
            ctx.beginPath(); 
            ctx.moveTo(particles[i].x, particles[i].y); 
            ctx.lineTo(particles[j].x, particles[j].y); 
            ctx.stroke(); 
          }
        }
      }
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  // --- Mobile Navigation Logic ---
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const siteNav = document.getElementById('siteNav');
  const navLinks = document.querySelectorAll('.nav-link');

  function updateMenuState(isOpen) {
    if (isOpen) {
      siteNav.classList.add('is-open');
      mobileMenuBtn.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
    } else {
      siteNav.classList.remove('is-open');
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    }
  }

  if (mobileMenuBtn && siteNav) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = siteNav.classList.contains('is-open');
      updateMenuState(!isOpen);
    });

    // Close mobile menu when a child link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        updateMenuState(false);
      });
    });
  }

  // --- Supabase Integration ---

  const supabaseUrl = 'https://fsjxyrsicsflsqwrbvof.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzanh5cnNpY3NmbHNxd3Jidm9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MjAwNDcsImV4cCI6MjA4OTM5NjA0N30.QjAofUeZO8DrzcCLQwdxsuy0lhmOg4tlcnP3XFWZi3w';
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  // Function to show a temporary message on form submission
  function showMessage(form, msg, isError = false, timeout = 5000) {
    const msgDiv = form.querySelector('.form-message');
    if (!msgDiv) return;
    msgDiv.textContent = msg;
    msgDiv.style.color = isError ? '#ff4e4e' : 'var(--accent)';
    msgDiv.style.display = 'block';
    setTimeout(() => {
      msgDiv.style.display = 'none';
      msgDiv.textContent = '';
    }, timeout);
  }

  // --- Photo Upload Logic ---
  let lostSelectedFiles = [];
  let foundSelectedFiles = [];

  function handleFileInput(e, filesArray, previewContainerId, maxFiles = 3) {
    const input = e.target;
    for (let i = 0; i < input.files.length; i++) {
      if (filesArray.length >= maxFiles) {
        alert(`You can only upload up to ${maxFiles} photos.`);
        break;
      }
      const file = input.files[i];
      
      const fileId = Math.random().toString(36).substring(7);
      const fileObj = { file, id: fileId };
      filesArray.push(fileObj);

      const reader = new FileReader();
      reader.onload = function(evt) {
        const previewContainer = document.getElementById(previewContainerId);
        const div = document.createElement('div');
        div.className = 'preview-item';
        div.dataset.id = fileId;
        div.innerHTML = `
          <img src="${evt.target.result}" alt="Preview" />
          <button type="button" class="remove-btn" title="Remove photo">&times;</button>
        `;
        div.querySelector('.remove-btn').addEventListener('click', () => {
          const index = filesArray.findIndex(f => f.id === fileId);
          if (index > -1) filesArray.splice(index, 1);
          div.remove();
          if (filesArray.length === 0) input.value = '';
        });
        previewContainer.appendChild(div);
      };
      reader.readAsDataURL(file);
    }
    input.value = '';
  }

  const lostPhotoInput = document.getElementById('lostPhotoInput');
  if (lostPhotoInput) {
    lostPhotoInput.addEventListener('change', (e) => handleFileInput(e, lostSelectedFiles, 'lostPhotoPreview', 3));
  }

  const foundPhotoInput = document.getElementById('foundPhotoInput');
  if (foundPhotoInput) {
    foundPhotoInput.addEventListener('change', (e) => handleFileInput(e, foundSelectedFiles, 'foundPhotoPreview', 3));
  }

  // Handle generalized form submissions
  async function submitForm(e, table) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Submitting...';
      btn.disabled = true;

      // Get current user id
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showMessage(form, 'You must be logged in to submit.', true);
        btn.textContent = originalText;
        btn.disabled = false;
        return;
      }
      data.user_id = session.user.id; // Attach user_id

      let photoUrls = [];
      if (table === 'items') {
        if (form.id === 'reportFoundForm' && foundSelectedFiles.length === 0) {
          showMessage(form, 'You must upload at least 1 photo for a found item.', true);
          btn.textContent = originalText;
          btn.disabled = false;
          return;
        }

        const filesToUpload = form.id === 'reportLostForm' ? lostSelectedFiles : (form.id === 'reportFoundForm' ? foundSelectedFiles : []);
        if (filesToUpload.length > 0) {
          btn.textContent = 'Uploading Photos...';
          for (const fileObj of filesToUpload) {
            const file = fileObj.file;
            const ext = file.name.split('.').pop() || 'jpg';
            const fileName = `${session.user.id}_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
            const { data: uploadData, error: uploadError } = await supabase.storage.from('item-photos').upload(fileName, file);
            
            if (uploadError) {
              console.error('Photo upload error:', uploadError);
            } else if (uploadData) {
              const { data: publicUrlData } = supabase.storage.from('item-photos').getPublicUrl(uploadData.path);
              photoUrls.push(publicUrlData.publicUrl);
            }
          }
        }
        if (photoUrls.length > 0) {
          data.photos = photoUrls;
        }
      }

      const { error } = await supabase.from(table).insert([data]);

      btn.textContent = originalText;
      btn.disabled = false;

      if (!error) {
        showMessage(form, 'Successfully submitted!');
        form.reset();
        
        // Reset photo state
        if (form.id === 'reportLostForm') {
          lostSelectedFiles = [];
          const preview = document.getElementById('lostPhotoPreview');
          if(preview) preview.innerHTML = '';
        } else if (form.id === 'reportFoundForm') {
          foundSelectedFiles = [];
          const preview = document.getElementById('foundPhotoPreview');
          if(preview) preview.innerHTML = '';
        }

        if (table === 'items') {
          fetchItems(); // Refresh the items list
        }
      } else {
        showMessage(form, error.message || 'Submission failed.', true);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showMessage(form, 'A network error occurred.', true);
    }
  }

  // Bind forms
  const reportLostForm = document.getElementById('reportLostForm');
  if (reportLostForm) reportLostForm.addEventListener('submit', (e) => submitForm(e, 'items'));

  const reportFoundForm = document.getElementById('reportFoundForm');
  if (reportFoundForm) reportFoundForm.addEventListener('submit', (e) => submitForm(e, 'items'));

  const helpForm = document.getElementById('helpForm');
  if (helpForm) helpForm.addEventListener('submit', (e) => submitForm(e, 'inquiries'));

  // Fetch and display items
  async function fetchItems(searchQuery = '') {
    const container = document.getElementById('itemsContainer');
    if (!container) return;

    try {
      // Shimmer Skeleton Loading State
      container.innerHTML = `
        <article class="card skeleton"></article>
        <article class="card skeleton"></article>
        <article class="card skeleton"></article>
      `;
      
      let query = supabase.from('items').select('*').order('created_at', { ascending: false });
      
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      container.innerHTML = ''; // Clear container

      if (error) throw error;

      if (!data || data.length === 0) {
        container.innerHTML = '<article class="card"><h3>No items found</h3><p>Try a different search term.</p></article>';
        return;
      }

      data.forEach(item => {
        const card = document.createElement('article');
        card.className = `card ${item.type === 'found' ? 'card--featured' : ''}`;
        
        const typeBadge = item.type === 'lost' ? '<span style="color: #ff4e4e; font-weight: bold;">[LOST]</span>' : '<span style="color: var(--accent); font-weight: bold;">[FOUND]</span>';
        const dateStr = item.date ? new Date(item.date).toLocaleDateString() : '';

        let photosHtml = '';
        if (item.photos && item.photos.length > 0) {
          photosHtml = '<div class="card-photos">';
          item.photos.forEach(url => {
            photosHtml += `<img src="${url}" alt="Item Photo" loading="lazy" />`;
          });
          photosHtml += '</div>';
        }

        card.innerHTML = `
          <h3>${typeBadge} ${item.title}</h3>
          <p><strong>Location:</strong> ${item.location || 'N/A'} <br/> <strong>Date:</strong> ${dateStr}</p>
          <p style="margin-top: 10px; font-size: 0.95em; color: var(--muted);">${item.description || ''}</p>
          ${photosHtml}
        `;
        
        // Attach 3D tilt physics dynamically
        card.addEventListener('mousemove', window.handleCardTilt);
        card.addEventListener('mouseleave', window.resetCardTilt);
        
        container.appendChild(card);
      });
    } catch (error) {
      console.error('Error fetching items:', error);
      container.innerHTML = '<article class="card"><h3>Error</h3><p>Failed to load items. Check console.</p></article>';
    }
  }

  // Search input binding
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    let timeoutId;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fetchItems(e.target.value);
      }, 300); // 300ms debounce
    });
  }

  // --- Auth UI Logic ---
  const authNavBtn = document.getElementById('authNavBtn');
  const authModal = document.getElementById('authModal');
  const closeAuthBtn = document.getElementById('closeAuthBtn');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  const otpForm = document.getElementById('otpForm');
  const otpEmail = document.getElementById('otpEmail');
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  const authToggleLink = document.getElementById('authToggleLink');
  const authTitle = document.getElementById('authTitle');
  
  let currentAuthMode = 'login'; // 'login', 'register', 'forgot', 'otp'

  function switchAuthMode(mode) {
    currentAuthMode = mode;
    [loginForm, registerForm, forgotPasswordForm, otpForm].forEach(f => {
      if (f) {
        f.style.display = 'none';
        f.reset();
        const msg = f.querySelector('.form-message');
        if (msg) msg.style.display = 'none';
      }
    });

    if (mode === 'login') {
      authTitle.textContent = 'Login';
      authToggleLink.style.display = 'inline';
      authToggleLink.textContent = 'Need an account? Register here.';
      if(loginForm) loginForm.style.display = 'flex';
    } else if (mode === 'register') {
      authTitle.textContent = 'Register';
      authToggleLink.style.display = 'inline';
      authToggleLink.textContent = 'Already have an account? Login here.';
      if(registerForm) registerForm.style.display = 'flex';
    } else if (mode === 'forgot') {
      authTitle.textContent = 'Reset Password';
      authToggleLink.style.display = 'inline';
      authToggleLink.textContent = 'Back to Login';
      if(forgotPasswordForm) forgotPasswordForm.style.display = 'flex';
    } else if (mode === 'otp') {
      authTitle.textContent = 'Verify OTP';
      authToggleLink.style.display = 'inline';
      authToggleLink.textContent = 'Cancel Request (Back to Login)';
      if(otpForm) otpForm.style.display = 'flex';
    }
  }

  async function updateAuthUI() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      if (authNavBtn) authNavBtn.textContent = 'Logout';
      document.querySelectorAll('.auth-message').forEach(el => el.style.display = 'none');
      document.querySelectorAll('.protected-form').forEach(el => el.style.display = 'grid');
    } else {
      if (authNavBtn) authNavBtn.textContent = 'Login';
      document.querySelectorAll('.auth-message').forEach(el => el.style.display = 'block');
      document.querySelectorAll('.protected-form').forEach(el => el.style.display = 'none');
    }
  }

  // Supabase Auth state listener
  supabase.auth.onAuthStateChange((event, session) => {
    updateAuthUI();
  });

  // Check for Email Verification Redirect from Supabase
  window.addEventListener('load', async () => {
    if (window.location.hash.includes('type=signup')) {
      alert("Your email has been successfully verified! Please log in manually to access your account.");
      window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
      
      // Supabase natively auto-logs in the user upon confirmation.
      // We explicitly sign them out to force the manual login step requested.
      await supabase.auth.signOut();
      updateAuthUI();

      // Open Login Modal automatically
      document.body.classList.add('modal-open');
      authModal.showModal();

      switchAuthMode('login');
    }
  });

  // Bind Open/Close Modal
  if (authNavBtn) {
    authNavBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.auth.signOut();
        updateAuthUI();
      } else {
        document.body.classList.add('modal-open');
        authModal.showModal();
      }
    });
  }

  document.querySelectorAll('.open-auth').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      document.body.classList.add('modal-open');
      authModal.showModal();
    });
  });

  if (authModal) {
    authModal.addEventListener('close', () => {
      document.body.classList.remove('modal-open');
    });
  }

  if (closeAuthBtn) {
    closeAuthBtn.addEventListener('click', () => authModal.close());
  }

  // Toggle Login/Register
  if (authToggleLink) {
    authToggleLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentAuthMode === 'login') {
        switchAuthMode('register');
      } else {
        switchAuthMode('login'); // Any other mode -> login
      }
    });
  }

  // Forgot Password Link Click
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      switchAuthMode('forgot');
    });
  }

  // Handle Login Submissions
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(loginForm);
      const email = formData.get('email');
      const password = formData.get('password');
      
      try {
        const btn = loginForm.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = 'Please wait...';
        btn.disabled = true;

        const result = await supabase.auth.signInWithPassword({ email, password });

        btn.textContent = originalText;
        btn.disabled = false;

        if (result.error) {
          showMessage(loginForm, result.error.message, true);
        } else {
          authModal.close();
          updateAuthUI();
          loginForm.reset();
        }
      } catch (error) {
        console.error('Login error:', error);
        showMessage(loginForm, 'Network error occurred.', true);
      }
    });
  }

  // Handle Register Submissions
  if (registerForm) {
    // --- REAL-TIME FRONTEND DUPLICATE EMAIL CHECK (ON BLUR) ---
    const registerEmailInput = registerForm.querySelector('input[name="email"]');
    if (registerEmailInput) {
      registerEmailInput.addEventListener('blur', async (e) => {
        const email = e.target.value.trim();
        if (!email) return;
        
        try {
          const { data: emailExists } = await supabase.rpc('check_email_exists', { lookup_email: email });
          if (emailExists === true) {
            showMessage(registerForm, 'This email address is already associated with an existing account. Please use a different email or log in instead.', true, 6000);
            e.target.style.borderColor = '#ff4e4e';
            e.target.style.boxShadow = '0 0 0 4px rgba(255, 78, 78, 0.1)';
          } else {
            e.target.style.borderColor = ''; // reset to default css rule
            e.target.style.boxShadow = '';
            const msgDiv = registerForm.querySelector('.form-message');
            if (msgDiv && msgDiv.textContent.includes('already associated')) {
              msgDiv.style.display = 'none';
              msgDiv.textContent = '';
            }
          }
        } catch (err) {
          console.error('Real-time validation error', err);
        }
      });
    }
    // ----------------------------------------------------------

    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(registerForm);
      const email = formData.get('email');
      const password = formData.get('password');
      const fullName = formData.get('full_name');
      const mobileNumber = formData.get('mobile_number');
      
      try {
        const btn = registerForm.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = 'Please wait...';
        btn.disabled = true;

        // --- DUPLICATE EMAIL CHECK (Server-side validation via RPC) ---
        const { data: emailExists, error: rpcError } = await supabase.rpc('check_email_exists', { lookup_email: email });
        
        if (emailExists === true) {
          showMessage(registerForm, 'This email address is already associated with an existing account. Please use a different email or log in instead.', true, 8000);
          btn.textContent = originalText;
          btn.disabled = false;
          return; // Stop execution immediately, reject registration
        }
        // --------------------------------------------------------------

        const result = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              full_name: fullName,
              mobile_number: mobileNumber
            }
          }
        });

        btn.textContent = originalText;
        btn.disabled = false;

        if (result.error) {
          if (result.error.message && result.error.message.toLowerCase().includes('error sending confirmation email')) {
            showMessage(registerForm, 'Setup Error: Supabase free-tier 3 email/hr limit reached. Please configure a Custom SMTP (like Resend) in your Supabase Dashboard to test unlimited emails.', true, 12000);
          } else {
            showMessage(registerForm, result.error.message, true);
          }
        } else {
          // Whether session exists or not, enforcement demands we enter verified state via email
          showMessage(registerForm, 'A verification email has been sent to your email address. Please verify your email to activate your account.', false, 10000);
          
          // Switch back to Login view after delay
          setTimeout(() => {
            switchAuthMode('login');
          }, 5000);
        }
      } catch (error) {
        console.error('Register error:', error);
        showMessage(registerForm, 'Network error occurred.', true);
      }
    });
  }

  // Handle Forgot Password (Send OTP)
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(forgotPasswordForm);
      const email = formData.get('email');
      
      try {
        const btn = forgotPasswordForm.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = 'Sending...';
        btn.disabled = true;

        const { error } = await supabase.auth.resetPasswordForEmail(email);

        btn.textContent = originalText;
        btn.disabled = false;

        if (error) {
          showMessage(forgotPasswordForm, error.message, true, 8000);
        } else {
          // Switch to OTP Form
          switchAuthMode('otp');
          if(otpEmail) otpEmail.value = email; // Keep track of email for verifyOtp
        }
      } catch (error) {
        console.error('Request OTP error:', error);
        showMessage(forgotPasswordForm, 'Network error occurred.', true);
      }
    });
  }

  // Handle Verify & Reset (OTP Form)
  if (otpForm) {
    otpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(otpForm);
      const email = formData.get('email');
      const token = formData.get('otp');
      const password = formData.get('password');

      try {
        const btn = otpForm.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = 'Verifying...';
        btn.disabled = true;

        // Verify the 6-digit OTP
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          email,
          token,
          type: 'recovery'
        });

        if (verifyError) {
          btn.textContent = originalText;
          btn.disabled = false;
          showMessage(otpForm, verifyError.message, true, 8000);
          return;
        }

        // OTP verified successfully (user gets a session)
        // Now update their password
        const { error: updateError } = await supabase.auth.updateUser({
          password: password
        });

        if (updateError) {
          btn.textContent = originalText;
          btn.disabled = false;
          showMessage(otpForm, updateError.message, true, 8000);
          return;
        }

        btn.textContent = originalText;
        btn.disabled = false;

        showMessage(otpForm, 'Password has been set successfully! Please log in.', false, 4000);
        
        // Log them out and wait a moment before sending them to Login screen
        await supabase.auth.signOut();
        setTimeout(() => {
          switchAuthMode('login');
        }, 3000);

      } catch (error) {
        console.error('OTP Verification or Password Update error:', error);
        showMessage(otpForm, 'Network error occurred.', true);
        const btn = otpForm.querySelector('button[type="submit"]');
        btn.textContent = 'Verify & Reset';
        btn.disabled = false;
      }
    });
  }

  // Set max date limit for date pickers to today
  const todayDate = new Date().toISOString().split('T')[0];
  document.querySelectorAll('input[type="date"]').forEach(input => {
    input.setAttribute('max', todayDate);
  });

  // Initial UI state setup
  updateAuthUI();
  // Initial fetch
  fetchItems();

})();
