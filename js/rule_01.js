import * as THREE from 'three';

class Rule01 {
    constructor(points){
        this.rule = 1;
        this.maxPoints = 4000;
        this.linewidth = 2;
        this.material = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: this.linewidth} );
        let bufferAttribute;
        let geometry = new THREE.BufferGeometry();
    
        if(points == undefined){
            this.positions = [];
            bufferAttribute = new THREE.BufferAttribute(new Float32Array(this.maxPoints*3), 3 )
            this.drawCount = 0;
            this.indexCount = 0;
        }
        else{
            this.positions = new Float32Array(points);
            bufferAttribute = new THREE.BufferAttribute( this.positions, 3 );
            this.drawCount = points.length/3;
            this.indexCount = points.length;
        }
        geometry.setAttribute('position', bufferAttribute);
        geometry.setDrawRange(0, this.drawCount);
        this.mesh = new THREE.LineSegments( geometry, this.material); 
    }

    update(pos, pos2, speed){
        this.positions.push(pos2.x);
        this.positions.push(pos2.y);
        this.positions.push(pos2.z);
        this.positions.push(pos.x);
        this.positions.push(pos.y);
        this.positions.push(pos.z);

        const position =  this.mesh.geometry.attributes.position.array;

        position[this.indexCount++] = pos2.x;
        position[this.indexCount++] = pos2.y;
        position[this.indexCount++] = pos2.z;

        position[this.indexCount++] = pos.x;
        position[this.indexCount++] = pos.y;
        position[this.indexCount++] = pos.z;
            
        this.drawCount += 2;
        this.mesh.geometry.setDrawRange(0,this.drawCount);
        this.mesh.geometry.attributes.position.needsUpdate = true; 
        this.mesh.geometry.computeBoundingBox();
        this.mesh.geometry.computeBoundingSphere();
    }

    startBrokenShape(pos, lineWidth){
        this.positions = this.positions.concat(pos);
    }

    checkMemory(){
        if(this.positions.length > this.maxPoints){
            return true;
        }
        else{
            return false;
        }
    }
}
export {Rule01};


