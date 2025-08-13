import * as THREE from "three";

export const mainColor = new THREE.Color(0x7aadfa);

export const meshMat = new THREE.MeshStandardMaterial({
  color: mainColor,
  side: THREE.DoubleSide,
  roughness: 0.8,
});

export const wireframeMat = new THREE.MeshBasicMaterial({
  color: 0x000000,
  wireframe: true,
  transparent: true,
  opacity: 0.2,
});

export const lineMat = new THREE.LineBasicMaterial({ color: mainColor });

export const pointMat = new THREE.PointsMaterial({
  color: mainColor,
  size: 0.05,
});
