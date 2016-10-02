"use strict";
var THREE = require("three");
var utils_1 = require("./utils");
var CanvasText = (function () {
    function CanvasText() {
        this.textWidth = null;
        this.textHeight = null;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }
    Object.defineProperty(CanvasText.prototype, "width", {
        get: function () { return this.canvas.width; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CanvasText.prototype, "height", {
        get: function () { return this.canvas.height; },
        enumerable: true,
        configurable: true
    });
    CanvasText.prototype.drawText = function (text, ctxOptions) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.font = ctxOptions.font;
        this.textWidth = Math.ceil(this.ctx.measureText(text).width);
        this.textHeight = utils_1.getFontHeight(this.ctx.font);
        this.canvas.width = THREE.Math.nextPowerOfTwo(this.textWidth);
        this.canvas.height = THREE.Math.nextPowerOfTwo(this.textHeight);
        this.ctx.font = ctxOptions.font;
        this.ctx.fillStyle = ctxOptions.fillStyle;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(text, 0, 0);
        return this.canvas;
    };
    return CanvasText;
}());
exports.CanvasText = CanvasText;
