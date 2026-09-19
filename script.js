/**
 * CHIWWIE — 3D Immersive Universe Experience
 * Pure Three.js WebGL Interactive Art Installation
 * No Frameworks, No Backend, 100% Client-Side
 */

(function () {
  'use strict';

  // --- Configuration ---
  const CONFIG = {
    camera: {
      fov: 45,
      near: 0.1,
      far: 1500,
      initialZ: 340,
      targetZ: 125,
      mobileTargetZ: 190,
    },
    particles: {
      deepStarCount: 2200,
      stardustCount: 900,
      sparkCount: 180,
    },
    physics: {
      mouseParallaxFactor: 24,
      letterMagneticDist: 42,
      letterMagneticPull: 0.35,
      letterPullZ: 10,
      springDamping: 0.085,
    },
    colors: {
      bg: 0x020206,
      fog: 0x020206,
      cyan: 0x00f2fe,
      violet: 0x8a2be2,
      magenta: 0xff007a,
      platinum: 0xffffff,
    }
  };

  // --- DOM Elements ---
  const canvas = document.getElementById('webgl-canvas');
  const openingCurtain = document.getElementById('openingCurtain');
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');

  // --- Three.js State Variables ---
  let scene, camera, renderer;
  let chiwwieGroup;
  let letterMeshes = [];
  let abstractObjects = [];
  let deepStarSystem, stardustSystem;
  let sparkParticles = [];
  
  // Lights
  let ambientLight, pointLightCyan, pointLightViolet, pointLightMagenta, dirLightRim;

  // Interaction State
  let width = window.innerWidth;
  let height = window.innerHeight;
  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0, rawX: width / 2, rawY: height / 2 };
  let cursor = { dotX: width / 2, dotY: height / 2, ringX: width / 2, ringY: height / 2, isHover: false };
  let raycaster = new THREE.Raycaster();
  let mouseVector = new THREE.Vector2();
  let planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  let rayIntersection = new THREE.Vector3();

  // Animation Timeline
  let introStartTime = null;
  let isIntroComplete = false;
  let clock = new THREE.Clock();

  // --- Procedural 3D Letter Shapes Generator ---
  // Generates bespoke avant-garde geometric shapes for C, H, I, W, W, I, E
  function createLetterShapes() {
    const shapes = {};

    // 1. Letter 'C' (Chamfered geometric luxury arch)
    const shapeC = new THREE.Shape();
    shapeC.moveTo(18, 20.5);
    shapeC.lineTo(18, 26);
    shapeC.lineTo(4, 26);
    shapeC.lineTo(0, 22);
    shapeC.lineTo(0, 4);
    shapeC.lineTo(4, 0);
    shapeC.lineTo(18, 0);
    shapeC.lineTo(18, 5.5);
    shapeC.lineTo(7, 5.5);
    shapeC.lineTo(5.5, 7);
    shapeC.lineTo(5.5, 19);
    shapeC.lineTo(7, 20.5);
    shapeC.closePath();
    shapes['C'] = shapeC;

    // 2. Letter 'H' (Dual pillar monolith + center bridge)
    const shapeH = new THREE.Shape();
    shapeH.moveTo(0, 0);
    shapeH.lineTo(5.5, 0);
    shapeH.lineTo(5.5, 10.5);
    shapeH.lineTo(14, 10.5);
    shapeH.lineTo(14, 0);
    shapeH.lineTo(19.5, 0);
    shapeH.lineTo(19.5, 26);
    shapeH.lineTo(14, 26);
    shapeH.lineTo(14, 15.5);
    shapeH.lineTo(5.5, 15.5);
    shapeH.lineTo(5.5, 26);
    shapeH.lineTo(0, 26);
    shapeH.closePath();
    shapes['H'] = shapeH;

    // 3. Letter 'I' (Sleek minimalist pillar)
    const shapeI = new THREE.Shape();
    shapeI.moveTo(0, 0);
    shapeI.lineTo(5.5, 0);
    shapeI.lineTo(5.5, 26);
    shapeI.lineTo(0, 26);
    shapeI.closePath();
    shapes['I'] = shapeI;

    // 4. Letter 'W' (Faceted futuristic double-V)
    const shapeW = new THREE.Shape();
    shapeW.moveTo(0, 26);
    shapeW.lineTo(4.2, 0);
    shapeW.lineTo(8.2, 0);
    shapeW.lineTo(12, 14.5);
    shapeW.lineTo(15.8, 0);
    shapeW.lineTo(19.8, 0);
    shapeW.lineTo(24, 26);
    shapeW.lineTo(18.6, 26);
    shapeW.lineTo(16, 9);
    shapeW.lineTo(13.8, 17.5);
    shapeW.lineTo(10.2, 17.5);
    shapeW.lineTo(8, 9);
    shapeW.lineTo(5.4, 26);
    shapeW.closePath();
    shapes['W'] = shapeW;

    // 5. Letter 'E' (Sleek triple-prong monolith)
    const shapeE = new THREE.Shape();
    shapeE.moveTo(0, 0);
    shapeE.lineTo(18, 0);
    shapeE.lineTo(18, 5.2);
    shapeE.lineTo(5.5, 5.2);
    shapeE.lineTo(5.5, 10.8);
    shapeE.lineTo(14, 10.8);
    shapeE.lineTo(14, 15.3);
    shapeE.lineTo(5.5, 15.3);
    shapeE.lineTo(5.5, 20.8);
    shapeE.lineTo(18, 20.8);
    shapeE.lineTo(18, 26);
    shapeE.lineTo(0, 26);
    shapeE.closePath();
    shapes['E'] = shapeE;

    return shapes;
  }

  // --- Initialize Three.js Scene ---
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(CONFIG.colors.bg);
    scene.fog = new THREE.FogExp2(CONFIG.colors.fog, 0.0016);

    // Camera
    const aspect = width / height;
    camera = new THREE.PerspectiveCamera(CONFIG.camera.fov, aspect, CONFIG.camera.near, CONFIG.camera.far);
    camera.position.set(0, 5, CONFIG.camera.initialZ);

    // Renderer
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.outputEncoding = THREE.sRGBEncoding;

    // Lighting
    setupLighting();

    // 3D Objects & Systems
    setupChiwwieMonolith();
    setupAbstractSculptures();
    setupDeepStarSystem();
    setupReactiveStardust();

    // Responsive scaling
    updateResponsiveLayout();
  }

  // --- Lighting Setup ---
  function setupLighting() {
    ambientLight = new THREE.AmbientLight(0x0a1020, 1.2);
    scene.add(ambientLight);

    // Dynamic Cursor Point Light (Cyan)
    pointLightCyan = new THREE.PointLight(CONFIG.colors.cyan, 3.8, 260, 1.6);
    pointLightCyan.position.set(0, 0, 45);
    scene.add(pointLightCyan);

    // Orbital Violet Atmosphere Light
    pointLightViolet = new THREE.PointLight(CONFIG.colors.violet, 3.2, 320, 1.4);
    pointLightViolet.position.set(-60, 30, -30);
    scene.add(pointLightViolet);

    // Counter-Orbit Magenta Light
    pointLightMagenta = new THREE.PointLight(CONFIG.colors.magenta, 2.6, 280, 1.6);
    pointLightMagenta.position.set(60, -25, -20);
    scene.add(pointLightMagenta);

    // Specular Rim Directional Light
    dirLightRim = new THREE.DirectionalLight(CONFIG.colors.platinum, 2.0);
    dirLightRim.position.set(40, 90, 80);
    scene.add(dirLightRim);
  }

  // --- Build 3D CHIWWIE Monolith Letters ---
  function setupChiwwieMonolith() {
    chiwwieGroup = new THREE.Group();
    scene.add(chiwwieGroup);

    const shapes = createLetterShapes();
    const wordLetters = ['C', 'H', 'I', 'W', 'W', 'I', 'E'];

    // Extrusion settings for deep beveled chamfers
    const extrudeSettings = {
      depth: 5.5,
      bevelEnabled: true,
      bevelThickness: 1.6,
      bevelSize: 1.2,
      bevelSegments: 4,
      curveSegments: 8,
    };

    // Shared Premium Metallic Material
    const sharedMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.88,
      roughness: 0.16,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 1.0,
      emissive: 0x031428,
      emissiveIntensity: 0.2,
    });

    // Letter widths & spacing
    const letterSpacings = {
      C: 22,
      H: 23,
      I: 10,
      W: 28,
      E: 22,
    };

    // Calculate total width for true center alignment
    let totalWidth = 0;
    wordLetters.forEach((char) => {
      totalWidth += letterSpacings[char];
    });

    let currentX = -totalWidth / 2;

    wordLetters.forEach((char, index) => {
      const shape = shapes[char];
      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geometry.center(); // Center local pivot for pure 3D rotations

      // Clone material so each letter can glow independently
      const material = sharedMaterial.clone();
      const mesh = new THREE.Mesh(geometry, material);

      const spacing = letterSpacings[char];
      const targetX = currentX + spacing / 2;
      currentX += spacing;

      mesh.position.set(targetX, 0, 0);

      // Letter Metadata for Interactive Physics
      const letterData = {
        mesh: mesh,
        index: index,
        char: char,
        basePos: new THREE.Vector3(targetX, 0, 0),
        currentOffset: new THREE.Vector3(0, 0, 0),
        targetOffset: new THREE.Vector3(0, 0, 0),
        rotX: 0,
        rotY: 0,
        rotZ: 0,
        targetRotX: 0,
        targetRotY: 0,
        targetRotZ: 0,
        scale: 0.001, // Starts at 0 for entrance animation
        targetScale: 1,
        isHovered: false,
        impulseOffset: 0,
      };

      mesh.userData = letterData;
      letterMeshes.push(letterData);
      chiwwieGroup.add(mesh);
    });
  }

  // --- Abstract Floating 3D Sculptures ---
  function setupAbstractSculptures() {
    const geometries = [
      new THREE.IcosahedronGeometry(4.5, 0),
      new THREE.OctahedronGeometry(5.0, 0),
      new THREE.DodecahedronGeometry(4.2, 0),
      new THREE.TorusGeometry(8.5, 0.35, 16, 64),
      new THREE.TorusGeometry(12.0, 0.3, 16, 64),
      new THREE.IcosahedronGeometry(6.0, 1),
    ];

    const sculptureMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x162238,
      metalness: 0.85,
      roughness: 0.2,
      clearcoat: 0.8,
      wireframe: false,
      transparent: true,
      opacity: 0.75,
      emissive: 0x050e1c,
    });

    const count = 18;
    for (let i = 0; i < count; i++) {
      const geom = geometries[i % geometries.length];
      const mesh = new THREE.Mesh(geom, sculptureMaterial.clone());

      // Position in wide hollow volume around CHIWWIE
      const angle = (i / count) * Math.PI * 2;
      const radius = 65 + Math.random() * 85;
      const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 40;
      const y = Math.sin(angle) * (radius * 0.5) + (Math.random() - 0.5) * 40;
      const z = (Math.random() - 0.5) * 160 - 20;

      mesh.position.set(x, y, z);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

      const objData = {
        mesh: mesh,
        baseY: y,
        speedX: (Math.random() - 0.5) * 0.008,
        speedY: (Math.random() - 0.5) * 0.008,
        speedZ: (Math.random() - 0.5) * 0.008,
        floatSpeed: Math.random() * 0.8 + 0.4,
        floatOffset: Math.random() * Math.PI * 2,
        floatAmp: Math.random() * 8 + 4,
      };

      abstractObjects.push(objData);
      scene.add(mesh);
    }
  }

  // --- Deep Cosmic Galaxy Starfield (System 1) ---
  function setupDeepStarSystem() {
    const count = CONFIG.particles.deepStarCount;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const color1 = new THREE.Color(CONFIG.colors.cyan);
    const color2 = new THREE.Color(CONFIG.colors.violet);
    const color3 = new THREE.Color(0xffffff);

    for (let i = 0; i < count; i++) {
      // Spherical distribution
      const r = 250 + Math.random() * 450;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Color variation
      const randColor = Math.random();
      let chosenColor = color3;
      if (randColor < 0.4) chosenColor = color1;
      else if (randColor < 0.7) chosenColor = color2;

      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 1.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    deepStarSystem = new THREE.Points(geometry, material);
    scene.add(deepStarSystem);
  }

  // --- Reactive Stardust Swarm (System 2) ---
  function setupReactiveStardust() {
    const count = CONFIG.particles.stardustCount;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const originalPositions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const cyan = new THREE.Color(CONFIG.colors.cyan);
    const violet = new THREE.Color(CONFIG.colors.violet);
    const magenta = new THREE.Color(CONFIG.colors.magenta);

    for (let i = 0; i < count; i++) {
      // Dense cloud around CHIWWIE
      const x = (Math.random() - 0.5) * 180;
      const y = (Math.random() - 0.5) * 70;
      const z = (Math.random() - 0.5) * 80;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;

      velocities[i * 3] = (Math.random() - 0.5) * 0.08;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.08;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.08;

      const pick = Math.random();
      const col = pick < 0.45 ? cyan : pick < 0.8 ? violet : magenta;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    stardustSystem = {
      mesh: new THREE.Points(
        geometry,
        new THREE.PointsMaterial({
          size: 2.2,
          vertexColors: true,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      ),
      originalPositions: originalPositions,
      velocities: velocities,
      count: count,
    };

    scene.add(stardustSystem.mesh);
  }

  // --- Click Shockwave Spark Explosion (System 3) ---
  function triggerSparkExplosion(origin3D) {
    const count = CONFIG.particles.sparkCount;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];
    const colors = new Float32Array(count * 3);

    const cyan = new THREE.Color(CONFIG.colors.cyan);
    const magenta = new THREE.Color(CONFIG.colors.magenta);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = origin3D.x;
      positions[i * 3 + 1] = origin3D.y;
      positions[i * 3 + 2] = origin3D.z;

      // Random 3D spherical direction
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const speed = Math.random() * 2.8 + 1.2;

      velocities.push(
        new THREE.Vector3(
          speed * Math.sin(phi) * Math.cos(theta),
          speed * Math.sin(phi) * Math.sin(theta),
          speed * Math.cos(phi)
        )
      );

      const col = Math.random() > 0.4 ? cyan : magenta;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 2.5,
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const sparkMesh = new THREE.Points(geometry, material);
    scene.add(sparkMesh);

    sparkParticles.push({
      mesh: sparkMesh,
      velocities: velocities,
      age: 0,
      maxAge: 70,
    });

    // Staggered Wave Bounce on CHIWWIE Letters
    letterMeshes.forEach((item, idx) => {
      setTimeout(() => {
        item.impulseOffset = -14;
        setTimeout(() => {
          item.impulseOffset = 0;
        }, 400);
      }, idx * 40);
    });
  }

  // --- Responsive Layout & Aspect Ratio ---
  function updateResponsiveLayout() {
    width = window.innerWidth;
    height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Mobile / Portrait adaptation
    const isMobile = width < 768;
    const isSmallMobile = width < 480;

    if (isSmallMobile) {
      chiwwieGroup.scale.set(0.68, 0.68, 0.68);
      camera.targetZ = 195;
    } else if (isMobile) {
      chiwwieGroup.scale.set(0.82, 0.82, 0.82);
      camera.targetZ = 160;
    } else {
      chiwwieGroup.scale.set(1.0, 1.0, 1.0);
      camera.targetZ = CONFIG.camera.targetZ;
    }
  }

  // --- Update Animation Logic per Frame ---
  function updateWorld(delta, time) {
    // 1. Cinematic Opening Animation Sequence
    if (introStartTime === null) {
      introStartTime = time;
      openingCurtain.classList.add('loaded');
    }

    const elapsed = time - introStartTime;
    const introDuration = 3.2; // Seconds
    const introProgress = Math.min(elapsed / introDuration, 1.0);

    // Camera Glide from initialZ to targetZ
    const easedProgress = 1 - Math.pow(1 - introProgress, 3);
    const targetZ = camera.targetZ || CONFIG.camera.targetZ;
    const currentBaseZ = THREE.MathUtils.lerp(CONFIG.camera.initialZ, targetZ, easedProgress);

    // Camera Parallax based on smoothed mouse
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    camera.position.x = mouse.x * CONFIG.physics.mouseParallaxFactor;
    camera.position.y = mouse.y * (CONFIG.physics.mouseParallaxFactor * 0.7) + 2;
    camera.position.z = currentBaseZ;
    camera.lookAt(0, 0, 0);

    // 2. Cursor Point Light Movement in 3D Space
    // Convert normalized mouse to 3D plane coordinates
    pointLightCyan.position.x = mouse.x * 90;
    pointLightCyan.position.y = mouse.y * 55;
    pointLightCyan.position.z = 45;

    // Orbital Violet & Magenta lights
    pointLightViolet.position.x = Math.cos(time * 0.6) * 90;
    pointLightViolet.position.y = Math.sin(time * 0.8) * 40;
    pointLightViolet.position.z = Math.sin(time * 0.5) * 50 - 20;

    pointLightMagenta.position.x = -Math.cos(time * 0.5) * 85;
    pointLightMagenta.position.y = -Math.sin(time * 0.7) * 35;
    pointLightMagenta.position.z = Math.cos(time * 0.6) * 40 - 20;

    // 3. CHIWWIE Letters Entrance & Magnetic Physics
    let isAnyHovered = false;

    // Raycast from mouse to 3D world plane Z=0
    mouseVector.x = mouse.targetX;
    mouseVector.y = mouse.targetY;
    raycaster.setFromCamera(mouseVector, camera);
    raycaster.ray.intersectPlane(planeZ, rayIntersection);

    letterMeshes.forEach((item) => {
      // Entrance Staggered Scaling
      const staggerDelay = 0.4 + item.index * 0.12;
      if (elapsed > staggerDelay) {
        const letterProgress = Math.min((elapsed - staggerDelay) / 1.0, 1.0);
        // Elastic overshoot easing
        const elastic = 1 - Math.pow(1 - letterProgress, 4);
        item.targetScale = elastic;
      } else {
        item.targetScale = 0.001;
      }

      // Magnetic Distance Check
      const letterWorldPos = item.basePos.clone();
      const dist = letterWorldPos.distanceTo(rayIntersection);

      if (dist < CONFIG.physics.letterMagneticDist && elapsed > 2.0) {
        const pull = (1 - dist / CONFIG.physics.letterMagneticDist);
        const easedPull = Math.pow(pull, 1.5);

        const dir = rayIntersection.clone().sub(letterWorldPos);
        item.targetOffset.x = dir.x * CONFIG.physics.letterMagneticPull * easedPull;
        item.targetOffset.y = dir.y * CONFIG.physics.letterMagneticPull * easedPull;
        item.targetOffset.z = CONFIG.physics.letterPullZ * easedPull;

        item.targetRotX = -dir.y * 0.03 * easedPull;
        item.targetRotY = dir.x * 0.03 * easedPull;
        item.targetRotZ = (dir.x / CONFIG.physics.letterMagneticDist) * 0.18 * easedPull;

        // Enhanced Specular Glow
        item.mesh.material.emissive.setHex(CONFIG.colors.cyan);
        item.mesh.material.emissiveIntensity = 0.35 + easedPull * 0.65;

        item.isHovered = true;
        isAnyHovered = true;
      } else {
        // Idle gentle float oscillation
        const floatWave = Math.sin(time * 1.5 + item.index * 0.5) * 1.2;
        item.targetOffset.set(0, floatWave, 0);
        item.targetRotX = Math.sin(time * 0.8 + item.index) * 0.04;
        item.targetRotY = Math.cos(time * 0.9 + item.index) * 0.04;
        item.targetRotZ = 0;

        item.mesh.material.emissive.setHex(0x031428);
        item.mesh.material.emissiveIntensity = 0.2;
        item.isHovered = false;
      }

      // Spring Damping Interpolation
      item.currentOffset.lerp(item.targetOffset, CONFIG.physics.springDamping);
      item.rotX += (item.targetRotX - item.rotX) * CONFIG.physics.springDamping;
      item.rotY += (item.targetRotY - item.rotY) * CONFIG.physics.springDamping;
      item.rotZ += (item.targetRotZ - item.rotZ) * CONFIG.physics.springDamping;
      item.scale += (item.targetScale - item.scale) * 0.1;

      // Apply to mesh
      const finalY = item.basePos.y + item.currentOffset.y + item.impulseOffset;
      item.mesh.position.set(
        item.basePos.x + item.currentOffset.x,
        finalY,
        item.basePos.z + item.currentOffset.z
      );
      item.mesh.rotation.set(item.rotX, item.rotY, item.rotZ);
      item.mesh.scale.set(item.scale, item.scale, item.scale);
    });

    cursor.isHover = isAnyHovered;

    // 4. Abstract 3D Sculptures Floating Animation
    abstractObjects.forEach((obj) => {
      obj.mesh.rotation.x += obj.speedX;
      obj.mesh.rotation.y += obj.speedY;
      obj.mesh.rotation.z += obj.speedZ;

      const floatY = Math.sin(time * obj.floatSpeed + obj.floatOffset) * obj.floatAmp;
      obj.mesh.position.y = obj.baseY + floatY;
    });

    // 5. Deep Starfield Rotation
    if (deepStarSystem) {
      deepStarSystem.rotation.y = time * 0.012;
      deepStarSystem.rotation.x = Math.sin(time * 0.008) * 0.05;
    }

    // 6. Reactive Stardust Swarm Physics
    if (stardustSystem) {
      const posAttr = stardustSystem.mesh.geometry.attributes.position;
      const positions = posAttr.array;
      const orig = stardustSystem.originalPositions;
      const vels = stardustSystem.velocities;

      for (let i = 0; i < stardustSystem.count; i++) {
        const idx = i * 3;
        let px = positions[idx];
        let py = positions[idx + 1];
        let pz = positions[idx + 2];

        // Drift slowly
        px += vels[idx];
        py += vels[idx + 1];
        pz += vels[idx + 2];

        // Proximity to raycast mouse position
        const dx = px - rayIntersection.x;
        const dy = py - rayIntersection.y;
        const dz = pz - rayIntersection.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const repelRadius = 35;

        if (dist < repelRadius && dist > 0) {
          const force = (1 - dist / repelRadius) * 1.5;
          px += (dx / dist) * force;
          py += (dy / dist) * force;
          pz += (dz / dist) * force;
        } else {
          // Return toward original positions with spring tension
          px += (orig[idx] - px) * 0.02;
          py += (orig[idx + 1] - py) * 0.02;
          pz += (orig[idx + 2] - pz) * 0.02;
        }

        positions[idx] = px;
        positions[idx + 1] = py;
        positions[idx + 2] = pz;
      }
      posAttr.needsUpdate = true;
    }

    // 7. Click Spark Particles Update
    for (let s = sparkParticles.length - 1; s >= 0; s--) {
      const spark = sparkParticles[s];
      spark.age++;

      const posAttr = spark.mesh.geometry.attributes.position;
      const positions = posAttr.array;

      for (let i = 0; i < spark.velocities.length; i++) {
        const idx = i * 3;
        const vel = spark.velocities[i];

        positions[idx] += vel.x;
        positions[idx + 1] += vel.y;
        positions[idx + 2] += vel.z;

        // Gravity / Drag
        vel.multiplyScalar(0.965);
      }
      posAttr.needsUpdate = true;

      // Fade out
      const progress = spark.age / spark.maxAge;
      spark.mesh.material.opacity = 1.0 - progress;

      if (spark.age >= spark.maxAge) {
        scene.remove(spark.mesh);
        spark.mesh.geometry.dispose();
        spark.mesh.material.dispose();
        sparkParticles.splice(s, 1);
      }
    }
  }

  // --- Custom Cursor Update Loop ---
  function updateCursor() {
    cursor.dotX += (mouse.rawX - cursor.dotX) * 0.55;
    cursor.dotY += (mouse.rawY - cursor.dotY) * 0.55;

    cursor.ringX += (mouse.rawX - cursor.ringX) * 0.12;
    cursor.ringY += (mouse.rawY - cursor.ringY) * 0.12;

    cursorDot.style.transform = `translate3d(${cursor.dotX}px, ${cursor.dotY}px, 0) translate(-50%, -50%)`;
    cursorRing.style.transform = `translate3d(${cursor.ringX}px, ${cursor.ringY}px, 0) translate(-50%, -50%)`;

    if (cursor.isHover) {
      cursorRing.classList.add('is-hovering');
      cursorDot.classList.add('is-hovering');
    } else {
      cursorRing.classList.remove('is-hovering');
      cursorDot.classList.remove('is-hovering');
    }
  }

  // --- Main Animation Frame Loop ---
  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    updateWorld(delta, time);
    updateCursor();

    renderer.render(scene, camera);
  }

  // --- Event Listeners Setup ---
  function setupEvents() {
    // Pointer Move
    window.addEventListener(
      'pointermove',
      (e) => {
        mouse.rawX = e.clientX;
        mouse.rawY = e.clientY;

        // Normalized Device Coordinates (-1 to +1)
        mouse.targetX = (e.clientX / width) * 2 - 1;
        mouse.targetY = -(e.clientY / height) * 2 + 1;
      },
      { passive: true }
    );

    // Pointer Down (Click shockwave explosion)
    window.addEventListener('pointerdown', (e) => {
      cursorRing.classList.add('is-clicking');

      // Project click coordinate into 3D world
      mouseVector.x = (e.clientX / width) * 2 - 1;
      mouseVector.y = -(e.clientY / height) * 2 + 1;
      raycaster.setFromCamera(mouseVector, camera);

      const hit = new THREE.Vector3();
      raycaster.ray.intersectPlane(planeZ, hit);

      triggerSparkExplosion(hit);
    });

    window.addEventListener('pointerup', () => {
      cursorRing.classList.remove('is-clicking');
    });

    // Touch Support
    window.addEventListener(
      'touchmove',
      (e) => {
        if (e.touches.length > 0) {
          const t = e.touches[0];
          mouse.rawX = t.clientX;
          mouse.rawY = t.clientY;
          mouse.targetX = (t.clientX / width) * 2 - 1;
          mouse.targetY = -(t.clientY / height) * 2 + 1;
        }
      },
      { passive: true }
    );

    // Mobile Gyroscope / Device Orientation
    if (window.DeviceOrientationEvent) {
      window.addEventListener(
        'deviceorientation',
        (e) => {
          if (e.gamma !== null && e.beta !== null) {
            const normGamma = Math.min(Math.max(e.gamma / 45, -1), 1);
            const normBeta = Math.min(Math.max((e.beta - 40) / 45, -1), 1);

            mouse.targetX = normGamma * 0.8;
            mouse.targetY = -normBeta * 0.8;
          }
        },
        { passive: true }
      );
    }

    // Window Resize
    window.addEventListener('resize', updateResponsiveLayout);
    window.addEventListener('orientationchange', () => {
      setTimeout(updateResponsiveLayout, 150);
    });
  }

  // --- Bootloader ---
  function init() {
    initScene();
    setupEvents();
    animate();
  }

  // Wait for Three.js and DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
