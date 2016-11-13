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
        events.emit("add_gui", {folder:name, step: 0.01}, cube.position, "x"); 
        events.emit("add_gui", {folder:name, step: 0.01}, cube.position, "y"); 
        events.emit("add_gui", {folder:name, step: 0.01}, cube.position, "z"); 
        return cube;
    },
    positionObject: function(object, name, listen = false, min=-50,max=50, angles) {
        console.log("Debug - position object ", name);
        events.emit("add_gui", {folder:name + " - Position", listen: listen, step: 0.01}, object.position, "x", min, max); 
        events.emit("add_gui", {folder:name + " - Position", listen: listen, step: 0.01}, object.position, "y", min, max * 2);
        events.emit("add_gui", {folder:name + " - Position", listen: listen, step: 0.001}, object.position, "z", min, max);

        if (angles) {
            object.angleRotation = {x: angles[0], y: angles[1], z: angles[2]};
        } else {
            object.angleRotation = {x: 0, y: 0, z: 0};
        }
        events.emit("add_gui", {
                    folder:name + " - Rotation",
                    onChange: () => {object.rotation.x = object.angleRotation.x * Math.PI / 180}
        }, object.angleRotation, "x", 0, 360); 
        events.emit("add_gui", {
                    folder:name + " - Rotation",
                    onChange: () => {object.rotation.y = object.angleRotation.y * Math.PI / 180}
        }, object.angleRotation, "y", 0, 360); 
        events.emit("add_gui", {
                    folder:name + " - Rotation",
                    onChange: () => {object.rotation.z = object.angleRotation.z * Math.PI / 180}
        }, object.angleRotation, "z", 0, 360);

        object.global = object.scale.x;
        events.emit("add_gui", {folder:name + " - Scale", listen: listen, step: 0.001, onChange: () => {
           object.scale.set(object.global, object.global, object.global);
        }}, object, "global",0,4); 

        events.emit("add_gui", {folder: name}, object, "visible"); 
    },

    fastForward : function(video) {
        video.currentTime = video.duration - 5;        
    },

    colorPicker: function(name, object, prop) {
        let lightPicker  = {color: [object[prop].r * 255, object[prop].g * 255, object[prop].b * 255]};
        events.emit("add_gui", {folder:name, color: true, listen:true, onChange: () => {
            object[prop].setRGB(lightPicker.color[0] / 255, lightPicker.color[1] / 255, lightPicker.color[2] / 255);
        }}, lightPicker, "color"); 
    }, 

    positionEntry : function (entry,square, scene) {
    
        let cube = this.adjustableCube(
            new THREE.Vector3().fromArray(entry.startPosition),
            "Ramp start",
            1,
            0xff0000
        )
        square.add( cube );

        let cube2 = this.adjustableCube(
            new THREE.Vector3().fromArray(entry.endPosition),
            "Ramp end",
            1,
            0x00ffff
        )
        square.add( cube2 );

        if (entry.worldPosition) {
            let cube3 = this.adjustableCube(
                new THREE.Vector3().fromArray(entry.worldPosition),
                "World Point",
                1,
                0x00ff00
            )
            scene.add(cube3);
        }
    },

    donePositioning: function(name) {
        events.emit("remove_gui_folder", name + " - Position");
        events.emit("remove_gui_folder", name + " - Rotation");
        events.emit("remove_gui_folder", name + " - Scale");
    }
}
