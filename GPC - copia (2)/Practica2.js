/**
 * Escena.js
 * Seminario #2 GPC: Pintar una escena básico con transformaciones, animacion y modelos importados
 * 
 * @author <margarb6@epsg.upv.es>, 2023
 */

//modulos necesarios

import * as THREE from "./lib/three.module.js"
import {GLTFLoader} from "./lib/GLTFLoader.module.js"
import {OrbitControls} from "./lib/OrbitControls.module.js"

//Variables de consenso

let renderer, scene, camera;

//Otras globales

let pinza1;
let pinza2;
let angulo= 0;

let brazo;
//Controlador de camara

let cameraControls;

let cenital;
const L = 120;

// Acciones

init();
loadScene();
render();

function init(){
  //motor de render 
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setClearColor(new THREE.Color(0.7,0.9,0.9));

  document.getElementById("container").appendChild(renderer.domElement);
  renderer.autoClear = false;

  //Escena
  scene = new THREE.Scene();
  //scene.background = new THREE.Color(0.7,0.9,0.9);

  //Camara
  const ar = window.innerWidth/window.innerHeight;
  setOrtographicCamera(ar);
  camera = new THREE.PerspectiveCamera(80, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(160,230,190);
  camera.lookAt(0, 90, 0);

  cameraControls = new OrbitControls(camera, renderer.domElement);
  cameraControls.target.set(0,1,0);


  //eventos
  window.addEventListener('resize', updateAspectRatio);

  /*window.addEventListener('click', rotateCamera);
  window.addEventListener('contextmenu', panningCamera);
  window.addEventListener('wheel', zoomCamera);
  */



}

function loadScene(){

    //MATERIAL
    const material = new THREE.MeshNormalMaterial({wireframe:false, flatShading:true});
    //ROBOT
    const robot = new THREE.Object3D();
    
    //BASE
    const cilindroBase = new THREE.CylinderGeometry(50,50,15,25);
    const base = new THREE.Mesh(cilindroBase, material);

    //BRAZO
    brazo = new THREE.Object3D();

    const esferaBrazo= new THREE.SphereGeometry(20);
    const cilindroBrazo = new THREE.CylinderGeometry(20,20,18,20);
    const cuboBrazo = new THREE.BoxGeometry(18,120,12);

    const meshEsferaBrazo = new  THREE.Mesh(esferaBrazo, material);
    const meshCilindroBrazo = new  THREE.Mesh(cilindroBrazo, material);
    const meshCuboBrazo = new  THREE.Mesh(cuboBrazo, material);
    
    meshCilindroBrazo.rotation.x = -Math.PI/2;

    //ANTEBRAZO
    const antebrazo = new THREE.Object3D();

    const cilindroSupAntebrazo = new THREE.CylinderGeometry(15,15,40,20);
    const nervioAntebrazo = new THREE.BoxGeometry(4,80,4);
    const cilindroInfAntebrazo = new THREE.CylinderGeometry(22,22,6,20);

    const meshCilindroSupAntebrazo = new  THREE.Mesh(cilindroSupAntebrazo, material);
    
    const meshNervioAntebrazo1 = new  THREE.Mesh(nervioAntebrazo, material);
    const meshNervioAntebrazo2 = new  THREE.Mesh(nervioAntebrazo, material);
    const meshNervioAntebrazo3 = new  THREE.Mesh(nervioAntebrazo, material);
    const meshNervioAntebrazo4 = new  THREE.Mesh(nervioAntebrazo, material);

    const meshCilindroInfAntebrazo = new  THREE.Mesh(cilindroInfAntebrazo, material);
    
    meshCilindroSupAntebrazo.rotation.x = -Math.PI/2;

    //PINZAS
    pinza1 = new THREE.Object3D();
    pinza2 = new THREE.Object3D();


    const malla = new THREE.BufferGeometry();
    const coordenadas = [9.5,-7,2, 9.5,-7,0, 9.5,7,0, 9.5,7,2, -9.5,10,2, -9.5,10,-2, -9.5,-10,-2, -9.5,-10,2];
    const indices= [7,0,3, 7,3,4, 0,1,2, 0,2,3, 3,2,5, 3,5,4, 6,7,4, 6,4,5, 1,6,5, 1,5,2, 7,1,0, 7,6,1];

    malla.setIndex(indices);
    malla.setAttribute('position', new THREE.Float32Attribute(coordenadas,3))



    //const dedo2 = new THREE.Mesh(malla2,material);

    const dedo = new THREE.Mesh(malla,material);
    const dedo2 = new THREE.Mesh(malla,material);
    dedo2.applyMatrix(new THREE.Matrix4().makeScale(1,1,-1));



    const cuboMano = new THREE.BoxGeometry(19,20,4);
    const cuboMano2 = new THREE.BoxGeometry(19,20,4);
    const mano = new  THREE.Mesh(cuboMano, material);
    const mano2 = new  THREE.Mesh(cuboMano2, material);

    base.position.set(0,1,0);
    meshEsferaBrazo.position.set(0,60,0);
    meshCilindroBrazo.position.set(0,-60,0);

    meshCilindroSupAntebrazo.position.set(0,40,0);
    meshCilindroInfAntebrazo.position.set(0,-43,0);
    meshNervioAntebrazo1.position.set(9,0,6);
    meshNervioAntebrazo2.position.set(-9,0,6);
    meshNervioAntebrazo3.position.set(-9,0,-6);
    meshNervioAntebrazo4.position.set(9,0,-6);
    

    brazo.add(meshEsferaBrazo);
    brazo.add(meshCilindroBrazo);
    brazo.add(meshCuboBrazo);
    

    antebrazo.add(meshCilindroSupAntebrazo);
    antebrazo.add(meshNervioAntebrazo1);    
    antebrazo.add(meshNervioAntebrazo2);
    antebrazo.add(meshNervioAntebrazo3);
    antebrazo.add(meshNervioAntebrazo4);

    antebrazo.add(meshCilindroInfAntebrazo);



    pinza1.add(dedo);
    pinza1.add(mano);
    dedo.position.set(19,0,0);
    pinza2.add(dedo2);
    pinza2.add(mano2);
    dedo2.position.set(19,0,0);


    antebrazo.add(pinza1);
    antebrazo.add(pinza2);





    pinza1.position.set(9.5,40,-6);
    pinza2.position.set(9.5,40,6);


    antebrazo.position.set(0,103,0);

    brazo.add(antebrazo);
    brazo.position.set(0,60,0);
    

    
    
    base.add(brazo);
    robot.add(base);
    scene.add(robot)
    //Suelo
    const suelo = new THREE.Mesh(new THREE.PlaneGeometry(1000,1000,10,10),material);
    suelo.rotation.x = -Math.PI/2;





    
    scene.add(suelo);
    scene.add(new THREE.AxisHelper(2));


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
function update(){
   // angulo+= 0.005;
  //  brazo.rotation.y =angulo;
   
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

function render(){

  requestAnimationFrame(render);
  renderer.clear();
  
  renderer.setViewport(0,0, window.innerWidth,window.innerHeight);
  renderer.render(scene, camera);
// El S.R. del viewport es left-bottom con X right y Y up
  const side = Math.min(window.innerWidth, window.innerHeight) * 0.25;
  renderer.setViewport(0, window.innerHeight - side, side, side)
  renderer.render(scene, cenital);

}
