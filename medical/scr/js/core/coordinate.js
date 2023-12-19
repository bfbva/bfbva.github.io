
/*jslint browser: true, node: true */
/*global */

"use strict";

/*** Imports ***/
var Medical_Image_Viewer = Medical_Image_Viewer || {};
Medical_Image_Viewer.core = Medical_Image_Viewer.core || {};


/*** Constructor ***/
Medical_Image_Viewer.core.Coordinate = Medical_Image_Viewer.core.Coordinate || function (xLoc, yLoc, zLoc) {
    this.x = xLoc;
    this.y = yLoc;
    this.z = zLoc;
};


/*** Prototype Methods ***/

Medical_Image_Viewer.core.Coordinate.prototype.setCoordinate = function (xLoc, yLoc, zLoc, round) {
    if (round) {
        this.x = Math.round(xLoc);
        this.y = Math.round(yLoc);
        this.z = Math.round(zLoc);
    } else {
        this.x = xLoc;
        this.y = yLoc;
        this.z = zLoc;
    }
};


Medical_Image_Viewer.core.Coordinate.prototype.toString = function () {
    return '(' + this.x + ',' + this.y + ',' + this.z + ')';
}


Medical_Image_Viewer.core.Coordinate.prototype.isAllZeros = function () {
    return ((this.x === 0) && (this.y === 0) && (this.z === 0));
};
/*
这段代码是JavaScript中的严格模式（"use strict"）下定义的一个名为Coordinate的构造函数，它接受三个参数xLoc、yLoc和zLoc，并将它们分别赋值给Coordinate对象的属性x、y和z。Coordinate对象还有三个原型方法：

1. setCoordinate(xLoc, yLoc, zLoc, round)：设置Coordinate对象的x、y和z属性。如果round参数为true，则将xLoc、yLoc和zLoc分别四舍五入后再赋值给Coordinate对象的x、y和z属性。

2. toString()：返回Coordinate对象的字符串表示，格式为"(x,y,z)"。

3. isAllZeros()：检查Coordinate对象的x、y和z属性是否都为0，如果是则返回true，否则返回false。

*/