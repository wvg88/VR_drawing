import * as THREE from '../js/build/three.module.js';
import { BoxLineGeometry } from './modules/jsm/geometries/BoxLineGeometry.js';
import { VRButton } from './modules/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from './modules/jsm/webxr/XRControllerModelFactory.js';

let camera, scene, renderer;
let controller1, controller2;
let controllerGrip1, controllerGrip2;

let room;

init();
animate();

function init(){
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x505050 );

    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 10 );
    camera.position.set( 0, 1.6, 3 );
    
    room = new THREE.LineSegments(
        new BoxLineGeometry( 6, 6, 6, 10, 10, 10 ),
        new THREE.LineBasicMaterial( { color: 0x808080 } )
    );
    room.geometry.translate( 0, 3, 0 );
	scene.add( room );

    scene.add( new THREE.HemisphereLight( 0x606060, 0x404040 ) );

    const light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 1, 1, 1 ).normalize();
    scene.add( light );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.xr.enabled = true;
    document.body.appendChild( renderer.domElement );
    document.body.appendChild( VRButton.createButton( renderer ) );

}

function animate(){
    renderer.setAnimationLoop( render );
}

function render() {
    renderer.render( scene, camera );
}

