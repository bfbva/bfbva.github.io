
/*jslint browser: true, node: true */
/*global */

"use strict";

/*** Imports ***/
var Medical_Image_Viewer = Medical_Image_Viewer || {};
Medical_Image_Viewer.core = Medical_Image_Viewer.core || {};


/*** Constructor ***/
Medical_Image_Viewer.core.Point = Medical_Image_Viewer.core.Point || function (xLoc, yLoc) {
    this.x = xLoc;
    this.y = yLoc;
};
