
/*jslint browser: true, node: true */
/*global */

"use strict";

/*** Imports ***/
var Medical_Image_Viewer = Medical_Image_Viewer || {};
Medical_Image_Viewer.utilities = Medical_Image_Viewer.utilities || {};
Medical_Image_Viewer.utilities.MathUtils = Medical_Image_Viewer.utilities.MathUtils || {};


/*** Static Pseudo-constants ***/

Medical_Image_Viewer.utilities.MathUtils.EPSILON = 0.00000001;



/*** Static Methods ***/

Medical_Image_Viewer.utilities.MathUtils.signum = function (val) {
    return val ? val < 0 ? -1 : 1 : 0;
};



Medical_Image_Viewer.utilities.MathUtils.lineDistance = function (point1x, point1y, point2x, point2y) {
    var xs, ys;

    xs = point2x - point1x;
    xs = xs * xs;

    ys = point2y - point1y;
    ys = ys * ys;

    return Math.sqrt(xs + ys);
};



Medical_Image_Viewer.utilities.MathUtils.lineDistance3d = function (point1x, point1y, point1z, point2x, point2y, point2z) {
    var xs, ys, zs;

    xs = point2x - point1x;
    xs = xs * xs;

    ys = point2y - point1y;
    ys = ys * ys;

    zs = point2z - point1z;
    zs = zs * zs;

    return Math.sqrt(xs + ys + zs);
};



Medical_Image_Viewer.utilities.MathUtils.essentiallyEqual = function (a, b) {
    return (a === b) || (Math.abs(a - b) <= ((Math.abs(a) > Math.abs(b) ? Math.abs(b) : Math.abs(a)) *
        Medical_Image_Viewer.utilities.MathUtils.EPSILON));
};



Medical_Image_Viewer.utilities.MathUtils.getPowerOfTwo = function (value, pow) {
    var pow = pow || 1;

    while (pow < value) {
        pow *= 2;
    }

    return pow;
};



function Medical_Image_ViewerRoundFast(val) {
    /*jslint bitwise: true */
    if (val > 0) {
        return (val + 0.5) | 0;
    }

    return (val - 0.5) | 0;
}



function Medical_Image_ViewerFloorFast(val) {
    /*jslint bitwise: true */
    return val | 0;
}
