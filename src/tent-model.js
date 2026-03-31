// Tent Model — Procedural 3D geometry for tent poles, bones, and tarps
import * as THREE from 'three';

// ========== Constants ==========
const SHORT_LEN = 1.2;  // short poles ~1.20m
const LONG_LEN = 1.5;   // long poles ~1.50m
const POLE_RADIUS = 0.015;
const BONE_RADIUS = 0.025;

// Roof pitch: 120° at the ridge → each slope = 30° from horizontal
const SLOPE_ANGLE = Math.PI / 6;                       // 30°
const RIDGE_RISE = SHORT_LEN * Math.sin(SLOPE_ANGLE);  // 0.6
const HALF_SPAN = SHORT_LEN * Math.cos(SLOPE_ANGLE);   // ~1.039

// Tent dimensions
const TENT_WIDTH = 2 * HALF_SPAN;  // ~2.078 (horizontal span of two cross-poles)
const TENT_LENGTH = 1.5 * 2;       // 3.0 (2 long poles per row along Z)
const LEG_HEIGHT = 1.2;            // legs are short poles standing vertically
const RIDGE_HEIGHT = LEG_HEIGHT + RIDGE_RISE; // 1.8 — peak of the roof

// ========== Materials ==========
function createAluminumMaterial() {
  return new THREE.MeshStandardMaterial({
    color: 0xc0c0c0,
    metalness: 0.85,
    roughness: 0.25,
    envMapIntensity: 1.0,
  });
}

function createBoneMaterial() {
  return new THREE.MeshStandardMaterial({
    color: 0x888888,
    metalness: 0.6,
    roughness: 0.4,
  });
}

function createInnerTentMaterial() {
  return new THREE.MeshStandardMaterial({
    color: 0xeedd88,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
}

function createOuterTentMaterial() {
  return new THREE.MeshStandardMaterial({
    color: 0x2266aa,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
}

// ========== Geometry Helpers ==========
function createPole(length, material) {
  const geo = new THREE.CylinderGeometry(POLE_RADIUS, POLE_RADIUS, length, 12);
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function createBone(material) {
  const geo = new THREE.SphereGeometry(BONE_RADIUS, 12, 8);
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = true;
  return mesh;
}

/**
 * Create a gable-shaped tent shell (pentagonal cross-section extruded along Z).
 * Cross-section (XY plane):
 *          (0, ridgeH)
 *         /           \
 *  (-w/2, eaveH)   (w/2, eaveH)
 *   |                     |
 *  (-w/2, 0)        (w/2, 0)
 */
function createTentShell(width, eaveH, ridgeH, length, material) {
  const hw = width / 2;
  const hl = length / 2;

  const shape = new THREE.Shape();
  shape.moveTo(-hw, 0);
  shape.lineTo(hw, 0);
  shape.lineTo(hw, eaveH);
  shape.lineTo(0, ridgeH);
  shape.lineTo(-hw, eaveH);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: length,
    bevelEnabled: false,
  });
  // ExtrudeGeometry extrudes along +Z starting at z=0. Center it.
  geo.translate(0, 0, -hl);

  const mesh = new THREE.Mesh(geo, material);
  return mesh;
}

// ========== Tent Structure Definitions ==========
// The tent has:
// - 6 legs (3 per side) = short poles, standing vertically
// - 6 short roof cross-poles forming a 2×3 grid across width
// - 6 long roof poles running along the length
// - Bones at every joint

/**
 * Build the entire tent model. Returns an object with groups & arrays
 * for animation control.
 */
export function createTentModel() {
  const tentGroup = new THREE.Group();
  const aluminumMat = createAluminumMaterial();
  const boneMat = createBoneMaterial();
  const innerTentMat = createInnerTentMaterial();
  const outerTentMat = createOuterTentMaterial();

  // Collections for animation
  const shortPoles = [];
  const longPoles = [];
  const bones = [];
  const allPoles = [];

  // ======= DEFINE GRID =======
  // X direction (width): 3 positions — left eave, center ridge, right eave
  // Z direction (length): 4 positions — front to back
  // Roof is a gable: center row sits at RIDGE_HEIGHT, left/right at LEG_HEIGHT

  const xPositions = [-TENT_WIDTH / 2, 0, TENT_WIDTH / 2]; // 3 columns
  const roofYPositions = [LEG_HEIGHT, RIDGE_HEIGHT, LEG_HEIGHT]; // Y per column
  const zPositions = [-TENT_LENGTH * 0.5, -TENT_LENGTH * 0.5 / 3, TENT_LENGTH * 0.5 / 3, TENT_LENGTH * 0.5]; // 4 rows along length

  // ======= LEGS (6 short poles, vertical) =======
  // 3 legs on left side (x = -TENT_WIDTH/2) and 3 on right side (x = +TENT_WIDTH/2)
  // At z positions [0], [1.5], [3] — evenly distributed
  const legZPositions = [zPositions[0], zPositions[1], zPositions[3]]; // front, mid-front, back
  const legZPositionsRight = [zPositions[0], zPositions[2], zPositions[3]]; // front, mid-back, back

  // Left side legs
  for (let i = 0; i < 3; i++) {
    const pole = createPole(SHORT_LEN, aluminumMat.clone());
    pole.userData.type = 'leg';
    pole.userData.side = 'left';
    pole.userData.index = i;
    // Final position: standing vertically
    pole.userData.finalPosition = new THREE.Vector3(
      xPositions[0],
      LEG_HEIGHT / 2,
      legZPositions[i]
    );
    pole.userData.finalRotation = new THREE.Euler(0, 0, 0);
    shortPoles.push(pole);
    allPoles.push(pole);
    tentGroup.add(pole);
  }

  // Right side legs — the 3 that get attached LAST (step 4)
  for (let i = 0; i < 3; i++) {
    const pole = createPole(SHORT_LEN, aluminumMat.clone());
    pole.userData.type = 'leg';
    pole.userData.side = 'right';
    pole.userData.index = i;
    pole.userData.isDelayedLeg = true; // These 3 are attached last!
    pole.userData.finalPosition = new THREE.Vector3(
      xPositions[2],
      LEG_HEIGHT / 2,
      legZPositionsRight[i]
    );
    pole.userData.finalRotation = new THREE.Euler(0, 0, 0);
    shortPoles.push(pole);
    allPoles.push(pole);
    tentGroup.add(pole);
  }

  // ======= ROOF SHORT CROSS-POLES (6 short poles, sloped across width) =======
  // 2 cross-poles per z-row — forming the gable: left-eave→ridge, ridge→right-eave
  // Row positions along Z: front, middle, back
  const crossZPos = [zPositions[0], (zPositions[1] + zPositions[2]) / 2, zPositions[3]];

  for (let z = 0; z < crossZPos.length; z++) {
    // Left segment: eave (left) → ridge (center), slopes up 30°
    const poleL = createPole(SHORT_LEN, aluminumMat.clone());
    poleL.userData.type = 'roof-cross';
    poleL.userData.zRow = z;
    poleL.userData.segment = 0;
    poleL.userData.finalPosition = new THREE.Vector3(
      -HALF_SPAN / 2,                          // midpoint X
      LEG_HEIGHT + RIDGE_RISE / 2,              // midpoint Y
      crossZPos[z]
    );
    // Cylinder default axis = Y. Rotate so it aligns up-right at 30° slope.
    poleL.userData.finalRotation = new THREE.Euler(0, 0, -Math.PI / 3);
    shortPoles.push(poleL);
    allPoles.push(poleL);
    tentGroup.add(poleL);

    // Right segment: ridge (center) → eave (right), slopes down 30°
    const poleR = createPole(SHORT_LEN, aluminumMat.clone());
    poleR.userData.type = 'roof-cross';
    poleR.userData.zRow = z;
    poleR.userData.segment = 1;
    poleR.userData.finalPosition = new THREE.Vector3(
      HALF_SPAN / 2,                           // midpoint X
      LEG_HEIGHT + RIDGE_RISE / 2,              // midpoint Y
      crossZPos[z]
    );
    poleR.userData.finalRotation = new THREE.Euler(0, 0, Math.PI / 3);
    shortPoles.push(poleR);
    allPoles.push(poleR);
    tentGroup.add(poleR);
  }

  // ======= LONG POLES (6 long poles, horizontal along Z/length direction) =======
  // 3 rows in X (left eave, center ridge, right eave), 2 long poles per row
  // Y height follows the gable: left/right at LEG_HEIGHT, center at RIDGE_HEIGHT
  const longZSegments = [
    [zPositions[0], zPositions[1]],  // front half
    [zPositions[2], zPositions[3]],  // back half
  ];

  for (let x = 0; x < xPositions.length; x++) {
    for (let seg = 0; seg < 2; seg++) {
      const pole = createPole(LONG_LEN, aluminumMat.clone());
      pole.userData.type = 'roof-long';
      pole.userData.xCol = x;
      pole.userData.segment = seg;
      const midZ = (longZSegments[seg][0] + longZSegments[seg][1]) / 2;
      pole.userData.finalPosition = new THREE.Vector3(
        xPositions[x],
        roofYPositions[x],   // follows gable height per column
        midZ
      );
      // Horizontal, rotated to lie along Z axis
      pole.userData.finalRotation = new THREE.Euler(Math.PI / 2, 0, 0);
      longPoles.push(pole);
      allPoles.push(pole);
      tentGroup.add(pole);
    }
  }

  // ======= BONES (joints at grid intersections) =======
  // Bones at roof grid intersections: 3 X × 4 Z = 12 bones
  // Y follows gable: left/right columns at LEG_HEIGHT, center at RIDGE_HEIGHT
  for (let xi = 0; xi < xPositions.length; xi++) {
    for (let zi = 0; zi < zPositions.length; zi++) {
      const bone = createBone(boneMat.clone());
      bone.userData.type = 'bone-roof';
      bone.userData.finalPosition = new THREE.Vector3(
        xPositions[xi],
        roofYPositions[xi],
        zPositions[zi]
      );
      bones.push(bone);
      tentGroup.add(bone);
    }
  }

  // Bones at leg-roof connections (6 bones, one per leg)
  for (let i = 0; i < 3; i++) {
    const boneLeft = createBone(boneMat.clone());
    boneLeft.userData.type = 'bone-leg';
    boneLeft.userData.side = 'left';
    boneLeft.userData.finalPosition = new THREE.Vector3(
      xPositions[0],
      0,
      legZPositions[i]
    );
    bones.push(boneLeft);
    tentGroup.add(boneLeft);
  }
  for (let i = 0; i < 3; i++) {
    const boneRight = createBone(boneMat.clone());
    boneRight.userData.type = 'bone-leg';
    boneRight.userData.side = 'right';
    boneRight.userData.isDelayedLeg = true;
    boneRight.userData.finalPosition = new THREE.Vector3(
      xPositions[2],
      0,
      legZPositionsRight[i]
    );
    bones.push(boneRight);
    tentGroup.add(boneRight);
  }

  // ======= INNER TENT (translucent gable-shaped shell) =======
  const innerTent = createTentShell(
    TENT_WIDTH - 0.06, LEG_HEIGHT - 0.05, RIDGE_HEIGHT - 0.05,
    TENT_LENGTH - 0.06, innerTentMat
  );
  innerTent.userData.type = 'inner-tent';
  tentGroup.add(innerTent);

  // ======= OUTER TENT (translucent gable-shaped shell, slightly larger) =======
  const outerTent = createTentShell(
    TENT_WIDTH + 0.1, LEG_HEIGHT + 0.05, RIDGE_HEIGHT + 0.08,
    TENT_LENGTH + 0.1, outerTentMat
  );
  outerTent.userData.type = 'outer-tent';
  tentGroup.add(outerTent);

  // ======= INITIAL SCATTERED POSITIONS =======
  setScatteredPositions(allPoles, bones);

  // Set initial tent plane invisible
  innerTent.material.opacity = 0;
  outerTent.material.opacity = 0;

  return {
    group: tentGroup,
    shortPoles,
    longPoles,
    allPoles,
    bones,
    innerTent,
    outerTent,
    materials: {
      aluminum: aluminumMat,
      bone: boneMat,
      innerTent: innerTentMat,
      outerTent: outerTentMat,
    },
  };
}

/**
 * Set all poles and bones to random scattered positions around the scene
 */
function setScatteredPositions(allPoles, bones) {
  const spread = 4;

  allPoles.forEach((pole) => {
    pole.position.set(
      (Math.random() - 0.5) * spread,
      Math.random() * 0.5 + 0.3,
      (Math.random() - 0.5) * spread
    );
    pole.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
  });

  bones.forEach((bone) => {
    bone.position.set(
      (Math.random() - 0.5) * spread,
      Math.random() * 0.3,
      (Math.random() - 0.5) * spread
    );
    bone.scale.setScalar(0);
  });
}

/**
 * Get all delayed-leg poles (right side, attached last)
 */
export function getDelayedLegs(model) {
  return model.allPoles.filter(p => p.userData.isDelayedLeg);
}

/**
 * Get non-delayed poles (everything except delayed legs)
 */
export function getNonDelayedPoles(model) {
  return model.allPoles.filter(p => !p.userData.isDelayedLeg);
}

/**
 * Get delayed-leg bones
 */
export function getDelayedBones(model) {
  return model.bones.filter(b => b.userData.isDelayedLeg);
}

/**
 * Get non-delayed bones
 */
export function getNonDelayedBones(model) {
  return model.bones.filter(b => !b.userData.isDelayedLeg);
}
