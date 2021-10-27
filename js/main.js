import * as THREE from 'three';
import { MeshLine, MeshLineMaterial } from '../js/MeshLine.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory';
import {Stroke} from './stroke.js'
import {Button} from './button.js'

var camera, scene, renderer;
var controllerGripL, controllerGripR;
var controller1, controller2;
var controllers = [];
var strokes = [];
var updateTimer = 0;
var drawings = [];
var activeDrawing = null;
var editRights = true;

//eventListeners
window.addEventListener( 'resize', onWindowResize );

init();

function init(){
    getDrawings();
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
    scene.add(l.mesh);
    strokes.push(l);
}

function newFile(load){
    if(!load){
        activeDrawing = null;
        editRights = true;
    }
    for(let i = 0; i < strokes.length; i++){
        scene.remove(strokes[i].mesh); 
    }
    strokes = [];
}

function saveDrawing(){
    if(editRights){
        if(activeDrawing == null){
            let shapesCollection = [];
            for(let i = 0; i < strokes.length; i++){
                let shapeObject = saveShape(strokes[i]);
                shapesCollection.push(shapeObject);
            }
            let jsonDrawing = {
                shapes: shapesCollection,
                editable: 1,
            }
            let xhr = new XMLHttpRequest();
            const formData = new FormData();
            formData.append('drawing', JSON.stringify(jsonDrawing));
            xhr.open("POST", "php/saveData.php", true);
            xhr.send(formData);
        }
        else{

        }
        
    }
}

function saveShape(obj){
    if(obj.rule == 1){

    }
    else if(obj.rule == 2){
        
    }
    else if(obj.rule == 3){
        let shapeObject = {
            rule: obj.rule,
            points: obj.positions,
            lineWidths: obj.lineWidths
        }
        return shapeObject;
    }
    else{
        return [];
    }
}


function getDrawings(){
    let request = new XMLHttpRequest();
    request.open('get', 'php/getDrawings.php', true);
    request.send();
    request.onload = function(){
        let data = JSON.parse(this.responseText);
        for(let i = 0; i < data.length; i++){
            drawings.push(data[i]);
        }
    }
}

function loadDrawing(direction){
    if(activeDrawing != null){
        if(direction){
            activeDrawing++;
            if(activeDrawing > drawings.length -1){
                activeDrawing = 0;
            }
        }
        else{
            activeDrawing--;
            if(activeDrawing < 0){
                activeDrawing = drawings.length -1;
            }
        }
    }
    else{
        activeDrawing = 0;
    }
    let request = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('id', drawings[activeDrawing]);
    request.open('POST', 'php/getData.php', true);
    request.send(formData);
    request.onload = function(){
        newFile(true);
        let data = JSON.parse(this.responseText);
        if(data.editable == 1){
            editRights = true;
        }
        else{
            editRights = false;
        }
        drawDrawing(JSON.parse(data['shapes']));
    }
}

function drawDrawing(drawing){
    for(const line of drawing){
       if(line.rule == 3){
            let l = new Stroke(line.points, line.lineWidths);
            scene.add(l.mesh);
            strokes.push(l);
       }
    }
}

document.addEventListener("keydown", function(event) {
    if(event.key == 's'){
        saveDrawing();
    }
    if(event.key == 'n'){
        loadDrawing(true);
    }
    if(event.key == 'p'){
        loadDrawing(false);
    }
})

function updateControllers(){
    const session = renderer.xr.getSession();
    let controllerCount = 0;
    if (session) {
        for (const source of session.inputSources) {
            if(controllerCount == 0){ 
                if(updateTimer == 0){
                    controllers[0].drawingSpeed.velocity = updateLineWidth(controllers[0].drawingSpeed.velocity,controllers[0].position.distanceTo(controllers[0].drawingSpeed.lastPoint));
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
                    controllers[1].drawingSpeed.velocity = updateLineWidth(controllers[1].drawingSpeed.velocity,controllers[1].position.distanceTo(controllers[1].drawingSpeed.lastPoint));
                    controllers[1].drawingSpeed.lastPoint = new THREE.Vector3(controllers[1].position.x, controllers[1].position.y,controllers[1].position.z);
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
                strokes[strokes.length-1].update(controllers[i].position, controllers[i].drawingSpeed.velocity);
            }
        }
    }
    updateTimer++;
    if(updateTimer > 5){
        updateTimer = 0;
    }
}

function updateLineWidth(a, b){
    b = b/4;
    let thickness;
    if(b > a){
        thickness = a + (0.2*(b-a));
    }
    else{
        thickness = a - (0.2*(a-b));
    }
    if(thickness > 0.05){
        thickness = 0.05;
    }
    else if (thickness < 0.002){
        thickness = 0.002;
    }
    return thickness;
}

function setupControllers(){
    let controllerSetupLeft = [new Button(startLine, 'triggerUp'),new Button(null, 'triggerDown'),new Button(null,'thumbstickPress'),new Button(newFile,'x'),new Button(null,'y')];
    let controllerSetupRight = [new Button(startLine, 'triggerUp'),new Button(null,'triggerDown'),new Button(null,'thumbstickPress'),new Button(null,'a'),new Button(null,'b')];
    let controller1Promise = new Promise((resolve) => {
        controller1 = renderer.xr.getController(0);
        controller1.addEventListener('connected', function(event){
            this.add(buildController(event.data));
            const session = renderer.xr.getSession();
            if(session.inputSources[0].handedness == 'left'){
                this.buttons = controllerSetupLeft;
            }
            else{
                this.buttons = controllerSetupRight;
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
            if(session.inputSources[0].handedness == 'left'){
                this.buttons = controllerSetupLeft;
            }
            else{
                this.buttons = controllerSetupRight;
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