"use client"

import { useRef, useState, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, useHelper, PerspectiveCamera } from "@react-three/drei"
import * as THREE from "three"
import SunCalc from "suncalc"

function City() {
  return (
    <group>
      <mesh receiveShadow castShadow position={[0, 0, 0]}>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color="gray" />
      </mesh>
      <mesh receiveShadow castShadow position={[2, 0, 2]}>
        <boxGeometry args={[1, 3, 1]} />
        <meshStandardMaterial color="gray" />
      </mesh>
      <mesh receiveShadow castShadow position={[-2, 0, -2]}>
        <boxGeometry args={[1, 1.5, 1]} />
        <meshStandardMaterial color="gray" />
      </mesh>
      <mesh receiveShadow position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="green" />
      </mesh>
    </group>
  )
}

function Sun({ position }: { position: THREE.Vector3 }) {
  const ref = useRef<THREE.DirectionalLight>(null!)
  useHelper(ref, THREE.DirectionalLightHelper, 1)

  useFrame(() => {
    if (ref.current) {
      ref.current.position.copy(position)
      ref.current.updateMatrixWorld()
    }
  })

  return <directionalLight ref={ref} castShadow intensity={1} shadow-mapSize={[2048, 2048]} />
}

function Scene({ sunPosition, ambientLightIntensity }: { sunPosition: THREE.Vector3, ambientLightIntensity: number }) {
  const { camera } = useThree()

  return (
    <>
      <PerspectiveCamera makeDefault position={[5, 5, 5]} />
      <OrbitControls enableDamping />
      <ambientLight intensity={ambientLightIntensity} />
      <Sun position={sunPosition} />
      <City />
    </>
  )
}

export function CitySimulationRealSun() {
  //get window longititude
  const [longitude, setLongitude] = useState()
  const [latitude, setLatitude] = useState()

  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [time, setTime] = useState(new Date().toTimeString().split(' ')[0])
  const [sunPosition, setSunPosition] = useState(new THREE.Vector3(5, 5, 5))
  const [ambientLightIntensity, setAmbientLightIntensity] = useState(0.2)

  useEffect(()=>{
    window.navigator.geolocation.getCurrentPosition((position) => setLongitude(position.coords.longitude))
    window.navigator.geolocation.getCurrentPosition((position) => setLatitude(position.coords.latitude))
  },[])
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

      // Adjust ambient light intensity based on sun's elevation
      const normalizedAltitude = (sunPosition.altitude + Math.PI / 2) / Math.PI
      setAmbientLightIntensity(Math.max(0.1, normalizedAltitude * 0.5))
    }

    calculateSunPosition()
  }, [longitude, latitude, date, time])

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex-grow">
        <Canvas shadows>
          <Scene sunPosition={sunPosition} ambientLightIntensity={ambientLightIntensity} />
        </Canvas>
      </div>
      <div className="p-4 bg-gray-100">
        <h2 className="text-lg font-semibold mb-2">Sun Position Controls</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="longitude" className="block text-sm font-medium">
              Longitude
            </label>
            <input
              id="longitude"
              type="number"
              value={longitude}
              onChange={(e) => setLongitude(parseFloat(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="latitude" className="block text-sm font-medium">
              Latitude
            </label>
            <input
              id="latitude"
              type="number"
              value={latitude}
              onChange={(e) => setLatitude(parseFloat(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium">
              Date
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="time" className="block text-sm font-medium">
              Time
            </label>
            <input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
        </div>
      </div>
    </div>
  )
}