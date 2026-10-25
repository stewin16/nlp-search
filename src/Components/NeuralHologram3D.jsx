import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const NeuralHologram3D = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        let width = mount.clientWidth || 550;
        let height = mount.clientHeight || 520;

        // Scene, Camera, Renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 0, 26);

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

        // Helper: Create high-res 3D text sprite using HTML5 Canvas
        const createTextSprite = (text, color = "#ffffff", isAccent = false) => {
            const canvas = document.createElement("canvas");
            canvas.width = 512;
            canvas.height = 128;
            const ctx = canvas.getContext("2d");

            // Pill tag background
            const bgGrad = ctx.createLinearGradient(0, 0, 512, 128);
            if (isAccent) {
                bgGrad.addColorStop(0, "rgba(255, 0, 86, 0.45)");
                bgGrad.addColorStop(1, "rgba(180, 0, 60, 0.25)");
            } else {
                bgGrad.addColorStop(0, "rgba(20, 24, 38, 0.7)");
                bgGrad.addColorStop(1, "rgba(10, 14, 24, 0.5)");
            }

            // Rounded rectangle
            const r = 36;
            ctx.beginPath();
            ctx.moveTo(r, 10);
            ctx.lineTo(512 - r, 10);
            ctx.quadraticCurveTo(512, 10, 512, 10 + r);
            ctx.lineTo(512, 128 - r);
            ctx.quadraticCurveTo(512, 128, 512 - r, 128);
            ctx.lineTo(r, 128);
            ctx.quadraticCurveTo(0, 128, 0, 128 - r);
            ctx.lineTo(0, 10 + r);
            ctx.quadraticCurveTo(0, 10, r, 10);
            ctx.closePath();

            ctx.fillStyle = bgGrad;
            ctx.fill();

            // Border
            ctx.strokeStyle = isAccent ? "rgba(255, 0, 86, 0.9)" : "rgba(0, 229, 255, 0.5)";
            ctx.lineWidth = 4;
            ctx.stroke();

            // Node indicator dot
            ctx.beginPath();
            ctx.arc(42, 64, 10, 0, Math.PI * 2);
            ctx.fillStyle = isAccent ? "#ff0056" : "#00e5ff";
            ctx.fill();

            // Text
            ctx.font = "bold 44px 'Segoe UI', Roboto, sans-serif";
            ctx.fillStyle = color;
            ctx.textBaseline = "middle";
            ctx.fillText(text, 68, 66);

            const texture = new THREE.CanvasTexture(canvas);
            texture.minFilter = THREE.LinearFilter;
            const spriteMaterial = new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
                opacity: 0.92,
                depthWrite: false
            });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(4.6, 1.15, 1);
            return sprite;
        };

        // NLP Word Embedding vocabulary & coordinates in 3D vector space
        const nlpTokens = [
            { text: "TRANSFORMER", pos: [0, 5.2, 0], accent: true },
            { text: "ATTENTION", pos: [4.8, 3.4, 2.5], accent: true },
            { text: "TEXTRANK", pos: [-4.6, 3.2, 1.8], accent: true },
            { text: "SUMMARIZATION", pos: [-5.4, -0.5, 2.8], accent: false },
            { text: "WORDNET", pos: [5.2, -0.8, -2.0], accent: false },
            { text: "LEMMATIZE", pos: [3.8, -4.2, 2.2], accent: false },
            { text: "TOKENIZE", pos: [-3.8, -4.0, -1.5], accent: false },
            { text: "SENTIMENT", pos: [0, -5.2, 1.0], accent: true },
            { text: "SEMANTICS", pos: [-2.8, 1.8, -4.5], accent: false },
            { text: "EMBEDDING", pos: [3.2, 1.5, -4.2], accent: false },
            { text: "SPEECH-TO-TEXT", pos: [5.5, -3.0, -1.8], accent: true },
            { text: "READABILITY", pos: [-5.0, -3.2, 1.5], accent: false },
            { text: "FLASHCARDS", pos: [-1.8, 4.2, -3.0], accent: false },
            { text: "RISK MATRIX", pos: [2.2, -2.2, 4.8], accent: false },
            { text: "INDIAN TTS", pos: [-2.4, -2.0, 4.5], accent: true }
        ];

        const tokenSprites = [];
        const tokenNodesGroup = new THREE.Group();
        mainGroup.add(tokenNodesGroup);

        nlpTokens.forEach((item) => {
            const sprite = createTextSprite(
                item.text,
                item.accent ? "#ffffff" : "#e0f2fe",
                item.accent
            );
            sprite.position.set(...item.pos);
            sprite.userData = {
                basePos: new THREE.Vector3(...item.pos),
                speed: 0.6 + Math.random() * 0.8,
                phase: Math.random() * Math.PI * 2
            };
            tokenSprites.push(sprite);
            tokenNodesGroup.add(sprite);

            // Small glowing node anchor dot
            const nodeDotGeo = new THREE.SphereGeometry(0.18, 12, 12);
            const nodeDotMat = new THREE.MeshBasicMaterial({
                color: item.accent ? 0xff0056 : 0x00e5ff
            });
            const nodeDot = new THREE.Mesh(nodeDotGeo, nodeDotMat);
            nodeDot.position.set(...item.pos);
            tokenNodesGroup.add(nodeDot);
        });

        // 2. Self-Attention Synapse Lines (Connecting related NLP tokens)
        const lineConnections = [
            [0, 1], // Transformer <-> Attention
            [0, 2], // Transformer <-> TextRank
            [2, 3], // TextRank <-> Summarization
            [0, 9], // Transformer <-> Embedding
            [9, 8], // Embedding <-> Semantics
            [4, 5], // WordNet <-> Lemmatize
            [5, 6], // Lemmatize <-> Tokenize
            [0, 7], // Transformer <-> Sentiment
            [1, 10], // Attention <-> Speech-to-Text
            [3, 11], // Summarization <-> Readability
            [3, 12], // Summarization <-> Flashcards
            [3, 13], // Summarization <-> Risk Matrix
            [10, 14], // Speech-to-Text <-> Indian TTS
            [1, 7], // Attention <-> Sentiment
            [2, 8]  // TextRank <-> Semantics
        ];

        const lineGeometries = [];
        const linesGroup = new THREE.Group();
        mainGroup.add(linesGroup);

        lineConnections.forEach(([fromIdx, toIdx]) => {
            const p1 = new THREE.Vector3(...nlpTokens[fromIdx].pos);
            const p2 = new THREE.Vector3(...nlpTokens[toIdx].pos);
            const geom = new THREE.BufferGeometry().setFromPoints([p1, p2]);
            lineGeometries.push({ geom, fromIdx, toIdx });

            const isKey = nlpTokens[fromIdx].accent && nlpTokens[toIdx].accent;
            const mat = new THREE.LineBasicMaterial({
                color: isKey ? 0xff0056 : 0x00e5ff,
                transparent: true,
                opacity: isKey ? 0.65 : 0.35,
                blending: THREE.AdditiveBlending
            });
            const line = new THREE.Line(geom, mat);
            linesGroup.add(line);
        });

        // 3. Central Attention Weight Core (Multi-ring Neural Gyroscope)
        const coreRingA = new THREE.Mesh(
            new THREE.TorusGeometry(2.8, 0.04, 16, 80),
            new THREE.MeshBasicMaterial({ color: 0xff0056, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending })
        );
        const coreRingB = new THREE.Mesh(
            new THREE.TorusGeometry(3.3, 0.03, 16, 90),
            new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending })
        );
        const coreRingC = new THREE.Mesh(
            new THREE.TorusGeometry(2.1, 0.05, 16, 70),
            new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending })
        );
        coreRingA.rotation.x = Math.PI / 4;
        coreRingB.rotation.y = Math.PI / 3;
        coreRingC.rotation.z = Math.PI / 6;
        mainGroup.add(coreRingA);
        mainGroup.add(coreRingB);
        mainGroup.add(coreRingC);

        // 4. Central Vector Origin Orb
        const originGeo = new THREE.SphereGeometry(1.2, 20, 20);
        const originMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true,
            transparent: true,
            opacity: 0.25
        });
        const originOrb = new THREE.Mesh(originGeo, originMat);
        mainGroup.add(originOrb);

        // 5. Floating Embedding Dust (Data Vectors in high dimensional space)
        const dustCount = 800;
        const dustPositions = new Float32Array(dustCount * 3);
        const dustColors = new Float32Array(dustCount * 3);
        for (let i = 0; i < dustCount; i++) {
            const i3 = i * 3;
            const r = 3 + Math.random() * 8.5;
            const th = Math.random() * Math.PI * 2;
            const ph = Math.acos(Math.random() * 2 - 1);
            dustPositions[i3] = r * Math.sin(ph) * Math.cos(th);
            dustPositions[i3 + 1] = r * Math.sin(ph) * Math.sin(th);
            dustPositions[i3 + 2] = r * Math.cos(ph);

            const isPink = Math.random() > 0.5;
            dustColors[i3] = isPink ? 1.0 : 0.0;
            dustColors[i3 + 1] = isPink ? 0.0 : 0.9;
            dustColors[i3 + 2] = isPink ? 0.35 : 1.0;
        }
        const dustGeo = new THREE.BufferGeometry();
        dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
        dustGeo.setAttribute("color", new THREE.BufferAttribute(dustColors, 3));
        const dustMat = new THREE.PointsMaterial({
            size: 0.15,
            vertexColors: true,
            transparent: true,
            opacity: 0.65,
            blending: THREE.AdditiveBlending
        });
        const dustPoints = new THREE.Points(dustGeo, dustMat);
        mainGroup.add(dustPoints);

        // 6. Interactive Mouse Tracking
        let targetRotX = 0;
        let targetRotY = 0;

        const onMouseMove = (e) => {
            const rect = mount.getBoundingClientRect();
            const mouseX = ((e.clientX - rect.left) / width) * 2 - 1;
            const mouseY = -(((e.clientY - rect.top) / height) * 2 - 1);
            targetRotY = mouseX * 0.85;
            targetRotX = mouseY * 0.65;
        };

        window.addEventListener("mousemove", onMouseMove);

        // 7. Resize Handling
        const handleResize = () => {
            if (!mount) return;
            width = mount.clientWidth || 550;
            height = mount.clientHeight || 520;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };
        window.addEventListener("resize", handleResize);

        // 8. Animation Loop
        let frameId;
        const clock = new THREE.Clock();

        const animate = () => {
            frameId = requestAnimationFrame(animate);
            const time = clock.getElapsedTime();

            // Organic slow orbital rotation
            tokenNodesGroup.rotation.y = time * 0.07;
            linesGroup.rotation.y = time * 0.07;

            // Core gyros rotate in opposing axes
            coreRingA.rotation.x += 0.008;
            coreRingA.rotation.y += 0.005;
            coreRingB.rotation.y += 0.007;
            coreRingB.rotation.z += 0.006;
            coreRingC.rotation.z -= 0.009;

            originOrb.rotation.y -= 0.006;

            dustPoints.rotation.y -= 0.003;

            // Gentle floating breathing animation on each NLP token sprite
            tokenSprites.forEach((sprite) => {
                const u = sprite.userData;
                const bobY = Math.sin(time * u.speed + u.phase) * 0.22;
                const bobX = Math.cos(time * u.speed * 0.7 + u.phase) * 0.15;
                sprite.position.x = u.basePos.x + bobX;
                sprite.position.y = u.basePos.y + bobY;
            });

            // Smooth mouse responsiveness
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
            coreRingA.geometry.dispose();
            coreRingA.material.dispose();
            coreRingB.geometry.dispose();
            coreRingB.material.dispose();
            coreRingC.geometry.dispose();
            coreRingC.material.dispose();
            originGeo.dispose();
            originMat.dispose();
            dustGeo.dispose();
            dustMat.dispose();
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
                cursor: "grab"
            }}
        />
    );
};

export default NeuralHologram3D;
