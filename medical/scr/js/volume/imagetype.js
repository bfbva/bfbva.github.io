
/*jslint browser: true, node: true */
/*global */

"use strict";

/*** Imports ***/
var Medical_Image_Viewer = Medical_Image_Viewer || {};
Medical_Image_Viewer.volume = Medical_Image_Viewer.volume || {};


/*** Constructor ***/
Medical_Image_Viewer.volume.ImageType = Medical_Image_Viewer.volume.ImageType || function (datatype, numBytes, littleEndian, compressed) {
    this.datatype = datatype;
    this.numBytes = numBytes;
    this.littleEndian = littleEndian;
    this.swapped = false;
    this.compressed = compressed;
    this.rgbBySample = false;
};


/*** Static Pseudo-constants ***/

Medical_Image_Viewer.volume.ImageType.DATATYPE_UNKNOWN = 0;
Medical_Image_Viewer.volume.ImageType.DATATYPE_INTEGER_SIGNED = 1;
Medical_Image_Viewer.volume.ImageType.DATATYPE_INTEGER_UNSIGNED = 2;
Medical_Image_Viewer.volume.ImageType.DATATYPE_FLOAT = 3;
Medical_Image_Viewer.volume.ImageType.DATATYPE_RGB = 4;
Medical_Image_Viewer.volume.ImageType.MAX_SUPPORTED_BYTES_FLOAT = 8;
Medical_Image_Viewer.volume.ImageType.MAX_SUPPORTED_BYTES_INTEGER = 4;


/*** Prototype Methods ***/

Medical_Image_Viewer.volume.ImageType.prototype.isValid = function () {
    return (
    (this.datatype <= Medical_Image_Viewer.volume.ImageType.DATATYPE_RGB) &&
    (this.datatype > Medical_Image_Viewer.volume.ImageType.DATATYPE_UNKNOWN) &&
    (this.numBytes > 0) &&
    (((this.datatype === Medical_Image_Viewer.volume.ImageType.DATATYPE_FLOAT) && (this.numBytes <= Medical_Image_Viewer.volume.ImageType.MAX_SUPPORTED_BYTES_FLOAT)) ||
    ((this.datatype !== Medical_Image_Viewer.volume.ImageType.DATATYPE_FLOAT) && (this.numBytes <= Medical_Image_Viewer.volume.ImageType.MAX_SUPPORTED_BYTES_INTEGER)))
    );
};



Medical_Image_Viewer.volume.ImageType.prototype.getTypeDescription = function () {
    if (this.datatype === Medical_Image_Viewer.volume.ImageType.DATATYPE_INTEGER_SIGNED) {
        return "Signed Integer";
    }

    if (this.datatype === Medical_Image_Viewer.volume.ImageType.DATATYPE_INTEGER_UNSIGNED) {
        return "Unsigned Integer";
    }

    if (this.datatype === Medical_Image_Viewer.volume.ImageType.DATATYPE_FLOAT) {
        return "Float";
    }

    if (this.datatype === Medical_Image_Viewer.volume.ImageType.DATATYPE_RGB) {
        return "RGB";
    }

    return "Unknown";
};



Medical_Image_Viewer.volume.ImageType.prototype.getOrderDescription = function () {
    if (this.numBytes > 1) {
        if (this.littleEndian) {
            return "Little Endian";
        }

        return "Big Endian";
    }

    return null;
};
