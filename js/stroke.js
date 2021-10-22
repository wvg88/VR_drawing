import * as THREE from 'three';
import { MeshLine, MeshLineMaterial } from '../js/MeshLine.js';

class Stroke {
    constructor(points){
        if(points == undefined){
            this.positions = []; 
            this.lineWidths = [];
            const line  = new MeshLine();
            line.setPoints(this.positions);
            const material = new MeshLineMaterial();
            this.mesh = new THREE.Mesh(line, material)
        }
        else{
            let geometry = new THREE.BufferGeometry(); 
            geometry.setAttribute('position', new THREE.BufferAttribute( Float32Array.from(points), 3 ) );
            this.drawCount = points.length/3;
            this.indexCount = points.length;
            geometry.setDrawRange(0, this.drawCount);
            this.material = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 1} );
            this.mesh = new THREE.Line( geometry, this.material); 
        }
    }
    update(pos, lw){
        this.positions.push(pos.x);
        this.positions.push(pos.y);
        this.positions.push(pos.z);
        this.lineWidths.push(lw);
        let count = 0;
        this.mesh.geometry.setPoints(this.positions.flat(), p => this.lineWidths[count++]);
    }
}
export {Stroke};