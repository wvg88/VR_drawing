class Button {
    constructor(activation, sort){
        this.activation = activation;
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
                    this.activation();
                }
            }
        }
    }
}

export {Button};