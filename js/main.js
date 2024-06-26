console.log('°°°°Initial Development by Studio Krom,  v2 °°°°');

import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory';
import { Button } from './button.js'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Rule03 } from './rule_03.js'
import { Rule02 } from './rule_02.js';
import { Rule01 } from './rule_01.js';
import ThreeMeshUI from 'three-mesh-ui';
import Block from 'three-mesh-ui/src/components/Block.js';
import Text from 'three-mesh-ui/src/components/Text.js';



import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

let camera, scene, renderer, controls, composer;
let UIcontainer;
let UIBlockRight;

const params = {
    exposure: 1.0,
    bloomStrength: 1.2,
    bloomThreshold: 0,
    bloomRadius: 0,
    autoRotate: true
};



let viewer = false;
let controllerGripL, controllerGripR;
let controller1, controller2;
let controllers = [];
let meshes = [];
const dotGeo = new THREE.SphereGeometry( 0.004, 32, 16 );
const material = new THREE.MeshBasicMaterial( { color: 0xff0000} );
const dotL = new THREE.Mesh( dotGeo, material );
const dotR = new THREE.Mesh( dotGeo, material );

let controllUpdateTimer = 0;
let drawings = [];
let activeDrawing = null;
let editRights = true;
let drawingTitle;
let savingInProgress = false;
let interactionOccuredL = false;
let interactionOccuredR = false;
let UIText = new Text({content: "Druk A voor de volgende sculptuur en \n B voor de vorige\n \nDruk twee keer X om een nieuwe tekening te maken \n Druk Y om op te slaan"});
// let UITextRight = new Text({content: "A = Volgende\n B = Vorige",fontSize:0.03});
let first_press = false;


let activeRule = 1;
const urlParams = new URLSearchParams(window.location.search);
if(urlParams.get('rule')){
    activeRule = parseInt(urlParams.get('rule'));
}
if(urlParams.get('viewer')){
   viewer = (urlParams.get('viewer').toLowerCase() === 'true');
}

init();

function init(){
    let canvas = document.getElementById('canvas');
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x000000);
    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 20 );
    camera.position.set( 0, 1.6, 5 );
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
    renderer.shadowMap.enabled = true;




    UIcontainer = new Block({
        width: 1.0,
        height: 0.6,
        padding: 0.05,
        fontFamily: './assets/Roboto-msdf.json',
        fontTexture: './assets/Roboto-msdf.png',
        borderWidth: 0.5
       });
    UIcontainer.position.set(camera.position.x, camera.position.y, -0.4);

    
    UIcontainer.add( UIText );

    let setupControllersP;
    


 
    if(!viewer){
        renderer.xr.enabled = true;
        document.body.appendChild( VRButton.createButton( renderer ) );
       
        scene.add(dotL);
        scene.add(dotR);
        scene.add( UIcontainer );
      //  scene.add( UIBlockRight );
        setupControllersP = new Promise((resolve) => {
        setupControllers(resolve);
    });


    }
    else{
        ////////////////BLOOM, GUI, TEXT
        renderer.toneMapping = THREE.ReinhardToneMapping;

        const renderScene = new RenderPass( scene, camera );
    
        const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
        bloomPass.threshold = params.bloomThreshold;
        bloomPass.strength = params.bloomStrength;
        bloomPass.radius = params.bloomRadius;
    
        composer = new EffectComposer( renderer );
        composer.addPass( renderScene );
        composer.addPass( bloomPass );
    
    
        const gui = new GUI();
        
            gui.add( params, 'exposure', 0.1, 2 ).onChange( function ( value ) {
                        renderer.toneMappingExposure = Math.pow( value, 4.0 );
                    } );
            gui.add( params, 'bloomThreshold', 0.0, 1.0 ).onChange( function ( value ) {
                        bloomPass.threshold = Number( value );
                    } );
            gui.add( params, 'bloomStrength', 0.0, 3.0 ).onChange( function ( value ) {
                        bloomPass.strength = Number( value );
                    } );
            gui.add( params, 'bloomRadius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {
                        bloomPass.radius = Number( value );
                    } );
            gui.add( params, 'autoRotate').onChange( function () {
                        if (controls.autoRotate)
                       { controls.autoRotate=false}else{controls.autoRotate=true}
                    })
    
   
        controls = new OrbitControls( camera, renderer.domElement );
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.1;
        controls.minDistance = 0;
        controls.maxDistance = 10;
        scene.add( UIcontainer );
        
    }
   

    let getDrawingsP = new Promise((resolve) => {
        getDrawings(resolve);
    });
    Promise.all([setupControllersP, getDrawingsP]).then(data =>{
        animate();
        if(viewer){
            loadDrawing(true);
        }
    });
}

function animate(){
    renderer.setAnimationLoop( render );
}

function render() {
    ThreeMeshUI.update();
    if(!viewer){
        updateControllers();
        updateMeshes();
        renderer.render( scene, camera );
    }else{ 
        composer.render( scene, camera ); 
    }
   
}

function startMesh(handedness){
    if(handedness == "left"){
        interactionOccuredL = true;
    }
    else{
        interactionOccuredR = true;
    }
    
    switch (activeRule) {
        case 1:
            addShapeToScene(new Rule01());
            break;
        case 2:
            addShapeToScene(new Rule02());
            break;
        case 3:
            addShapeToScene(new Rule03());
            break;
    }
    for(let i = 0; i < controllers.length; i++){
        if(controllers[i].handedness == handedness){
            controllers[i].activeMesh = meshes.length -1;
        }
    }
}

function updateMeshes(){
    for(let i = 0; i < controllers.length; i++){
        if(controllers[i].activeMesh != null){
            let other = 1;
            if(i == 1){
                other = 0;
            }
            meshes[controllers[i].activeMesh].update(controllers[i].position, controllers[other].position,controllers[i].drawingSpeed.velocity);
            if(meshes[controllers[i].activeMesh].checkMemory()){
                let oldMesh = controllers[i].activeMesh;
                startMesh(controllers[i].handedness);
                updateBrokenShape(controllers[i].handedness,meshes[oldMesh]);
            }
        }
    }
}

function updateBrokenShape(handedness, oldMesh){
    let number = 4;
    let pos = oldMesh.positions.slice(oldMesh.positions.length - (number*3) );
    let lw;
    if(Array.isArray(oldMesh.lineWidth)){
        lw = oldMesh.lineWidth.slice(oldMesh.lineWidth.length - number);
    }
    else{
        lw = oldMesh.lineWidth;
    }
    for(let i = 0; i < controllers.length; i++){
        if(controllers[i].handedness == handedness){
            meshes[controllers[i].activeMesh].startBrokenShape(pos, lw);
        }
    }
}

function stopMesh(handedness){
    for(let i = 0; i < controllers.length; i++){
        if(controllers[i].handedness == handedness){
            controllers[i].activeMesh = null;
        }
    }
}

function saveDrawing(){
    if(!savingInProgress){
        if(activeDrawing == null || editRights){
            savingInProgress = true;
            let shapesCollection = [];
            for(let i = 0; i < meshes.length; i++){
                let shapeObject = saveShape(meshes[i]);
                shapesCollection.push(shapeObject);
            }
            let jsonDrawing = {
                shapes: shapesCollection,
                editable: 1,
            }
            let request = new XMLHttpRequest();
            const formData = new FormData();
            formData.append('drawing', JSON.stringify(jsonDrawing));
            if(activeDrawing == null){
                formData.append('id', 'new');
            }
            else if(editRights){
                formData.append('id', drawings[activeDrawing]);
            }
            request.open("POST", "php/saveData.php", true);
            request.send(formData);
            request.onload = function(){
                if(activeDrawing == null){
                    let updateIDP = new Promise((resolve) => {
                        getDrawings(resolve);
                        
                    });
                    updateIDP.then((value) => {
                        activeDrawing = drawings.length -1;
                    }); 
                }
                savingInProgress = false;
                interactionOccuredL = false;
                interactionOccuredR = false;
            }
        }
        else if(!editRights){
            console.log('no edit rights to this drawing');
        }
    }
    else{
        console.log('saving in progress');
    }
}

function saveShape(obj){
    let shapeObject;
    switch (obj.rule) {
        case 1: case 2:
            shapeObject = {
                rule: obj.rule,
                points: obj.positions,
            }
            return shapeObject;
        case 3:
            shapeObject = {
                rule: obj.rule,
                points: obj.positions,
                lineWidths: obj.lineWidth
            }
            return shapeObject;
        default:
            return [];
    }
}

function getDrawings(p){
    let request = new XMLHttpRequest();
    request.open('get', 'php/getDrawings.php', true);
    request.send();
    request.onload = function(){
        drawings = [];
        let data = JSON.parse(this.responseText);
        for(let i = 0; i < data.length; i++){
            drawings.push(data[i]);
        }
        p();
    }
}

function loadDrawing(direction){
    if(activeDrawing != null){
        if(direction){
            activeDrawing++;

            if(activeDrawing > drawings.length - 1){
                activeDrawing = 0;
            }

        }
        else{
            activeDrawing--;
            if(activeDrawing < 0){
                activeDrawing = drawings.length - 1;
            }
        }
    }
    else{
        if(direction){
            activeDrawing = 0;
        }
        else{
            activeDrawing = drawings.length - 1;
        }  
    }
    


    let request = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('id', drawings[activeDrawing]);
    request.open('POST', 'php/getData.php', true);
    request.send(formData);
    request.onload = function(){
        clearScene();
        let data = JSON.parse(this.responseText);
        if (data.title ){ drawingTitle = data.title}else{drawingTitle = activeDrawing.toString()}
        if(data.editable == 1){
            editRights = true;
        }
        else{
            editRights = false;
        }
        drawDrawing(JSON.parse(data['shapes']));
        interactionOccuredL = false;
        interactionOccuredR = false;
        UIText.set({content:
            drawingTitle
        })
    }
}

function drawDrawing(drawing){
    for(const shape of drawing){
        switch (shape.rule) {
            case 1:
                addShapeToScene(new Rule01(shape.points));
                break;
            case 2:
                addShapeToScene(new Rule02(shape.points));
                break;
            case 3:
                addShapeToScene(new Rule03(shape.points, shape.lineWidths));
                break;
        }
    }
}

function addShapeToScene(shape){
    scene.add(shape.mesh);
    meshes.push(shape);
}

function newFile(){
    activeDrawing = null;
    editRights = true;
    clearScene();
    interactionOccuredL = false;
    interactionOccuredR = false;
}

function clearScene(){
    for(let i = 0; i < meshes.length; i++){
        scene.remove(meshes[i].mesh); 
    }
    if(!viewer){
        controllers[0].activeMesh = null;
        controllers[1].activeMesh = null;
    }
    meshes = [];
}

function updateControllers(){
    const session = renderer.xr.getSession();
    let controllerCount = 0;
    if (session) {
        for (const source of session.inputSources) {
            if(controllerCount == 0){
                dotL.position.x = controllers[0].position.x;
                dotL.position.y = controllers[0].position.y;
                dotL.position.z = controllers[0].position.z;
                if(controllUpdateTimer == 0){
                    controllers[0].drawingSpeed.velocity = updateLineWidth(controllers[0].drawingSpeed.velocity,controllers[0].position.distanceTo(controllers[0].drawingSpeed.lastPoint));
                    controllers[0].drawingSpeed.lastPoint = new THREE.Vector3(controllers[0].position.x, controllers[0].position.y,controllers[0].position.z);
                }
                controllers[0].buttons[0].update(source.gamepad.buttons[0].pressed);
                controllers[0].buttons[1].update(source.gamepad.buttons[1].pressed);
                controllers[0].buttons[2].update(source.gamepad.buttons[3].pressed);
                controllers[0].buttons[3].update(source.gamepad.buttons[4].pressed);
                controllers[0].buttons[4].update(source.gamepad.buttons[5].pressed);
                

                // positioning UI Text above controller
               /* UIBlockRight.position.x = controllers[0].position.x;
                UIBlockRight.position.y = controllers[0].position.y + 0.2;
                UIBlockRight.position.z = controllers[0].position.z;
                UIBlockRight.rotation.x = controllers[0].rotation.x;
                UIBlockRight.rotation.y = controllers[0].rotation.y;
                UIBlockRight.rotation.z = controllers[0].rotation.z;*/
                
            }
            else if(controllerCount == 1){
                dotR.position.x = controllers[1].position.x;
                dotR.position.y = controllers[1].position.y;
                dotR.position.z = controllers[1].position.z
                if(controllUpdateTimer == 0){
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
    controllUpdateTimer++;
    if(controllUpdateTimer > 5){
        controllUpdateTimer = 0;
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

function setupControllers(p){
    let controllerSetupLeft = [new Button(triggerPressL,triggerReleaseL, 'triggerDown'),new Button(null, null, 'sideTriggerDown'),new Button(null, null,'thumbstickPress'),new Button(xPress, null,'x'),new Button(yPress, null,'y')];
    let controllerSetupRight = [new Button(triggerPressR,triggerReleaseR, 'triggerDown'),new Button(null, null, 'sideTriggerDown'),new Button(null, null,'thumbstickPress'),new Button(aPress, null,'a'),new Button(bPress, null,'b')];
    let controller1Promise = new Promise((resolve) => {
        controller1 = renderer.xr.getController(0);
        controller1.addEventListener('connected', function(event){
            this.add(buildController(event.data));
            const session = renderer.xr.getSession();
            if(session.inputSources[0].handedness == 'left'){
                this.handedness = 'left';
                this.buttons = controllerSetupLeft;
            }
            else{
                this.handedness = 'right';
                this.buttons = controllerSetupRight;
            }
            this.activeMesh = null;
            resolve();
        });
        controller1.addEventListener('disconnected', function(){
            this.remove(this.children[0]);
        } );
        controller1.drawingSpeed = {
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
                this.handedness = 'left';
                this.buttons = controllerSetupLeft;
            }
            else{
                this.handedness = 'right';
                this.buttons = controllerSetupRight;
            }
            this.activeMesh = null;
            resolve(); 
        });
        controller2.addEventListener('disconnected', function(){
            this.remove(this.children[0]);
        });
        controller2.drawingSpeed = {
            lastPoint: new THREE.Vector3(0,0,0),
            velocity: 0
        }
        controllers.push(controller2);
    });

    //Add controller models
    controllerGripL = renderer.xr.getControllerGrip(0);
    controllerGripL.add(dotL);
    scene.add(controllerGripL);

    controllerGripR = renderer.xr.getControllerGrip(1);
    controllerGripR.add(dotR);
    // controllerGripR.add( controllerModelFactory.createControllerModel(controllerGripR));
    scene.add(controllerGripR);

    Promise.all([controller1Promise, controller2Promise]).then(data =>{
        p();
    });
}

function buildController( data ) {
    let geometry, material;
    switch ( data.targetRayMode ) {
        case 'tracked-pointer':
            console.log('trackedf');
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


function triggerPressL(){
    switch (activeRule) {
        case 1:
            for(let i = 0; i < controllers.length; i++){
                if(controllers[i].activeMesh != null){
                    break;
                }
            }
            startMesh("left");
            break;
        case 2:
            for(let i = 0; i < controllers.length; i++){
                if(controllers[i].handedness == "left"){
                    if(controllers[i].activeMesh == null && !interactionOccuredL){
                        startMesh("left");
                    }
                    else{
                        stopMesh("left");
                    }
                }
            }
            break;
        case 3:
            startMesh("left");
            break;
    }
}

function triggerPressR(){
    switch (activeRule) {
        case 1:
            for(let i = 0; i < controllers.length; i++){
                if(controllers[i].activeMesh != null){
                    break;
                }
            }
            startMesh("right");
            break;
        case 2:
            for(let i = 0; i < controllers.length; i++){
                if(controllers[i].handedness == "right"){
                    if(controllers[i].activeMesh == null && !interactionOccuredR){
                        startMesh("right");
                    }
                    else{
                        stopMesh("right");
                    }
                }
            }
            break;
        case 3:
            startMesh("right");
            break;
    }
}

function triggerReleaseL(){
    switch (activeRule) {
        case 1:
            stopMesh("left");
            break;
        case 2:
            
            break;
        case 3:
            stopMesh("left");
            break;
    }
}

function triggerReleaseR(){
    switch (activeRule) {
        case 1:
            stopMesh("right");
            break;
        case 2:
            
            break;
        case 3:
            stopMesh("right");
            break;
    }
}

function xPress(){
    //DoubleClick Safeguard
    if(first_press) {
        newFile();
        first_press = false;
    } else {
        first_press = true;
        window.setTimeout(function() { first_press = false; }, 500);
    }
}

function yPress(){
    saveDrawing();
}

function aPress(){
    loadDrawing(true);
}

function bPress(){
    loadDrawing(false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

//Eventlisteners

window.addEventListener( 'resize', onWindowResize );

document.addEventListener("keydown", function(event) {
    if(event.key == 's'){
        saveDrawing();
    }
    if(event.key == 'ArrowLeft'){
        loadDrawing(true);
    }
    if(event.key == 'ArrowRight'){
        loadDrawing(false);
    }
    if(event.key == 'c'){
        newFile();
    }
    if(event.key == 'e'){ 
         exportGLTF(scene);
    }
})

function exportGLTF( input ) {
    const exporter = new GLTFExporter();
    const gltfExporter = new GLTFExporter();
    const options = {
    };
    gltfExporter.parse( input, function ( result ) {

        if ( result instanceof ArrayBuffer ) {
            saveArrayBuffer( result, 'scene.glb' );
        } 
        else {
            const output = JSON.stringify( result, null, 2 );
            saveString( output, 'scene.gltf' );
        }
    }, options );
}

function save( blob, filename ) {    
    const link = document.createElement('a');
    link.style.display = 'none';
    document.body.appendChild( link ); // Firefox workaround, see #6594
    link.href = URL.createObjectURL( blob );
    link.download = filename;
    link.click();
    // URL.revokeObjectURL( url ); breaks Firefox...
}

function saveString( text, filename ) {
    save( new Blob( [ text ], { type: 'text/plain' } ), filename );
}

function saveArrayBuffer( buffer, filename ) {
    save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );
}

