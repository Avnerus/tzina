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
    },
    positionObject: function(object, name, angles) {
        events.emit("add_gui", {folder:name + " - Position"}, object.position, "x"); 
        events.emit("add_gui", {folder:name + " - Position"}, object.position, "y"); 
        events.emit("add_gui", {folder:name + " - Position"}, object.position, "z"); 

        if (angles) {
            object.angleRotation = {x: angles[0], y: angles[1], z: angles[2]};
        } else {
            object.angleRotation = {x: 0, y: 0, z: 0};
        }
        events.emit("add_gui", {
                    folder:name + " - Rotation",
                    onChange: () => {object.rotation.x = object.angleRotation.x * Math.PI / 180}
        }, object.angleRotation, "x"); 
        events.emit("add_gui", {
                    folder:name + " - Rotation",
                    onChange: () => {object.rotation.y = object.angleRotation.y * Math.PI / 180}
        }, object.angleRotation, "y"); 
        events.emit("add_gui", {
                    folder:name + " - Rotation",
                    onChange: () => {object.rotation.z = object.angleRotation.z * Math.PI / 180}
        }, object.angleRotation, "z");

        events.emit("add_gui", {folder:name + " - Scale"}, object.scale, "x"); 
        events.emit("add_gui", {folder:name + " - Scale"}, object.scale, "y"); 
        events.emit("add_gui", {folder:name + " - Scale"}, object.scale, "z");
    },

    fastForward : function(video) {
        video.currentTime = video.duration - 5;        
    }
}
