export default class Pidgeon extends THREE.Object3D{
  constructor(scene){
    super(scene);
  }
  init(camera) {
    this.camera=camera;
    this.socketController=socketController;
    console.log("pidgeon",Pidgeon.geometry);
    this.mesh = new THREE.Mesh(Pidgeon.geometry,Pidgeon.material);
    this.add(this.mesh);
  }
  update(deltaTime){
    console.log("update"+deltaTime);
    console.log(camera.position);
    //poll camera
  }
  static initMesh(){
    console.log("pidgeon init mesh");
    //initialize graphics, create mesh?
    this.geometry = new THREE.BoxGeometry(10,10,10);
    this.material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );

  }
}