
/*jslint browser: true, node: true */
/*global */

"use strict";

/*** Imports ***/
var Medical_Image_Viewer = Medical_Image_Viewer || {};
Medical_Image_Viewer.volume = Medical_Image_Viewer.volume || {};


/*** Constructor ***/
Medical_Image_Viewer.volume.Header = Medical_Image_Viewer.volume.Header || function (pad) {
    this.fileFormat = null;
    this.imageDimensions = null;
    this.voxelDimensions = null;
    this.imageDescription = null;
    this.imageType = null;
    this.orientation = null;
    this.imageRange = null;
    this.error = null;
    this.origin = null;
    this.pad = pad;
    this.orientationCertainty = Medical_Image_Viewer.volume.Header.ORIENTATION_CERTAINTY_UNKNOWN;
    this.onFinishedFileFormatRead = null;
};


/*** Static Pseudo-constants ***/

Medical_Image_Viewer.volume.Header.HEADER_TYPE_UNKNOWN = 0;
Medical_Image_Viewer.volume.Header.HEADER_TYPE_NIFTI = 1;
Medical_Image_Viewer.volume.Header.HEADER_TYPE_DICOM = 2;
Medical_Image_Viewer.volume.Header.ERROR_UNRECOGNIZED_FORMAT = "This format is not recognized!";
Medical_Image_Viewer.volume.Header.INVALID_IMAGE_DIMENSIONS = "Image dimensions are not valid!";
Medical_Image_Viewer.volume.Header.INVALID_VOXEL_DIMENSIONS = "Voxel dimensions are not valid!";
Medical_Image_Viewer.volume.Header.INVALID_DATATYPE = "Datatype is not valid or not supported!";
Medical_Image_Viewer.volume.Header.INVALID_IMAGE_RANGE = "Image range is not valid!";
Medical_Image_Viewer.volume.Header.ORIENTATION_CERTAINTY_UNKNOWN = 0;
Medical_Image_Viewer.volume.Header.ORIENTATION_CERTAINTY_LOW = 1;
Medical_Image_Viewer.volume.Header.ORIENTATION_CERTAINTY_HIGH = 2;


/*** Prototype Methods ***/

Medical_Image_Viewer.volume.Header.prototype.findHeaderType = function (filename, data) {
    if (Medical_Image_Viewer.volume.nifti.HeaderNIFTI.isThisFormat(filename, data)) {
        return Medical_Image_Viewer.volume.Header.HEADER_TYPE_NIFTI;
    } else if (Medical_Image_Viewer.Container.DICOM_SUPPORT && Medical_Image_Viewer.volume.dicom.HeaderDICOM.isThisFormat(filename, data)) {
        return Medical_Image_Viewer.volume.Header.HEADER_TYPE_DICOM;
    }

    return Medical_Image_Viewer.volume.Header.HEADER_TYPE_UNKNOWN;
};



Medical_Image_Viewer.volume.Header.prototype.readHeaderData = function (filename, data, progressMeter, dialogHandler,
                                                          onFinishedFileFormatRead) {
    var headerType = this.findHeaderType(filename, data);

    this.onFinishedFileFormatRead = onFinishedFileFormatRead;

    if (headerType === Medical_Image_Viewer.volume.Header.HEADER_TYPE_NIFTI) {
        this.fileFormat = new Medical_Image_Viewer.volume.nifti.HeaderNIFTI();
        this.fileFormat.readHeaderData(data, progressMeter, dialogHandler, Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.onFinishedHeaderRead));
    } else if (headerType === Medical_Image_Viewer.volume.Header.HEADER_TYPE_DICOM) {
        this.fileFormat = new Medical_Image_Viewer.volume.dicom.HeaderDICOM();
        this.fileFormat.readHeaderData(data, progressMeter, dialogHandler, Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.onFinishedHeaderRead));
    } else {
        this.error = new Error(Medical_Image_Viewer.volume.Header.ERROR_UNRECOGNIZED_FORMAT);
        this.onFinishedFileFormatRead();
    }
};



Medical_Image_Viewer.volume.Header.prototype.onFinishedHeaderRead = function () {
    if (this.fileFormat.hasError()) {
        this.error = this.fileFormat.error;
    } else {
        this.imageType = this.fileFormat.getImageType();
        if (!this.imageType.isValid()) {
            this.error = new Error(Medical_Image_Viewer.volume.Header.INVALID_DATATYPE);
        }

        this.imageDimensions = this.fileFormat.getImageDimensions();
        if (!this.imageDimensions.isValid()) {
            this.error = new Error(Medical_Image_Viewer.volume.Header.INVALID_IMAGE_DIMENSIONS);
        }


        this.voxelDimensions = this.fileFormat.getVoxelDimensions();
        if (!this.voxelDimensions.isValid()) {
            this.error = new Error(Medical_Image_Viewer.volume.Header.INVALID_VOXEL_DIMENSIONS);
        }

        if (this.pad) {
            this.imageDimensions.padIsometric(this.voxelDimensions);
        }

        this.orientation = this.fileFormat.getOrientation();
        if (!this.orientation.isValid()) {
            this.orientation = new Medical_Image_Viewer.volume.Orientation(Medical_Image_Viewer.volume.Orientation.DEFAULT);
            this.orientationCertainty = Medical_Image_Viewer.volume.Header.ORIENTATION_CERTAINTY_UNKNOWN;
        } else {
            this.orientationCertainty = this.fileFormat.getOrientationCertainty();
        }

        this.orientation.createInfo(this.imageDimensions, this.voxelDimensions);

        this.origin = this.orientation.convertCoordinate(this.fileFormat.getOrigin(),
            new Medical_Image_Viewer.core.Coordinate(0, 0, 0));

        this.imageRange = this.fileFormat.getImageRange();
        if (!this.imageRange.isValid()) {
            this.error = new Error(Medical_Image_Viewer.volume.Header.INVALID_IMAGE_RANGE);
        }

        this.imageDescription = this.fileFormat.getImageDescription();
    }

    this.onFinishedFileFormatRead();
};



Medical_Image_Viewer.volume.Header.prototype.getName = function () {
    return this.fileFormat.getName();
};



Medical_Image_Viewer.volume.Header.prototype.getSeriesLabels = function () {
    return this.fileFormat.getSeriesLabels();
};



Medical_Image_Viewer.volume.Header.prototype.readImageData = function (progressMeter, onFinishedImageRead) {
    this.fileFormat.readImageData(progressMeter, onFinishedImageRead);
};



Medical_Image_Viewer.volume.Header.prototype.hasError = function () {
    return (this.error !== null);
};



Medical_Image_Viewer.volume.Header.prototype.getBestTransform = function () {
    return this.fileFormat.getBestTransform();
};



Medical_Image_Viewer.volume.Header.prototype.getBestTransformOrigin = function () {
    return this.fileFormat.getBestTransformOrigin();
};



Medical_Image_Viewer.volume.Header.prototype.toString = function () {
    return this.fileFormat.toString();
}