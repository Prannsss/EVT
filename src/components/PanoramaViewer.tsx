"use client"

import React, {Suspense} from "react"
import {Canvas} from "@react-three/fiber"
import {OrbitControls, useTexture} from "@react-three/drei"
import * as THREE from "three"

export default function PanoramaViewer({src}: {src: string}) {
  // useTexture handles caching and async loading; wrap in Suspense where used
  const texture = useTexture(src)

  return (
    <Canvas camera={{fov: 75}} className="w-full h-full">
      <ambientLight intensity={0.8} />
      <mesh>
        <sphereGeometry args={[50, 64, 64]} />
        <meshBasicMaterial map={texture} side={THREE.BackSide} />
      </mesh>
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  )
}
