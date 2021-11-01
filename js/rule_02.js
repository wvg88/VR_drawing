import * as THREE from 'three';
import { MeshLine, MeshLineMaterial } from './MeshLine.js';

class Rule02 {
    constructor(points){
        this.rule = 2;
        this.lineWidth = 0.012;
        this.maxPoints = 50;
        const line  = new MeshLine();
        const material = new MeshLineMaterial();
        if(points == undefined){
            this.positions = []; 
            this.mesh = new THREE.Mesh(line, material)
        }
        else{
            this.positions = points; 
            line.setPoints(this.positions.flat(), p => this.lineWidth);
            this.mesh = new THREE.Mesh(line, material)
        }
    }
    update(pos, pos2, speed){
        this.positions.push(pos.x);
        this.positions.push(pos.y);
        this.positions.push(pos.z);
        this.mesh.geometry.setPoints(this.positions, p => this.lineWidth);
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
export {Rule02};


