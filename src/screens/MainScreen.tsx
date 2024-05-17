import React, { useEffect, useRef } from "react";

export interface MainScreenProps {
  // Add any props here if needed
}

export const MainScreen: React.FC<MainScreenProps> = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
  }, []);

  return (
    <div>
      hej hej
      <video autoPlay></video>
    </div>
  );
}
