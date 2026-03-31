// GSAP ScrollTrigger Animations — Scroll-driven 3D tent assembly
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    getDelayedLegs,
    getNonDelayedPoles,
    getDelayedBones,
    getNonDelayedBones,
} from './tent-model.js';

gsap.registerPlugin(ScrollTrigger);

/**
 * Initialize all scroll-driven animations.
 * @param {Object} model — The tent model returned from createTentModel()
 * @param {THREE.Camera} camera — The Three.js camera
 */
export function initAnimations(model, camera) {
    const { allPoles, bones, innerTent, outerTent, group } = model;
    const nonDelayedPoles = getNonDelayedPoles(model);
    const delayedLegs = getDelayedLegs(model);
    const nonDelayedBones = getNonDelayedBones(model);
    const delayedBones = getDelayedBones(model);

    // ========== Hero Entrance Animation (non-scroll, on load) ==========
    const heroTl = gsap.timeline({ delay: 0.3 });

    heroTl.to('.hero-line-1', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
    });
    heroTl.to('.hero-line-2', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
    }, '-=0.4');
    heroTl.to('.hero-subtitle', {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
    }, '-=0.3');

    // Gentle idle rotation of scattered poles
    gsap.to(group.rotation, {
        y: Math.PI * 0.05,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
    });

    // ========== Section: Overview — Poles sort by type ==========
    const overviewTl = gsap.timeline({
        scrollTrigger: {
            trigger: '#overview',
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: 1.5,
        },
    });

    // Sort poles into two groups visually
    model.shortPoles.forEach((pole, i) => {
        overviewTl.to(pole.position, {
            x: -1.5 + (i % 4) * 0.3,
            y: 0.6,
            z: -1 + Math.floor(i / 4) * 0.5,
            duration: 1,
            ease: 'power2.inOut',
        }, 0);
        overviewTl.to(pole.rotation, {
            x: 0,
            y: 0,
            z: Math.PI / 2,
            duration: 1,
            ease: 'power2.inOut',
        }, 0);
    });
    model.longPoles.forEach((pole, i) => {
        overviewTl.to(pole.position, {
            x: 1 + (i % 3) * 0.3,
            y: 0.6,
            z: -0.5 + Math.floor(i / 3) * 0.5,
            duration: 1,
            ease: 'power2.inOut',
        }, 0);
        overviewTl.to(pole.rotation, {
            x: Math.PI / 2,
            y: 0,
            z: 0,
            duration: 1,
            ease: 'power2.inOut',
        }, 0);
    });

    // Fade in overview card
    overviewTl.to('#overview .info-card', {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
    }, 0.2);

    // Camera move for overview
    overviewTl.to(camera.position, {
        x: 0,
        y: 3.5,
        z: 5.5,
        duration: 1,
        ease: 'power2.inOut',
        onUpdate: () => camera.lookAt(0, 0.9, 0),
    }, 0);

    // ========== Section: Parts (short poles) ==========
    const partsTl = gsap.timeline({
        scrollTrigger: {
            trigger: '#parts',
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: 1.5,
        },
    });

    // Highlight short poles
    model.shortPoles.forEach((pole) => {
        partsTl.to(pole.material, { emissiveIntensity: 0.3, duration: 0.5 }, 0);
        partsTl.to(pole.material, { emissiveIntensity: 0, duration: 0.5 }, 0.5);
    });
    partsTl.to('#parts .info-card', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0);

    // ========== Section: Parts Long ==========
    const partsLongTl = gsap.timeline({
        scrollTrigger: {
            trigger: '#parts-long',
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: 1.5,
        },
    });

    model.longPoles.forEach((pole) => {
        partsLongTl.to(pole.material, { emissiveIntensity: 0.3, duration: 0.5 }, 0);
        partsLongTl.to(pole.material, { emissiveIntensity: 0, duration: 0.5 }, 0.5);
    });
    partsLongTl.to('#parts-long .info-card', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0);

    // Camera orbits around
    partsLongTl.to(camera.position, {
        x: 2.5,
        y: 3,
        z: 5,
        duration: 1,
        ease: 'power2.inOut',
        onUpdate: () => camera.lookAt(0, 0.9, 0),
    }, 0);

    // ========== Step 1: Connect poles (non-delayed) ==========
    const step1Tl = gsap.timeline({
        scrollTrigger: {
            trigger: '#step-1',
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: 1.5,
        },
    });

    // Move all non-delayed poles to final positions
    nonDelayedPoles.forEach((pole, i) => {
        step1Tl.to(pole.position, {
            x: pole.userData.finalPosition.x,
            y: pole.userData.finalPosition.y,
            z: pole.userData.finalPosition.z,
            duration: 1,
            ease: 'power3.inOut',
        }, i * 0.03);
        step1Tl.to(pole.rotation, {
            x: pole.userData.finalRotation.x,
            y: pole.userData.finalRotation.y,
            z: pole.userData.finalRotation.z,
            duration: 1,
            ease: 'power3.inOut',
        }, i * 0.03);
    });

    // Move delayed legs nearby but not connected — lying on the ground near their position
    delayedLegs.forEach((pole, i) => {
        step1Tl.to(pole.position, {
            x: pole.userData.finalPosition.x + 0.8,
            y: 0.3,
            z: pole.userData.finalPosition.z,
            duration: 1,
            ease: 'power3.inOut',
        }, i * 0.05);
        step1Tl.to(pole.rotation, {
            x: 0,
            y: 0,
            z: Math.PI / 2, // lying on their side
            duration: 1,
            ease: 'power3.inOut',
        }, i * 0.05);
    });

    // Show non-delayed bones
    nonDelayedBones.forEach((bone, i) => {
        step1Tl.to(bone.position, {
            x: bone.userData.finalPosition.x,
            y: bone.userData.finalPosition.y,
            z: bone.userData.finalPosition.z,
            duration: 0.8,
            ease: 'power2.inOut',
        }, 0.2 + i * 0.02);
        step1Tl.to(bone.scale, {
            x: 1, y: 1, z: 1,
            duration: 0.5,
            ease: 'back.out(2)',
        }, 0.3 + i * 0.02);
    });

    // Step card
    step1Tl.to('#step-1 .step-card', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.1);

    // Camera for step 1
    step1Tl.to(camera.position, {
        x: 3.5,
        y: 2.5,
        z: 4,
        duration: 1,
        ease: 'power2.inOut',
        onUpdate: () => camera.lookAt(0, 0.9, 0),
    }, 0);

    // ========== Step 2: Inner tent ==========
    const step2Tl = gsap.timeline({
        scrollTrigger: {
            trigger: '#step-2',
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: 1.5,
        },
    });

    step2Tl.to(innerTent.material, {
        opacity: 0.35,
        duration: 1,
        ease: 'power2.inOut',
    });
    step2Tl.to('#step-2 .step-card', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0);

    // Camera orbit
    step2Tl.to(camera.position, {
        x: -2.5,
        y: 3,
        z: 5,
        duration: 1,
        ease: 'power2.inOut',
        onUpdate: () => camera.lookAt(0, 0.9, 0),
    }, 0);

    // ========== Step 3: Outer tent ==========
    const step3Tl = gsap.timeline({
        scrollTrigger: {
            trigger: '#step-3',
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: 1.5,
        },
    });

    step3Tl.to(outerTent.material, {
        opacity: 0.55,
        duration: 1,
        ease: 'power2.inOut',
    });
    step3Tl.to('#step-3 .step-card', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0);

    step3Tl.to(camera.position, {
        x: 0,
        y: 4,
        z: 5.5,
        duration: 1,
        ease: 'power2.inOut',
        onUpdate: () => camera.lookAt(0, 0.9, 0),
    }, 0);

    // ========== Step 4: Attach delayed legs ==========
    const step4Tl = gsap.timeline({
        scrollTrigger: {
            trigger: '#step-4',
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: 1.5,
        },
    });

    delayedLegs.forEach((pole, i) => {
        step4Tl.to(pole.position, {
            x: pole.userData.finalPosition.x,
            y: pole.userData.finalPosition.y,
            z: pole.userData.finalPosition.z,
            duration: 1,
            ease: 'power3.inOut',
        }, i * 0.1);
        step4Tl.to(pole.rotation, {
            x: pole.userData.finalRotation.x,
            y: pole.userData.finalRotation.y,
            z: pole.userData.finalRotation.z,
            duration: 1,
            ease: 'power3.inOut',
        }, i * 0.1);
    });

    // Show delayed bones
    delayedBones.forEach((bone, i) => {
        step4Tl.to(bone.position, {
            x: bone.userData.finalPosition.x,
            y: bone.userData.finalPosition.y,
            z: bone.userData.finalPosition.z,
            duration: 0.8,
            ease: 'power2.inOut',
        }, 0.2 + i * 0.05);
        step4Tl.to(bone.scale, {
            x: 1, y: 1, z: 1,
            duration: 0.5,
            ease: 'back.out(2)',
        }, 0.3 + i * 0.05);
    });

    step4Tl.to('#step-4 .step-card', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0);

    step4Tl.to(camera.position, {
        x: 2.5,
        y: 2,
        z: 4.5,
        duration: 1,
        ease: 'power2.inOut',
        onUpdate: () => camera.lookAt(0, 0.9, 0),
    }, 0);

    // ========== Step 5: Done — Full rotation ==========
    const step5Tl = gsap.timeline({
        scrollTrigger: {
            trigger: '#step-5',
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: 1.5,
        },
    });

    step5Tl.to(group.rotation, {
        y: Math.PI * 2,
        duration: 2,
        ease: 'power1.inOut',
    });

    step5Tl.to('#step-5 .step-card', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0);

    step5Tl.to(camera.position, {
        x: 0,
        y: 3,
        z: 6,
        duration: 2,
        ease: 'power2.inOut',
        onUpdate: () => camera.lookAt(0, 0.9, 0),
    }, 0);

    // ========== Footer ==========
    ScrollTrigger.create({
        trigger: '#footer',
        start: 'top 80%',
        end: 'bottom bottom',
        scrub: 1,
        onUpdate: (self) => {
            // Slow continuous rotation in footer
            group.rotation.y = Math.PI * 2 + self.progress * Math.PI * 0.5;
        },
    });
}

/**
 * Set up emissive property on aluminum materials for glow effect
 */
export function prepareEmissive(model) {
    const accent = new THREE.Color(0x00d4ff);
    [...model.shortPoles, ...model.longPoles].forEach((pole) => {
        if (pole.material.emissive) {
            pole.material.emissive = accent;
            pole.material.emissiveIntensity = 0;
        }
    });
}


