"use client"

import { useRef, useState, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, useHelper, PerspectiveCamera, Text } from "@react-three/drei"
import * as THREE from "three"
import SunCalc from "suncalc"

function City() {
  return (
    <group>
      <mesh receiveShadow castShadow position={[0, 0, 0]}>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color="gray" roughness={0.7} metalness={0.1} />
      </mesh>
      <mesh receiveShadow castShadow position={[2, 0, 2]}>
        <boxGeometry args={[1, 3, 1]} />
        <meshStandardMaterial color="gray" roughness={0.7} metalness={0.1} />
      </mesh>
      <mesh receiveShadow castShadow position={[-2, 0, -2]}>
        <boxGeometry args={[1, 1.5, 1]} />
        <meshStandardMaterial color="gray" roughness={0.7} metalness={0.1} />
      </mesh>
      <mesh receiveShadow position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="green" roughness={0.8} metalness={0.1} />
      </mesh>
    </group>
  )
}

function Sun({ position, color }: { position: THREE.Vector3; color: THREE.Color }) {
  const ref = useRef<THREE.DirectionalLight>(null!)
  useHelper(ref, THREE.DirectionalLightHelper, 1)

  useFrame(() => {
    if (ref.current) {
      ref.current.position.copy(position)
      ref.current.color = color
      ref.current.updateMatrixWorld()
    }
  })

  return <directionalLight ref={ref} castShadow intensity={1} shadow-mapSize={[2048, 2048]} />
}

function SolarPanel({ position, sunPosition }: { position: THREE.Vector3; sunPosition: THREE.Vector3 }) {
  const ref = useRef<THREE.Mesh>(null!)
  const [efficiency, setEfficiency] = useState(0)

  useFrame(({ scene }) => {
    if (ref.current) {
      // Calculate the vector from the panel to the sun
      const toSun = new THREE.Vector3().subVectors(sunPosition, position).normalize()

      // Rotate the panel to face the sun
      const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), toSun)
      ref.current.quaternion.slerp(targetQuaternion, 0.1) // Smooth rotation

      // Raycast from the panel to the sun to check for shadows
      const raycaster = new THREE.Raycaster(position, toSun)
      const intersects = raycaster.intersectObjects(scene.children, true)

      let shadowFactor = 1 // Assume full efficiency initially

      if (intersects.length > 0 && intersects[0].distance < sunPosition.distanceTo(position)) {
        shadowFactor = 0 // Shadow is falling on the panel, reduce efficiency
      }

      // Calculate the efficiency based on the angle to the sun and shadow factor
      const dotProduct = toSun.dot(new THREE.Vector3(0, 1, 0))
      const newEfficiency = Math.max(dotProduct, 0) * shadowFactor // Clamp to [0, 1]
      setEfficiency(newEfficiency)

      // Adjust panel color based on efficiency
      ref.current.material.color.setHSL(0.3, 1, 0.5 + 0.5 * newEfficiency)
    }
  })

  return (
    <group position={position}>
      <mesh ref={ref} castShadow receiveShadow>
        <boxGeometry args={[0.1, 0.01, 0.1]} />
        <meshStandardMaterial color="blue" roughness={0.6} metalness={0.3} />
      </mesh>
      <Text
        position={[0, 0.6, 0]} // Position the text above the panel
        fontSize={0.3}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {`Efficiency: ${(efficiency * 100).toFixed(2)}%`}
      </Text>
    </group>
  )
}



function DirectionIndicators() {
  return (
    <group>
      <Text position={[0, 0, 5.5]} rotation={[0, Math.PI, 0]} fontSize={0.5} color="black">
        N
      </Text>
      <Text position={[-5.5, 0, 0]} rotation={[0, Math.PI / 2, 0]} fontSize={0.5} color="black">
        E
      </Text>
      <Text position={[0, 0, -5.5]} fontSize={0.5} color="black">
        S
      </Text>
      <Text position={[5.5, 0, 0]} rotation={[0, -Math.PI / 2, 0]} fontSize={0.5} color="black">
        W
      </Text>
    </group>
  )
}

function Scene({
  sunPosition,
  sunColor,
  backgroundColor,
  onPlaneClick,
}: {
  sunPosition: THREE.Vector3
  sunColor: THREE.Color
  backgroundColor: THREE.Color
  onPlaneClick: (position: THREE.Vector3) => void
}) {
  const { camera, scene } = useThree()
  const planeRef = useRef<THREE.Mesh>(null!)

  useEffect(() => {
    scene.background = backgroundColor
  }, [scene, backgroundColor])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const raycaster = new THREE.Raycaster()
      const mouse = new THREE.Vector2()
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObject(planeRef.current)
      if (intersects.length > 0) {
        onPlaneClick(intersects[0].point)
      }
    }

    window.addEventListener("click", handleClick)
    return () => window.removeEventListener("click", handleClick)
  }, [camera, onPlaneClick])

  return (
    <>
      <PerspectiveCamera makeDefault position={[5, 5, 5]} />
      <OrbitControls enableDamping />
      <ambientLight intensity={0.5} />
      <Sun position={sunPosition} color={sunColor} />
      <City />
      <DirectionIndicators />
      <mesh ref={planeRef} position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <planeGeometry args={[10, 10]} />
        <meshBasicMaterial />
      </mesh>
    </>
  )
}

export function EnhancedCitySimulation() {
  const [longitude, setLongitude] = useState<number>(0)
  const [latitude, setLatitude] = useState<number>(0)
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [time, setTime] = useState<string>(new Date().toTimeString().split(" ")[0])
  const [sunPosition, setSunPosition] = useState<THREE.Vector3>(new THREE.Vector3(5, 5, 5))
  const [sunColor, setSunColor] = useState<THREE.Color>(new THREE.Color(0xffffff))
  const [backgroundColor, setBackgroundColor] = useState<THREE.Color>(new THREE.Color(0x87ceeb))
  const [panels, setPanels] = useState<THREE.Vector3[]>([])

  useEffect(() => {
    window.navigator.geolocation.getCurrentPosition((position) => {
      if (longitude === 0 && latitude === 0) {
        setLongitude(position.coords.longitude)
        setLatitude(position.coords.latitude)
      }
    })
  }, [longitude, latitude])
  

  useEffect(() => {
    const calculateSunPosition = () => {
      const dateTime = new Date(`${date}T${time}`)
      const sunPosition = SunCalc.getPosition(dateTime, latitude, longitude)

      // Convert altitude and azimuth to Cartesian coordinates
      const distance = 100 // Arbitrary distance for visualization
      const x = distance * Math.cos(sunPosition.altitude) * Math.sin(sunPosition.azimuth)
      const y = distance * Math.sin(sunPosition.altitude)
      const z = distance * Math.cos(sunPosition.altitude) * Math.cos(sunPosition.azimuth)

      setSunPosition(new THREE.Vector3(x, y, z))

      // Calculate sun color based on altitude
      const normalizedAltitude = (sunPosition.altitude + Math.PI / 2) / Math.PI
      const hue = Math.max(0, Math.min(0.1, normalizedAltitude * 0.1))
      const saturation = 1 - normalizedAltitude * 0.5
      const sunColor = new THREE.Color().setHSL(hue, saturation, 0.5)
      setSunColor(sunColor)

      // Calculate background color based on sun position
      const skyHue = 0.6 - normalizedAltitude * 0.1
      const skySaturation = 0.7 - normalizedAltitude * 0.3
      const skyLightness = 0.5 + normalizedAltitude * 0.3
      const backgroundColor = new THREE.Color().setHSL(skyHue, skySaturation, skyLightness)
      setBackgroundColor(backgroundColor)
    }

    calculateSunPosition()
  }, [longitude, latitude, date, time])

  const handlePlaneClick = (position: THREE.Vector3) => {
    setPanels((prevPanels) => [...prevPanels, position])
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex-grow">
        <Canvas shadows>
          <Scene
            sunPosition={sunPosition}
            sunColor={sunColor}
            backgroundColor={backgroundColor}
            onPlaneClick={handlePlaneClick}
          />
          {panels.map((position, index) => (
            <SolarPanel key={index} position={position} sunPosition={sunPosition} />
          ))}
        </Canvas>
      </div>
      <div className="bg-gray-200 p-4">
  <label>
    Date:
    <input
      type="date"
      value={date}
      onChange={(e) => setDate(e.target.value)}
      className="ml-2 border border-gray-300 rounded"
    />
  </label>
  <label className="ml-4">
    Time:
    <input
      type="time"
      value={time}
      onChange={(e) => setTime(e.target.value)}
      className="ml-2 border border-gray-300 rounded"
    />
  </label>
  <label className="ml-4">
    Longitude:
    <input
      type="number"
      step="0.0001"
      value={longitude}
      onChange={(e) => setLongitude(parseFloat(e.target.value))}
      className="ml-2 border border-gray-300 rounded"
    />
  </label>
  <label className="ml-4">
    Latitude:
    <input
      type="number"
      step="0.0001"
      value={latitude}
      onChange={(e) => setLatitude(parseFloat(e.target.value))}
      className="ml-2 border border-gray-300 rounded"
    />
  </label>
      </div>
    </div>
  )
}
