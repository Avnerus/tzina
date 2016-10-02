"use strict";
var three_1 = require("three");
exports.textAlign = {
    center: new three_1.Vector2(0, 0),
    left: new three_1.Vector2(1, 0),
    topLeft: new three_1.Vector2(1, -1),
    topRight: new three_1.Vector2(-1, -1),
    right: new three_1.Vector2(-1, 0),
    bottomLeft: new three_1.Vector2(1, 1),
    bottomRight: new three_1.Vector2(-1, 1),
};
var fontHeightCache = {};
function getFontHeight(fontStyle) {
    var result = fontHeightCache[fontStyle];
    if (!result) {
        var body = document.getElementsByTagName('body')[0];
        var dummy = document.createElement('div');
        var dummyText = document.createTextNode('MÉq');
        dummy.appendChild(dummyText);
        dummy.setAttribute('style', "font:" + fontStyle + ";position:absolute;top:0;left:0");
        body.appendChild(dummy);
        result = dummy.offsetHeight;
        fontHeightCache[fontStyle] = result;
        body.removeChild(dummy);
    }
    return result;
}
exports.getFontHeight = getFontHeight;
