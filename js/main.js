import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory';
import {Stroke} from './stroke.js'
import {Button} from './button.js'

let camera, scene, renderer;
let controllerGripL, controllerGripR;
let controllerL, controllerR;
let controllers = [];
let strokes = [];

//eventListeners
window.addEventListener( 'resize', onWindowResize );

init();
animate();

function init(){
    let canvas = document.getElementById('canvas');

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xe8e8e8 );

    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 10 );
    camera.position.set( 0, 1.6, 3 );

    scene.add( new THREE.HemisphereLight( 0x808080, 0x606060 ) );

    const light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0, 6, 0 );
    light.castShadow = true;
    scene.add( light );

    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true
    });

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.xr.enabled = true;
    document.body.appendChild( VRButton.createButton( renderer ) );
    
    setupControllers();
}

function animate(){
    renderer.setAnimationLoop( render );
}

function render() {
    updateControllers();
    renderer.render( scene, camera );
}

function startLine(){
    let l = new Stroke();
    scene.add(l.shape);
    strokes.push(l);
}

function updateControllers(){
    const session = renderer.xr.getSession();
    if (session) {
        for (const source of session.inputSources) {
            if(source.handedness == 'right'){
                controllers[0].buttons[0].update(source.gamepad.buttons[0].pressed);
                controllers[0].buttons[1].update(source.gamepad.buttons[1].pressed);
                controllers[0].buttons[2].update(source.gamepad.buttons[3].pressed);
                controllers[0].buttons[3].update(source.gamepad.buttons[4].pressed);
                controllers[0].buttons[4].update(source.gamepad.buttons[5].pressed);
            }
            else if(source.handedness == 'left'){
                controllers[1].buttons[0].update(source.gamepad.buttons[0].pressed);
                controllers[1].buttons[1].update(source.gamepad.buttons[1].pressed);
                controllers[1].buttons[2].update(source.gamepad.buttons[3].pressed);
                controllers[1].buttons[3].update(source.gamepad.buttons[4].pressed);
                controllers[1].buttons[4].update(source.gamepad.buttons[5].pressed);
            }
        }
    }
    for(let i = 0; i < controllers.length; i++){
        if(controllers[i].buttons[0].pressed){
            if(strokes.length > 0){
                strokes[strokes.length-1].update(controllers[i].position);
            }
        }
    }
}

function setupControllers(){
    controllerL = renderer.xr.getController(0);
    controllerL.addEventListener('connected', function(event){
        this.add(buildController(event.data));
    });
    controllerL.addEventListener('disconnected', function(){
        this.remove(this.children[0]);
    } );
    controllerL.buttons = [new Button(startLine, 'triggerUp'),new Button(null,'triggerDown'),new Button(null,'thumbstickPress'),new Button(null,'x'),new Button(null,'y')];
    controllers.push(controllerL);

    controllerR = renderer.xr.getController(1);
    controllerR.addEventListener('connected', function(event){
        this.add(buildController(event.data));
    });
    controllerR.addEventListener('disconnected', function(){
        this.remove(this.children[0]);
    });
    controllerR.buttons = [new Button(startLine, 'triggerUp'),new Button(null, 'triggerDown'),new Button(null,'thumbstickPress'),new Button(null,'A'),new Button(null,'B')];
    controllers.push(controllerR);

    //Add controller models
    const controllerModelFactory = new XRControllerModelFactory();
    controllerGripL = renderer.xr.getControllerGrip(0);
    controllerGripL.add(controllerModelFactory.createControllerModel(controllerGripL));
    scene.add(controllerGripL);

    controllerGripR = renderer.xr.getControllerGrip(1);
    controllerGripR.add( controllerModelFactory.createControllerModel(controllerGripR));
    scene.add(controllerGripR);
}

function buildController( data ) {
    let geometry, material;
    switch ( data.targetRayMode ) {
        case 'tracked-pointer':
            geometry = new THREE.BufferGeometry();
            geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0, 0, 0, - 1 ], 3 ) );
            geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( [ 0.5, 0.5, 0.5, 0, 0, 0 ], 3 ) );
            material = new THREE.LineBasicMaterial( { vertexColors: true, blending: THREE.AdditiveBlending } );
            return new THREE.Line( geometry, material );

        case 'gaze':
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