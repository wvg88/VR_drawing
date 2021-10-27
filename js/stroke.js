import * as THREE from 'three';
import { MeshLine, MeshLineMaterial } from '../js/MeshLine.js';

class Stroke {
    constructor(points , lineWidths){
        if(points == undefined){
            this.rule = 3;
            this.positions = []; 
            this.lineWidths = [];
            const line  = new MeshLine();
            line.setPoints(this.positions);
            const material = new MeshLineMaterial();
            this.mesh = new THREE.Mesh(line, material)
        }
        else{
            this.rule = 3;
            this.positions = points; 
            this.lineWidths = lineWidths;
            const line  = new MeshLine();
            let count = 0;
            line.setPoints(this.positions.flat(), p => this.lineWidths[count++]);
            const material = new MeshLineMaterial();
            this.mesh = new THREE.Mesh(line, material)
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