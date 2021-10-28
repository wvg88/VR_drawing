class Button {
    constructor(activation, sort, handedness){
        this.activation = activation;
        this.handedness = handedness;
        this.pressed = false;
        this.previousState = false;
        this.sort = sort;
    }
    update(state){
        this.previousState = this.pressed;
        this.pressed = state;
        if(this.pressed != this.previousState){
            if(this.pressed){
                if(typeof this.activation === "function"){
                    this.activation(this.handedness);
                }
            }
        }
    }
}

export {Button};