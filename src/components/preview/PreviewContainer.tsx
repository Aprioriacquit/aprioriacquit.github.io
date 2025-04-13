// ✅ PreviewContainer — чистая структура по логике:
// 1. Загрузка и центрирование модели + вращение
// 2. Загрузка изображения и применение на майку
// 3. Ресет материалов
// 4. Покраска только старой текстуры (если нет изображения)

import { useEffect, useRef, useState, FC } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import modelPath from "@/assets/models/t-shirt/oversized_t-shirt.glb";

const BASE_PRICE = 200;
const MIN_EXTRA = 400;
const MAX_EXTRA = 1200;

const PreviewContainer: FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const modelRef = useRef<THREE.Object3D | null>(null);
    const shirtMesh = useRef<THREE.Mesh | null>(null);
    const baseMaterial = useRef<THREE.MeshStandardMaterial | null>(null);
    const isSpinning = useRef(true);
    const spinTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const textureRef = useRef<THREE.CanvasTexture | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const hasImage = useRef(false);
    const editModeRef = useRef(false);
    const controlsRef = useRef<OrbitControls | null>(null);

    const [editMode, setEditMode] = useState(false);
    const transformRef = useRef({ x: 512, y: 512, scale: 1, rotate: 0 });
    const pointerState = useRef({
        dragging: false,
        startX: 0,
        startY: 0,
        startTransform: { x: 512, y: 512, scale: 1, rotate: 0 },
        altMode: false
    });
    const [color, setColor] = useState("#cccccc");
    const [size, setSize] = useState("M");
    const [price, setPrice] = useState(BASE_PRICE);

    const calculatePrice = (scale: number) => {
        const coverage = Math.min(scale * scale, 1);
        const extra = MIN_EXTRA + coverage * (MAX_EXTRA - MIN_EXTRA);
        setPrice(Math.round(BASE_PRICE + extra));
    };

    useEffect(() => {
        calculatePrice(hasImage.current ? transformRef.current.scale : 0);
    }, []);

    const clearUploadInput = () => {
        const input = document.getElementById("hidden-upload") as HTMLInputElement;
        if (input) input.value = "";
    };

    const handleReset = () => {
        if (!modelRef.current) return;

        textureRef.current = null;
        imageRef.current = null;
        hasImage.current = false;
        isSpinning.current = true;

        transformRef.current = { x: 512, y: 512, scale: 1, rotate: 0 };
        calculatePrice(0); // ✅ сброс цены

        modelRef.current.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                const mat = child.material;
                const reset = (m: THREE.Material) => {
                    if (m instanceof THREE.MeshStandardMaterial) {
                        m.map = null;
                        m.color.set("#cccccc");
                        m.needsUpdate = true;
                    }
                };
                Array.isArray(mat) ? mat.forEach(reset) : reset(mat);
            }
        });

        clearUploadInput();
    };


    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !shirtMesh.current) return;

        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                imageRef.current = img;
                hasImage.current = true;
                updateTexture({ x: 512, y: 512, scale: 1, rotate: 0 });
                setTimeout(clearUploadInput, 100); // устранение повторного popup
            };
            img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
    };

    const updateTexture = ({
                               x,
                               y,
                               scale,
                               rotate
                           }: {
        x: number;
        y: number;
        scale: number;
        rotate: number;
    }) => {
        if (!canvasRef.current || !imageRef.current || !shirtMesh.current) return;

        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;

        const canvas = canvasRef.current;
        canvas.width = canvas.height = 1024;

        // 🔴 1. Фоновая заливка (цвет футболки)
        ctx.fillStyle = color; // из useState color
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 🖼 2. Наложение изображения поверх
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((rotate * Math.PI) / 180);
        ctx.scale(scale, scale);
        ctx.drawImage(
            imageRef.current,
            -imageRef.current.width / 2,
            -imageRef.current.height / 2
        );
        ctx.restore();

        // 3. Обновляем текстуру
        if (!textureRef.current) {
            textureRef.current = new THREE.CanvasTexture(canvas);
        } else {
            textureRef.current.needsUpdate = true;
        }

        const apply = (m: THREE.Material) => {
            if (m instanceof THREE.MeshStandardMaterial) {
                m.map = textureRef.current!;
                m.transparent = true;
                m.needsUpdate = true;
            }
        };

        const mat = shirtMesh.current.material;
        Array.isArray(mat) ? mat.forEach(apply) : apply(mat);
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newColor = e.target.value;
        setColor(newColor);

        if (!shirtMesh.current) return;

        if (hasImage.current) {
            updateTexture({ x: 512, y: 512, scale: 1, rotate: 0 }); // или сохранить последние трансформации
        } else {
            const mat = shirtMesh.current.material;
            const applyColor = (m: THREE.MeshStandardMaterial) => {
                m.color.set(newColor);
                m.needsUpdate = true;
            };
            Array.isArray(mat)
                ? mat.forEach((m) => m instanceof THREE.MeshStandardMaterial && applyColor(m))
                : mat instanceof THREE.MeshStandardMaterial && applyColor(mat);
        }
    };

    const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSize(e.target.value);
    };

    const handleSubmit = () => {
        alert(`Заказ оформлен!\nЦвет: ${color}\nРазмер: ${size}`);
    };

    const handleTriggerUpload = () => {
        console.log("Upload triggered");
        document.getElementById("hidden-upload")?.click();
    };

    useEffect(() => {
        window.addEventListener("reset-shirt", handleReset);
        window.addEventListener("trigger-upload", handleTriggerUpload);

        const container = mountRef.current;
        if (!container) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x222222);

        const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.set(0, 1.5, 3);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1));
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(5, 10, 7.5);
        scene.add(dirLight);

        const loader = new GLTFLoader();
        loader.load(modelPath, (gltf) => {
            const model = gltf.scene;
            model.scale.set(1.5, 1.5, 1.5);

            const box = new THREE.Box3().setFromObject(model);
            const center = new THREE.Vector3();
            box.getCenter(center);
            model.position.sub(center);

            scene.add(model);
            modelRef.current = model;

            model.traverse((child) => {
                if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                    shirtMesh.current = child;
                    baseMaterial.current = child.material.clone();
                }
            });
        });

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.maxPolarAngle = Math.PI / 2;
        controls.minPolarAngle = Math.PI / 3;
        controls.enableZoom = false;

        controls.addEventListener("start", () => {
            isSpinning.current = false;
            if (spinTimeout.current) clearTimeout(spinTimeout.current);
        });

        controls.addEventListener("end", () => {
            spinTimeout.current = setTimeout(() => {
                isSpinning.current = true;
            }, 3000);
        });
        controlsRef.current = controls;

        const animate = () => {
            animationFrameRef.current = requestAnimationFrame(animate);
            console.log("Animation frame", !!modelRef.current, isSpinning.current, !editModeRef.current);
            if (modelRef.current && isSpinning.current && !editModeRef.current) {
                modelRef.current.rotation.y += 0.003;
            }
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("trigger-upload", handleTriggerUpload);
            window.removeEventListener("reset-shirt", handleReset);
            window.removeEventListener("resize", handleResize);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            container.removeChild(renderer.domElement);
        };
    }, []);

    useEffect(() => {
        const canvas = mountRef.current;
        if (!canvas) return;

        const onPointerDown = (e: PointerEvent) => {
            if (!editMode) return;
            pointerState.current.dragging = true;
            pointerState.current.startX = e.clientX;
            pointerState.current.startY = e.clientY;
            pointerState.current.startTransform = { ...transformRef.current };
            pointerState.current.altMode = e.altKey;
        };

        const onPointerMove = (e: PointerEvent) => {
            if (!editMode || !pointerState.current.dragging) return;

            const dx = e.clientX - pointerState.current.startX;
            const dy = e.clientY - pointerState.current.startY;

            if (pointerState.current.altMode) {
                const newRotate = pointerState.current.startTransform.rotate + dx * 0.3;
                transformRef.current.rotate = newRotate;
            } else {
                transformRef.current.x = pointerState.current.startTransform.x + dx;
                transformRef.current.y = pointerState.current.startTransform.y + dy;
            }

            updateTexture(transformRef.current);
        };

        const onPointerUp = () => {
            if (!editMode) return;
            pointerState.current.dragging = false;
        };

        const onWheel = (e: WheelEvent) => {
            if (!editMode) return;
            e.preventDefault();
            const delta = e.deltaY * -0.001;
            transformRef.current.scale = Math.max(0.1, transformRef.current.scale + delta);
            calculatePrice(transformRef.current.scale); // ✅ вот здесь обновляется
            updateTexture(transformRef.current);
        };

        canvas.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
        canvas.addEventListener("wheel", onWheel, { passive: false });

        return () => {
            canvas.removeEventListener("pointerdown", onPointerDown);
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
            canvas.removeEventListener("wheel", onWheel);
        };
    }, [editMode]);

    useEffect(() => {
        editModeRef.current = editMode;
        if (controlsRef.current) {
            controlsRef.current.enabled = !editMode; // отключаем вращение в режиме редактирования
        }
    }, [editMode]);


    // const handleSubmit = async () => {
    //     if (!imageRef.current) return;
    //
    //     const formData = new FormData();
    //     formData.append("image", await fetch(imageRef.current.src).then(r => r.blob()));
    //     formData.append("position", JSON.stringify({ x: transformRef.current.x, y: transformRef.current.y }));
    //     formData.append("scale", transformRef.current.scale.toString());
    //     formData.append("rotate", transformRef.current.rotate.toString());
    //     formData.append("size", size);
    //     formData.append("color", color);
    //     formData.append("price", price.toString());
    //
    //     try {
    //         const response = await fetch("/api/send-order", {
    //             method: "POST",
    //             body: formData,
    //         });
    //
    //         if (response.ok) {
    //             alert("Заказ отправлен!");
    //         } else {
    //             alert("Ошибка при отправке заказа.");
    //         }
    //     } catch (err) {
    //         console.error(err);
    //         alert("Сервер не отвечает.");
    //     }
    // };


    return (
        <div className="preview-container" style={{ position: "relative" }}>
            <div
                className="preview-ui"
                style={{
                    position: "absolute",
                    top: 20,
                    left: 20,
                    zIndex: 10,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    padding: 16,
                    borderRadius: 12,
                    color: "white"
                }}
            >
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <label>
                        Цвет футболки:
                        <input type="color" value={color} onChange={handleColorChange} style={{ marginLeft: 8 }} />
                    </label>
                    <label>
                        Размер:
                        <select value={size} onChange={handleSizeChange} style={{ marginLeft: 8 }}>
                            {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </label>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => {
                            if (modelRef.current) modelRef.current.rotation.y = 0;
                        }}>Вид спереди</button>
                        <button onClick={() => {
                            if (modelRef.current) modelRef.current.rotation.y = Math.PI;
                        }}>Вид сзади</button>
                    </div>
                    <button onClick={() => setEditMode(!editMode)}>
                        {editMode ? "Завершить редактирование" : "Редактировать принт"}
                    </button>
                    <div style={{ marginTop: "auto" }}>
                        <p>Цена: <strong>{price} грн</strong></p>
                        <button onClick={handleSubmit} style={{ marginTop: 10 }}>
                            Оформить заказ
                        </button>
                    </div>
                </div>
            </div>
            <div ref={mountRef} className="three-preview" />
            <input
                id="hidden-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
            />
            <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
        </div>
    );
};

export default PreviewContainer;
