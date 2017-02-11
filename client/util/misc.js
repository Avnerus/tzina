export default {
    overwriteProps: function(original, update) {
        let keys = Object.keys(update);
        keys.forEach((key) => {
            //console.log("Overwriting prop ", key, original[key], update[key]);
            original[key] = update[key];
        });
    }
}
