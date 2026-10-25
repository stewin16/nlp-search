import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const NeuralHologram3D = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        let width = mount.clientWidth || 560;
        let height = mount.clientHeight || 530;

        // Scene, Camera, Renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
        camera.position.set(0, 0, 27);

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "high-performance"
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mount.appendChild(renderer.domElement);

        const mainGroup = new THREE.Group();
        // Isometric perspective tilt
        mainGroup.rotation.x = 0.36;
        mainGroup.rotation.y = -0.40;
        mainGroup.rotation.z = 0.10;
        scene.add(mainGroup);

        // Helper: Create High-Resolution Light Luxury Frosted Glass Card Texture
        const createGlassCardTexture = (tierNumber, title, subtitle, items, themeColor, accentColor) => {
            const canvas = document.createElement("canvas");
            canvas.width = 720;
            canvas.height = 370;
            const ctx = canvas.getContext("2d");

            // 1. Frosted Crystal Glass Base
            const bgGrad = ctx.createLinearGradient(0, 0, 720, 370);
            bgGrad.addColorStop(0, "rgba(255, 255, 255, 0.96)");
            bgGrad.addColorStop(0.6, "rgba(250, 252, 255, 0.92)");
            bgGrad.addColorStop(1, "rgba(241, 245, 249, 0.95)");

            const r = 28;
            ctx.beginPath();
            ctx.moveTo(r, 8);
            ctx.lineTo(720 - r, 8);
            ctx.quadraticCurveTo(720, 8, 720, 8 + r);
            ctx.lineTo(720, 370 - r);
            ctx.quadraticCurveTo(720, 370, 720 - r, 370);
            ctx.lineTo(r, 370);
            ctx.quadraticCurveTo(0, 370, 0, 370 - r);
            ctx.lineTo(0, 8 + r);
            ctx.quadraticCurveTo(0, 8, r, 8);
            ctx.closePath();

            ctx.fillStyle = bgGrad;
            ctx.fill();

            // 2. Crisp Polished Glass Border
            const borderGrad = ctx.createLinearGradient(0, 0, 720, 370);
            borderGrad.addColorStop(0, themeColor);
            borderGrad.addColorStop(0.35, "rgba(255, 255, 255, 0.8)");
            borderGrad.addColorStop(0.7, accentColor);
            borderGrad.addColorStop(1, themeColor);
            ctx.strokeStyle = borderGrad;
            ctx.lineWidth = 4;
            ctx.stroke();

            // Subtle top highlight reflection
            ctx.beginPath();
            ctx.moveTo(36, 12);
            ctx.lineTo(684, 12);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
            ctx.lineWidth = 2;
            ctx.stroke();

            // 3. Card Header Bar
            // Tier Number Badge Pill
            ctx.fillStyle = themeColor;
            ctx.beginPath();
            if (ctx.roundRect) {
                ctx.roundRect(36, 30, 58, 34, 17);
            } else {
                ctx.rect(36, 30, 58, 34);
            }
            ctx.fill();

            ctx.font = "bold 18px 'Segoe UI', Roboto, sans-serif";
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(tierNumber, 65, 47);

            // Title
            ctx.textAlign = "left";
            ctx.font = "bold 26px 'Segoe UI', Roboto, sans-serif";
            ctx.fillStyle = "#0f172a";
            ctx.fillText(title, 110, 42);

            // Subtitle
            ctx.font = "15px 'Segoe UI', Roboto, sans-serif";
            ctx.fillStyle = "#64748b";
            ctx.fillText(subtitle, 110, 68);

            // Subtle separator line
            ctx.strokeStyle = "rgba(15, 23, 42, 0.08)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(36, 92);
            ctx.lineTo(684, 92);
            ctx.stroke();

            // 4. Feature Rows inside the Card
            items.forEach((item, idx) => {
                const y = 118 + idx * 68;

                // Item Pill Background
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                if (ctx.roundRect) {
                    ctx.roundRect(36, y, 648, 52, 14);
                } else {
                    ctx.rect(36, y, 648, 52);
                }
                ctx.fill();

                // Subtle item border & drop shadow
                ctx.strokeStyle = item.accent ? "rgba(255, 0, 86, 0.35)" : "rgba(15, 23, 42, 0.08)";
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Left color accent bar
                ctx.fillStyle = item.accent ? themeColor : accentColor;
                ctx.fillRect(36, y + 10, 5, 32);

                // Item Label
                ctx.font = "bold 18px 'Segoe UI', Roboto, sans-serif";
                ctx.fillStyle = "#1e293b";
                ctx.fillText(item.label, 58, y + 26);

                // Item Tag Badge Pill
                ctx.font = "bold 13px 'Segoe UI', Roboto, sans-serif";
                ctx.fillStyle = item.accent ? themeColor : "#0284c7";
                ctx.textAlign = "right";
                ctx.fillText(item.tag, 664, y + 26);
                ctx.textAlign = "left";
            });

            const texture = new THREE.CanvasTexture(canvas);
            texture.minFilter = THREE.LinearFilter;
            return texture;
        };

        // Configuration for the 3 Tiers
        const tierCardsData = [
            {
                tierNumber: "01",
                title: "Multimodal Ingestion",
                subtitle: "Real-Time Audio, Video & Document Streams",
                items: [
                    { label: "YouTube Video Captions", tag: "TimedText Audio Stream", accent: true },
                    { label: "Zoom Lecture Transcripts", tag: "Speaker & Timestamps", accent: false },
                    { label: "Legal & Policy Agreements", tag: "Clause Segmenter", accent: false }
                ],
                themeColor: "#ff0056",
                accentColor: "#f43f5e",
                yPos: 5.8,
                zPos: -3.8
            },
            {
                tierNumber: "02",
                title: "Deep NLP Intelligence",
                subtitle: "Semantic Graph, TextRank & Lexical Parsing",
                items: [
                    { label: "TextRank Extractive Engine", tag: "Graph-Based Ranker", accent: true },
                    { label: "WordNet Synset Similarity", tag: "Semantic Lemmatizer", accent: false },
                    { label: "VADER Polarity Scoring", tag: "Sentiment Spectrum", accent: true }
                ],
                themeColor: "#7c3aed",
                accentColor: "#8b5cf6",
                yPos: 0.0,
                zPos: 0.0
            },
            {
                tierNumber: "03",
                title: "Actionable Outputs",
                subtitle: "Study Flashcards, Quiz & Voice Synthesis",
                items: [
                    { label: "Indian Female Voice TTS", tag: "en-IN Voice Synthesizer", accent: true },
                    { label: "Smart Comprehension Quiz", tag: "Context-Aware MCQs", accent: false },
                    { label: "Legal Risk & Clause Matrix", tag: "Automated Compliance", accent: true }
                ],
                themeColor: "#0284c7",
                accentColor: "#0ea5e9",
                yPos: -5.8,
                zPos: 3.8
            }
        ];

        // 3D Card Meshes
        const cardMeshes = [];
        const cardWidth = 11.4;
        const cardHeight = 5.9;
        const cardGeometry = new THREE.PlaneGeometry(cardWidth, cardHeight);

        tierCardsData.forEach((data, index) => {
            const texture = createGlassCardTexture(
                data.tierNumber,
                data.title,
                data.subtitle,
                data.items,
                data.themeColor,
                data.accentColor
            );

            const material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                opacity: 0.98,
                side: THREE.DoubleSide
            });

            const mesh = new THREE.Mesh(cardGeometry, material);
            mesh.position.set(0, data.yPos, data.zPos);
            mainGroup.add(mesh);

            // Realistic Soft Ambient Occlusion Shadow Plane (Dark shadow under card against white space)
            const shadowGeo = new THREE.PlaneGeometry(cardWidth + 0.6, cardHeight + 0.6);
            const shadowMat = new THREE.MeshBasicMaterial({
                color: 0x0f172a,
                transparent: true,
                opacity: 0.09,
                depthWrite: false
            });
            const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
            shadowPlane.position.set(0.15, -0.2, -0.1);
            mesh.add(shadowPlane);

            cardMeshes.push({
                mesh,
                baseY: data.yPos,
                baseZ: data.zPos,
                phase: index * 1.5,
                speed: 1.15
            });
        });

        // 3. Glowing Laser Data Threads Connecting the 3 Tiers
        const laserLinesGroup = new THREE.Group();
        mainGroup.add(laserLinesGroup);

        const threadCount = 7;
        const laserParticles = [];

        for (let i = 0; i < threadCount; i++) {
            const xOffset = -4.6 + (i / (threadCount - 1)) * 9.2;
            const curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(xOffset, 5.8 - 2.9, -3.8),
                new THREE.Vector3(xOffset * 0.9, 2.9, -1.9),
                new THREE.Vector3(xOffset * 0.95, 0.0, 0.0),
                new THREE.Vector3(xOffset * 0.9, -2.9, 1.9),
                new THREE.Vector3(xOffset, -5.8 + 2.9, 3.8)
            ]);

            const pts = curve.getPoints(50);
            const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
            const isPink = i % 2 === 0;

            const lineMat = new THREE.LineBasicMaterial({
                color: isPink ? 0xff0056 : 0x0284c7,
                transparent: true,
                opacity: 0.55,
                linewidth: 2
            });
            const line = new THREE.Line(lineGeo, lineMat);
            laserLinesGroup.add(line);

            // Glowing data packet travelling down the thread
            const pulseGeo = new THREE.SphereGeometry(0.2, 12, 12);
            const pulseMat = new THREE.MeshBasicMaterial({
                color: isPink ? 0xff0056 : 0x0284c7
            });
            const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
            laserLinesGroup.add(pulseMesh);

            laserParticles.push({
                mesh: pulseMesh,
                curve,
                progress: (i / threadCount) + Math.random() * 0.2,
                speed: 0.16 + Math.random() * 0.09
            });
        }

        // 4. Subtle Micro Data Particles around the 3D scene
        const particleCount = 300;
        const partPositions = new Float32Array(particleCount * 3);
        const partColors = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            partPositions[i3] = (Math.random() - 0.5) * 22;
            partPositions[i3 + 1] = (Math.random() - 0.5) * 20;
            partPositions[i3 + 2] = (Math.random() - 0.5) * 16;

            const isPink = Math.random() > 0.5;
            partColors[i3] = isPink ? 1.0 : 0.01;
            partColors[i3 + 1] = isPink ? 0.0 : 0.52;
            partColors[i3 + 2] = isPink ? 0.34 : 0.78;
        }
        const particleGeo = new THREE.BufferGeometry();
        particleGeo.setAttribute("position", new THREE.BufferAttribute(partPositions, 3));
        particleGeo.setAttribute("color", new THREE.BufferAttribute(partColors, 3));
        const particleMat = new THREE.PointsMaterial({
            size: 0.16,
            vertexColors: true,
            transparent: true,
            opacity: 0.65
        });
        const particles = new THREE.Points(particleGeo, particleMat);
        mainGroup.add(particles);

        // 5. Interactive Mouse Camera Pan
        let targetRotX = 0.36;
        let targetRotY = -0.40;

        const onMouseMove = (e) => {
            const rect = mount.getBoundingClientRect();
            const mouseX = ((e.clientX - rect.left) / width) * 2 - 1;
            const mouseY = -(((e.clientY - rect.top) / height) * 2 - 1);
            targetRotY = -0.40 + mouseX * 0.25;
            targetRotX = 0.36 - mouseY * 0.18;
        };

        window.addEventListener("mousemove", onMouseMove);

        // 6. Resize Handling
        const handleResize = () => {
            if (!mount) return;
            width = mount.clientWidth || 560;
            height = mount.clientHeight || 530;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };
        window.addEventListener("resize", handleResize);

        // 7. Animation Loop
        let frameId;
        const clock = new THREE.Clock();

        const animate = () => {
            frameId = requestAnimationFrame(animate);
            const delta = clock.getDelta();
            const time = clock.getElapsedTime();

            // Organic levitation on the 3 tiers
            cardMeshes.forEach((item) => {
                const bob = Math.sin(time * item.speed + item.phase) * 0.22;
                item.mesh.position.y = item.baseY + bob;
            });

            // Data packets streaming down laser threads
            laserParticles.forEach((p) => {
                p.progress = (p.progress + p.speed * delta) % 1.0;
                const pt = p.curve.getPointAt(p.progress);
                p.mesh.position.copy(pt);
            });

            // Subtle particle drift
            particles.rotation.y = time * 0.015;

            // Smooth mouse damping
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
            cardGeometry.dispose();
            cardMeshes.forEach((item) => {
                item.mesh.material.map.dispose();
                item.mesh.material.dispose();
            });
            renderer.dispose();
        };
    }, []);

    return (
        <div
            ref={mountRef}
            className="direct-3d-hologram"
            style={{
                width: "100%",
                height: "530px",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "grab"
            }}
        />
    );
};

export default NeuralHologram3D;
