
/*jslint browser: true, node: true */
/*global */

"use strict";

/*** Imports ***/
var Medical_Image_Viewer = Medical_Image_Viewer || {};
Medical_Image_Viewer.volume = Medical_Image_Viewer.volume || {};


/*** Constructor ***/
Medical_Image_Viewer.volume.ImageDimensions = Medical_Image_Viewer.volume.ImageDimensions || function (cols, rows, slices, timepoints) {
    this.cols = cols;
    this.rows = rows;
    this.slices = slices;

    this.colsOrig = cols;
    this.rowsOrig = rows;
    this.slicesOrig = slices;

    this.xDim = -1;
    this.yDim = -1;
    this.zDim = -1;
    this.timepoints = timepoints || 1;
    this.dataOffsets = [];  // offset of image data from start of file
    this.dataLengths = [];  // length of image data
};


/*** Prototype Methods ***/

Medical_Image_Viewer.volume.ImageDimensions.prototype.padIsometric = function (vd) {
    var id = this,
        cols = id.cols,
        rows = id.rows,
        slices = id.slices,
        colExt = (cols * vd.colSize),
        rowExt = (rows * vd.rowSize),
        sliceExt = (slices * vd.sliceSize),
        largestDim = Math.max(Math.max(colExt, rowExt), sliceExt),
        colDiff = parseInt((largestDim - colExt) / vd.colSize / 2, 10),
        rowDiff = parseInt((largestDim - rowExt) / vd.rowSize / 2, 10),
        sliceDiff = parseInt((largestDim - sliceExt) / vd.sliceSize / 2, 10);

    this.cols = (cols+2*colDiff);
    this.rows = (rows+2*rowDiff);
    this.slices = (slices+2*sliceDiff);
};



Medical_Image_Viewer.volume.ImageDimensions.prototype.getNumVoxelsSeries = function () {
    return this.cols * this.rows * this.slices * this.timepoints;
};



Medical_Image_Viewer.volume.ImageDimensions.prototype.getNumVoxelsSlice = function () {
    return this.rows * this.cols;
};



Medical_Image_Viewer.volume.ImageDimensions.prototype.getNumVoxelsVolume = function () {
    return this.rows * this.cols * this.slices;
};



Medical_Image_Viewer.volume.ImageDimensions.prototype.isValid = function () {
    return ((this.cols > 0) && (this.rows > 0) && (this.slices > 0) && (this.timepoints > 0) &&
        (this.dataOffsets[0] >= 0) && (this.dataLengths[0] >= 0));
};


/*** Exports ***/
var moduleType = typeof module;
if ((moduleType !== 'undefined') && module.exports) {
    module.exports.ImageDimensions = Medical_Image_Viewer.volume.ImageDimensions;
}
