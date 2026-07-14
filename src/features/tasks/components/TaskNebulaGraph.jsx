import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import * as d3 from 'd3-force-3d';

// --- Star Flare Texture — a true glowing star point (hot white core fading through the
// domain color, additive blended) instead of a shaded sphere. This is what actually reads
// as "a star" rather than a lit ball, since spheres always show a flat side away from light.
function createStarTexture(hexColor) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const c = new THREE.Color(hexColor);

  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.12, `rgba(255,255,255,0.95)`);
  grad.addColorStop(0.3, `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},0.85)`);
  grad.addColorStop(0.6, `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},0.25)`);
  grad.addColorStop(1, `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// --- Premium Orb Texture — replaces flat plastic-looking flat color fills with a soft
// gaseous gradient + fine grain, similar to how the sun/planets are rendered in the
// reference image (radial light falloff, subtle surface variation, not a flat disc)
function createOrbTexture(hexColor) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const c = new THREE.Color(hexColor);
  const hsl = {};
  c.getHSL(hsl);

  const light = new THREE.Color().setHSL(hsl.h, Math.min(1, hsl.s * 0.9), Math.min(0.92, hsl.l + 0.35));
  const mid = new THREE.Color().setHSL(hsl.h, hsl.s, hsl.l);
  const dark = new THREE.Color().setHSL(hsl.h, Math.min(1, hsl.s * 1.1), hsl.l * 0.45);

  const cx = size * 0.38, cy = size * 0.36;
  const grad = ctx.createRadialGradient(cx, cy, 0, size / 2, size / 2, size * 0.72);
  grad.addColorStop(0, `#${light.getHexString()}`);
  grad.addColorStop(0.45, `#${mid.getHexString()}`);
  grad.addColorStop(1, `#${dark.getHexString()}`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Fine grain / cloud-like noise so it doesn't read as a flat gradient sphere
  const imgData = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 14;
    imgData.data[i] += n;
    imgData.data[i + 1] += n;
    imgData.data[i + 2] += n;
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// --- Starfield background — two depth layers like real space, not a flat dot grid
function createStarfield(count, radius, size, opacity, color) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = radius * (0.4 + Math.random() * 0.6);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color,
    size,
    transparent: true,
    opacity,
    sizeAttenuation: true
  });
  return new THREE.Points(geo, mat);
}

// --- Text Label Generator ---
function createTextSprite(text, fontSize, color, isBigNode) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  context.font = `bold ${fontSize}px Inter, sans-serif`;
  const textWidth = context.measureText(text).width;

  canvas.width = textWidth + 32;
  canvas.height = fontSize + 24;

  // Background pill
  if (isBigNode) {
    context.fillStyle = 'rgba(0, 0, 0, 0.6)';
    context.roundRect(0, 0, canvas.width, canvas.height, canvas.height / 2);
    context.fill();
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
  } else {
    context.fillStyle = 'rgba(0, 0, 0, 0.4)';
    context.roundRect(0, 0, canvas.width, canvas.height, canvas.height / 2);
    context.fill();
  }

  context.font = `bold ${fontSize}px Inter, sans-serif`;
  context.fillStyle = color;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;

  const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, depthTest: false });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.renderOrder = 999;

  sprite.scale.set(canvas.width / (isBigNode ? 5 : 10), canvas.height / (isBigNode ? 5 : 10), 1);
  return sprite;
}

// --- Mini Task Card Board — shows title + description as a compact card ---
function createTaskCardSprite(title, description, color) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const w = 320, h = 100, r = 10, pad = 12;
  canvas.width = w;
  canvas.height = h;

  // Card background
  ctx.fillStyle = 'rgba(8, 10, 20, 0.85)';
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, r);
  ctx.fill();

  // Left accent bar
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(0, 0, 4, h, [r, 0, 0, r]);
  ctx.fill();

  // Border
  ctx.strokeStyle = color + '60';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, r);
  ctx.stroke();

  // Title text
  const displayTitle = title.length > 28 ? title.slice(0, 28) + '…' : title;
  ctx.font = 'bold 16px Inter, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(displayTitle, pad + 6, pad);

  // Description text (2 lines max)
  ctx.font = '12px Inter, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  const maxLineW = w - pad * 2 - 6;
  const desc = description || '';
  const words = desc.split(' ');
  let line = '', lineY = pad + 24, lineCount = 0;
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxLineW) {
      ctx.fillText(line, pad + 6, lineY);
      lineY += 16;
      lineCount++;
      line = word;
      if (lineCount >= 2) { line += '…'; break; }
    } else {
      line = test;
    }
  }
  if (line && lineCount < 2) ctx.fillText(line, pad + 6, lineY);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;

  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  sprite.renderOrder = 998;
  sprite.scale.set(w / 18, h / 18, 1);
  return sprite;
}

const TaskNebulaGraph = forwardRef(function TaskNebulaGraph({ data, onTaskSelect, width, height }, externalRef) {
  const graphRef = useRef();
  const [focusedDomain, setFocusedDomain] = useState(null);
  const [focusedTask, setFocusedTask] = useState(null);
  const textureCache = useRef({});

  const getOrbTexture = useCallback((color) => {
    if (!textureCache.current[color]) {
      textureCache.current[color] = createOrbTexture(color);
    }
    return textureCache.current[color];
  }, []);

  const starTextureCache = useRef({});
  const getStarTexture = useCallback((color) => {
    if (!starTextureCache.current[color]) {
      starTextureCache.current[color] = createStarTexture(color);
    }
    return starTextureCache.current[color];
  }, []);

  // Give every node a fixed random phase/speed once, so its float animation
  // is unique and stable across re-renders instead of resetting
  useEffect(() => {
    data.nodes.forEach(node => {
      if (node._floatPhase === undefined) {
        node._floatPhase = Math.random() * Math.PI * 2;
        node._floatSpeed = 0.4 + Math.random() * 0.4;
        node._floatAmp = node.isBig ? 1.5 : 2.5 + Math.random() * 2;
      }
    });
  }, [data]);

  // Custom node geometry
  const nodeThreeObject = useCallback((node) => {
    const group = new THREE.Group();

    // The Orb — textured MeshPhysicalMaterial instead of a flat single-color
    // MeshStandardMaterial, which is what was giving the "plastic toy" look
    const sphereGeo = new THREE.SphereGeometry(node.val * 0.55, 24, 24);
    const isDimmed = focusedDomain && node.domain !== focusedDomain && node.id !== focusedDomain;
    const isHighlighted = focusedDomain && (node.domain === focusedDomain || node.id === focusedDomain);
    const orbTexture = getOrbTexture(node.color);
    const sphereMat = new THREE.MeshPhysicalMaterial({
      map: orbTexture,
      emissiveMap: orbTexture,
      color: 0xffffff,
      roughness: 0.55,
      metalness: 0.05,
      clearcoat: 0.4,
      clearcoatRoughness: 0.6,
      transparent: true,
      opacity: isDimmed ? 0.08 : (node.isBig ? 1 : 0.92),
      emissive: node.color,
      emissiveIntensity: node.isBig ? (isHighlighted ? 0.7 : 0.4) : (isHighlighted ? 0.55 : 0.25)
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    group.add(sphere);

    // Invisible hit-sphere sized to the full flare — keeps the click target generous
    // and matching what the user visually sees as "the star", not just its tiny core
    const hitGeo = new THREE.SphereGeometry(node.val * (node.isBig ? 2.2 : 1.6), 8, 8);
    const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
    const hitSphere = new THREE.Mesh(hitGeo, hitMat);
    group.add(hitSphere);

    // The Label — small nodes normally only show labels on close proximity via opacity fade,
    // but when their domain is actively filtered, force them fully visible so the
    // "scrambled" tasks become readable once you click their hub
    const sprite = createTextSprite(node.name, node.isBig ? 44 : 20, node.color, node.isBig);
    sprite.position.y = node.val + (node.isBig ? 10 : 4);

    sprite.onBeforeRender = function(renderer, scene, camera) {
      if (node.isBig) {
        this.material.opacity = (focusedDomain && node.id !== focusedDomain) ? 0.08 : 1;
        return;
      }
      if (focusedDomain && node.domain === focusedDomain) {
        this.material.opacity = 1;
        return;
      }
      const dist = camera.position.distanceTo(group.position);
      const maxDist = 180;
      const minDist = 60;
      let opacity = 1 - (dist - minDist) / (maxDist - minDist);
      opacity = Math.max(0, Math.min(1, opacity));
      if (focusedDomain && node.domain !== focusedDomain) opacity = 0.03;
      this.material.opacity = opacity;
    };

    group.add(sprite);

    // Task card board — replaces the hard-to-read floating description text.
    // When a domain is filtered, each task node morphs into a compact card
    // displaying title + description, making the nebula actually useful.
    if (!node.isBig && node.description) {
      const cardSprite = createTaskCardSprite(node.name, node.description, node.color);
      cardSprite.position.y = node.val + 6;
      cardSprite.onBeforeRender = function() {
        this.material.opacity = (focusedDomain && node.domain === focusedDomain) ? 0.95 : 0;
      };
      group.add(cardSprite);
    }

    // Star flare — reduced intensity so the nebula reads as elegant, not blinding.
    const starTexture = getStarTexture(node.color);
    const flareOpacity = (focusedDomain && node.id !== focusedDomain && node.domain !== focusedDomain)
      ? 0.03
      : (node.isBig ? 0.45 : 0.35);
    const flareMat = new THREE.SpriteMaterial({
      map: starTexture,
      transparent: true,
      opacity: flareOpacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const flareSize = node.val * (node.isBig ? 5 : 3.5);
    const flare = new THREE.Sprite(flareMat);
    flare.scale.set(flareSize, flareSize, 1);
    flare.renderOrder = 1;
    group.add(flare);

    // Subtle continuous floating motion — offsets the whole node group each frame
    // using a per-node sine wave. This is applied at render time on top of the
    // physics-settled base position, so it never fights or destabilizes the layout.
    group.onBeforeRender = function() {
      const t = performance.now() * 0.001 * node._floatSpeed;
      const amp = node._floatAmp || 2;
      this.position.x = node.x + Math.sin(t + node._floatPhase) * amp;
      this.position.y = node.y + Math.cos(t * 0.8 + node._floatPhase) * amp;
      this.position.z = node.z + Math.sin(t * 0.6 + node._floatPhase * 1.3) * amp;
    };

    return group;
  }, [focusedDomain]);

  // Handle Graph clicks
  const handleNodeClick = useCallback((node) => {
    if (!graphRef.current) return;

    if (node.isBig) {
      setFocusedDomain(node.id);
      setFocusedTask(null);
      onTaskSelect(null);

      const distance = 220;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
      const newPos = { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio };

      graphRef.current.cameraPosition(newPos, node, 2000);
    } else {
      setFocusedTask(node.id);
      setFocusedDomain(node.domain);
      onTaskSelect(node);

      const distance = 120;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
      const camPos = new THREE.Vector3(node.x * distRatio, node.y * distRatio, node.z * distRatio);
      const nodePos = new THREE.Vector3(node.x, node.y, node.z);

      const dir = new THREE.Vector3().subVectors(nodePos, camPos).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(dir, up).normalize();

      const shiftAmount = distance * 0.4;
      const lookAtTarget = nodePos.clone().add(right.multiplyScalar(shiftAmount));

      graphRef.current.cameraPosition(camPos, lookAtTarget, 2000);
    }
  }, [onTaskSelect]);

  const handleBackgroundClick = useCallback(() => {
    setFocusedDomain(null);
    setFocusedTask(null);
    onTaskSelect(null);
  }, [onTaskSelect]);

  useImperativeHandle(externalRef, () => ({
    zoomIn: () => {
      if (!graphRef.current) return;
      const cam = graphRef.current.camera();
      const target = new THREE.Vector3(0, 0, 0);
      const dir = new THREE.Vector3().subVectors(cam.position, target).normalize();
      const currentDist = cam.position.distanceTo(target);
      const newDist = Math.max(40, currentDist * 0.7);
      const newPos = target.clone().add(dir.multiplyScalar(newDist));
      graphRef.current.cameraPosition(newPos, target, 600);
    },
    zoomOut: () => {
      if (!graphRef.current) return;
      const cam = graphRef.current.camera();
      const target = new THREE.Vector3(0, 0, 0);
      const dir = new THREE.Vector3().subVectors(cam.position, target).normalize();
      const currentDist = cam.position.distanceTo(target);
      const newDist = Math.min(700, currentDist * 1.4);
      const newPos = target.clone().add(dir.multiplyScalar(newDist));
      graphRef.current.cameraPosition(newPos, target, 600);
    },
    resetView: () => {
      setFocusedDomain(null);
      setFocusedTask(null);
      onTaskSelect(null);
      graphRef.current?.cameraPosition({ x: 0, y: 0, z: 400 }, { x: 0, y: 0, z: 0 }, 1200);
    }
  }));



  // Scene + force setup — this is the part that creates the "nebula" spread
  useEffect(() => {
    if (graphRef.current) {
      const scene = graphRef.current.scene();

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
      dirLight.position.set(200, 200, 200);
      scene.add(dirLight);

      // Zoom — smooth damped scroll, clamped range so users can't clip or lose context
      const controls = graphRef.current.controls();
      if (controls) {
        controls.minDistance = 60;
        controls.maxDistance = 600;
        controls.enableDamping = true;
        controls.dampingFactor = 0.12;
        controls.zoomSpeed = 0.4;
        controls.rotateSpeed = 0.45;
        controls.enablePan = false;
      }

      if (!scene.getObjectByName('nebula-starfield-far')) {
        const farStars = createStarfield(1800, 950, 1.1, 0.45, 0x8899bb);
        farStars.name = 'nebula-starfield-far';
        scene.add(farStars);

        const nearStars = createStarfield(250, 600, 2.2, 0.8, 0xffffff);
        nearStars.name = 'nebula-starfield-near';
        scene.add(nearStars);
      }

      // Links do NOT pull tasks toward their hub anymore — this is what was still
      // clustering things no matter how the other forces were tuned. Now links exist
      // purely as data for the click-filter logic, not as a physical constraint.
      graphRef.current.d3Force('link').distance(400).strength(0);

      // Even repulsion across all nodes — hubs and tasks treated the same, so nothing
      // naturally organizes into groups. This is what actually scrambles it.
      graphRef.current.d3Force('charge').strength(-14).distanceMax(260);

      // Moderate center pull keeps the whole scattered field within view
      graphRef.current.d3Force('center', d3.forceCenter(0, 0, 0).strength(0.06));
      graphRef.current.d3Force('x', d3.forceX(0).strength(0.015));
      graphRef.current.d3Force('y', d3.forceY(0).strength(0.015));
      graphRef.current.d3Force('z', d3.forceZ(0).strength(0.015));

      // Just enough collision to keep nodes from stacking exactly on top of each other
      graphRef.current.d3Force('collide', d3.forceCollide().radius(node => node.isBig ? 14 : 5).strength(0.6));

      // graphRef.current.d3ReheatSimulation();
    }
  }, [data]);

  return (
    <ForceGraph3D
      ref={graphRef}
      width={width}
      height={height}
      graphData={data}
      backgroundColor="rgba(0,0,0,0)"
      nodeThreeObject={nodeThreeObject}
      nodeResolution={16}
      d3AlphaDecay={0.008}
      d3AlphaMin={0}
      d3VelocityDecay={0.45}
      cooldownTime={Infinity}
      linkWidth={0.3}
      linkOpacity={1}
      linkMaterial={(link) => {
        const isFocusedLink = focusedDomain && (link.target.id === focusedDomain || link.target.domain === focusedDomain);
        return new THREE.LineBasicMaterial({
          color: link.color,
          transparent: true,
          // No focus = links invisible, so nothing gives away the scramble.
          // Focus a hub = only ITS links light up, tracing straight to its scattered tasks.
          opacity: isFocusedLink ? 0.5 : 0
        });
      }}
      onNodeClick={handleNodeClick}
      onBackgroundClick={handleBackgroundClick}
      showNavInfo={false}
      enableNodeDrag={false}
      enableNavigationControls={true}
    />
  );
});

export default TaskNebulaGraph;