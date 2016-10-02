export default {
    closestValue: function (arr, goal) {
        let closest = arr.reduce(function (prev, curr) {
            return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
        });
        return closest;
    }
}
