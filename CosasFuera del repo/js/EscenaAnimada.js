/**
 * Escena.js
 * Seminario #2 GPC: Pintar una escena básico con transformaciones, animacion y modelos importados
 * 
 * @author <margarb6@epsg.upv.es>, 2023
 */

//modulos necesarios

import * as THREE from "../lib/three.module.js"
import {GLTFLoader} from "../lib/GLTFLoader.module.js"
import {OrbitControls} from "../lib/OrbitControls.module.js"
import {TWEEN} from "../lib/tween.module.min.js"
import Stats from "../lib/stats.module.js"
import {GUI} from "../lib/lil-gui.module.min.js"

//Variables de consenso

let renderer, scene, camera, stats;

//Otras globales

let esferaCubo, esfera, cubo,suelo;

let angulo= 0;

//Controlador de camara

let cameraControls;


let effectController;


// Acciones
init();
setupGUI();

loadScene();
render();


function init(){
//motor de render 
renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth,window.innerHeight);
document.getElementById("container").appendChild(renderer.domElement);

//Escena
scene = new THREE.Scene();
scene.background = new THREE.Color(0.7,0.9,0.9);

//Camara
camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0.5,2,7);
cameraControls = new OrbitControls(camera, renderer.domElement);
cameraControls.target.set(0,1,0);
camera.lookAt(0, 1, 0);

//Monitor
stats = new Stats();
stats.setMode(0);
//stats.domElement.style.position;
document.getElementById('container').appendChild(stats.domElement);

//Eventos
window.addEventListener('resize', updateAspectRatio);
renderer.domElement.addEventListener('dblclick', animate)


}

function loadScene(){

    //Construir objeto tipo mesh

    const material = new THREE.MeshBasicMaterial({color:'blue', wireframe: true});
    const geoCubo = new THREE.BoxGeometry(2,2,2);

    const geoEsfera = new THREE.SphereGeometry(1, 20, 20);

    esferaCubo = new THREE.Object3D();
    esfera = new THREE.Mesh(geoEsfera, material);
    cubo = new THREE.Mesh(geoCubo, material);
    cubo.position.set(1,1,0);
    esfera.position.set(-1,1,0);
    //esferaCubo.position.set(0,1,0);
    //Hay q enganchar cubo a la escena
    esferaCubo.add(cubo);
    esferaCubo.add(esfera);
    scene.add(esferaCubo);

    //Suelo
    suelo = new THREE.Mesh(new THREE.PlaneGeometry(10,10,10,10),material);
    suelo.rotation.x = -Math.PI/2;


    //Importar un modelo JSON
    const loader = new THREE.ObjectLoader()
    loader.load( 'models/soldado/soldado.json', function(objeto) {
    cubo.add( objeto );
    objeto.position.set(0,1,0);
    objeto.name = 'soldado';
})

    //Importar modelo en GLTFLoader

    const gltfloader = new GLTFLoader()
    gltfloader.load( 'models/vanelope/scene.gltf', function(objeto) {
        esfera.add( objeto.scene )
        objeto.scene.scale.set( 0.01, 0.01, 0.01 )
        objeto.scene.position.y = 1
        objeto.scene.rotation.y = -Math.PI/2
        objeto.scene.name = 'robot';
        
    })


    
    scene.add(suelo);
    scene.add(new THREE.AxisHelper(2));


}


function setupGUI(){

    //Definicion del objeto controlador

    effectController = {
        mensaje: 'Soldado y Robot',
        giroY: 0.0,
        separacion:0,
        colorAlambre:'rgb(255,255,0)'

    };

    const gui = new GUI();

    //Construir el menu de widgets

    const h = gui.addFolder("Controles");
    h.add(effectController,"mensaje").name("Aplicacion")
    h.add(effectController, "giroY", -180.0, 180.0, 0.025).name("Giro en Y");
    h.add(effectController, "separacion", { 'Ninguna': 0, 'Media': 2, 'Total': 5}).name("Separacion");
    h.addColor(effectController, "colorAlambre").name("Color alambres");

}



function updateAspectRatio(){
    renderer.setSize(window.innerWidth, window.innerHeight);

    const ar = window.innerWidth/window.innerHeight;

    camera.aspect = ar;

    camera.updateProjectionMatrix();
   

    }



function animate(event){

//Capturar posicion del click

let x = event.clientX;
let y = event.clientY;

//Normalizar a cuadrado 2x2
x = (x / window.innerWidth)* 2 - 1;
y = -(y / window.innerHeight)* 2 + 1;

//Rayo e interseccion
const rayo = new THREE.Raycaster();
rayo.setFromCamera(new THREE.Vector2(x,y), camera);
const soldado = scene.getObjectByName('soldado');
let intersecciones = rayo.intersectObject(soldado,false);

if(intersecciones.length>0){
    
    new TWEEN.Tween(soldado.position).
    to({x:[0,0],y:[3,1], z:[0,0]}, 2000).
    interpolation(TWEEN.Interpolation.Bezier).
    easing(TWEEN.Easing.Bounce.Out).
    start();
}
    // Animacion

const robot = scene.getObjectByName('robot');

intersecciones = rayo.intersectObjects(robot.children,true);
if(intersecciones.length > 0) {
    new TWEEN.Tween(robot.rotation).
    to( {x:[0,0], y:[Math.PI, -Math.PI/2], z:[0,0]}, 5000).
    interpolation(TWEEN.Interpolation.Linear).
    easing(TWEEN.Easing.Exponential.InOut).
    start();
}

}


function update(delta){
    TWEEN.update(delta)
    stats.update();
    //angulo+= 0.01;
    //esferaCubo.rotation.y =angulo;
    //cubo.position.set(1+effectController.separacion/2,0,0);
    //esfera.position.set(-1-effectController.separacion/2,0,0);
    cubo.material.setValues( {color: effectController.colorAlambre} );
    esferaCubo.rotation.y = effectController.giroY * Math.PI / 180; // radianes

}


function render(delta){

    requestAnimationFrame(render);
    update(delta);
    renderer.render(scene, camera);
}
