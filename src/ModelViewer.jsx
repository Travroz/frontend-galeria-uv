import React from "react";
import { useGLTF } from "@react-three/drei";

export default function ModelViewer({ url }) {
  const { scene } = useGLTF(url);
  const clone = scene.clone();
  return <primitive object={clone} scale={1} />;
}
