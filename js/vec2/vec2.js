// 2D vector math (all vector operations create new vector, for easier chaining, like Sylvester library)
"use strict";
// globals: document, window

function Vec2(x, y) {
    this.x = x || 0;
    this.y = y || 0;
}

function vec2(x, y) {
    return new Vec2(x, y);
}

Vec2.prototype.length = function () {
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vec2.prototype.distanceTo = function (v) {
    var dx = this.x - v.x,
        dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
};

Vec2.prototype.clone = function () {
    return new Vec2(this.x, this.y);
};

Vec2.prototype.add = function (vec2) {
    return new Vec2(this.x + vec2.x, this.y + vec2.y);
};

Vec2.prototype.addXY = function (x, y) {
    return new Vec2(this.x + x, this.y + y);
};

Vec2.prototype.sub = function (vec2) {
    return new Vec2(this.x - vec2.x, this.y - vec2.y);
};

Vec2.prototype.mul = function (k) {
    return new Vec2(this.x * k, this.y * k);
};

Vec2.prototype.mulX = function (k) {
    return new Vec2(this.x * k, this.y);
};

Vec2.prototype.mulY = function (k) {
    return new Vec2(this.x, this.y * k);
};

Vec2.prototype.mulXY = function (kx, ky) {
    return new Vec2(this.x * kx, this.y * ky);
};

Vec2.prototype.left = function () {
    return new Vec2(-this.y, this.x);
};

Vec2.prototype.right = function () {
    return new Vec2(this.y, -this.x);
};

Vec2.prototype.neg = function () {
    return new Vec2(-this.x, -this.y);
};

Vec2.prototype.unit = function () {
    var d = this.length();
    return new Vec2(this.x / d, this.y / d);
};

Vec2.prototype.angle = function (aPositive) {
    var a = Math.atan2(this.y, this.x);
    if (aPositive && (a < 0)) {
        a += 2 * Math.PI;
        return a;
    }
    return a;
};

Vec2.prototype.angleTo = function (v) {
    var a = this.angle(),
        b = v.angle(),
        r = a - b;
    if (r < -Math.PI) {
        return r + 2 * Math.PI;
    }
    if (r > Math.PI) {
        return r - 2 * Math.PI;
    }
    return r;
};

Vec2.prototype.fromAngle = function (aAngle) {
    return new Vec2(Math.cos(aAngle), Math.sin(aAngle));
};

Vec2.prototype.fromObject = function (aObject) {
    return new Vec2(aObject.x, aObject.y);
};

Vec2.prototype.rotate = function (aAngle) {
    var a = this.angle() - aAngle,
        l = this.length();
    return new Vec2(l * Math.cos(a), l * Math.sin(a));
};

Vec2.prototype.dot = function (v) {
    return this.x * v.x + this.y * v.y;
};

Vec2.prototype.cross = function (v) {
    return this.x * v.y - v.x * this.y;
};

Vec2.prototype.round = function () {
    return new Vec2(Math.round(this.x), Math.round(this.y));
};

Vec2.prototype.ceil = function () {
    return new Vec2(Math.ceil(this.x), Math.ceil(this.y));
};

Vec2.prototype.floor = function () {
    return new Vec2(Math.floor(this.x), Math.floor(this.y));
};

Vec2.prototype.toString = function (aName) {
    var a = this.angle();
    a = 180 * a / Math.PI;
    return (aName ? aName + ' ' : '') + this.x.toFixed(2).replace('.00', '') + ' ' + this.y.toFixed(2).replace('.00', '') + ' angle=' + a.toFixed(1).replace('.0', '') + '°';
};

