
/*jslint browser: true, node: true */
/*global */

"use strict";

/*** Imports ***/
var Medical_Image_Viewer = Medical_Image_Viewer || {};
Medical_Image_Viewer.volume = Medical_Image_Viewer.volume || {};


/*** Constructor ***/
Medical_Image_Viewer.volume.VoxelDimensions = Medical_Image_Viewer.volume.VoxelDimensions || function (colSize, rowSize, sliceSize, timeSize) {
    this.colSize = Math.abs(colSize);
    this.rowSize = Math.abs(rowSize);
    this.sliceSize = Math.abs(sliceSize);
    this.xSize = 0;
    this.ySize = 0;
    this.zSize = 0;
    this.flip = false;
    this.timeSize = timeSize;
    this.spatialUnit = Medical_Image_Viewer.volume.VoxelDimensions.UNITS_UNKNOWN;
    this.temporalUnit = Medical_Image_Viewer.volume.VoxelDimensions.UNITS_UNKNOWN;
};

/*** Static Pseudo-constants ***/

Medical_Image_Viewer.volume.VoxelDimensions.UNITS_UNKNOWN = 0;
Medical_Image_Viewer.volume.VoxelDimensions.UNITS_METER = 1;
Medical_Image_Viewer.volume.VoxelDimensions.UNITS_MM = 2;
Medical_Image_Viewer.volume.VoxelDimensions.UNITS_MICRON = 3;
Medical_Image_Viewer.volume.VoxelDimensions.UNITS_SEC = 8;
Medical_Image_Viewer.volume.VoxelDimensions.UNITS_MSEC = 16;
Medical_Image_Viewer.volume.VoxelDimensions.UNITS_USEC = 24;
Medical_Image_Viewer.volume.VoxelDimensions.UNITS_HZ = 32;
Medical_Image_Viewer.volume.VoxelDimensions.UNITS_PPM = 40;
Medical_Image_Viewer.volume.VoxelDimensions.UNITS_RADS = 48;

Medical_Image_Viewer.volume.VoxelDimensions.UNIT_STRINGS = [];
Medical_Image_Viewer.volume.VoxelDimensions.UNIT_STRINGS[Medical_Image_Viewer.volume.VoxelDimensions.UNITS_UNKNOWN] = "Unknown Unit";
Medical_Image_Viewer.volume.VoxelDimensions.UNIT_STRINGS[Medical_Image_Viewer.volume.VoxelDimensions.UNITS_METER] = "Meters";
Medical_Image_Viewer.volume.VoxelDimensions.UNIT_STRINGS[Medical_Image_Viewer.volume.VoxelDimensions.UNITS_MM] = "Millimeters";
Medical_Image_Viewer.volume.VoxelDimensions.UNIT_STRINGS[Medical_Image_Viewer.volume.VoxelDimensions.UNITS_MICRON] = "Microns";
Medical_Image_Viewer.volume.VoxelDimensions.UNIT_STRINGS[Medical_Image_Viewer.volume.VoxelDimensions.UNITS_SEC] = "Seconds";
Medical_Image_Viewer.volume.VoxelDimensions.UNIT_STRINGS[Medical_Image_Viewer.volume.VoxelDimensions.UNITS_MSEC] = "Milliseconds";
Medical_Image_Viewer.volume.VoxelDimensions.UNIT_STRINGS[Medical_Image_Viewer.volume.VoxelDimensions.UNITS_USEC] = "Microseconds";
Medical_Image_Viewer.volume.VoxelDimensions.UNIT_STRINGS[Medical_Image_Viewer.volume.VoxelDimensions.UNITS_HZ] = "Hertz";
Medical_Image_Viewer.volume.VoxelDimensions.UNIT_STRINGS[Medical_Image_Viewer.volume.VoxelDimensions.UNITS_PPM] = "Parts-per-million";
Medical_Image_Viewer.volume.VoxelDimensions.UNIT_STRINGS[Medical_Image_Viewer.volume.VoxelDimensions.UNITS_RADS] = "Radians-per-second";


/*** Prototype Methods ***/

Medical_Image_Viewer.volume.VoxelDimensions.prototype.isValid = function () {
    return ((this.colSize > 0) && (this.rowSize > 0) && (this.sliceSize > 0) && (this.timeSize >= 0));
};



Medical_Image_Viewer.volume.VoxelDimensions.prototype.getSpatialUnitString = function () {
    return Medical_Image_Viewer.volume.VoxelDimensions.UNIT_STRINGS[this.spatialUnit];
};



Medical_Image_Viewer.volume.VoxelDimensions.prototype.getTemporalUnitString = function () {
    return Medical_Image_Viewer.volume.VoxelDimensions.UNIT_STRINGS[this.temporalUnit];
};


Medical_Image_Viewer.volume.VoxelDimensions.prototype.getTemporalUnitMultiplier = function () {
    if (this.temporalUnit === Medical_Image_Viewer.volume.VoxelDimensions.UNITS_MSEC) {
        return 0.001;
    }

    if (this.temporalUnit === Medical_Image_Viewer.volume.VoxelDimensions.UNITS_USEC) {
        return 0.000001;
    }

    return 1;
};
