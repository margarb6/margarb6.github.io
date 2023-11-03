/**
 * EscenaMultivista.js
 * Seminario #3 GPC: Pintar una escena básico con transformaciones, modelos importados
 * en 4 vistas diferentes
 * 
 * @author <margarb6@epsg.upv.es>, 2023
 */

//modulos necesarios

import * as THREE from "../lib/three.module.js"
import {GLTFLoader} from "../lib/GLTFLoader.module.js"
import {OrbitControls} from "../lib/OrbitControls.module.js"

//Variables de consenso

let renderer, scene, camera

//Otras globales

let esferaCubo;

let angulo= 0;

//Controlador de camara

let cameraControls;

//Camaras Adicionales

let planta, alzado, perfil;

const L = 5;

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
    setOrtographicCameras(ar);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(0.5,2,7);
    cameraControls = new OrbitControls(camera, renderer.domElement);
    cameraControls.target.set(0,1,0);
    camera.lookAt(0, 1, 0);

    //Eventos
    window.addEventListener('resize', updateAspectRatio);
    window.addEventListener('dblclick', rotateElement);

}


function setOrtographicCameras(ar){
    let camaraOrtografica;
    if (ar>1)
        camaraOrtografica = new THREE.OrthographicCamera(-L*ar,L*ar, L,-L,-10,100);
    else
        camaraOrtografica = new THREE.OrthographicCamera(-L,L, L/ar,-L/ar,-10,100);


    alzado = camaraOrtografica.clone();
    alzado.position.set(0,0,L);
    alzado.lookAt(0,1,0);

    perfil = camaraOrtografica.clone();
    perfil.position.set(L,0,0);
    perfil.lookAt(0,1,0);

    planta = camaraOrtografica.clone();
    planta.position.set(0,L,0);
    planta.lookAt(0,1,0);
    planta.up = new THREE.Vector3(0,0,-1);
    
}


function loadScene(){

    //Construir objeto tipo mesh

    const material = new THREE.MeshBasicMaterial({color:'blue', wireframe: true});
    const geoCubo = new THREE.BoxGeometry(2,2,2);

    const geoEsfera = new THREE.SphereGeometry(1, 20, 20);

    esferaCubo = new THREE.Object3D();
    esferaCubo.name= 'grupoEC';
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


function updateAspectRatio(){
    renderer.setSize(window.innerWidth, window.innerHeight);

    const ar = window.innerWidth/window.innerHeight;

    camera.aspect = ar;

    camera.updateProjectionMatrix();

    if(ar>1){ 
        alzado.left = planta.left = perfil.left = -L*ar;
        alzado.right = planta.right = perfil.right = L*ar;
        alzado.top = planta.top = perfil.top = L;
        alzado.bottom = planta.bottom = perfil.bottom = -L;
    }
       
    else{
        alzado.left = planta.left = perfil.left = -L;
        alzado.right = planta.right = perfil.right = L;
        alzado.top = planta.top = perfil.top = L/ar;
        alzado.bottom = planta.bottom = perfil.bottom = -L/ar;
    }
    alzado.updateProjectionMatrix();
    perfil.updateProjectionMatrix();
    planta.updateProjectionMatrix();

    }




function update(){

    angulo+= 0.01;
    esferaCubo.rotation.y =angulo;

}


function render(){

requestAnimationFrame(render);
//update();
renderer.clear();

let w = window.innerWidth/2;
let h = window.innerHeight/2;
// El S.R. del viewport es left-bottom con X right y Y up
renderer.setViewport(0,h, w,h);
renderer.render(scene, alzado);
renderer.setViewport(0,0, w,h);
renderer.render(scene, planta);
renderer.setViewport(w,h, w,h);
renderer.render(scene, perfil);
renderer.setViewport(w,0, w,h);
renderer.render(scene, camera);
}
