// Main entry point — Initialize everything
import { initTheme } from './theme.js';
import { initScene, startRenderLoop } from './scene.js';
import { createTentModel } from './tent-model.js';
import { initAnimations, prepareEmissive } from './animations.js';

function start() {
  // 1. Theme
  initTheme();

  // 2. Three.js Scene
  const canvas = document.getElementById('tent-canvas');
  const { scene, camera } = initScene(canvas);

  // 3. Tent Model
  const tentModel = createTentModel();
  scene.add(tentModel.group);

  // 4. Prepare emissive for glow effects
  prepareEmissive(tentModel);

  // 5. GSAP Animations
  initAnimations(tentModel, camera);

  // 6. Render loop
  startRenderLoop(() => {});

  // 7. Hide loader after short delay
  requestAnimationFrame(() => {
    setTimeout(() => {
      const loader = document.getElementById('loader');
      if (loader) loader.classList.add('hidden');
    }, 600);
  });
}

// Wait for DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}
