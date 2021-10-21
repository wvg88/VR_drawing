import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory';
import {Stroke} from './stroke.js'
import {Button} from './button.js'
import { Vector3 } from 'three';

let camera, scene, renderer;
let controllerGripL, controllerGripR;
let controller1, controller2;
let controllers = [];
let strokes = [];
let updateTimer = 0;

//eventListeners
window.addEventListener( 'resize', onWindowResize );

init();

function init(){
    let canvas = document.getElementById('canvas');

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x000000);

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
    // renderer.outputEncoding = THREE.sRGBEncoding;
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

function addLine(points){
    let l = new Stroke(points);
    scene.add(l.shape);
    strokes.push(l);
}

function clearLines(){
    for(let i = 0; i < strokes.length; i++){
        scene.remove(strokes[i].shape); 
    }
    strokes = [];
}

function saveDrawing(){
    let jsonDrawing = [];
    for(let i = 0; i < strokes.length; i++){
        let jsonObject = {
            sort: 'Line',
            points: Array.from(strokes[i].shape.geometry.attributes.position.array.slice(0, strokes[i].indexCount))
        }
        jsonDrawing.push(jsonObject);
    }
    let xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('drawing', JSON.stringify(jsonDrawing));
    xhr.open("POST", "php/saveData.php", true);
    xhr.send(formData);
}

function loadDrawing(){
    var request = new XMLHttpRequest();
    request.open('get', 'php/getData.php', true);
    request.send();
    request.onload = function(){
        clearLines();
        var data = JSON.parse(this.responseText);
        for(const d of data){
            let shapes = JSON.parse(d.shapes);
            for(const l of shapes){
                if(l.sort == 'Line'){
                    addLine(l.points);
                }
            }
        }
    }
}

document.addEventListener("keydown", function(event) {
    if(event.key == 's'){
        saveDrawing();
    }
    if(event.key == 'o'){
        loadDrawing();
    }
})

function updateControllers(){
    const session = renderer.xr.getSession();
    let controllerCount = 0;
    if (session) {
        for (const source of session.inputSources) {
            if(controllerCount == 0){ 
                if(updateTimer == 0){
                    controllers[0].drawingSpeed.velocity = controllers[0].position.distanceTo(controllers[0].drawingSpeed.lastPoint);
                    controllers[0].drawingSpeed.lastPoint = new THREE.Vector3(controllers[0].position.x, controllers[0].position.y,controllers[0].position.z);
                }
                controllers[0].buttons[0].update(source.gamepad.buttons[0].pressed);
                controllers[0].buttons[1].update(source.gamepad.buttons[1].pressed);
                controllers[0].buttons[2].update(source.gamepad.buttons[3].pressed);
                controllers[0].buttons[3].update(source.gamepad.buttons[4].pressed);
                controllers[0].buttons[4].update(source.gamepad.buttons[5].pressed);
            }
            else if(controllerCount == 1){
                if(updateTimer == 0){
                    controllers[1].drawingSpeed.velocity = controllers[1].position.distanceTo(controllers[0].drawingSpeed.lastPoint);
                    controllers[1].drawingSpeed.lastPoint = new THREE.Vector3(controllers[0].position.x, controllers[0].position.y,controllers[0].position.z);
                }
                controllers[1].buttons[0].update(source.gamepad.buttons[0].pressed);
                controllers[1].buttons[1].update(source.gamepad.buttons[1].pressed);
                controllers[1].buttons[2].update(source.gamepad.buttons[3].pressed);
                controllers[1].buttons[3].update(source.gamepad.buttons[4].pressed);
                controllers[1].buttons[4].update(source.gamepad.buttons[5].pressed);
            }
            controllerCount++;
        }
    }
    for(let i = 0; i < controllers.length; i++){
        if(controllers[i].buttons[0].pressed){
            if(strokes.length > 0){
                strokes[strokes.length-1].update(controllers[i].position);
            }
        }
    }
    updateTimer++;
    if(updateTimer > 5){
        updateTimer = 0;
    }
}

function setupControllers(){
    let controller1Promise = new Promise((resolve) => {
        controller1 = renderer.xr.getController(0);
        controller1.addEventListener('connected', function(event){
            this.add(buildController(event.data));
            const session = renderer.xr.getSession();
            if(session.inputSources[0].handedness == 'left'){
                this.buttons = [new Button(startLine, 'triggerUp'),new Button(null, 'triggerDown'),new Button(null,'thumbstickPress'),new Button(clearLines,'x'),new Button(null,'B')];;
            }
            else{
                this.buttons = [new Button(startLine, 'triggerUp'),new Button(null,'triggerDown'),new Button(null,'thumbstickPress'),new Button(null,'A'),new Button(null,'y')];;
            }
            resolve();
        });
        controller1.addEventListener('disconnected', function(){
            this.remove(this.children[0]);
        } );
        controller1.drawingSpeed = {
            lastUpdate: new Date(),
            lastPoint: new THREE.Vector3(0,0,0),
            velocity: 0
        }
        controllers.push(controller1);
    });
    
    let controller2Promise = new Promise((resolve) => {
        controller2 = renderer.xr.getController(1);
        controller2.addEventListener('connected', function(event){
            this.add(buildController(event.data));
            const session = renderer.xr.getSession();
            if(session.inputSources[1].handedness == 'left'){
                this.buttons = [new Button(startLine, 'triggerUp'),new Button(null, 'triggerDown'),new Button(null,'thumbstickPress'),new Button(clearLines,'x'),new Button(null,'B')];;
            }
            else{
                this.buttons = [new Button(startLine, 'triggerUp'),new Button(null,'triggerDown'),new Button(null,'thumbstickPress'),new Button(null,'A'),new Button(null,'y')];;
            }
            resolve(); 
        });
        controller2.addEventListener('disconnected', function(){
            this.remove(this.children[0]);
        });
        controller2.drawingSpeed = {
            lastUpdate: new Date(),
            lastPoint: new THREE.Vector3(0,0,0),
            velocity: 0
        }
        controllers.push(controller2);
    });

    Promise.all([controller1Promise, controller2Promise]).then(data =>{
        animate();
    });

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