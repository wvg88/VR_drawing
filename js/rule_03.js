import * as THREE from 'three';
import { MeshLine, MeshLineMaterial } from './MeshLine.js';

class Rule03 {
    constructor(points , lineWidth){
        this.rule = 3;
        this.maxPoints = 800;
        const line  = new MeshLine();
        const material = new MeshLineMaterial();
        if(points == undefined){
            this.positions = []; 
            this.lineWidth = [];
            this.mesh = new THREE.Mesh(line, material)
        }
        else{
            this.positions = points; 
            this.lineWidth = lineWidth;
            let count = 0;
            line.setPoints(this.positions.flat(), p => this.lineWidth[count++]);
            this.mesh = new THREE.Mesh(line, material)
        }
    }
    update(pos, pos2, speed){
        this.positions.push(pos.x);
        this.positions.push(pos.y);
        this.positions.push(pos.z);
        this.lineWidth.push(speed);
        let count = 0;
        this.mesh.geometry.setPoints(this.positions, p => this.lineWidth[count++]);
    }
    
    startBrokenShape(pos, lineWidth){
        this.positions = this.positions.concat(pos);
        this.lineWidth = this.lineWidth.concat(lineWidth);
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
export {Rule03};