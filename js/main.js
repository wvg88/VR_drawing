import * as THREE from '../js/build/three.module.js';
import { BoxLineGeometry } from './modules/jsm/geometries/BoxLineGeometry.js';
import { VRButton } from './modules/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from './modules/jsm/webxr/XRControllerModelFactory.js';

let camera, scene, renderer;
let controller1, controller2;
let controllerGrip1, controllerGrip2;

const MAX_POINTS = 400;


let drawCount = 3;
let line;




//eventListeners
window.addEventListener( 'resize', onWindowResize );

init();
animate();


function init(){
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xe8e8e8);

    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 10 );
    camera.position.set( 0, 1.6, 0 );

    scene.add( new THREE.HemisphereLight( 0x606060, 0x404040 ) );

    const light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 1, 1, 1 ).normalize();
    scene.add( light );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.xr.enabled = true;
    document.body.appendChild( renderer.domElement );
    document.body.appendChild( VRButton.createButton( renderer ) );
    
    setupControllers();


    var lineGeometry = new THREE.BufferGeometry();
    const positions2 = new Float32Array( 
        0.5, 1.5, -1,
        -0.5, 1.5, -1.6,
        -0.5, 1.5, -2,
    ); 

    const positions = [];
    positions.push(0.5, 1.5, -1);
    positions.push(-0.5, 1.5, -1.6);
    positions.push(-0.5, 1.5, -2);

    console.log(positions2);
    console.log(positions);
    
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute( positions, 3 ) );
    lineGeometry.setDrawRange(0, drawCount);
    
   
    const points = [];
    points.push(new THREE.Vector3( 0.5, 1.5, -1));
    points.push(new THREE.Vector3(  -0.5, 1.5, -1.6));
    points.push(new THREE.Vector3(  -0.5, 1.5, -2));
    const geometry = new THREE.BufferGeometry().setFromPoints( points );

    console.log(lineGeometry);
    console.log(geometry);


    const lineMaterial = new THREE.LineBasicMaterial( { color: 0xFF0000, linewidth: 2} );
    line = new THREE.Line( lineGeometry, lineMaterial );
    scene.add(line);
}

function animate(){
    renderer.setAnimationLoop( render );
}

function render() {
    handleController( controller1 );
	handleController( controller2 );
	// line.geometry.setDrawRange( 0, drawCount );
    renderer.render( scene, camera );
}


function handleController( controller ) {
    const userData = controller.userData;

    if(controller.userData.isSelecting){
        const positions =  line.geometry.attributes.position.array;
        positions[indexCount++] = controller.position.x;
        positions[indexCount++] = controller.position.y;
        positions[indexCount++] = controller.position.z;
        drawCount++;
        line.geometry.setDrawRange(0,drawCount);
        line.geometry.attributes.position.needsUpdate = true; 
    }
}

function setupControllers(){
    controller1 = renderer.xr.getController( 0 );
    controller1.addEventListener( 'selectstart', onSelectStart );
    controller1.addEventListener( 'selectend', onSelectEnd );
    controller1.addEventListener( 'connected', function ( event ) {
        this.add( buildController( event.data ) );
    } );
    controller1.addEventListener( 'disconnected', function () {
        this.remove( this.children[ 0 ] );
    } );
    scene.add( controller1 );

    controller2 = renderer.xr.getController( 1 );
    controller2.addEventListener( 'selectstart', onSelectStart );
    controller2.addEventListener( 'selectend', onSelectEnd );
    controller2.addEventListener( 'connected', function ( event ) {
        this.add( buildController( event.data ) );
    } );
    controller2.addEventListener( 'disconnected', function () {
        this.remove( this.children[ 0 ] );
    } );
    scene.add( controller2 );

    const controllerModelFactory = new XRControllerModelFactory();

    controllerGrip1 = renderer.xr.getControllerGrip( 0 );
    controllerGrip1.add( controllerModelFactory.createControllerModel( controllerGrip1 ) );
    scene.add( controllerGrip1 );

    controllerGrip2 = renderer.xr.getControllerGrip( 1 );
    controllerGrip2.add( controllerModelFactory.createControllerModel( controllerGrip2 ) );
    scene.add( controllerGrip2 );

    function onSelectStart() {
        this.userData.isSelecting = true;
        console.log('start');
    }
    function onSelectEnd() {
        this.userData.isSelecting = false;
        console.log('end');
    }
}

function buildController( data ) {
    let geometry, material;
    switch ( data.targetRayMode ) {
        case 'tracked-pointer':
            console.log('tracker');
            geometry = new THREE.BufferGeometry();
            geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0, 0, 0, - 1 ], 3 ) );
            geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( [ 0.5, 0.5, 0.5, 0, 0, 0 ], 3 ) );
            material = new THREE.LineBasicMaterial( { vertexColors: true, blending: THREE.AdditiveBlending } );
            return new THREE.Line( geometry, material );

        case 'gaze':
            console.log('GAZE');
            geometry = new THREE.RingGeometry( 0.02, 0.04, 32 ).translate( 0, 0, - 1 );
            material = new THREE.MeshBasicMaterial( { opacity: 0.5, transparent: true } );
            return new THREE.Mesh( geometry, material );
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}