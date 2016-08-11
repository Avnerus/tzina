export default class TimeController {
    constructor(config, element, square) {
        this.square = square;
        this.config = config;
        this.element = element;
        
        this.rotateVelocity = 0;
    }
    init() {
        console.log("Initializing Time Controller", this.element)
        document.addEventListener("mousemove", (e) => {this.handleMouseMove(e)})
    }

    update(dt) {
        if (this.rotateVelocity != 0) {
            this.square.mesh.rotateY(this.rotateVelocity * Math.PI /180 * dt * 10);
        }
    }

    handleMouseMove(e) {
        //console.log("Time move! ", e.pageX + "/" + this.element.offsetWidth);
        if (e.pageX > this.element.offsetWidth * 2 / 3) {
            this.rotateVelocity = (e.pageX - this.element.offsetWidth * 2 /3) / (this.element.offsetWidth / 3);
            console.log("Time velocity: " + this.rotateVelocity);
        } else if (e.pageX < this.element.offsetWidth / 3) {
            this.rotateVelocity = (this.element.offsetWidth / 3 - e.pageX) / (this.element.offsetWidth / 3) * -1;
            console.log("Time velocity: " + this.rotateVelocity);
        } else {
            this.rotateVelocity = 0;
        }
    } 
}
