/**
 * Escena.js
 * Seminario #2 GPC: Pintar una escena básico con transformaciones, animacion y modelos importados
 * 
 * @author <margarb6@epsg.upv.es>, 2023
 */

//modulos necesarios

import * as THREE from "../lib/three.module.js"
import {GLTFLoader} from "../lib/GLTFLoader.module.js"

//Variables de consenso

let renderer, scene, camera

//Otras globales

let esferaCubo;

let angulo= 0;

// Acciones
init();
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
camera.lookAt(0, 1, 0);


}

function loadScene(){

    //Construir objeto tipo mesh

    const material = new THREE.MeshBasicMaterial({color:'yellow', wireframe: true});
    const geoCubo = new THREE.BoxGeometry(2,2,2);

    const geoEsfera = new THREE.SphereGeometry(1, 20, 20);

    esferaCubo = new THREE.Object3D();
    const esfera = new THREE.Mesh(geoEsfera, material);
    const cubo = new THREE.Mesh(geoCubo, material);
    cubo.position.set(1,1,0);
    esfera.position.set(-1,1,0);
    //esferaCubo.position.set(0,1,0);
    //Hay q enganchar cubo a la escena
    esferaCubo.add(cubo);
    esferaCubo.add(esfera);
    scene.add(esferaCubo);

    //SUelo
    const suelo = new THREE.Mesh(new THREE.PlaneGeometry(10,10,10,10),material);
    suelo.rotation.x = -Math.PI/2;


//Importar un modelo JSON
const loader = new THREE.ObjectLoader()
loader.load( 'models/soldado/soldado.json', function(objeto) {
    cubo.add( objeto )
    objeto.position.set(0,1,0);
})

    //Importar modelo en GLTFLoader

    const gltfloader = new GLTFLoader()
    gltfloader.load( 'models/vanelope/scene.gltf', function(objeto) {
        esfera.add( objeto.scene )
        objeto.scene.scale.set( 0.01, 0.01, 0.01 )
        objeto.scene.position.y = 1
        objeto.scene.rotation.y = -Math.PI/2
        console.log( "ROBOT" )
        console.log( objeto )
    })


    
    scene.add(suelo);
    scene.add(new THREE.AxisHelper(2));


}


function update(){

    angulo+= 0.01;
    esferaCubo.rotation.y =angulo;

}


function render(){

requestAnimationFrame(render);
update();
renderer.render(scene, camera);
}
