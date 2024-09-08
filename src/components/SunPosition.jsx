import React, { useState, useEffect } from 'react';
import SunCalc from 'suncalc';

const SunPosition = ({ latitude, longitude }) => {
  const [altitude, setAltitude] = useState(null);
  const [azimuth, setAzimuth] = useState(null);

  useEffect(() => {
    const calculateSunPosition = () => {
      const date = new Date();
      const sunPosition = SunCalc.getPosition(date, latitude, longitude);

      // Convert altitude and azimuth from radians to degrees
      setAltitude((sunPosition.altitude * 180) / Math.PI);
      setAzimuth((sunPosition.azimuth * 180) / Math.PI);
    };

    calculateSunPosition();

    // Optional: Update position every minute
    const interval = setInterval(calculateSunPosition, 60000);

    return () => clearInterval(interval);
  }, [latitude, longitude]);

  return (
    <div>
      <h2>Sun Position</h2>
      <p>Altitude: {altitude !== null ? altitude.toFixed(2) : 'Loading...'}°</p>
      <p>Azimuth: {azimuth !== null ? azimuth.toFixed(2) : 'Loading...'}°</p>
    </div>
  );
};

export default SunPosition;
