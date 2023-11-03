/**
 * practica5.js
 * Luces y materiales
 * @author <<margarb6@epsg.upv.es>, 2023
 */


import * as THREE from "../lib/three.module.js"
import {GLTFLoader} from "../lib/GLTFLoader.module.js"
import {OrbitControls} from "../lib/OrbitControls.module.js"
import {TWEEN} from "../lib/tween.module.min.js"
import Stats from "../lib/stats.module.js"
import {GUI} from "../lib/lil-gui.module.min.js"
//Variables de consenso

let renderer, scene, camera;

//Otras globales
let robot;
let pinza1;
let pinza2;
let brazo;
let base;
let antebrazo;
let eje;
let rotula;
let esparrago;
let pinzasMano;
let meshCilindroSupAntebrazo;
let material;

let effectController;

let angulo= 0;
//Controlador de camara

let cameraControls;

let cenital;
const L = 100;

// Acciones

init();
setupGUI();
loadScene();
render();

function init(){
  //motor de render 
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setClearColor(new THREE.Color(0.7,0.9,0.9));

  document.getElementById("container").appendChild(renderer.domElement);
  renderer.autoClear = false;


  renderer.antialias = true;

  renderer.shadowMapEnabled = true;
  scene = new THREE.Scene();
  //scene.background = new THREE.Color(0.7,0.9,0.9);

  //Luces
  
  const ambiental = new THREE.AmbientLight(0x222222, 1);
  scene.add(ambiental);

  var light = new THREE.DirectionalLight(0x4A97FF, 0.5);
light.position.set(-100, 200, 100);
light.target.position.set(0, 100, 0);
light.castShadow = true;
light.shadowDarkness = 0.5;
light.shadowCameraVisible = true; // only for debugging
// these six values define the boundaries of the yellow box seen above
light.shadowCameraNear = 50;
light.shadowCameraFar = 500;
light.shadowCameraLeft = -200;
light.shadowCameraRight = 200;
light.shadowCameraTop = 200;
light.shadowCameraBottom = -200;
scene.add(light);
scene.add(new THREE.CameraHelper(light.shadow.camera));

  const focal = new THREE.SpotLight(0xFFFFFF, 0.6);
  focal.position.set(100,400,100);
  focal.target.position.set(0,0,0);
  focal.angle = Math.PI/5;
  focal.penumbra  = 0.3;
  focal.castShadow = true;
  scene.add(focal);
  scene.add(new THREE.CameraHelper(focal.shadow.camera));

  //Camara
  const ar = window.innerWidth/window.innerHeight;
  setOrtographicCamera(ar);
  camera = new THREE.PerspectiveCamera(90, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(160,250,150);
  camera.lookAt(0, 100, 0);

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
    const texturaSuelo = new THREE.TextureLoader().load('./images/pisometalico_1024.jpg');
    const matSuelo = new THREE.MeshLambertMaterial({ map: texturaSuelo});
    const texturaRobot = new THREE.TextureLoader().load('./images/metal_128.jpg');
    const matRobotDorado = new THREE.MeshPhongMaterial({ color:0xFFB900,specular: 0xFFD64A, shininess: 30, map: texturaRobot});
    const matRobotGris = new THREE.MeshLambertMaterial({ color:0xF0F0F0,  map: texturaRobot});
    const entorno = ['./images/posx.jpg','./images/negx.jpg','./images/posy.jpg','./images/negy.jpg','./images/posz.jpg','./images/negz.jpg'];
    const texturaEntorno = new THREE.CubeTextureLoader().load(entorno);
    const matEntorno = new THREE.MeshPhongMaterial({ color:0xFFFFFF, specular: 0xFFFFFF, shininess: 30, envMap: texturaEntorno});
    

    material = new THREE.MeshLambertMaterial({color : 'white',map: texturaRobot, side: THREE.FrontSide});

    //ROBOT
    robot = new THREE.Object3D();
    
    //BASE
    const cilindroBase = new THREE.CylinderGeometry(50,50,15,25);
    base = new THREE.Mesh(cilindroBase, matRobotGris);

    //BRAZO
    brazo = new THREE.Object3D();

    const esferaBrazo= new THREE.SphereGeometry(20);
    const cilindroBrazo = new THREE.CylinderGeometry(20,20,18,20);
    const cuboBrazo = new THREE.BoxGeometry(18,120,12);

    rotula = new  THREE.Mesh(esferaBrazo, matEntorno);
    eje = new  THREE.Mesh(cilindroBrazo, matRobotGris);
    esparrago = new  THREE.Mesh(cuboBrazo, matRobotGris);
    
    

    //ANTEBRAZO
    antebrazo = new THREE.Object3D();

    const cilindroSupAntebrazo = new THREE.CylinderGeometry(15,15,40,20);
    const nervioAntebrazo = new THREE.BoxGeometry(4,80,4);
    const cilindroInfAntebrazo = new THREE.CylinderGeometry(22,22,6,20);

     meshCilindroSupAntebrazo = new  THREE.Mesh(cilindroSupAntebrazo, matRobotDorado);
    
    const meshNervioAntebrazo1 = new  THREE.Mesh(nervioAntebrazo, matRobotDorado);
    const meshNervioAntebrazo2 = new  THREE.Mesh(nervioAntebrazo, matRobotDorado);
    const meshNervioAntebrazo3 = new  THREE.Mesh(nervioAntebrazo, matRobotDorado);
    const meshNervioAntebrazo4 = new  THREE.Mesh(nervioAntebrazo, matRobotDorado);

    const meshCilindroInfAntebrazo = new  THREE.Mesh(cilindroInfAntebrazo, matRobotDorado);
    
    meshCilindroSupAntebrazo.rotation.x = -Math.PI/2;

    //PINZAS
    pinza1 = new THREE.Object3D();
    pinza2 = new THREE.Object3D();


    const malla = new THREE.BufferGeometry();
    const coordenadas = [9.5,-7,2, 9.5,-7,0, 9.5,7,0, 9.5,7,2, -9.5,10,2, -9.5,10,-2, -9.5,-10,-2, -9.5,-10,2];
    const indices= [7,0,3, 7,3,4, 0,1,2, 0,2,3, 3,2,5, 3,5,4, 6,7,4, 6,4,5, 1,6,5, 1,5,2, 7,1,0, 7,6,1];

    malla.setIndex(indices);
    malla.setAttribute('position', new THREE.Float32Attribute(coordenadas,3))
    malla.computeVertexNormals();


    //const dedo2 = new THREE.Mesh(malla2,material);
    texturaPinzas(malla);
    const dedo = new THREE.Mesh(malla,material);
    const dedo2 = new THREE.Mesh(malla,material);
    dedo2.applyMatrix(new THREE.Matrix4().makeScale(1,1,-1));



    const cuboMano = new THREE.BoxGeometry(19,20,4);
    const cuboMano2 = new THREE.BoxGeometry(19,20,4);
    const mano = new  THREE.Mesh(cuboMano, material);
    const mano2 = new  THREE.Mesh(cuboMano2, material);
   

    meshCilindroSupAntebrazo.position.set(0,83,0);
    meshCilindroInfAntebrazo.position.set(0,0,0);
    meshNervioAntebrazo1.position.set(9,43,6);
    meshNervioAntebrazo2.position.set(-9,43,6);
    meshNervioAntebrazo3.position.set(-9,43,-6);
    meshNervioAntebrazo4.position.set(9,43,-6);
    

   

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


    
    pinzasMano = new THREE.Object3D();

    pinzasMano.add(pinza1);
    pinzasMano.add(pinza2);
  
    pinzasMano.position.set(9.5,0,0)
    pinzasMano.rotation.x = -Math.PI/2;
    pinza1.position.set(0,0,-6);
    pinza2.position.set(0,0,6);

    meshCilindroSupAntebrazo.add(pinzasMano);
    antebrazo.position.set(0,137,0);

    eje.rotation.x = -Math.PI/2;
    base.position.set(0,1,0);
    esparrago.position.set(0,75,0);
    rotula.position.set(0,135,0);
   
    

    
    //HABITACION

    const paredes = []
    paredes.push(new THREE.MeshBasicMaterial({side: THREE.BackSide, map: new THREE.TextureLoader().load('./images/posx.jpg')}))
    paredes.push(new THREE.MeshBasicMaterial({side: THREE.BackSide, map: new THREE.TextureLoader().load('./images/negx.jpg')}))
    paredes.push(new THREE.MeshBasicMaterial({side: THREE.BackSide, map: new THREE.TextureLoader().load('./images/posy.jpg')}))
    paredes.push(new THREE.MeshBasicMaterial({side: THREE.BackSide, map: new THREE.TextureLoader().load('./images/negy.jpg')}))
    paredes.push(new THREE.MeshBasicMaterial({side: THREE.BackSide, map: new THREE.TextureLoader().load('./images/posz.jpg')}))
    paredes.push(new THREE.MeshBasicMaterial({side: THREE.BackSide, map: new THREE.TextureLoader().load('./images/negz.jpg')}))


    const geoHabitacion = new THREE.BoxGeometry(800,800,800);
    const habitacion = new THREE.Mesh(geoHabitacion,paredes);
    scene.add(habitacion);
   
    //Suelo
    const suelo = new THREE.Mesh(new THREE.PlaneGeometry(800,800,10,10),matSuelo);
    suelo.rotation.x = -Math.PI/2;

    // Desglose
    brazo.add(antebrazo);

    brazo.add(rotula);

    brazo.add(esparrago);
    brazo.add(eje);
    base.add(brazo);
    robot.add(base);
    
    scene.add(robot);
    
    scene.add(suelo);
    scene.add(new THREE.AxisHelper(2));

    //Shadows
    base.castShadow = true;
    base.receiveShadow = true;
    brazo.castShadow = true;
    brazo.receiveShadow = true;
    antebrazo.castShadow = true;
    antebrazo.receiveShadow = true;
    pinza1.castShadow = true;
    pinza1.receiveShadow = true;
    pinza2.castShadow = true;
    pinza2.receiveShadow = true;
    pinzasMano.castShadow = true;
    pinzasMano.receiveShadow = true;
    
    eje.castShadow = true;
    eje.receiveShadow = true;
    rotula.castShadow = true;
    rotula.receiveShadow = true;
    esparrago.castShadow = true;
    esparrago.receiveShadow = true;
    pinzasMano.castShadow = true;
    pinzasMano.receiveShadow = true;
    meshCilindroSupAntebrazo.castShadow = true;
    meshCilindroSupAntebrazo.receiveShadow = true;
    meshCilindroInfAntebrazo.castShadow = true;
    meshCilindroInfAntebrazo.receiveShadow = true;
    mano2.castShadow = true;
    mano2.receiveShadow = true;
    meshNervioAntebrazo1.castShadow = true;
    meshNervioAntebrazo1.receiveShadow = true;
    meshNervioAntebrazo2.castShadow = true;
    meshNervioAntebrazo2.receiveShadow = true;
    meshNervioAntebrazo3.castShadow = true;
    meshNervioAntebrazo3.receiveShadow = true;
    meshNervioAntebrazo4.castShadow = true;
    meshNervioAntebrazo4.receiveShadow = true;

    mano.castShadow = true;
    mano.receiveShadow = true;
    dedo.castShadow = true;
    dedo.receiveShadow = true;
    dedo2.castShadow = true;
    dedo2.receiveShadow = true;

    
    suelo.receiveShadow = true;
    suelo.castShadow = true;



}

function setupGUI(){

    //Definicion del objeto controlador

    effectController = {
        
        giroBase: 0.0,
        giroBrazo: 0.0,
        giroAntebrazoY: 0.0,
        giroAntebrazoZ: 0.0,
        giroPinza: 0.0,
        separacionPinza:6,
        alambres:false,
        animacion: saludoAnimation
        
        /*function(){
          const tween = new TWEEN.Tween(robot.rotation).
          to( {x:[0,0], y:[Math.PI, Math.PI/2], z:[0,0]}, 5000).
          interpolation(TWEEN.Interpolation.Linear).
          easing(TWEEN.Easing.Exponential.InOut)

          const tween2 = new TWEEN.Tween(antebrazo.position).
          to( {x:[0,1,0], y:[0, 2,0], z:[0,0]}, 5000).
          interpolation(TWEEN.Interpolation.Linear).
          easing(TWEEN.Easing.Exponential.InOut)
          //tween.chain(tween2)
          
          tween.start();
          tween2.start();
      }*/

    };

    const gui = new GUI();

    //Construir el menu de widgets

    const h = gui.addFolder("Controles Robot");
    
    h.add(effectController, "giroBase", -180.0, 180.0, 0.025).name("Giro Base");
    h.add(effectController, "giroBrazo", -45.0, 45.0, 0.025).name("Giro Brazo");
    h.add(effectController, "giroAntebrazoY", -180.0, 180.0, 0.025).name("Giro Antebrazo Y");
    h.add(effectController, "giroAntebrazoZ", -90.0, 90.0, 0.025).name("Giro Antebrazo Z").listen();
    h.add(effectController, "giroPinza", -40.0, 220.0, 0.025).name("Giro Pinza");
    h.add(effectController, "separacionPinza", 0.0, 15.0, 0.025).name("Separacion Pinza");
    h.add(effectController, "alambres").name("alambres");
    h.add(effectController, "animacion")

}

function setOrtographicCamera(ar){
  let camaraOrtografica;
  camaraOrtografica = new THREE.OrthographicCamera(-L, L, L, -L, -200, 200);
  
    cenital = camaraOrtografica.clone();
    cenital.position.set(0,L,0);
    cenital.lookAt(0,0,0);
    cenital.up = new THREE.Vector3(0,1,0);
  
}



function texturaPinzas(geometry) {
  const MAX_X = 1, MAX_Y = 2, MAX_Z = 3;
  geometry.computeBoundingBox();
  let { min, max } = geometry.boundingBox;
  let offset = new THREE.Vector3(0 - min.x, 0 - min.y, 0 - min.z);
  let range = new THREE.Vector3(max.x - min.x, max.y - min.y, max.z - min.z);
  let uvs = [];
  let pos = geometry.getAttribute('position'),
    normals = geometry.getAttribute('normal');
  
  console.log(normals);
  for (let i = 0; i < pos.count; i++) {
    
    let normalX = Math.abs(normals.getX(i)),
      normalY = Math.abs(normals.getY(i)),
      normalZ = Math.abs(normals.getZ(i));

    let maxim = MAX_X;
    if (normalY >= normalX && normalY >= normalZ) maxim = MAX_Y;
    else if (normalZ >= normalX && normalZ >= normalX) maxim = MAX_Z;

    
    let x = (pos.getX(i) + offset.x) / range.x,
      y = (pos.getY(i) + offset.y) / range.y,
      z = (pos.getZ(i) + offset.z) / range.z;

    switch (maxim) {
      case MAX_X:
        uvs.push(y, z);
        break;
      case MAX_Y:
        uvs.push(x, z);
        break;
      case MAX_Z:
        uvs.push(x, y);
        break;
    }
  }
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
  
   // Controles robot
   base.rotation.y = effectController.giroBase * Math.PI/180;
   brazo.rotation.z = effectController.giroBrazo * Math.PI/180;
   antebrazo.rotation.y =effectController.giroAntebrazoY * Math.PI/180;
   antebrazo.rotation.z =effectController.giroAntebrazoZ * Math.PI/180;
   meshCilindroSupAntebrazo.rotation.y = -effectController.giroPinza * Math.PI/180;
   pinza1.position.z = -2-effectController.separacionPinza;
   pinza2.position.z = 2+effectController.separacionPinza;
   material.wireframe = effectController.alambres;
   TWEEN.update(delta)
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

}


function handleKey(event) {

  if ( event.keyCode == 39 || event.keyCode==68) {
  	robot.position.z-=2;
  }
  if ( (event.keyCode == 38 || event.keyCode==87)) {
    robot.position.x+=2;
  }
  if ( (event.keyCode == 37 || event.keyCode==65)) {
    robot.position.z+=2;
  }
  if ((event.keyCode == 40 || event.keyCode==83)) {
    robot.position.x-=2;
  }
}
function saludoAnimation() {
  
   //Gira el antebrazo hacia alante
   const antebrazoUpTween = new TWEEN.Tween(antebrazo.rotation)
   .to({ z: -Math.PI / 4 }, 1000) 
   .easing(TWEEN.Easing.Quadratic.Out).onUpdate(function(){
    effectController.giroAntebrazoZ = antebrazo.rotation.z * 180/Math.PI
});

  const antebrazoDownTween = new TWEEN.Tween(antebrazo.rotation)
    .to({ z: 0 }, 500)
    .easing(TWEEN.Easing.Quadratic.In).onUpdate(function(){
    effectController.giroAntebrazoZ = antebrazo.rotation.z * 180/Math.PI
});

  
  //Gira el brazo hacia atrás
  const brazoUpTween = new TWEEN.Tween(brazo.rotation)
  .to({ z: Math.PI / 8 }, 1000) 
  .easing(TWEEN.Easing.Quadratic.Out);

  const brazoDownTween = new TWEEN.Tween(brazo.rotation)
  .to({ z: 0 }, 500) 
  .easing(TWEEN.Easing.Quadratic.In);

 // Posible salto 
 const saltoBase = new TWEEN.Tween(base.position)
 .to({ y: base.position.y+20, x: base.position.x + 10 }, 500)
 .interpolation(TWEEN.Interpolation.Linear)
 .easing(TWEEN.Easing.Quadratic.Out);
 // 2. Abrir y cerrar las pinzas

//pinza sube y baja
  const pinzaUpTween = new TWEEN.Tween(meshCilindroSupAntebrazo.rotation)
    .to({ y: -Math.PI / 4 }, 1000) 
    .easing(TWEEN.Easing.Quadratic.Out);

  const pinzaDownTween = new TWEEN.Tween(meshCilindroSupAntebrazo.rotation)
    .to({ y: 0 }, 500)
    .easing(TWEEN.Easing.Quadratic.In);

  pinzaUpTween.chain(pinzaDownTween);


  // 2. Abrir y cerrar las pinzas
  const pinzaOpenTween = new TWEEN.Tween(pinza1.position)
    .to({ z: pinza1.position.z + 5 }, 1000)
    .easing(TWEEN.Easing.Quadratic.Out);

  const pinzaCloseTween = new TWEEN.Tween(pinza1.position)
    .to({ z: pinza1.position.z }, 1000)
    .easing(TWEEN.Easing.Quadratic.In);

  const pinza2OpenTween = new TWEEN.Tween(pinza2.position)
    .to({ z: pinza2.position.z - 5 }, 1000)
    .easing(TWEEN.Easing.Quadratic.Out);

  const pinza2CloseTween = new TWEEN.Tween(pinza2.position)
    .to({ z: pinza2.position.z }, 1000)
    .easing(TWEEN.Easing.Quadratic.In);

  pinzaOpenTween.chain(pinzaCloseTween);
  pinza2OpenTween.chain(pinza2CloseTween);

  /*const antebrazoSide1Tween = new TWEEN.Tween(antebrazo.rotation)
  .to({ x: -Math.PI / 4 }, 1000)
  .delay(1000)
  .easing(TWEEN.Easing.Quadratic.Out);

  const antebrazoSide2Tween = new TWEEN.Tween(antebrazo.rotation)
  .to({ x: 0 }, 1000)
  .easing(TWEEN.Easing.Quadratic.Out);*/




  //antebrazoUpTween.chain(antebrazoSide1Tween);
  antebrazoUpTween.chain(antebrazoDownTween);
  brazoUpTween.chain(brazoDownTween);
  //antebrazoSide1Tween.chain(antebrazoSide2Tween);

  
  

  
 
  // Iniciar las animaciones
  antebrazoUpTween.start();
  brazoUpTween.start();
  pinzaUpTween.start();
  pinzaOpenTween.start();
  pinza2OpenTween.start();
  //saltoBase.start();
  //antebrazoSide1Tween.start()
  
 
}