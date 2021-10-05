import * as THREE from 'three';
class Stroke {
    constructor(points){

        if(points == undefined){
            const MAX_POINTS = 4000;
            let geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(MAX_POINTS*3); 
            geometry.setAttribute('position', new THREE.BufferAttribute( positions, 3 ) );
            this.drawCount = 0;
            this.indexCount = 0;
            geometry.setDrawRange(0, this.drawCount);
            this.material = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2} );
            this.shape = new THREE.Line( geometry, this.material); 

        }
        else{
            let geometry = new THREE.BufferGeometry(); 
            geometry.setAttribute('position', new THREE.BufferAttribute( Float32Array.from(points), 3 ) );
            this.drawCount = points.length/3;
            this.indexCount = points.length;
            geometry.setDrawRange(0, this.drawCount);
            this.material = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2} );
            this.shape = new THREE.Line( geometry, this.material); 
        }
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