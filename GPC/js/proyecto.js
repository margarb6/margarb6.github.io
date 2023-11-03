/**
 * Proyecto.js
 *
 * Proyecto GPC. Mapamundi con monumentos interactivos.
 *
 * @author <margarb6@epsg.upv.es>, 2023
 */

//modulos necesarios

import * as THREE from '../lib/three.module.js';
import { GLTFLoader } from '../lib/GLTFLoader.module.js';
import { OBJLoader } from '../lib/OBJLoader.js';
import { FBXLoader } from '../lib/FBXLoader.js';
import { OrbitControls } from '../lib/OrbitControls.module.js';
import { TextureLoader } from '../lib/three.module.js';
import { TWEEN } from '../lib/tween.module.min.js';
import { GUI } from '../lib/lil-gui.module.min.js';

//Variables de consenso

let renderer, scene, camera;

//Otras globales

let mapamundi;
let planeta;
let sol;
let entornoMesh;
const L = 120;
const monuments = [
  {
    name: 'Big ben',
    lat: 51.5007,
    lon: -0.1246,
    path3DObject: './models/monumentos/bigBen.FBX',
    createNewMesh: true,
    camera: {
      x: 174.23431751732733,
      y: 154.1993556273577,
      z: 0.5401272192886638,
      dgZ: 90,
      dgY: 0,
    },
    info: {
      name: 'Big ben',
      country: 'Reino Unido',
      city: 'Londres',
      height: '96m',
      curiosity:
        'El Big Ben es el nombre con el que se conoce a la gran campana del reloj situado en la torre del reloj del Palacio de Westminster, la sede del Parlamento del Reino Unido, en Londres, aunque comúnmente se confunde el nombre de la torre con el del reloj o con el de la propia campana. La torre mide 96,3 metros, y es una de las atracciones turísticas más famosas de Londres.',
    },
  },
  {
    name: 'Estatua de la Libertad',
    lat: 40.6892,
    lon: -74.0445,
    path3DObject: './models/monumentos/estatuaLibertad.fbx',
    createNewMesh: false,
    info: {
      name: 'Estatua de la Libertad',
      country: 'Estados Unidos',
      city: 'Nueva York',
      height: '93m',
      curiosity:
        'La Estatua de la Libertad fue un regalo de los franceses a los estadounidenses en 1886 para conmemorar el centenario de la Declaración de Independencia de los Estados Unidos y como un signo de amistad entre las dos naciones.',
    },
  },
  {
    name: 'Cristo Redentor',
    lat: -22.951917,
    lon: -43.210487,
    path3DObject: './models/monumentos/cristoRedentor.fbx',
    createNewMesh: false,
    info: {
      name: 'Cristo Redentor',
      country: 'Brasil',
      city: 'Río de Janeiro',
      height: '38m',
      curiosity:
        'La estatua del Cristo Redentor es una de las siete maravillas del mundo moderno y es considerada la mayor estatua de Cristo en el mundo. La estatua se encuentra en la cima del cerro del Corcovado, a 709 metros sobre el nivel del mar, en el Parque Nacional de la Tijuca, con una vista panorámica de la ciudad de Río de Janeiro.',
    },
  },
  {
    name: 'La Gran Pirámide de Giza',
    lat: 29.979235,
    lon: 31.134202,
    camera: {
      x: 171.7100759088272,
      y: 88.6214776913354,
      z: -81.7393006763515,
      dgZ: 90,
      dgY: 50,
    },
    path3DObject: './models/monumentos/piramides.fbx',
    createNewMesh: false,
    info: {
      name: 'La Gran Pirámide de Giza',
      country: 'Egipto',
      city: 'El Cairo',
      height: '146m',
      curiosity:
        'La Gran Pirámide de Giza es la más antigua de las siete maravillas del mundo y la única que aún se conserva. Fue construida por los egipcios en el año 2.560 a.C. y es la más grande de las pirámides de Egipto. La Gran Pirámide de Giza es la única de las siete maravillas del mundo que aún se conserva.',
    },
  },
  {
    name: 'La Ópera de Sídney',
    lat: -33.8572,
    lon: 151.2153,
    path3DObject: './models/monumentos/sidney.fbx',
    createNewMesh: false,
    info: {
      name: 'La Ópera de Sídney',
      country: 'Australia',
      city: 'Sídney',
      height: '65m',
      curiosity:
        'La Ópera de Sídney es uno de los edificios más famosos del siglo XX y uno de los edificios más famosos del mundo. La Ópera de Sídney es uno de los edificios más famosos del siglo XX y uno de los edificios más famosos del mundo. La Ópera de Sídney es uno de los edificios más famosos del siglo XX y uno de los edificios más famosos del mundo.',
    },
  },
  {
    name: 'Taj Mahal',
    lat: 27.1750151,
    lon: 78.0421552,
    path3DObject: './models/monumentos/tajMajal.fbx',
    createNewMesh: false,
    camera: {
      x: 41.721645778171485,
      y: 83.58693776133677,
      z: -187.83473795135254,
      dgZ: 0,
      dgY: 50,
    },
    info: {
      name: 'Taj Mahal',
      country: 'India',
      city: 'Agra',
      height: '73m',
      curiosity:
        'El Taj Mahal es un mausoleo de mármol blanco ubicado en la ciudad de Agra, India. Fue construido por el emperador mogol Shah Jahan en memoria de su esposa favorita, Mumtaz Mahal. El Taj Mahal es considerado el más bello ejemplo de arquitectura mogol, un estilo que combina elementos de las arquitecturas islámica, persa, india e incluso turca.',
    },
  },
  {
    name: 'Buda de Leshan',
    lat: 29.54472,
    lon: 103.77333,
    camera: {
      x: -47.20044479733252,
      y: 103.59871004686724,
      z: -202.66611559516454,
      dgZ: 0,
      dgY: 90,
    },
    path3DObject: './models/monumentos/buda.fbx',
    createNewMesh: true,
    info: {
      name: 'Buda de Leshan',
      country: 'China',
      city: 'Leshan',
      height: '71m',
      curiosity:
        'El Buda de Leshan es una estatua de Buda esculpida en la roca de un acantilado en la confluencia de los ríos Minjiang, Dadu y Qingyi en la provincia de Sichuan, China, cerca de la ciudad de Leshan. La estatua representa a Maitreya. La estatua es la escultura de Buda más grande del mundo y fue declarada Patrimonio de la Humanidad por la UNESCO en 1996.',
    },
  },
];

//Controlador de camara

let cameraControls;

// Acciones

init();
//setupGUI();
loadScene();
render();
// Crear una luz direccional
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
// Establecer la posición inicial de la luz
directionalLight.position.set(100, 0, 0);
// Agregar la luz a la escena
scene.add(directionalLight);

const lightRadius = 100; // Radio de la órbita de la luz
const lightSpeed = 1; // Velocidad de rotación de la luz

function animateLight() {
  const time = performance.now() * 0.001; // Obtener el tiempo actual en segundos
  const lightX = Math.cos(time * lightSpeed) * lightRadius;
  const lightZ = Math.sin(time * lightSpeed) * lightRadius;

  // Actualizar la posición de la luz
  directionalLight.position.set(lightX, 0, lightZ);

  // Llamar a la función nuevamente para la próxima animación de fotograma
  requestAnimationFrame(animateLight);
  updateLights();
}
const cities = [
  { name: 'Madrid', lat: 40.4168, lon: -3.7038 },
  { name: 'New York', lat: 40.7128, lon: -74.006 },
  { name: 'Paris', lat: 48.8566, lon: 2.3522 },
  { name: 'Tokyo', lat: 35.682839, lon: 139.759455 },
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
  { name: 'Beijing', lat: 39.9042, lon: 116.4074 },
  { name: 'Sydney', lat: -33.8651, lon: 151.2099 },
  { name: 'Cairo', lat: 30.0444, lon: 31.2357 },
  { name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729 },
  { name: 'Hong Kong', lat: 22.3193, lon: 114.1694 },
  { name: 'Mumbai', lat: 19.076, lon: 72.8777 },
  { name: 'Rome', lat: 41.9028, lon: 12.4964 },
  { name: 'Berlin', lat: 52.52, lon: 13.405 },
  { name: 'Toronto', lat: 43.65107, lon: -79.347015 },
  { name: 'Mexico City', lat: 19.4326, lon: -99.1332 },
  { name: 'Buenos Aires', lat: -34.6118, lon: -58.4173 },
  { name: 'Cape Town', lat: -33.9249, lon: 18.4241 },
  { name: 'Moscow', lat: 55.7558, lon: 37.6176 },
  { name: 'Seoul', lat: 37.5665, lon: 126.978 },
  { name: 'Bangkok', lat: 13.7563, lon: 100.5018 },
  { name: 'Dubai', lat: 25.276987, lon: 55.296249 },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { name: 'Istanbul', lat: 41.0082, lon: 28.9784 },
  { name: 'Munich', lat: 48.1351, lon: 11.582 },
  { name: 'Amsterdam', lat: 52.3792, lon: 4.8994 },
  { name: 'Stockholm', lat: 59.3293, lon: 18.0686 },
  { name: 'Athens', lat: 37.9838, lon: 23.7275 },
  { name: 'Copenhagen', lat: 55.6761, lon: 12.5683 },
  { name: 'Oslo', lat: 59.9139, lon: 10.7522 },
  { name: 'Helsinki', lat: 60.1699, lon: 24.9384 },
  { name: 'Warsaw', lat: 52.2297, lon: 21.0122 },
  { name: 'Lisbon', lat: 38.7223, lon: -9.1393 },
  { name: 'Dublin', lat: 53.349805, lon: -6.26031 },
  { name: 'Edinburgh', lat: 55.9533, lon: -3.1883 },
  { name: 'Geneva', lat: 46.2044, lon: 6.1432 },
  { name: 'Vancouver', lat: 49.2827, lon: -123.1207 },
  { name: 'San Francisco', lat: 37.7749, lon: -122.4194 },
  { name: 'Chicago', lat: 41.8781, lon: -87.6298 },
  { name: 'Miami', lat: 25.7617, lon: -80.1918 },
  { name: 'Dallas', lat: 32.7767, lon: -96.797 },
  { name: 'Denver', lat: 39.7392, lon: -104.9903 },
  { name: 'Phoenix', lat: 33.4484, lon: -112.074 },
  { name: 'Las Vegas', lat: 36.1699, lon: -115.1398 },
];

const countries = [
  { name: 'Spain', lat: 40.4637, lon: -3.7492 },
  { name: 'USA', lat: 37.0902, lon: -95.7129 }, // Multiple entries for USA for different cities
  { name: 'France', lat: 46.2276, lon: 2.2137 },
  { name: 'Japan', lat: 36.2048, lon: 138.2529 },
  { name: 'United Kingdom', lat: 55.3781, lon: -3.436 }, // Multiple entries for UK for different cities
  { name: 'China', lat: 35.8617, lon: 104.1954 }, // Beijing
  { name: 'Australia', lat: -25.2744, lon: 133.7751 }, // Sydney
  { name: 'Egypt', lat: 26.8206, lon: 30.8025 }, // Cairo
  { name: 'Brazil', lat: -14.235, lon: -51.9253 }, // Rio de Janeiro
  { name: 'Hong Kong', lat: 22.3193, lon: 114.1694 }, // Special Administrative Region of China
  { name: 'India', lat: 20.5937, lon: 78.9629 }, // Mumbai
  // { name: 'Italy', lat: 41.8719, lon: 12.5674 }, // Rome
  // { name: 'Germany', lat: 51.1657, lon: 10.4515 }, // Berlin
  { name: 'Canada', lat: 56.1304, lon: -106.3468 }, // Toronto
  { name: 'Argentina', lat: -38.4161, lon: -63.6167 }, // Buenos Aires
  { name: 'South Africa', lat: -30.5595, lon: 22.9375 }, // Cape Town
  // { name: 'Russia', lat: 61.524, lon: 105.3188 }, // Moscow
  { name: 'South Korea', lat: 35.9078, lon: 127.7669 }, // Seoul
  { name: 'Thailand', lat: 15.87, lon: 100.9925 }, // Bangkok
  { name: 'United Arab Emirates', lat: 23.4241, lon: 53.8478 }, // Dubai
  { name: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { name: 'Polonia', lat: 52.2297, lon: 21.0122 },
  // { name: 'Tunez', lat: 36.8188, lon: 10.166 },
];

const amountOfCitiesToGenerate = 50;
let generatedCities = [];
cities.map((city) => {
  const nearbyCoordinates = generateNearbyCoordinates(city);
  generatedCities.push(...nearbyCoordinates);
});

function generateNearbyCoordinates(city) {
  const minOffset = 0.01;
  const maxOffset = 0.8;
  const latMinOffset = 0.01;
  const latMaxOffset = 0.4;
  // Coordenadas originales de la ciudad
  const lat = city.lat;
  const lon = city.lon;

  // Generar coordenadas cercanas con offsets aleatorios
  const nearbyCoordinates = [];

  for (let i = 0; i < amountOfCitiesToGenerate; i++) {
    const element = 2;
    nearbyCoordinates.push({
      lat: lat + getRandomOffset(latMinOffset, latMaxOffset),
      lon: lon + getRandomOffset(minOffset, maxOffset),
    });
  }

  return nearbyCoordinates;
}

function getRandomOffset(min, max) {
  const randomNumber = Math.random() * (max - min) + min;
  return Math.random() < 0.5 ? -randomNumber : randomNumber;
}

function addGeneralLightToCountry(countries) {
  const worldLights = new THREE.Group();

  countries.forEach((country) => {
    const spotlight = new THREE.SpotLight(0xffffff, 2); // Color y intensidad de la luz
    spotlight.position.copy(
      latLongToVector3(country.lat, country.lon, 200 + 2)
    ); // Posición de la luz (en este caso, en el centro del planeta)
    spotlight.target = planeta; // Hacer que la luz apunte hacia el objeto planeta
    spotlight.distance = 100; // Ajusta la distancia de la luz según tus necesidades
    spotlight.angle = Math.PI; // Ángulo del cono de luz
    spotlight.penumbra = 1; // Suavidad de los bordes de la luz
    worldLights.add(spotlight);
  });
  scene.add(worldLights);
}
addGeneralLightToCountry(countries);
const cityLightsGroup = new THREE.Group();

function addCityLights(initialCities, generatedCities) {
  const arr = [...initialCities, ...generatedCities];

  arr.forEach((city) => {
    const cityLightMaterial = new THREE.PointsMaterial({
      color: 0xffffff, // Color blanco
      size: getRandomOffset(1, 3), // Tamaño de los puntos (ajusta este valor según tus necesidades)
      sizeAttenuation: false, // Evitar que el tamaño de los puntos se reduzca con la distancia
    });

    // console.log(city.lat, city.lon);
    // Crear una geometría para los puntos de luz de la ciudad (por ejemplo, un solo vértice)
    const position = latLongToVector3(city.lat, city.lon, 100 + 0.5);
    // console.log('Posicion original ', position);
    const cityLightGeometry = new THREE.BufferGeometry().setFromPoints([
      position,
    ]);

    console.log(
      'Posicion geometria ',
      cityLightGeometry.attributes.position.count
    );
    // Crear los puntos de luz de la ciudad
    const cityLights = new THREE.Points(cityLightGeometry, cityLightMaterial);
    // console.log(position.x, position.y, position.z);
    cityLights.position.set(...position);
    // console.log('Posicion luces', cityLights.position);
    // Agregar los puntos de luz al grupo
    cityLightsGroup.add(cityLights);
  });

  // Agregar el grupo de luces de la ciudad a la escena
  scene.add(cityLightsGroup);
}

// Llama a la función con el array de ciudades iniciales y las coordenadas generadas
addCityLights(cities, generatedCities);
// Iniciar la animación de la luz

animateLight();

function updateLights() {
  // Actualizar la posición e intensidad de la luz principal (directionalLight) aquí

  // Obtener la posición de la luz principal
  const mainLightPosition = directionalLight.position;

  // Iterar a través de las luces de la ciudad
  for (const cityLight of cityLightsGroup.children) {
    // Obtener la posición de la luz de la ciudad
    const cityPosition = cityLight.position;

    // Comparar la distancia entre la posición de la luz principal y la posición de la luz de la ciudad
    const distanceToMainLight = cityPosition.distanceTo(mainLightPosition);
    // console.log(distanceToMainLight);
    // Determinar si la luz de la ciudad está fuera del alcance de la luz principal
    const isCityInShadow = distanceToMainLight > 120; // Ajusta 'distanciaMaxima' según tus necesidades

    // Encender o apagar la luz de la ciudad según si está en sombra o no
    cityLight.visible = isCityInShadow;
  }

  // Otras actualizaciones o cambios que necesites hacer
}
function init() {
  //motor de render
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(new THREE.Color(0, 0, 0), 1);

  document.getElementById('container').appendChild(renderer.domElement);
  renderer.autoClear = false;
  renderer.shadowMap.enabled = true;
  //Escena
  scene = new THREE.Scene();

  //scene.background = new THREE.TextureLoader().load('./models/textures/space_large.png');
  //Camara
  const ar = window.innerWidth / window.innerHeight;
  setOrtographicCamera(ar);
  //Camara
  camera = new THREE.PerspectiveCamera(
    80,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(300, 100, 150);
  camera.lookAt(0, 90, 0);

  cameraControls = new OrbitControls(camera, renderer.domElement);
  cameraControls.target.set(0, 1, 0);

  //eventos
  window.addEventListener('resize', updateAspectRatio);
  renderer.domElement.addEventListener('dblclick', zoomMonument);

  cameraControls = new OrbitControls(camera, renderer.domElement);
  cameraControls.target.set(0, 1, 0);
  //limitar el zoom
  cameraControls.minDistance = 200;
  cameraControls.maxDistance = 400;
  //camera controls solo rota y mueve el planeta soibre si mismo
  cameraControls.enablePan = false;
  //cameraControls.enableDamping = false
  cameraControls.enableZoom = true;
  cameraControls.update();
}

function loadScene() {
  /*************************************************
   * CREAR LA TIERRA
   *************************************************/

  const textureLoader = new THREE.TextureLoader();
  const earthTexture = textureLoader.load('./images/e.jpg');
  const earthMaterial = new THREE.MeshLambertMaterial({ map: earthTexture });
  const radius = 200; // Define el radio que quieras para tu esfera
  const segments = 64; // Define la resolución

  const earthGeometry = new THREE.SphereGeometry(radius, segments, segments);
  planeta = new THREE.Mesh(earthGeometry, earthMaterial);
  planeta.castShadow = true;
  planeta.receiveShadow = true;
  //earthMesh.rotation.y = Math.PI/2;

  scene.add(planeta);

  /*************************************************
   * CREAR LOS MONUMENTOS
   *************************************************/

  monuments.forEach((monument) => {
    const fbxLoader = new FBXLoader();

    fbxLoader.load(
      monument.path3DObject,
      (object) => {
        if (monument.createNewMesh) {
          // Asume que hay un solo hijo relevante y crea un nuevo Mesh
          const mesh = new THREE.Mesh(
            object.children[0].geometry,
            object.children[0].material
          );
          const position = latLongToVector3(monument.lat, monument.lon, radius); // +2 para que el cubo esté sobre la superficie
          // mesh.scale.set(0.001, 0.001, 0.001);
          mesh.name = monument.name;
          mesh.position.set(position.x, position.y, position.z);

          //Orientar objeto hacia el centro de la tierra

          mesh.up = new THREE.Vector3(0, -1, 0);

          mesh.lookAt(planeta.position.clone());
          //asegrar que el eje Y sea el que apunte hacia el centro de la tierra

          scene.add(mesh);
          iluminarMonumento(mesh.position.clone(), mesh);
        } else {
          // Procesa todos los hijos y asume que cada uno es un Mesh
          object.traverse((child) => {
            if (child.isMesh) {
              // Aplica texturas o materiales si es necesario
              /*  if (monument.texturePath) {
                const texture = new THREE.TextureLoader().load(monument.texturePath);
                child.monument.map = texture;
                child.monument.needsUpdate = true;
              } */
            }
          });
          const position = latLongToVector3(
            monument.lat,
            monument.lon,
            radius + 1.5
          ); // +2 para que el cubo esté sobre la superficie
          object.position.set(position.x, position.y, position.z);

          object.scale.set(0.001, 0.001, 0.001);
          object.lookAt(planeta.position.clone());
          const children = object.children;
          children.forEach((child) => {
            child.name = monument.name;
          });
          scene.add(object);
          iluminarMonumento(object.position.clone(), object);
        }
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },
      (error) => {
        console.error(error);
      }
    );
    /* const monumentMesh = new THREE.Mesh(monumentGeometry, monumentMaterial);
    monumentMesh.name = monument.name;
    monumentMesh.position.set(position.x, position.y, position.z);
    monumentMesh.lookAt(planeta.position);  // Orientar el cubo hacia el centro de la Tierra

    scene.add(monumentMesh); */
  });

  //Fondo de estrellas con esfera
  const entorno = new THREE.TextureLoader().load('./images/pink.jpg');
  const entornoMaterial = new THREE.MeshBasicMaterial({ map: entorno });
  const entornoGeometry = new THREE.SphereGeometry(700, 32, 32);
  entornoMesh = new THREE.Mesh(entornoGeometry, entornoMaterial);
  entornoMesh.material.side = THREE.BackSide;
  entorno.castShadow = true;
  entorno.receiveShadow = true;
  entornoMesh.name = 'entorno';
  scene.add(entornoMesh);
}

function latLongToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}

function zoomMonument(event) {
  // Capturo la posicion del click (sistema de referencia top-left)
  const x = event.clientX;
  const y = event.clientY;

  // Cambia al sistema de referencia cuadrado de 2x2
  const xN = (x / window.innerWidth) * 2 - 1;
  const yN = -(y / window.innerHeight) * 2 + 1;

  // Rayo e interseccion
  const rayo = new THREE.Raycaster();
  rayo.setFromCamera(new THREE.Vector2(xN, yN), camera);

  const intersecciones = rayo.intersectObjects(scene.children, true);

  if (intersecciones.length > 0) {
    const obj = intersecciones[0].object;
    console.log(obj.name);
    if (obj.name != null && obj.name != 'planeta' && obj.name != 'entorno') {
      console.log(obj.name);
      const position = obj.position.clone();
      //Si el vector es (0,0,0) tomo la posicion del parent
      if (position.x == 0 && position.y == 0 && position.z == 0) {
        position.x = obj.parent.position.x;
        position.y = obj.parent.position.y;
        position.z = obj.parent.position.z;
      }
      console.log(obj);
      let fullObject = monuments.find((objeto) => objeto.name === obj.name);
      //colocamos la camara y mirando el alzado del monumento
      const camPosition = new THREE.Vector3(
        fullObject.camera.x,
        fullObject.camera.y,
        fullObject.camera.z
      );
      camera.position.copy(camPosition);
      console.log('POSICION', obj.position);
      // Define la cantidad de rotación en radianes (60 grados en radianes)
      const rotationAngleZ = THREE.MathUtils.degToRad(fullObject.camera.dgZ);
      const rotationAngleY = THREE.MathUtils.degToRad(fullObject.camera.dgY);
      // Rota la cámara alrededor de su eje Y
      camera.rotateY(rotationAngleY);
      camera.rotateZ(rotationAngleZ);
      camera.updateMatrixWorld(true);
      camera.lookAt(obj.position);
      //Llamar a la funcion para mostrar datos del monumento
      showMonumentData(obj.name);
    }
  }
}
function setOrtographicCamera(ar) {
  let camaraOrtografica;
  if (ar > 1)
    camaraOrtografica = new THREE.OrthographicCamera(
      -L * ar,
      L * ar,
      L,
      -L,
      -100,
      500
    );
  else
    camaraOrtografica = new THREE.OrthographicCamera(
      -L,
      L,
      L / ar,
      -L / ar,
      -100,
      500
    );
}
//Funcion para mostrar datos del monumento en una ventana emergente
function showMonumentData(name) {
  //Creo un div para mostrar los datos
  const div = document.createElement('div');
  div.style.position = 'absolute';
  div.style.width = 320 + 'px';
  div.style.height = 600 + 'px';
  div.style.backgroundColor = '#ffffff';
  div.style.top = 100 + 'px';
  div.style.left = 100 + 'px';
  div.style.zIndex = 100;
  div.style.padding = 20;
  div.style.borderRadius = 10;
  div.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
  div.style.textAlign = 'center';
  div.style.fontFamily = 'sans-serif';
  div.style.fontSize = 20;
  div.style.color = '#000000';
  div.innerHTML = 'Monumento';
  //Añado los datos del monumento

  monuments.forEach((monument) => {
    if (monument.name == name) {
      div.innerHTML =
        '<h1>' +
        monument.info.name +
        '</h1>' +
        '<h2>' +
        monument.info.country +
        '</h2>' +
        '<h3>' +
        monument.info.city +
        '</h3>' +
        '<p>Altura: ' +
        monument.info.height +
        '</p>' +
        '<p>Curiosidad: ' +
        monument.info.curiosity +
        '</p>';
    }
  });

  document.body.appendChild(div);

  //Creo un boton para cerrar la ventana emergente
  const button = document.createElement('button');
  button.style.position = 'absolute';
  button.style.width = 20;
  button.style.height = 20;
  button.style.backgroundColor = '#ffffff';
  button.style.top = 100 + 'px';
  button.style.left = 380 + 'px';
  button.style.zIndex = 100;
  button.style.borderRadius = 10;
  button.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
  button.style.textAlign = 'center';
  button.style.fontFamily = 'sans-serif';
  button.style.fontSize = 20;
  button.style.color = '#000000';
  button.innerHTML = 'X';
  document.body.appendChild(button);

  button.addEventListener('click', () => {
    document.body.removeChild(div);
    document.body.removeChild(button);
    const camPosition = new THREE.Vector3(300, 100, 150);
    camera.position.copy(camPosition);
    camera.lookAt();
  });
}
//funcion para iluminar cada monumento con "focos"
function iluminarMonumento(posicionMonumento, monument) {
  const position = new THREE.Vector3(
    posicionMonumento.x,
    posicionMonumento.y,
    posicionMonumento.z
  );
  //creo luz focal

  const light = new THREE.SpotLight(0xff8800, 1);
  light.position.set(0, 0, 0);
  light.target = monument;
  light.angle = Math.PI;
  light.castShadow = true;
  monument.add(light);
}

function updateAspectRatio() {
  renderer.setSize(window.innerWidth, window.innerHeight);

  const ar = window.innerWidth / window.innerHeight;

  camera.aspect = ar;

  camera.updateProjectionMatrix();
}
function update(delta) {
  // angulo+= 0.005;
  //  brazo.rotation.y =angulo;
  TWEEN.update(delta);
}
function rotateElement(event) {
  //Capturo la posicion del click (sistema de referencia top-left)
  let x = event.clientX;
  let y = event.clientY;

  //Cambia al sistema de referencia cuadrado de 2x2
  x = (x / window.innerWidth) * 2 - 1;
  y = -(y / window.innerHeight) * 2 + 1;

  //Rayo e interseccion
  const rayo = new THREE.Raycaster();
  rayo.setFromCamera(new THREE.Vector2(x, y), camera);

  const intersecciones = rayo.intersectObjects(
    scene.getObjectByName('grupoEC').children,
    false
  );

  if (intersecciones.length > 0)
    intersecciones[0].object.rotation.y += Math.PI / 8;
}

function render(delta) {
  requestAnimationFrame(render);
  update(delta);
  renderer.clear();

  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
  // cameraControls.update();
  console.log(camera.position);
}
