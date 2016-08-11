export default {
    drawCurve: function(curve, color) {
        let geo = new THREE.Geometry();
        for (let i = 0; i <= 1; i += 0.01) {
            geo.vertices.push(curve.getPoint(i));
        }
        let mat = new THREE.LineBasicMaterial({color: color});
        return (new THREE.Line(geo, mat));
    },
    adjustableCube: function(position,name, size, color) {
        let geometry = new THREE.BoxGeometry( size, size, size );
        let material = new THREE.MeshBasicMaterial( {color: color} );
        let cube = new THREE.Mesh( geometry, material );
        cube.position.copy(position);
        events.emit("add_gui", {folder:name}, cube.position, "x"); 
        events.emit("add_gui", {folder:name}, cube.position, "y"); 
        events.emit("add_gui", {folder:name}, cube.position, "z"); 
        return cube;
    }
}
