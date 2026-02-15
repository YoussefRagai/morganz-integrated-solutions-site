document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    const setOpen = (open) => {
      links.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    };

    toggle.addEventListener('click', () => {
      const open = !links.classList.contains('open');
      setOpen(open);
    });

    links.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setOpen(false));
    });

    document.addEventListener('click', (event) => {
      if (!links.contains(event.target) && !toggle.contains(event.target)) {
        setOpen(false);
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    });
  }

  const revealTargets = document.querySelectorAll('section, .card, .plain-block, .info-block');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealTargets.forEach((el) => {
      el.classList.add('reveal');
      observer.observe(el);
    });
  } else {
    revealTargets.forEach((el) => el.classList.add('visible'));
  }

  const contactForm = document.querySelector('[data-contact-form]');
  if (contactForm) {
    const feedback = document.getElementById('contact-form-feedback');
    const fields = Array.from(contactForm.querySelectorAll('input, textarea'));
    let isDirty = false;

    const setDirty = () => {
      isDirty = fields.some((field) => field.value.trim().length > 0);
    };

    const clearErrors = () => {
      fields.forEach((field) => {
        field.removeAttribute('aria-invalid');
      });
      if (feedback) feedback.textContent = '';
    };

    fields.forEach((field) => {
      field.addEventListener('input', setDirty);
      field.addEventListener('change', setDirty);
    });

    window.addEventListener('beforeunload', (event) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = '';
    });

    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      clearErrors();

      const errors = [];
      const name = contactForm.querySelector('#name');
      const email = contactForm.querySelector('#email');
      const message = contactForm.querySelector('#message');
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (name && !name.value.trim()) errors.push({ field: name, message: 'Please enter your name.' });
      if (email && !email.value.trim()) {
        errors.push({ field: email, message: 'Please enter your email address.' });
      } else if (email && !emailPattern.test(email.value.trim())) {
        errors.push({ field: email, message: 'Please enter a valid email address.' });
      }
      if (message && !message.value.trim()) errors.push({ field: message, message: 'Please enter a message.' });

      if (errors.length > 0) {
        errors.forEach(({ field }) => field.setAttribute('aria-invalid', 'true'));
        if (feedback) feedback.textContent = errors[0].message;
        errors[0].field.focus();
        return;
      }

      if (feedback) feedback.textContent = 'Thanks. Your message has been captured. Our engineering team will contact you.';
      contactForm.reset();
      isDirty = false;
    });
  }

  initHeroThreeAnimation();
  initFieldThreeAnimation();
  initUrbanThreeAnimation();
});

function initHeroThreeAnimation() {
  const container = document.getElementById('hero-threejs');
  const visual = document.querySelector('.hero-visual');
  if (!container || !visual) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const THREE = window.THREE;
  if (!THREE || reducedMotion) {
    visual.classList.add('fallback');
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 6.2);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  container.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xb7d6ff, 1);
  key.position.set(3, 4, 5);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x8de2a9, 0.8);
  fill.position.set(-4, -2, 4);
  scene.add(fill);

  const torus = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1.2, 0.24, 160, 18),
    new THREE.MeshStandardMaterial({
      color: 0x0a66c2,
      roughness: 0.34,
      metalness: 0.28,
      emissive: 0x0e3b68,
      emissiveIntensity: 0.25,
    }),
  );
  scene.add(torus);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.85, 0.05, 14, 110),
    new THREE.MeshStandardMaterial({
      color: 0x238636,
      roughness: 0.42,
      metalness: 0.18,
      transparent: true,
      opacity: 0.85,
    }),
  );
  ring.rotation.x = Math.PI * 0.35;
  scene.add(ring);

  const particleCount = 380;
  const pos = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i += 1) {
    const r = 2.1 + Math.random() * 1.7;
    const a = Math.random() * Math.PI * 2;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 3;
    pos[i * 3 + 2] = Math.sin(a) * r;
  }
  const particles = new THREE.BufferGeometry();
  particles.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const particleMaterial = new THREE.PointsMaterial({
    color: 0x7dc9ff,
    size: 0.03,
    transparent: true,
    opacity: 0.72,
  });
  const points = new THREE.Points(particles, particleMaterial);
  scene.add(points);

  let raf = null;
  const clock = new THREE.Clock();

  const setSize = () => {
    const rect = container.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const tick = () => {
    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    torus.rotation.x += delta * 0.32;
    torus.rotation.y += delta * 0.56;
    torus.position.y = Math.sin(elapsed * 0.75) * 0.22;

    ring.rotation.z += delta * 0.22;
    ring.position.y = Math.cos(elapsed * 0.66) * 0.12;

    points.rotation.y += delta * 0.085;
    points.rotation.x = Math.sin(elapsed * 0.22) * 0.08;

    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };

  setSize();
  tick();

  window.addEventListener('resize', setSize);
}

function initFieldThreeAnimation() {
  const container = document.getElementById('field-threejs');
  const visual = container ? container.closest('.hero-visual') : null;
  if (!container || !visual) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const THREE = window.THREE;
  if (!THREE || reducedMotion) {
    visual.classList.add('fallback');
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0.3, 7);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.68));
  const key = new THREE.DirectionalLight(0xa5f0b7, 1.1);
  key.position.set(4, 5, 4);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xd2f8de, 0.72);
  fill.position.set(-4, -2, 3);
  scene.add(fill);

  const stalkMaterial = new THREE.MeshStandardMaterial({ color: 0x238636, roughness: 0.45, metalness: 0.12 });
  const dropsMaterial = new THREE.MeshStandardMaterial({ color: 0x5bc2ff, roughness: 0.12, metalness: 0.35, transparent: true, opacity: 0.88 });

  const stems = [];
  for (let i = 0; i < 9; i += 1) {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 2.6, 18), stalkMaterial);
    stem.position.x = -2.2 + i * 0.55;
    stem.position.y = -0.9;
    stem.rotation.z = (Math.random() - 0.5) * 0.08;
    stems.push(stem);
    scene.add(stem);

    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), dropsMaterial);
    tip.position.set(stem.position.x, 0.42, 0);
    tip.userData.offset = Math.random() * Math.PI * 2;
    stems.push(tip);
    scene.add(tip);
  }

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.3, 0.04, 12, 130),
    new THREE.MeshStandardMaterial({ color: 0x8ad89a, roughness: 0.5, metalness: 0.1, transparent: true, opacity: 0.72 }),
  );
  ring.rotation.x = Math.PI * 0.42;
  scene.add(ring);

  const clock = new THREE.Clock();
  const setSize = () => {
    const rect = container.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const tick = () => {
    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    ring.rotation.z += delta * 0.18;

    stems.forEach((obj, idx) => {
      if (obj.geometry.type === 'CylinderGeometry') {
        obj.rotation.z = Math.sin(elapsed * 0.9 + idx * 0.2) * 0.08;
      } else {
        obj.position.y = 0.38 + Math.sin(elapsed * 1.8 + obj.userData.offset) * 0.07;
      }
    });

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  };

  setSize();
  tick();
  window.addEventListener('resize', setSize);
}

function initUrbanThreeAnimation() {
  const container = document.getElementById('urban-threejs');
  const visual = container ? container.closest('.hero-visual') : null;
  if (!container || !visual) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const THREE = window.THREE;
  if (!THREE || reducedMotion) {
    visual.classList.add('fallback');
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 120);
  camera.position.set(0, 2.3, 8.2);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const key = new THREE.DirectionalLight(0xb9dbff, 1.1);
  key.position.set(5, 6, 4);
  scene.add(key);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 9),
    new THREE.MeshStandardMaterial({ color: 0xeaf4ff, roughness: 0.9, metalness: 0 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.4;
  scene.add(ground);

  const blocks = [];
  for (let i = 0; i < 20; i += 1) {
    const h = 0.6 + Math.random() * 1.8;
    const b = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, h, 0.5),
      new THREE.MeshStandardMaterial({ color: i % 2 ? 0x0a66c2 : 0x2f83d8, roughness: 0.38, metalness: 0.2 }),
    );
    const gx = (i % 5) - 2;
    const gz = Math.floor(i / 5) - 2;
    b.position.set(gx * 0.9, -1.4 + h / 2, gz * 0.9);
    b.userData.baseH = h;
    b.userData.phase = Math.random() * Math.PI * 2;
    blocks.push(b);
    scene.add(b);
  }

  const arc = new THREE.Mesh(
    new THREE.TorusGeometry(2.8, 0.045, 16, 180, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x6fc3ff, roughness: 0.4, metalness: 0.2, transparent: true, opacity: 0.86 }),
  );
  arc.rotation.x = Math.PI * 0.5;
  arc.position.y = 1.05;
  scene.add(arc);

  const clock = new THREE.Clock();
  const setSize = () => {
    const rect = container.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const tick = () => {
    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    arc.rotation.z += delta * 0.2;
    blocks.forEach((b) => {
      const pulse = Math.sin(elapsed * 1.5 + b.userData.phase) * 0.14;
      const h = b.userData.baseH + pulse;
      b.scale.y = h / b.userData.baseH;
      b.position.y = -1.4 + h / 2;
    });

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  };

  setSize();
  tick();
  window.addEventListener('resize', setSize);
}
