import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const NeuralHologram3D = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        // Dimensions
        let width = mount.clientWidth || 550;
        let height = mount.clientHeight || 500;

        // Scene, Camera, Renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 0, 24);

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "high-performance"
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mount.appendChild(renderer.domElement);

        const mainGroup = new THREE.Group();
        scene.add(mainGroup);

        // 1. Central Neural Brain Core (Icosahedron wireframe)
        const coreGeo = new THREE.IcosahedronGeometry(4.2, 2);
        const coreMat = new THREE.MeshBasicMaterial({
            color: 0xff0056,
            wireframe: true,
            transparent: true,
            opacity: 0.45
        });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        mainGroup.add(coreMesh);

        // 2. Vertex Glowing Nodes on Core
        const corePointsMat = new THREE.PointsMaterial({
            color: 0xff3377,
            size: 0.28,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending
        });
        const corePoints = new THREE.Points(coreGeo, corePointsMat);
        mainGroup.add(corePoints);

        // 3. Inner Glowing Sphere (Electric Cyan)
        const innerGeo = new THREE.SphereGeometry(2.6, 20, 20);
        const innerMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        const innerMesh = new THREE.Mesh(innerGeo, innerMat);
        mainGroup.add(innerMesh);

        // 4. Floating Semantic Token Cloud (Particle Sphere)
        const particleCount = 1800;
        const particlePositions = new Float32Array(particleCount * 3);
        const particleColors = new Float32Array(particleCount * 3);

        const colorCrimson = new THREE.Color(0xff0056);
        const colorCyan = new THREE.Color(0x00f0ff);
        const colorViolet = new THREE.Color(0xa855f7);
        const colorWhite = new THREE.Color(0xffffff);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const radius = 5.4 + Math.random() * 4.2;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);

            particlePositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            particlePositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            particlePositions[i3 + 2] = radius * Math.cos(phi);

            const rnd = Math.random();
            let pColor;
            if (rnd < 0.45) {
                pColor = colorCrimson.clone().lerp(colorWhite, Math.random() * 0.35);
            } else if (rnd < 0.85) {
                pColor = colorCyan.clone().lerp(colorWhite, Math.random() * 0.35);
            } else {
                pColor = colorViolet.clone().lerp(colorWhite, 0.2);
            }

            particleColors[i3] = pColor.r;
            particleColors[i3 + 1] = pColor.g;
            particleColors[i3 + 2] = pColor.b;
        }

        const particleGeo = new THREE.BufferGeometry();
        particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
        particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

        // Create round glow canvas texture
        const canvas = document.createElement("canvas");
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext("2d");
        const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, "rgba(255, 255, 255, 1)");
        grad.addColorStop(0.25, "rgba(255, 255, 255, 0.9)");
        grad.addColorStop(0.6, "rgba(255, 255, 255, 0.25)");
        grad.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);

        const particleTexture = new THREE.CanvasTexture(canvas);

        const particleMat = new THREE.PointsMaterial({
            size: 0.42,
            vertexColors: true,
            map: particleTexture,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const particles = new THREE.Points(particleGeo, particleMat);
        mainGroup.add(particles);

        // 5. Orbiting Audio Speech Waveform Ring (Oscillating)
        const wavePointsCount = 200;
        const waveRadius = 8.6;
        const waveGeo = new THREE.BufferGeometry();
        const wavePos = new Float32Array(wavePointsCount * 3);
        for (let i = 0; i < wavePointsCount; i++) {
            const angle = (i / wavePointsCount) * Math.PI * 2;
            wavePos[i * 3] = Math.cos(angle) * waveRadius;
            wavePos[i * 3 + 1] = 0;
            wavePos[i * 3 + 2] = Math.sin(angle) * waveRadius;
        }
        waveGeo.setAttribute("position", new THREE.BufferAttribute(wavePos, 3));
        const waveMat = new THREE.LineBasicMaterial({
            color: 0xff0056,
            transparent: true,
            opacity: 0.75,
            linewidth: 2,
            blending: THREE.AdditiveBlending
        });
        const waveLine = new THREE.LineLoop(waveGeo, waveMat);
        waveLine.rotation.x = Math.PI / 4;
        waveLine.rotation.z = Math.PI / 8;
        mainGroup.add(waveLine);

        // 6. Orbiting Text Stream Ring (Cyan)
        const ringGeoB = new THREE.TorusGeometry(10.2, 0.04, 16, 160);
        const ringMatB = new THREE.MeshBasicMaterial({
            color: 0x00e5ff,
            transparent: true,
            opacity: 0.55,
            blending: THREE.AdditiveBlending
        });
        const ringB = new THREE.Mesh(ringGeoB, ringMatB);
        ringB.rotation.x = -Math.PI / 3.5;
        ringB.rotation.y = Math.PI / 5;
        mainGroup.add(ringB);

        // 7. Dynamic Mouse Tilt
        let targetRotX = 0;
        let targetRotY = 0;

        const onMouseMove = (e) => {
            const rect = mount.getBoundingClientRect();
            const mouseX = ((e.clientX - rect.left) / width) * 2 - 1;
            const mouseY = -(((e.clientY - rect.top) / height) * 2 - 1);
            targetRotY = mouseX * 0.75;
            targetRotX = mouseY * 0.55;
        };

        window.addEventListener("mousemove", onMouseMove);

        // 8. Resize Handler
        const handleResize = () => {
            if (!mount) return;
            width = mount.clientWidth || 550;
            height = mount.clientHeight || 500;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };
        window.addEventListener("resize", handleResize);

        // 9. Animation Loop
        let frameId;
        const clock = new THREE.Clock();

        const animate = () => {
            frameId = requestAnimationFrame(animate);
            const time = clock.getElapsedTime();

            // Core rotations
            coreMesh.rotation.y += 0.005;
            coreMesh.rotation.x += 0.002;
            corePoints.rotation.y = coreMesh.rotation.y;
            corePoints.rotation.x = coreMesh.rotation.x;

            innerMesh.rotation.y -= 0.008;

            // Particle drift
            particles.rotation.y -= 0.002;
            particles.rotation.x += 0.0008;

            // Audio waveform ripple animation on waveLine
            const posAttr = waveGeo.attributes.position;
            for (let i = 0; i < wavePointsCount; i++) {
                const angle = (i / wavePointsCount) * Math.PI * 2;
                const waveHeight = Math.sin(angle * 8 + time * 3.5) * 0.45 + Math.cos(angle * 4 - time * 2) * 0.25;
                const currentR = waveRadius + waveHeight;
                posAttr.setXYZ(i, Math.cos(angle) * currentR, waveHeight * 0.6, Math.sin(angle) * currentR);
            }
            posAttr.needsUpdate = true;

            waveLine.rotation.z += 0.004;
            ringB.rotation.z -= 0.003;

            // Organic breathing pulse
            const pulse = 1 + Math.sin(time * 2.2) * 0.04;
            coreMesh.scale.set(pulse, pulse, pulse);
            corePoints.scale.set(pulse, pulse, pulse);

            // Damped mouse tracking
            mainGroup.rotation.y += (targetRotY - mainGroup.rotation.y) * 0.05;
            mainGroup.rotation.x += (targetRotX - mainGroup.rotation.x) * 0.05;

            renderer.render(scene, camera);
        };
        animate();

        // Cleanup
        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("resize", handleResize);
            if (mount && renderer.domElement) {
                mount.removeChild(renderer.domElement);
            }
            coreGeo.dispose();
            coreMat.dispose();
            corePointsMat.dispose();
            innerGeo.dispose();
            innerMat.dispose();
            particleGeo.dispose();
            particleMat.dispose();
            particleTexture.dispose();
            waveGeo.dispose();
            waveMat.dispose();
            ringGeoB.dispose();
            ringMatB.dispose();
            renderer.dispose();
        };
    }, []);

    return (
        <div
            ref={mountRef}
            className="direct-3d-hologram"
            style={{
                width: "100%",
                height: "520px",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "auto"
            }}
        />
    );
};

export default NeuralHologram3D;
