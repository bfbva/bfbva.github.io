
/*jslint browser: true, node: true */
/*global */

"use strict";

/*** Imports ***/
var Medical_Image_Viewer = Medical_Image_Viewer || {};
Medical_Image_Viewer.volume = Medical_Image_Viewer.volume || {};


/*** Constructor ***/
/*表示图像的维度*/
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
/*在保持等轴向尺寸的情况下，将图像维度进行填充。
这个方法通过计算各个维度的填充差异，调整图像的列数、行数和切片数。*/
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


/*返回图像序列中的体素数量，考虑到时间点。*/
Medical_Image_Viewer.volume.ImageDimensions.prototype.getNumVoxelsSeries = function () {
    return this.cols * this.rows * this.slices * this.timepoints;
};


/*每个切片中的体素数量。*/
Medical_Image_Viewer.volume.ImageDimensions.prototype.getNumVoxelsSlice = function () {
    return this.rows * this.cols;
};

/*返回整个体积中的体素数量*/

Medical_Image_Viewer.volume.ImageDimensions.prototype.getNumVoxelsVolume = function () {
    return this.rows * this.cols * this.slices;
};

/*检查图像维度是否有效，根据一些条件返回布尔值*/

Medical_Image_Viewer.volume.ImageDimensions.prototype.isValid = function () {
    return ((this.cols > 0) && (this.rows > 0) && (this.slices > 0) && (this.timepoints > 0) &&
        (this.dataOffsets[0] >= 0) && (this.dataLengths[0] >= 0));
};


/*** Exports ***/
var moduleType = typeof module;
if ((moduleType !== 'undefined') && module.exports) {
    module.exports.ImageDimensions = Medical_Image_Viewer.volume.ImageDimensions;
}
