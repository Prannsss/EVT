'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
// OrbitControls from three examples (Esm)
// @ts-ignore - typings for three/examples may be missing in this project
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-white" />
        <p className="text-white text-lg font-medium">Loading Tour...</p>
      </div>
    </div>
  );
}

type Tour3DProps = {
  height?: string;
};

export default function Tour3D({ height = '80vh' }: Tour3DProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const canvasRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const currentTextureRef = useRef<THREE.Texture | null>(null);

  // NOTE: For Next.js, images in public/ must use absolute path starting with '/assets/'.
  // Update extension below to match your files (jpg/png).
  const totalImages = 20;
  const imageUrls = Array.from(
    { length: totalImages },
    (_, i) => `/assets/vt${i + 1}.png`
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  // Initialize Three.js renderer, camera, scene and controls
  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 2000);
    camera.position.set(0, 0, 0.1);
    cameraRef.current = camera;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = -0.4;
    controls.minDistance = 0.1;
    controls.maxDistance = 100;
    controlsRef.current = controls;

    // Animation loop
    let req = 0;
    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      req = requestAnimationFrame(animate);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(req);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      // remove canvas
      if (renderer.domElement.parentElement === container) container.removeChild(renderer.domElement);
      sceneRef.current = null;
      rendererRef.current = null;
      cameraRef.current = null;
      controlsRef.current = null;
    };
  }, []);

  const handleImageChange = (index: number) => {
    if (index !== currentIndex) {
      setIsLoading(true);
      setCurrentIndex(index);
    }
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % totalImages;
    handleImageChange(nextIndex);
  };

  const handlePrevious = () => {
    const prevIndex = (currentIndex - 1 + totalImages) % totalImages;
    handleImageChange(prevIndex);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setLoadedImages((prev) => new Set(prev).add(currentIndex));
  };

  // Load texture and apply to sphere
  useEffect(() => {
    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    const container = canvasRef.current;
    if (!scene || !renderer || !container) return;

    const loader = new THREE.TextureLoader();
    setIsLoading(true);

    const url = imageUrls[currentIndex];
    loader.load(
      url,
      (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.colorSpace = THREE.SRGBColorSpace;

        // Dispose previous texture
        if (currentTextureRef.current) {
          currentTextureRef.current.dispose();
          currentTextureRef.current = null;
        }

        // Create sphere if not exists
        let sphere = sphereRef.current;
        if (!sphere) {
          const geometry = new THREE.SphereGeometry(500, 60, 40);
          const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
          sphere = new THREE.Mesh(geometry, material);
          sphere.scale.set(-1, 1, 1);
          scene.add(sphere);
          sphereRef.current = sphere;
        } else {
          // Replace material map with fade
          const mat = sphere.material as THREE.MeshBasicMaterial;
          // apply texture
          mat.map = texture;
          mat.needsUpdate = true;
        }

        currentTextureRef.current = texture;
        setIsLoading(false);
        setLoadedImages((prev) => new Set(prev).add(currentIndex));
      },
      undefined,
      (err) => {
        console.error('Texture load error', err, url);
        setIsLoading(false);
      }
    );

    // Preload next image for smoother transitions
    const next = (currentIndex + 1) % totalImages;
    loader.load(imageUrls[next], () => {}, undefined, () => {});

    return () => {
      // do not dispose texture immediately to allow cached reuse
    };
  }, [currentIndex]);

  return (
    <div className="w-full">
      {/* Title Section */}
      <div className="text-center mb-6">
        <h2 className="text-3xl md:text-4xl font-bold font-headline">
          Interactive 3D Tour
        </h2>
        <p className="mt-2 text-muted-foreground italic">
          Explore our resort in 360°. Drag to look around, scroll to zoom.
        </p>
      </div>

      {/* 3D Viewer Card */}
      <Card className="overflow-hidden shadow-2xl">
        <CardContent className="p-0">
          <div
            ref={canvasRef}
            className="relative w-full bg-neutral-900"
            style={{ height }}
            role="img"
            aria-label={`Panoramic view ${currentIndex + 1} of ${totalImages}`}
          >
            {isLoading && <LoadingFallback />}
            {/* Three.js renderer attaches to this container (see initialization in useEffect) */}

            {/* Navigation Arrows */}
            <div className="absolute inset-y-0 left-4 flex items-center">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevious}
                className="bg-white/90 hover:bg-white shadow-lg rounded-full w-12 h-12"
                aria-label="Previous panorama"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
            </div>
            <div className="absolute inset-y-0 right-4 flex items-center">
              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                className="bg-white/90 hover:bg-white shadow-lg rounded-full w-12 h-12"
                aria-label="Next panorama"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>

            {/* Image Counter */}
            <div className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
              {currentIndex + 1} / {totalImages}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-neutral-50 dark:bg-neutral-900 p-4 border-t">
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-2 justify-center">
                {Array.from({ length: totalImages }, (_, i) => (
                  <Button
                    key={i}
                    onClick={() => handleImageChange(i)}
                    variant={currentIndex === i ? 'default' : 'outline'}
                    size="sm"
                    className={
                      `p-0 min-w-0 rounded-full flex items-center justify-center text-sm transition-all duration-150 leading-none overflow-hidden ` +
                      (currentIndex === i
                        ? 'w-11 h-11 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black shadow-lg'
                        : 'w-10 h-10 bg-white hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700')
                    }
                    aria-label={`View panorama ${i + 1}`}
                    aria-pressed={currentIndex === i}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p className="italic">
          <strong>Tips:</strong> Click and drag to explore • Click numbers to jump to specific views
        </p>
      </div>
    </div>
  );
}
