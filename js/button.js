class Button {
    constructor(trigger, release, sort){
        this.trigger = trigger;
        this.release = release;
        this.pressed = false;
        this.previousState = false;
        this.sort = sort;
    }
    update(state){
        this.previousState = this.pressed;
        this.pressed = state;
        if(this.pressed != this.previousState){
            if(this.pressed){
                if(typeof this.trigger === "function"){
                    this.trigger();
                }
            }
            else{
                if(typeof this.release === "function"){
                    this.release();
                }
            }
        }
    }
}

export {Button};