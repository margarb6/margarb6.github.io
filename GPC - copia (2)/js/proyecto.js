/**
 * Proyecto.js
 * 
 * Proyecto GPC. Mapamundi con monumentos interactivos.
 * 
 * @author <margarb6@epsg.upv.es>, 2023
 */

//modulos necesarios

import * as THREE from "../lib/three.module.js"
import {GLTFLoader} from "../lib/GLTFLoader.module.js"
import {OBJLoader} from "../lib/OBJLoader.js"
import {FBXLoader} from "../lib/FBXLoader.js"
import {OrbitControls} from "../lib/OrbitControls.module.js"
import { TextureLoader } from "../lib/three.module.js"
import {TWEEN} from "../lib/tween.module.min.js"
import {GUI} from "../lib/lil-gui.module.min.js"


//Variables de consenso

let renderer, scene, camera;

//Otras globales

let mapamundi;
let planeta;
let sol;
let entornoMesh;

const monuments = [
  { name: 'Eiffel Tower', lat: 48.8584, lon: 2.2945, path3DObject:'./models/monumentos/arcoTriunfo.FBX', createNewMesh:true, info: {'name': 'Eiffel Tower', 'country': 'Francia', 'city': 'París', 'height': '324m', 'curiosity': 'La Torre Eiffel se compone de un total de 18.038 piezas de metal y su ensamblaje fue realizado con un total de 2.5 millones de tornillos; en total cuenta con un peso de 10.100 toneladas de hierro, las cuales además soportan el peso correspondiente a las diferentes capas de pintura, lo cual da como resultado un peso aproximado de 250 toneladas.' } },
  { name: 'Estatua de la Libertad', lat: 40.6892, lon: -74.0445, path3DObject:'./models/monumentos/empireEstate.fbx',createNewMesh:true,info: {'name': 'Estatua de la Libertad', 'country': 'Estados Unidos', 'city': 'Nueva York', 'height': '93m', 'curiosity': 'La Estatua de la Libertad fue un regalo de los franceses a los estadounidenses en 1886 para conmemorar el centenario de la Declaración de Independencia de los Estados Unidos y como un signo de amistad entre las dos naciones.' } },
 { name: 'Cristo Redentor', lat:  -22.951917, lon: -43.210487,path3DObject:'./models/monumentos/cristoRedentor.fbx',createNewMesh:false, info: {'name': 'Cristo Redentor', 'country': 'Brasil', 'city': 'Río de Janeiro', 'height': '38m', 'curiosity': 'La estatua del Cristo Redentor es una de las siete maravillas del mundo moderno y es considerada la mayor estatua de Cristo en el mundo. La estatua se encuentra en la cima del cerro del Corcovado, a 709 metros sobre el nivel del mar, en el Parque Nacional de la Tijuca, con una vista panorámica de la ciudad de Río de Janeiro.' } },
  { name: 'La Gran Pirámide de Giza', lat: 29.979235, lon: 31.134202, path3DObject:'./models/monumentos/tajMajal.fbx',createNewMesh:false,info: {'name': 'La Gran Pirámide de Giza', 'country': 'Egipto', 'city': 'El Cairo', 'height': '146m', 'curiosity': 'La Gran Pirámide de Giza es la más antigua de las siete maravillas del mundo y la única que aún se conserva. Fue construida por los egipcios en el año 2.560 a.C. y es la más grande de las pirámides de Egipto. La Gran Pirámide de Giza es la única de las siete maravillas del mundo que aún se conserva.' } },
  { name: 'La Ópera de Sídney', lat: -33.8572, lon: 151.2153, path3DObject:'./models/monumentos/operaSidney.fbx',createNewMesh:false,info: {'name': 'La Ópera de Sídney', 'country': 'Australia', 'city': 'Sídney', 'height': '65m', 'curiosity': 'La Ópera de Sídney es uno de los edificios más famosos del siglo XX y uno de los edificios más famosos del mundo. La Ópera de Sídney es uno de los edificios más famosos del siglo XX y uno de los edificios más famosos del mundo. La Ópera de Sídney es uno de los edificios más famosos del siglo XX y uno de los edificios más famosos del mundo.' } },
  { name: 'Taj Mahal', lat: 27.1750151, lon: 78.0421552, path3DObject:'./models/monumentos/tajMajal.fbx',createNewMesh:false, info: {'name': 'Taj Mahal', 'country': 'India', 'city': 'Agra', 'height': '73m', 'curiosity': 'El Taj Mahal es un mausoleo de mármol blanco ubicado en la ciudad de Agra, India. Fue construido por el emperador mogol Shah Jahan en memoria de su esposa favorita, Mumtaz Mahal. El Taj Mahal es considerado el más bello ejemplo de arquitectura mogol, un estilo que combina elementos de las arquitecturas islámica, persa, india e incluso turca.' } },

];



//Controlador de camara

let cameraControls;

let cenital;
const L = 120;

// Acciones

init();
//setupGUI();
loadScene();
render();

function init(){
  //motor de render 
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setClearColor(new THREE.Color(1,1,1), 1);

  document.getElementById("container").appendChild(renderer.domElement);
  renderer.autoClear = false;

  //Escena
  scene = new THREE.Scene();

  
  //scene.background = new THREE.TextureLoader().load('./models/textures/space_large.png');

  //Camara
  const ar = window.innerWidth/window.innerHeight;
  setOrtographicCamera(ar);
  camera = new THREE.PerspectiveCamera(80, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(300,100,150);
  camera.lookAt(0, 90, 0);

  cameraControls = new OrbitControls(camera, renderer.domElement);
  cameraControls.target.set(0,1,0);


  //eventos
  window.addEventListener('resize', updateAspectRatio);
  renderer.domElement.addEventListener('dblclick', zoomMonument);



  /*window.addEventListener('click', rotateCamera);
  window.addEventListener('contextmenu', panningCamera);
  window.addEventListener('wheel', zoomCamera);
  */

  // Animación al iniciar de rotación la tierra
  /*
  const origen = {
    angulo: 0
  };  
  const destino = {
    angulo: 2 * Math.PI
  };
  const tween = new TWEEN.Tween(origen).to(destino, 20000);
  tween.easing(TWEEN.Easing.Quadratic.InOut);
  tween.onUpdate(() => {
      planeta.rotation.y = origen.angulo;
  });
  tween.start();
*/

}

function loadScene(){
  const light = new THREE.PointLight(0xffffff, 1)
    light.position.set(200, 300, 200)
    scene.add(light)
/*
    
    //MATERIAL
    const material = new THREE.MeshNormalMaterial({wireframe:true, flatShading:true});

    //Mapamundi
    mapamundi = new THREE.Object3D();

    //Planeta Tierra

    const planetaGeometry = new THREE.SphereGeometry(50);
    planeta = new THREE.Mesh(planetaGeometry, material);

    //Monumentos
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 10);
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xFF0000 }); // Color rojo
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    const cubePosition = latLongToVector3(39.466667, -0.375000, 50+ 5);
    cube.position.set(cubePosition.x, cubePosition.y, cubePosition.z);
    cube.lookAt(planeta.position);


    //Importar OBJ

    const fbxLoader = new FBXLoader()
    fbxLoader.load(
        'models/torre/uploads_files_2458783_EiffelTower.fbx',
        (object) => {
            // (object.children[0] as THREE.Mesh).material = material
            // object.traverse(function (child) {
            //     if ((child as THREE.Mesh).isMesh) {
            //         (child as THREE.Mesh).material = material
            //     }
            // })
            cube.add(object)
            cube.scale.set(0.001,0.001,0.001)
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        },
        (error) => {
            console.log(error)
        }
    )




    //Jerarquia de objectos 
    planeta.add(cube)
    mapamundi.add(planeta);
    scene.add(mapamundi);
    scene.add(new THREE.AxisHelper(2));

*/

/*************************************************
* CREAR LA TIERRA
*************************************************/

const textureLoader = new THREE.TextureLoader();
const earthTexture = textureLoader.load('./models/textures/Equirectangular-projection-topographic-world.jpg');
const earthMaterial = new THREE.MeshBasicMaterial({ map: earthTexture });
const radius = 200;  // Define el radio que quieras para tu esfera
const segments = 64; // Define la resolución

const earthGeometry = new THREE.SphereGeometry(radius, segments, segments);
planeta = new THREE.Mesh(earthGeometry, earthMaterial);
//earthMesh.rotation.y = Math.PI/2;

scene.add(planeta);

// poner referencia objeto en el 0 0 0 
const geometry = new THREE.BoxGeometry(10, 10, 10);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0,0,0);
scene.add(cube);

/*************************************************
* CREAR LOS MONUMENTOS
*************************************************/

monuments.forEach(monument => {
    const position = latLongToVector3(monument.lat, monument.lon, radius+2);  // +2 para que el cubo esté sobre la superficie
    const fbxLoader = new FBXLoader();

    fbxLoader.load(
      monument.path3DObject,
      (object) => {
        if (monument.createNewMesh) {
          // Asume que hay un solo hijo relevante y crea un nuevo Mesh
          const mesh = new THREE.Mesh(object.children[0].geometry, object.children[0].material);
          mesh.name = monument.name;
          mesh.position.set(position.x, position.y, position.z);
          
          //Orientar objeto hacia el centro de la tierra
          
          mesh.up = new THREE.Vector3(0, -1, 0);
          
          mesh.lookAt(planeta.position);
//asegrar que el eje Y sea el que apunte hacia el centro de la tierra
          

          scene.add(mesh);
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
          object.position.set(position.x, position.y, position.z);

          object.scale.set(0.001, 0.001, 0.001);
          
          object.lookAt(0,1,0); 
          console.log (planeta.position) // Orientar el cubo hacia el centro de la Tierra
          //object.rotation.set(0,0,  0);
          scene.add(object);
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




/*************************************************
* CREAR EL SOL
*************************************************/


/******************
 * Fondo de estrellas
 ******************/
 
// Crear un skybox (cubo) con una textura de estrellas
/*const skyboxGeometry = new THREE.BoxGeometry(1000, 1000, 1000);
const entornoSkybox = ['./images/skybox/front.png', './images/skybox/back.png', './images/skybox/top.png', './images/skybox/bottom.png', './images/skybox/right.png', './images/skybox/left.png'];
const skyboxMaterial = [];
for (let i = 0; i < 6; i++)
    skyboxMaterial.push(new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(entornoSkybox[i]), side: THREE.BackSide }));
const skyboxMesh = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
scene.add(skyboxMesh);
*/

/* //Fondo de estrellas con esfera
const entorno = new THREE.TextureLoader().load('./models/textures/space.jpg');
const entornoMaterial = new THREE.MeshBasicMaterial({ map: entorno });
const entornoGeometry = new THREE.SphereGeometry(1000, 32, 32);
 entornoMesh = new THREE.Mesh(entornoGeometry, entornoMaterial);
entornoMesh.material.side = THREE.BackSide;
entornoMesh.name = 'entorno';
scene.add(entornoMesh);
 */

//Estrellas
const estrellasGeometry = new THREE.BufferGeometry();
const estrellasMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.1,
  transparent: true,
  opacity: 0.8,
});

const estrellasVertices = [];
for (let i = 0; i < 1000; i++) {
  const x = (Math.random() - 0.5) * 2000;
  const y = (Math.random() - 0.5) * 2000;
  const z = (Math.random() - 0.5) * 2000;
  estrellasVertices.push(x, y, z);
}

estrellasGeometry.setAttribute('position', new THREE.Float32BufferAttribute(estrellasVertices, 3));

const estrellas = new THREE.Points(estrellasGeometry, estrellasMaterial);
scene.add(estrellas);


scene.add(new THREE.AxisHelper(500));

}

function latLongToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const y = (radius * Math.cos(phi));
    const z = (radius * Math.sin(phi) * Math.sin(theta));

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
      if (obj.name != null) {
          console.log(obj.name);
          const position = obj.position;
          const zoom = 20;
          const camPosition = new THREE.Vector3(position.x + zoom, position.y + zoom, position.z + zoom);
          //camera.position.copy(camPosition);
          //camera.lookAt(position);
          //Llamar a la funcion para mostrar datos del monumento
          showMonumentData(obj.name);

          //Animacion
          const origen = {
              x: camera.position.x,
              y: camera.position.y,
              z: camera.position.z
          };
          const destino = {
              x: camPosition.x,
              y: camPosition.y,
              z: camPosition.z
          };
          const tween = new TWEEN.Tween(origen).to(destino, 2000);
          tween.easing(TWEEN.Easing.Quadratic.InOut);
          tween.onUpdate(() => {
              camera.position.set(origen.x, origen.y, origen.z);
          });
          tween.start();

      }
  }
}

//Funcion para mostrar datos del monumento en una ventana emergente
function showMonumentData(name) {
  //Creo un div para mostrar los datos
  const div = document.createElement('div');
  div.style.position = 'absolute';
  div.style.width = 320+ 'px';
  div.style.height = 600+ 'px';
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
  
  monuments.forEach(monument => {
      if (monument.name == name) {
          div.innerHTML = '<h1>' + monument.info.name + '</h1>' +
              '<h2>' + monument.info.country + '</h2>' +
              '<h3>' + monument.info.city + '</h3>' +
              '<p>Altura: ' + monument.info.height + '</p>' +
              '<p>Curiosidad: ' + monument.info.curiosity + '</p>';
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

  //Añado un evento al boton para cerrar la ventana emergente
  button.addEventListener('click', () => {
      document.body.removeChild(div);
      document.body.removeChild(button);
  });

}
  


function setOrtographicCamera(ar){
  let camaraOrtografica;
  if (ar>1)
      camaraOrtografica = new THREE.OrthographicCamera(-L*ar,L*ar, L,-L,-100,500);
  else
      camaraOrtografica = new THREE.OrthographicCamera(-L,L, L/ar,-L/ar,-100,500);


  
      cenital = camaraOrtografica;
      cenital.position.set(0,L,0);
      cenital.lookAt(0,0,0);
      cenital.up = new THREE.Vector3(0,0,-1);
      
      
  
}


function updateAspectRatio(){
  renderer.setSize(window.innerWidth, window.innerHeight);

  const ar = window.innerWidth/window.innerHeight;

  camera.aspect = ar;


  if (ar < 1) {
    cenital.left = -L
    cenital.right = L
    cenital.top = L;
    cenital.bottom = -L
} else {
  cenital.left = -L
  cenital.right = L
  cenital.top = L;
  cenital.bottom = -L
}
camera.updateProjectionMatrix();

  cenital.updateProjectionMatrix();
  

  }
function update(delta){
   // angulo+= 0.005;
  //  brazo.rotation.y =angulo;
  TWEEN.update(delta);
   
}
function rotateElement(event){

  //Capturo la posicion del click (sistema de referencia top-left)
  let x = event.clientX
  let y = event.clientY

  //Cambia al sistema de referencia cuadrado de 2x2
  x = (x/window.innerWidth)*2-1;
  y = -(y/window.innerHeight)*2+1;

  //Rayo e interseccion
  const rayo = new THREE.Raycaster();
  rayo.setFromCamera(new THREE.Vector2(x,y), camera);

  const intersecciones = rayo.intersectObjects(scene.getObjectByName('grupoEC').children,false);

  if(intersecciones.length>0)
      intersecciones[0].object.rotation.y += Math.PI/8;


}

function render(delta){

  requestAnimationFrame(render);
  update(delta);
  renderer.clear();
  
  renderer.setViewport(0,0, window.innerWidth,window.innerHeight);
  renderer.render(scene, camera);
// El S.R. del viewport es left-bottom con X right y Y up
  const side = Math.min(window.innerWidth, window.innerHeight) * 0.25;
  renderer.setViewport(0, window.innerHeight - side, side, side)
  renderer.render(scene, cenital);
// Asegúrate de que el fondo se mueva con la cámara
/* entornoMesh.position.copy(camera.position);


  // Añadir rotación lenta
  entornoMesh.rotation.x += 0.00005;
  entornoMesh.rotation.y += 0.00005;
 */
  renderer.render(scene, camera);
}


