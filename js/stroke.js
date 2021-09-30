import * as THREE from 'three';
class Stroke {
    constructor(){
        const MAX_POINTS = 2000;
        let geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(MAX_POINTS*3); 
        geometry.setAttribute('position', new THREE.BufferAttribute( positions, 3 ) );
        geometry.setDrawRange(0, this.drawCount);
        this.material = new THREE.LineBasicMaterial( { color: 0xFF0000, linewidth: 2} );
        this.shape = new THREE.Line( geometry, this.material); 
        this.drawCount = 0;
        this.indexCount = 0;
    }
    update(pos){
        const position =  this.shape.geometry.attributes.position.array;
        position[this.indexCount++] = pos.x;
        position[this.indexCount++] = pos.y;
        position[this.indexCount++] = pos.z;
        this.drawCount++;
        this.shape.geometry.setDrawRange(0,this.drawCount);
        this.shape.geometry.attributes.position.needsUpdate = true; 
        this.shape.geometry.computeBoundingBox();
        this.shape.geometry.computeBoundingSphere();
    }
}

export {Stroke};