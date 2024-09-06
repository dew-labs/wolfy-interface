/* eslint-disable @eslint-community/eslint-comments/no-unlimited-disable -- no check */
/* eslint-disable -- no check */
// @ts-nocheck
import {
  AccumulativeShadows,
  Environment,
  Float,
  Lightformer,
  PerformanceMonitor,
  RandomizedLight,
  useGLTF,
} from '@react-three/drei'
import {applyProps, Canvas, useFrame} from '@react-three/fiber'
import {Color, Depth, LayerMaterial} from 'lamina'
import {easing} from 'maath'
import {useLayoutEffect, useRef, useState} from 'react'
import * as THREE from 'three'

export default function  Effect() {
  const [degraded, degrade] = useState(false)
  return (
    <Canvas
      style={{
        height: '100vh',
      }}
      camera={{position: [5, 0, 15], fov: 30}}
    >
      <ambientLight intensity={0.1} />
      <Porsche scale={20} position={[0.25, -1.5, 0]} rotation={[0.2, Math.PI / 10, 0.125]} />
      <AccumulativeShadows position={[0, -1.16, 0]} frames={100} alphaTest={0.125} scale={10}>
        <RandomizedLight amount={10} radius={10} ambient={0.5} position={[0, 0, 0]} />
      </AccumulativeShadows>
      <PerformanceMonitor
        onDecline={() => {
          degrade(true)
        }}
      />
      <CameraRig />
      <Environment frames={degraded ? 1 : Infinity} resolution={256}>
        <Lightformers />
      </Environment>
    </Canvas>
  )
}


function Porsche(props: any) {
  const {scene, nodes, materials} = useGLTF('/wolfy-logo.glb')
  useLayoutEffect(() => {
    applyProps(materials['May Mist']!, {envMapIntensity: 0.5, roughness: 0.1, metalness: 1})
    applyProps(materials.Windsurf!, {envMapIntensity: 0.5, roughness: 0.1, metalness: 1})
    applyProps(materials.Bumblebee!, {
      roughness: 0.1,
      metalness: 1,
      envMapIntensity: 0.5,
    })
  }, [nodes, materials])
  return <primitive object={scene} {...props} />
}

function CameraRig({v = new THREE.Vector3()}) {
  return useFrame((state, delta) => {
    easing.damp3(
      state.camera.position,
      [Math.sin(-state.pointer.x) * 10, state.pointer.y * 5 - 2, 15 + Math.cos(state.pointer.x)],
      0.5,
      delta,
    )
    state.camera.lookAt(0, 0, 0)
  })
}

function Lightformers() {
  const positions = [2, 0, 2, 0, 2, 0, 2, 0]

  const group = useRef()
  useFrame(
    (state, delta) =>
      (group.current!.position.z += delta * 10) > 20 && (group.current!.position.z = -60),
  )
  return (
    <>
      {/* Ceiling */}
      <Lightformer
        intensity={0.5}
        rotation-x={Math.PI / 2}
        position={[0, 5, -9]}
        scale={[10, 10, 1]}
      />
      <group rotation={[0, 0.5, 0]}>
        <group ref={group}>
          {positions.map((x, i) => (
            <Lightformer
              key={i}
              form='circle'
              intensity={2}
              rotation={[Math.PI / 2, 0.5, 0.5]}
              position={[x, 4, i * 4]}
              scale={[3, 1, 1]}
            />
          ))}
        </group>
      </group>
      {/* Sides */}
      <Lightformer
        intensity={4}
        rotation-y={Math.PI / 2}
        position={[-5, 1, -1]}
        scale={[20, 0.1, 1]}
      />
      <Lightformer rotation-y={Math.PI / 2} position={[-1, -1, -1]} scale={[20, 0.5, 1]} />
      <Lightformer rotation-y={-Math.PI / 2} position={[5, 2, 0]} scale={[20, 1, 1]} />
      {/* Accent (red) */}
      <Float speed={5} floatIntensity={5} rotationIntensity={1}>
        <Lightformer
          form='ring'
          color='red'
          intensity={0.3}
          scale={5}
          position={[-15, 4, -18]}
          target={[1, 1, 1]}
        />
      </Float>
      {/* Background */}
      <mesh scale={100}>
        <sphereGeometry args={[1, 28, 28]} />
        <LayerMaterial side={THREE.BackSide}>
          <Color color='#000' alpha={1} mode='darken' />
          <Depth
            colorA='red'
            colorB='black'
            alpha={0.3}
            mode='normal'
            near={0}
            far={300}
            origin={[100, 100, 100]}
          />
        </LayerMaterial>
      </mesh>
    </>
  )
}
/* eslint-enable */
