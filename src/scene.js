// Three.js Scene Setup — Camera, Renderer, Lights
import * as THREE from 'three';
import { getPixelRatio, debounce } from './utils.js';
import { getSceneBgColor, getCurrentTheme } from './theme.js';

let scene, camera, renderer;

export function initScene(canvas) {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(getSceneBgColor(getCurrentTheme()));
  scene.fog = new THREE.FogExp2(getSceneBgColor(getCurrentTheme()), 0.08);

  // Camera
  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 3, 7);
  camera.lookAt(0, 1.0, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(getPixelRatio());
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  // Lights
  setupLights();

  // Procedural environment map for metallic reflections
  generateEnvironmentMap();

  // Resize
  const onResize = debounce(() => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(getPixelRatio());
  }, 150);
  window.addEventListener('resize', onResize);

  // Theme observer — update scene bg on theme change
  const observer = new MutationObserver(() => {
    const theme = getCurrentTheme();
    const bgColor = getSceneBgColor(theme);
    scene.background.setHex(bgColor);
    scene.fog.color.setHex(bgColor);
  });
  observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });

  return { scene, camera, renderer };
}

function setupLights() {
  // Ambient
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);

  // Main directional
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(5, 8, 5);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 20;
  dirLight.shadow.camera.left = -5;
  dirLight.shadow.camera.right = 5;
  dirLight.shadow.camera.top = 5;
  dirLight.shadow.camera.bottom = -5;
  scene.add(dirLight);

  // Fill light
  const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
  fillLight.position.set(-3, 4, -3);
  scene.add(fillLight);

  // Rim light
  const rimLight = new THREE.DirectionalLight(0xffaa44, 0.4);
  rimLight.position.set(-2, 3, 6);
  scene.add(rimLight);
}

function generateEnvironmentMap() {
  // Create a simple procedural environment for metallic reflections
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x888899);

  // Add gradient hemisphere light to env scene
  const hemiLight = new THREE.HemisphereLight(0xddeeff, 0x333344, 1.0);
  envScene.add(hemiLight);

  const envMap = pmremGenerator.fromScene(envScene, 0).texture;
  scene.environment = envMap;
  pmremGenerator.dispose();
}

export function getScene() { return scene; }
export function getCamera() { return camera; }
export function getRenderer() { return renderer; }

export function renderFrame() {
  renderer.render(scene, camera);
}

export function startRenderLoop(onFrame) {
  function loop() {
    onFrame();
    renderFrame();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
