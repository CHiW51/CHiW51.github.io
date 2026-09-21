/**
 * CHIWSPACE — 3D Immersive Universe Experience
 * Pure Three.js WebGL Interactive Art Installation
 * Layout:
 *      C   H   I   W      (ด้านบน)
 *    S   P   A   C   E    (ด้านล่าง)
 * No Frameworks, No Backend, 100% Client-Side
 */

(function () {
  'use strict';

  // --- Configuration ---
  const CONFIG = {
    camera: {
      fov: 45,
      near: 0.1,
      far: 1600,
      initialZ: 390,
      targetZ: 175,
      mobileTargetZ: 255,
    },
    particles: {
      deepStarCount: 2400,
      stardustCount: 1000,
      sparkCount: 190,
    },
    physics: {
      mouseParallaxFactor: 24,
      letterMagneticDist: 42,
      letterMagneticPull: 0.35,
      letterPullZ: 12,
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
  let chiwspaceGroup;
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
  let domHoverType = null; // 'fb', 'ig', or null for custom cursor tinting
  let raycaster = new THREE.Raycaster();
  let mouseVector = new THREE.Vector2();
  let planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  let rayIntersection = new THREE.Vector3();

  // Animation Timeline
  let introStartTime = null;
  let clock = new THREE.Clock();

  // --- Procedural 3D Letter Shapes Generator ---
  // Generates bespoke avant-garde geometric shapes for C, H, I, W, S, P, A, E
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

    // 5. Letter 'S' (Futuristic geometric S-curve)
    const shapeS = new THREE.Shape();
    shapeS.moveTo(19, 20.5);
    shapeS.lineTo(19, 26);
    shapeS.lineTo(0, 26);
    shapeS.lineTo(0, 11);
    shapeS.lineTo(13.5, 11);
    shapeS.lineTo(13.5, 5.5);
    shapeS.lineTo(0, 5.5);
    shapeS.lineTo(0, 0);
    shapeS.lineTo(19, 0);
    shapeS.lineTo(19, 15);
    shapeS.lineTo(5.5, 15);
    shapeS.lineTo(5.5, 20.5);
    shapeS.closePath();
    shapes['S'] = shapeS;

    // 6. Letter 'P' (Monolith pillar + upper loop with hole)
    const shapeP = new THREE.Shape();
    shapeP.moveTo(0, 0);
    shapeP.lineTo(5.0, 0);
    shapeP.lineTo(5.0, 11);
    shapeP.lineTo(19, 11);
    shapeP.lineTo(19, 26);
    shapeP.lineTo(0, 26);
    shapeP.closePath();

    const holeP = new THREE.Path();
    holeP.moveTo(5.5, 15.5);
    holeP.lineTo(13.5, 15.5);
    holeP.lineTo(13.5, 21.5);
    holeP.lineTo(5.5, 21.5);
    holeP.closePath();
    shapeP.holes.push(holeP);
    shapes['P'] = shapeP;

    // 7. Letter 'A' (Faceted trapezoid arch + triangular window)
    const shapeA = new THREE.Shape();
    shapeA.moveTo(0, 0);
    shapeA.lineTo(5.5, 0);
    shapeA.lineTo(7.5, 8);
    shapeA.lineTo(14.5, 8);
    shapeA.lineTo(16.5, 0);
    shapeA.lineTo(22, 0);
    shapeA.lineTo(13.5, 26);
    shapeA.lineTo(8.5, 26);
    shapeA.closePath();

    const holeA = new THREE.Path();
    holeA.moveTo(8.5, 12.5);
    holeA.lineTo(13.5, 12.5);
    holeA.lineTo(11, 20.5);
    holeA.closePath();
    shapeA.holes.push(holeA);
    shapes['A'] = shapeA;

    // 8. Letter 'E' (Sleek triple-prong monolith)
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
    camera.position.set(0, 0, CONFIG.camera.initialZ);

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
    renderer.toneMappingExposure = 1.35;
    renderer.outputEncoding = THREE.sRGBEncoding;

    // Lighting
    setupLighting();

    // 3D Objects & Systems
    setupChiwspaceMonolith();
    setupAbstractSculptures();
    setupDeepStarSystem();
    setupReactiveStardust();

    // Responsive scaling
    updateResponsiveLayout();
  }

  // --- Lighting Setup ---
  function setupLighting() {
    ambientLight = new THREE.AmbientLight(0x0a1020, 1.3);
    scene.add(ambientLight);

    // Dynamic Cursor Point Light (Cyan)
    pointLightCyan = new THREE.PointLight(CONFIG.colors.cyan, 4.2, 320, 1.5);
    pointLightCyan.position.set(0, 0, 55);
    scene.add(pointLightCyan);

    // Orbital Violet Atmosphere Light
    pointLightViolet = new THREE.PointLight(CONFIG.colors.violet, 3.5, 360, 1.4);
    pointLightViolet.position.set(-70, 35, -30);
    scene.add(pointLightViolet);

    // Counter-Orbit Magenta Light
    pointLightMagenta = new THREE.PointLight(CONFIG.colors.magenta, 2.9, 320, 1.6);
    pointLightMagenta.position.set(70, -30, -20);
    scene.add(pointLightMagenta);

    // Specular Rim Directional Light
    dirLightRim = new THREE.DirectionalLight(CONFIG.colors.platinum, 2.2);
    dirLightRim.position.set(50, 100, 90);
    scene.add(dirLightRim);
  }

  // --- Build 3D CHIWSPACE Monolith: CHIW (Top) / SPACE (Bottom) ---
  function setupChiwspaceMonolith() {
    chiwspaceGroup = new THREE.Group();
    scene.add(chiwspaceGroup);

    const shapes = createLetterShapes();

    // Line 1: C H I W (Top, Y = +20)
    // Line 2: S P A C E (Bottom, Y = -20)
    const lines = [
      { text: ['C', 'H', 'I', 'W'], yPos: 20 },
      { text: ['S', 'P', 'A', 'C', 'E'], yPos: -20 }
    ];

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

    // Generous luxury tracking/spacing for each letter
    const letterSpacings = {
      C: 28,
      H: 30,
      I: 18,
      W: 36,
      S: 30,
      P: 30,
      A: 32,
      E: 28,
    };

    let globalIndex = 0;

    lines.forEach((line) => {
      // Calculate total line width for true center alignment
      let lineWidth = 0;
      line.text.forEach((char) => {
        lineWidth += letterSpacings[char];
      });

      let currentX = -lineWidth / 2;

      line.text.forEach((char) => {
        const shape = shapes[char];
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.center(); // Center local pivot for true 3D rotations

        // Clone material so each letter can glow independently
        const material = sharedMaterial.clone();
        const mesh = new THREE.Mesh(geometry, material);

        const spacing = letterSpacings[char];
        const targetX = currentX + spacing / 2;
        currentX += spacing;

        mesh.position.set(targetX, line.yPos, 0);

        // Letter Metadata for Interactive Physics
        const letterData = {
          mesh: mesh,
          index: globalIndex,
          char: char,
          basePos: new THREE.Vector3(targetX, line.yPos, 0),
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
        chiwspaceGroup.add(mesh);

        globalIndex++;
      });
    });
  }

  // --- Abstract Floating 3D Sculptures ---
  function setupAbstractSculptures() {
    const geometries = [
      new THREE.IcosahedronGeometry(4.8, 0),
      new THREE.OctahedronGeometry(5.2, 0),
      new THREE.DodecahedronGeometry(4.5, 0),
      new THREE.TorusGeometry(9.0, 0.35, 16, 64),
      new THREE.TorusGeometry(13.0, 0.3, 16, 64),
      new THREE.IcosahedronGeometry(6.5, 1),
    ];

    const sculptureMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x162238,
      metalness: 0.85,
      roughness: 0.2,
      clearcoat: 0.8,
      transparent: true,
      opacity: 0.75,
      emissive: 0x050e1c,
    });

    const count = 20;
    for (let i = 0; i < count; i++) {
      const geom = geometries[i % geometries.length];
      const mesh = new THREE.Mesh(geom, sculptureMaterial.clone());

      const angle = (i / count) * Math.PI * 2;
      const radius = 75 + Math.random() * 105;
      const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 50;
      const y = Math.sin(angle) * (radius * 0.6) + (Math.random() - 0.5) * 50;
      const z = (Math.random() - 0.5) * 180 - 20;

      mesh.position.set(x, y, z);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

      const objData = {
        mesh: mesh,
        baseY: y,
        speedX: (Math.random() - 0.5) * 0.007,
        speedY: (Math.random() - 0.5) * 0.007,
        speedZ: (Math.random() - 0.5) * 0.007,
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
      const r = 280 + Math.random() * 500;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

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
      // Envelops both CHIW and SPACE lines
      const x = (Math.random() - 0.5) * 190;
      const y = (Math.random() - 0.5) * 105;
      const z = (Math.random() - 0.5) * 85;

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

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const speed = Math.random() * 3.0 + 1.2;

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
      size: 2.6,
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

    // Staggered Wave Bounce on CHIWSPACE Letters
    letterMeshes.forEach((item, idx) => {
      setTimeout(() => {
        item.impulseOffset = -15;
        setTimeout(() => {
          item.impulseOffset = 0;
        }, 380);
      }, idx * 35);
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

    // Mobile / Portrait adaptation for 2-line layout
    const isMobile = width < 768;
    const isSmallMobile = width < 480;

    if (isSmallMobile) {
      chiwspaceGroup.scale.set(0.68, 0.68, 0.68);
      camera.targetZ = 245;
    } else if (isMobile) {
      chiwspaceGroup.scale.set(0.82, 0.82, 0.82);
      camera.targetZ = 205;
    } else {
      chiwspaceGroup.scale.set(1.0, 1.0, 1.0);
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
    camera.position.y = mouse.y * (CONFIG.physics.mouseParallaxFactor * 0.7);
    camera.position.z = currentBaseZ;
    camera.lookAt(0, 0, 0);

    // 2. Cursor Point Light Movement in 3D Space
    pointLightCyan.position.x = mouse.x * 95;
    pointLightCyan.position.y = mouse.y * 65;
    pointLightCyan.position.z = 55;

    // Orbital Violet & Magenta lights
    pointLightViolet.position.x = Math.cos(time * 0.6) * 105;
    pointLightViolet.position.y = Math.sin(time * 0.8) * 50;
    pointLightViolet.position.z = Math.sin(time * 0.5) * 60 - 20;

    pointLightMagenta.position.x = -Math.cos(time * 0.5) * 100;
    pointLightMagenta.position.y = -Math.sin(time * 0.7) * 45;
    pointLightMagenta.position.z = Math.cos(time * 0.6) * 50 - 20;

    // 3. CHIWSPACE Letters Entrance & Magnetic Physics
    let isAnyHovered = false;

    // Raycast from mouse to 3D world plane Z=0
    mouseVector.x = mouse.targetX;
    mouseVector.y = mouse.targetY;
    raycaster.setFromCamera(mouseVector, camera);
    raycaster.ray.intersectPlane(planeZ, rayIntersection);

    letterMeshes.forEach((item) => {
      // Entrance Staggered Scaling
      const staggerDelay = 0.35 + item.index * 0.09;
      if (elapsed > staggerDelay) {
        const letterProgress = Math.min((elapsed - staggerDelay) / 0.9, 1.0);
        const elastic = 1 - Math.pow(1 - letterProgress, 4);
        item.targetScale = elastic;
      } else {
        item.targetScale = 0.001;
      }

      // Magnetic Distance Check
      const letterWorldPos = item.basePos.clone();
      const dist = letterWorldPos.distanceTo(rayIntersection);

      if (dist < CONFIG.physics.letterMagneticDist && elapsed > 1.8) {
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
        const floatWave = Math.sin(time * 1.5 + item.index * 0.45) * 1.1;
        item.targetOffset.set(0, floatWave, 0);
        item.targetRotX = Math.sin(time * 0.8 + item.index) * 0.035;
        item.targetRotY = Math.cos(time * 0.9 + item.index) * 0.035;
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

    cursor.isHover = isAnyHovered || Boolean(domHoverType);

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

        px += vels[idx];
        py += vels[idx + 1];
        pz += vels[idx + 2];

        // Proximity to raycast mouse position
        const dx = px - rayIntersection.x;
        const dy = py - rayIntersection.y;
        const dz = pz - rayIntersection.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const repelRadius = 42;

        if (dist < repelRadius && dist > 0) {
          const force = (1 - dist / repelRadius) * 1.6;
          px += (dx / dist) * force;
          py += (dy / dist) * force;
          pz += (dz / dist) * force;
        } else {
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

        vel.multiplyScalar(0.965);
      }
      posAttr.needsUpdate = true;

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

        mouse.targetX = (e.clientX / width) * 2 - 1;
        mouse.targetY = -(e.clientY / height) * 2 + 1;
      },
      { passive: true }
    );

    // Pointer Down (Click shockwave explosion)
    window.addEventListener('pointerdown', (e) => {
      cursorRing.classList.add('is-clicking');

      // Do not trigger 3D spark explosion if user clicks on UI docks or links
      if (e.target && e.target.closest && e.target.closest('.social-dock, a, button')) {
        return;
      }

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

    // Social Dock Interactive Hover Handlers
    const socialFb = document.getElementById('socialFb');
    const socialIg = document.getElementById('socialIg');

    if (socialFb) {
      socialFb.addEventListener('mouseenter', () => {
        domHoverType = 'fb';
        cursorRing.classList.add('is-hovering-fb');
        cursorDot.classList.add('is-hovering-fb');
      });
      socialFb.addEventListener('mouseleave', () => {
        if (domHoverType === 'fb') domHoverType = null;
        cursorRing.classList.remove('is-hovering-fb');
        cursorDot.classList.remove('is-hovering-fb');
      });
    }

    if (socialIg) {
      socialIg.addEventListener('mouseenter', () => {
        domHoverType = 'ig';
        cursorRing.classList.add('is-hovering-ig');
        cursorDot.classList.add('is-hovering-ig');
      });
      socialIg.addEventListener('mouseleave', () => {
        if (domHoverType === 'ig') domHoverType = null;
        cursorRing.classList.remove('is-hovering-ig');
        cursorDot.classList.remove('is-hovering-ig');
      });
    }

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
