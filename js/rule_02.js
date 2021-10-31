import * as THREE from 'three';
import { MeshLine, MeshLineMaterial } from './MeshLine.js';

class Rule02 {
    constructor(points){
        if(points == undefined){
            this.rule = 2;
            this.positions = []; 
            this.lineWidth = 1;
            const line  = new MeshLine();
            const material = new MeshLineMaterial();
            this.mesh = new THREE.Mesh(line, material)
        }
        else{
            this.rule = 2;
            this.positions = points; 
            this.lineWidth = 1;
            const line  = new MeshLine();
            line.setPoints(this.positions.flat(), p => this.lineWidth);
            const material = new MeshLineMaterial();
            this.mesh = new THREE.Mesh(line, material)
        }
    }
    update(pos, speed){
        this.positions.push(pos.x);
        this.positions.push(pos.y);
        this.positions.push(pos.z);
        this.mesh.geometry.setPoints(this.positions, p => this.lineWidth);
        if(this.positions.length > 1000){
            return true;
        }
        else{
            return false;
        }
    }
}
export {Rule02};


