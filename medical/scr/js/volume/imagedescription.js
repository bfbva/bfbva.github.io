
/*jslint browser: true, node: true */
/*global */

"use strict";

/*** Imports ***/
var Medical_Image_Viewer = Medical_Image_Viewer || {};
Medical_Image_Viewer.volume = Medical_Image_Viewer.volume || {};


/*** Constructor ***/
Medical_Image_Viewer.volume.ImageDescription = Medical_Image_Viewer.volume.ImageDescription || function (notes) {
    this.notes = "(none)";

    if (!Medical_Image_Viewer.utilities.StringUtils.isStringBlank(notes)) {
        this.notes = notes;
    }
};
