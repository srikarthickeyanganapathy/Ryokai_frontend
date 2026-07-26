import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import * as d3 from 'd3-force-3d';

// --- Star Flare Texture ---
function createStarTexture(hexColor) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const c = new THREE.Color(hexColor);

  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.15, `rgba(255,255,255,0.9)`);
  grad.addColorStop(0.4, `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},0.8)`);
  grad.addColorStop(0.7, `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},0.2)`);
  grad.addColorStop(1, `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// --- Textured Orb ---
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
  const dark = new THREE.Color().setHSL(hsl.h, Math.min(1, hsl.s * 1.1), hsl.l * 0.4);

  const cx = size * 0.38, cy = size * 0.36;
  const grad = ctx.createRadialGradient(cx, cy, 0, size / 2, size / 2, size * 0.7);
  grad.addColorStop(0, `#${light.getHexString()}`);
  grad.addColorStop(0.5, `#${mid.getHexString()}`);
  grad.addColorStop(1, `#${dark.getHexString()}`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const imgData = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 12;
    imgData.data[i] += n;
    imgData.data[i + 1] += n;
    imgData.data[i + 2] += n;
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// --- Starfield Background ---
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

// --- Text Label Sprite ---
function createTextSprite(text, fontSize, color, isHighlighted) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  context.font = `bold ${fontSize}px Inter, sans-serif`;
  const textWidth = context.measureText(text).width;

  canvas.width = textWidth + 36;
  canvas.height = fontSize + 24;

  context.fillStyle = isHighlighted ? 'rgba(15, 23, 42, 0.85)' : 'rgba(0, 0, 0, 0.6)';
  context.beginPath();
  context.roundRect(0, 0, canvas.width, canvas.height, canvas.height / 2);
  context.fill();

  if (isHighlighted) {
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
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
  sprite.scale.set(canvas.width / 12, canvas.height / 12, 1);
  return sprite;
}

// --- 3D Spatial Impact Badge Sprite ---
function createImpactBadgeSprite(text) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  ctx.font = 'bold 18px Inter, sans-serif';
  const textW = ctx.measureText(text).width;
  canvas.width = textW + 36;
  canvas.height = 42;

  ctx.fillStyle = 'rgba(6, 78, 59, 0.9)';
  ctx.beginPath();
  ctx.roundRect(0, 0, canvas.width, canvas.height, 10);
  ctx.fill();

  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = 'bold 18px Inter, sans-serif';
  ctx.fillStyle = '#6ee7b7';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;

  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  sprite.renderOrder = 1000;
  sprite.scale.set(canvas.width / 10, canvas.height / 10, 1);
  return sprite;
}

// --- 3D Orbit Satellite Launcher Orb Sprite ---
function createOrbitOrbSprite(label, iconText, color) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  ctx.font = 'bold 16px Inter, sans-serif';
  const textW = ctx.measureText(`${iconText} ${label}`).width;
  canvas.width = textW + 28;
  canvas.height = 36;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.beginPath();
  ctx.roundRect(0, 0, canvas.width, canvas.height, 18);
  ctx.fill();

  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = 'bold 16px Inter, sans-serif';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${iconText} ${label}`, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;

  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  sprite.renderOrder = 1000;
  sprite.scale.set(canvas.width / 14, canvas.height / 14, 1);
  return sprite;
}

const TaskNebulaGraph = forwardRef(function TaskNebulaGraph({
  data,
  selectedTaskId,
  highlightTaskId = null,
  causalPathNodeIds = new Set(),
  causalPathLinkIds = new Set(),
  unblockedChainCount = 0,
  terminalCausalNodeId = null,
  onTaskSelect,
  onAnalyze,
  onOpenTaskContext,
  width,
  height
}, externalRef) {
  const graphRef = useRef();
  const textureCache = useRef({});
  const starTextureCache = useRef({});
  const lastClickTimeRef = useRef(0);
  const lastClickedNodeIdRef = useRef(null);

  const getOrbTexture = useCallback((color) => {
    if (!textureCache.current[color]) {
      textureCache.current[color] = createOrbTexture(color);
    }
    return textureCache.current[color];
  }, []);

  const getStarTexture = useCallback((color) => {
    if (!starTextureCache.current[color]) {
      starTextureCache.current[color] = createStarTexture(color);
    }
    return starTextureCache.current[color];
  }, []);

  useEffect(() => {
    if (data?.nodes) {
      data.nodes.forEach(node => {
        if (node._floatPhase === undefined) {
          node._floatPhase = Math.random() * Math.PI * 2;
          node._floatSpeed = 0.3 + Math.random() * 0.4;
          node._floatAmp = 2 + Math.random() * 2;
        }
      });
    }
  }, [data]);

  // Project 3D coordinates into screen pixels
  const getScreenCoordinates = useCallback((x, y, z) => {
    if (!graphRef.current) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const camera = graphRef.current.camera();
    const vec = new THREE.Vector3(x, y, z);
    vec.project(camera);

    const screenX = (vec.x * 0.5 + 0.5) * width;
    const screenY = (-vec.y * 0.5 + 0.5) * height;
    return { x: screenX, y: screenY };
  }, [width, height]);

  // Custom Node 3D Object Rendering
  const nodeThreeObject = useCallback((node) => {
    const group = new THREE.Group();

    const isSelected = selectedTaskId === node.id;
    const isCausal = causalPathNodeIds.has(node.id);
    const isTerminalCausal = terminalCausalNodeId === node.id;
    const isDimmed = selectedTaskId && !isSelected && !isCausal;

    const baseColor = isSelected ? '#22d3ee' : isCausal ? '#34d399' : (node.color || '#3b82f6');
    const val = isSelected ? 12 : isCausal ? 9 : (node.val || 6);

    // Orb Mesh
    const sphereGeo = new THREE.SphereGeometry(val * 0.5, 24, 24);
    const orbTexture = getOrbTexture(baseColor);
    const sphereMat = new THREE.MeshPhysicalMaterial({
      map: orbTexture,
      emissiveMap: orbTexture,
      color: 0xffffff,
      roughness: 0.5,
      metalness: 0.1,
      clearcoat: 0.5,
      transparent: true,
      opacity: isDimmed ? 0.04 : 0.95,
      emissive: baseColor,
      emissiveIntensity: isSelected ? 0.9 : isCausal ? 0.6 : 0.25
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    group.add(sphere);

    // Star Flare
    const starTexture = getStarTexture(baseColor);
    const flareMat = new THREE.SpriteMaterial({
      map: starTexture,
      transparent: true,
      opacity: isDimmed ? 0.01 : (isSelected ? 0.7 : isCausal ? 0.5 : 0.25),
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const flareSize = val * (isSelected ? 4.5 : 3);
    const flare = new THREE.Sprite(flareMat);
    flare.scale.set(flareSize, flareSize, 1);
    group.add(flare);

    // Node Title Sprite
    const sprite = createTextSprite(node.name || node.title, isSelected ? 24 : 18, baseColor, isSelected || isCausal);
    sprite.position.y = val + 4;
    sprite.onBeforeRender = function(renderer, scene, camera) {
      if (isDimmed) {
        this.material.opacity = 0.03;
        return;
      }
      if (isSelected || isCausal) {
        this.material.opacity = 1;
        return;
      }
      const dist = camera.position.distanceTo(group.position);
      let opacity = 1 - (dist - 80) / 160;
      this.material.opacity = Math.max(0, Math.min(1, opacity));
    };
    group.add(sprite);

    // 3D Spatial Impact Badge Sprite on Terminal Node
    if (isTerminalCausal && unblockedChainCount > 0) {
      const impactBadge = createImpactBadgeSprite(`⚡ ${unblockedChainCount} tasks unblocked`);
      impactBadge.position.y = val + 18;
      group.add(impactBadge);
    }

    // Single "Analyze" orbit satellite — progressive disclosure
    if (isSelected && node.rawTask) {
      const analyzeRadius = 34;
      const analyzeAngle = -Math.PI / 2; // top position
      const analyzeX = Math.cos(analyzeAngle) * analyzeRadius;
      const analyzeY = Math.sin(analyzeAngle) * analyzeRadius;

      const analyzeGroup = new THREE.Group();
      analyzeGroup.position.set(analyzeX, analyzeY, 0);

      // Analyze sphere
      const analyzeGeo = new THREE.SphereGeometry(4, 16, 16);
      const analyzeMat = new THREE.MeshBasicMaterial({ color: '#06b6d4' });
      const analyzeMesh = new THREE.Mesh(analyzeGeo, analyzeMat);
      analyzeGroup.add(analyzeMesh);

      // Analyze label sprite
      const analyzeSprite = createOrbitOrbSprite('Analyze', '🔍', '#06b6d4');
      analyzeSprite.position.y = 5;
      analyzeGroup.add(analyzeSprite);

      // Beam line
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(analyzeX, analyzeY, 0)
      ]);
      const lineMat = new THREE.LineBasicMaterial({ color: '#06b6d4', transparent: true, opacity: 0.6 });
      group.add(new THREE.Line(lineGeo, lineMat));
      group.add(analyzeGroup);
    }

    // Highlight glow for explorer-driven navigation
    const isHighlighted = highlightTaskId === node.id;
    if (isHighlighted && !isSelected) {
      const highlightGeo = new THREE.SphereGeometry(val + 6, 16, 16);
      const highlightMat = new THREE.MeshBasicMaterial({ color: '#06b6d4', transparent: true, opacity: 0.15 });
      const highlightMesh = new THREE.Mesh(highlightGeo, highlightMat);
      group.add(highlightMesh);
    }

    // Soft Floating Motion
    group.onBeforeRender = function() {
      const t = performance.now() * 0.001 * (node._floatSpeed || 0.4);
      const amp = node._floatAmp || 2;
      this.position.x = node.x + Math.sin(t + (node._floatPhase || 0)) * amp;
      this.position.y = node.y + Math.cos(t * 0.8 + (node._floatPhase || 0)) * amp;
      this.position.z = node.z + Math.sin(t * 0.6 + (node._floatPhase || 0) * 1.3) * amp;
    };

    return group;
  }, [selectedTaskId, highlightTaskId, causalPathNodeIds, terminalCausalNodeId, unblockedChainCount, getOrbTexture, getStarTexture]);

  // Click & Double-Click Handler
  const handleNodeClick = useCallback((node) => {
    const now = performance.now();
    const isDoubleClick = (now - lastClickTimeRef.current < 380) && (lastClickedNodeIdRef.current === node.id);
    lastClickTimeRef.current = now;
    lastClickedNodeIdRef.current = node.id;

    const screenPos = getScreenCoordinates(node.x, node.y, node.z);

    if (isDoubleClick) {
      // Double Click -> Open Task Context
      if (onOpenTaskContext && node.rawTask) {
        onOpenTaskContext(node.rawTask, screenPos);
      }
      return;
    }

    const isAlreadySelected = selectedTaskId === node.id;

    if (isAlreadySelected) {
      // Node is already selected -> Click/touch on node or Analyze orb triggers Analyze Menu!
      if (onAnalyze && node.rawTask) {
        const analyzeScreenPos = getScreenCoordinates(node.x, node.y + 25, node.z);
        onAnalyze(node.rawTask, analyzeScreenPos);
      }
    } else {
      // First click -> Focus Node & Offset Camera
      onTaskSelect(node.rawTask || node);

      if (graphRef.current) {
        const distance = 130;
        const camPos = new THREE.Vector3(node.x, node.y, node.z + distance);
        const targetLookAt = new THREE.Vector3(node.x + 28, node.y, node.z);
        graphRef.current.cameraPosition(camPos, targetLookAt, 1600);
      }
    }
  }, [selectedTaskId, onTaskSelect, onAnalyze, onOpenTaskContext, getScreenCoordinates]);

  const handleBackgroundClick = useCallback(() => {
    onTaskSelect(null);
  }, [onTaskSelect]);

  // Imperative Camera Controls
  useImperativeHandle(externalRef, () => ({
    zoomIn: () => {
      if (!graphRef.current) return;
      const cam = graphRef.current.camera();
      const target = new THREE.Vector3(0, 0, 0);
      const dir = new THREE.Vector3().subVectors(cam.position, target).normalize();
      const currentDist = cam.position.distanceTo(target);
      const newDist = Math.max(40, currentDist * 0.7);
      graphRef.current.cameraPosition(target.clone().add(dir.multiplyScalar(newDist)), target, 600);
    },
    zoomOut: () => {
      if (!graphRef.current) return;
      const cam = graphRef.current.camera();
      const target = new THREE.Vector3(0, 0, 0);
      const dir = new THREE.Vector3().subVectors(cam.position, target).normalize();
      const currentDist = cam.position.distanceTo(target);
      const newDist = Math.min(750, currentDist * 1.4);
      graphRef.current.cameraPosition(target.clone().add(dir.multiplyScalar(newDist)), target, 600);
    },
    resetView: () => {
      onTaskSelect(null);
      graphRef.current?.cameraPosition({ x: 0, y: 0, z: 420 }, { x: 0, y: 0, z: 0 }, 1200);
    },
    flyToTask: (taskId) => {
      if (!graphRef.current || !data?.nodes) return;
      const node = data.nodes.find(n => n.id === taskId);
      if (!node) return;
      const distance = 130;
      const camPos = new THREE.Vector3(node.x, node.y, node.z + distance);
      const targetLookAt = new THREE.Vector3(node.x, node.y, node.z);
      graphRef.current.cameraPosition(camPos, targetLookAt, 1200);
    }
  }));

  // Force setup & Starfield initialization
  useEffect(() => {
    if (graphRef.current) {
      const scene = graphRef.current.scene();

      if (!scene.getObjectByName('nebula-starfield-far')) {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const farStars = createStarfield(2200, 1000, 1.2, 0.45, 0x8899bb);
        farStars.name = 'nebula-starfield-far';
        scene.add(farStars);

        const nearStars = createStarfield(350, 650, 2.4, 0.85, 0xffffff);
        nearStars.name = 'nebula-starfield-near';
        scene.add(nearStars);
      }

      const controls = graphRef.current.controls();
      if (controls) {
        controls.minDistance = 50;
        controls.maxDistance = 700;
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        controls.zoomSpeed = 0.5;
        controls.rotateSpeed = 0.4;
      }

      graphRef.current.d3Force('charge').strength(-26).distanceMax(300);
      graphRef.current.d3Force('center', d3.forceCenter(0, 0, 0).strength(0.05));
      graphRef.current.d3Force('collide', d3.forceCollide().radius(12).strength(0.7));
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
      d3AlphaDecay={0.01}
      d3VelocityDecay={0.4}
      cooldownTime={Infinity}
      linkWidth={(link) => {
        const linkId = `${link.source.id || link.source}->${link.target.id || link.target}`;
        return causalPathLinkIds.has(linkId) ? 2.5 : (link.type === 'blocking' ? 1.8 : 0.8);
      }}
      linkOpacity={1}
      linkMaterial={(link) => {
        const linkId = `${link.source.id || link.source}->${link.target.id || link.target}`;
        const isCausalLink = causalPathLinkIds.has(linkId);

        let color = '#38bdf8';
        if (link.type === 'blocking') color = '#f43f5e';
        else if (link.type === 'dependency') color = '#38bdf8';
        else if (link.type === 'parent') color = '#a855f7';
        else if (link.type === 'related') color = '#64748b';
        else if (link.type === 'review') color = '#eab308';

        return new THREE.LineBasicMaterial({
          color: isCausalLink ? '#34d399' : color,
          transparent: true,
          opacity: selectedTaskId ? (isCausalLink ? 0.95 : 0.03) : 0.35
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