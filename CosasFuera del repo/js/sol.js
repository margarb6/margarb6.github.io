
// Importa la librería Three.js
const THREE = require('three');

// Función que genera la geometría del sol
function crearGeometriaSol() {
    const diametro = 1392000;
    return new THREE.SphereGeometry(diametro / 2, 32, 32);
}

// Función que genera el material del sol
function crearMaterialSol() {
    const color = 0xffff00;
    return new THREE.MeshBasicMaterial({ color });
}

// Función que genera la luz del sol
function crearLuzSol() {
    const intensidad = 1;
    const distancia = 0;
    const luz = new THREE.PointLight(0xffffff, intensidad, distancia);
    return luz;
}

// Función que genera el objeto 3D del sol
function crearObjetoSol() {
    const geometria = crearGeometriaSol();
    const material = crearMaterialSol();
    const objeto = new THREE.Mesh(geometria, material);
    return objeto;
}

// Crea el objeto sol y asígnale el objeto 3D y la función de iluminación
const sol = {
    objeto3D: crearObjetoSol(),
    iluminacion: crearLuzSol(),
};

// Exporta el objeto sol
module.exports = sol;
