
/*jslint browser: true, node: true */
/*global */

"use strict";

/*** Imports ***/
var Medical_Image_Viewer = Medical_Image_Viewer || {};
Medical_Image_Viewer.viewer = Medical_Image_Viewer.viewer || {};


/*** Constructor ***/
Medical_Image_Viewer.viewer.ColorTable = Medical_Image_Viewer.viewer.ColorTable || function (lutName, baseImage, colorTable) {
    var lut = null;

    if (colorTable !== undefined) {
        lut = colorTable;
    } else {
        lut = Medical_Image_Viewer.viewer.ColorTable.findLUT(lutName);
    }

    this.lutData = lut.data;
    this.maxLUT = 0;
    this.minLUT = 0;
    this.knotThresholds = [];
    this.knotRangeRatios = [];

    this.LUTarrayG = new Array(256);
    this.LUTarrayR = new Array(256);
    this.LUTarrayB = new Array(256);
    this.isBaseImage = baseImage;

    this.knotMin = this.lutData[0];
    this.knotMax = this.lutData[this.lutData.length - 1];
    this.useGradation = (typeof lut.gradation === "undefined") || lut.gradation;

    this.updateLUT(Medical_Image_Viewer.viewer.ColorTable.LUT_MIN, Medical_Image_Viewer.viewer.ColorTable.LUT_MAX);
};


/*** Static Pseudo-constants ***/

Medical_Image_Viewer.viewer.ColorTable.TABLE_GRAYSCALE = {"name": "灰度", "data": [[0, 0, 0, 0], [1, 1, 1, 1]],
    "gradation": true};
Medical_Image_Viewer.viewer.ColorTable.TABLE_SPECTRUM = {"name": "光谱", "data": [[0, 0, 0, 0], [0.1, 0, 0, 1], [0.33, 0, 1, 1],
    [0.5, 0, 1, 0], [0.66, 1, 1, 0], [0.9, 1, 0, 0], [1, 1, 1, 1]], "gradation": true};
Medical_Image_Viewer.viewer.ColorTable.TABLE_RED2YELLOW = {"name": "叠加（阳性）", "data": [[0, 1, 0, 0], [1, 1, 1, 0]],
    "gradation": true};
Medical_Image_Viewer.viewer.ColorTable.TABLE_BLUE2GREEN = {"name": "叠加（阴性）", "data": [[0, 0, 0, 1], [1, 0, 1, 0]],
    "gradation": true};
Medical_Image_Viewer.viewer.ColorTable.TABLE_HOTANDCOLD = {"name": "热冷", "data": [[0, 0, 0, 1], [0.15, 0, 1, 1],
    [0.3, 0, 1, 0], [0.45, 0, 0, 0], [0.5, 0, 0, 0], [0.55, 0, 0, 0], [0.7, 1, 1, 0], [0.85, 1, 0, 0], [1, 1, 1, 1]],
    "gradation": true};
Medical_Image_Viewer.viewer.ColorTable.TABLE_GOLD = {"name": "金色", "data": [[0, 0, 0, 0], [0.13, 0.19, 0.03, 0],
    [0.25, 0.39, 0.12, 0], [0.38, 0.59, 0.26, 0], [0.50, 0.80, 0.46, 0.08], [0.63, 0.99, 0.71, 0.21],
    [0.75, 0.99, 0.88, 0.34], [0.88, 0.99, 0.99, 0.48], [1, 0.90, 0.95, 0.61]], "gradation": true};
Medical_Image_Viewer.viewer.ColorTable.TABLE_RED2WHITE = {"name": "红色叠加", "data": [[0, 0.75, 0, 0], [0.5, 1, 0.5, 0],
    [0.95, 1, 1, 0], [1, 1, 1, 1]], "gradation": true};
Medical_Image_Viewer.viewer.ColorTable.TABLE_GREEN2WHITE = {"name": "绿色叠加", "data": [[0, 0, 0.75, 0], [0.5, 0.5, 1, 0],
    [0.95, 1, 1, 0], [1, 1, 1, 1]], "gradation": true};
Medical_Image_Viewer.viewer.ColorTable.TABLE_BLUE2WHITE = {"name": "蓝色叠加", "data": [[0, 0, 0, 1], [0.5, 0, 0.5, 1],
    [0.95, 0, 1, 1], [1, 1, 1, 1]], "gradation": true};
Medical_Image_Viewer.viewer.ColorTable.TABLE_DTI_SPECTRUM = {"name": "光谱", "data": [[0, 1, 0, 0], [0.5, 0, 1, 0], [1, 0, 0, 1]],
    "gradation": true};
Medical_Image_Viewer.viewer.ColorTable.TABLE_FIRE = {"name": "火焰", "data": [[0, 0, 0, 0], [0.06, 0, 0, 0.36], [0.16, 0.29, 0, 0.75],
    [0.22, 0.48, 0, 0.89], [0.31, 0.68, 0, 0.6], [0.37, 0.76, 0, 0.36], [0.5, 0.94, 0.31, 0], [0.56, 1, 0.45, 0],
    [0.81, 1, 0.91, 0], [0.88, 1, 1, 0.38], [1,1,1,1]], "gradation": true};
   

Medical_Image_Viewer.viewer.ColorTable.ARROW_ICON = "data:image/gif;base64,R0lGODlhCwARAPfGMf//////zP//mf//Zv//M///AP/M///MzP/Mmf/M" +
    "Zv/MM//MAP+Z//+ZzP+Zmf+ZZv+ZM/+ZAP9m//9mzP9mmf9mZv9mM/9mAP8z//8zzP8zmf8zZv8zM/8zAP8A//8AzP8Amf8AZv8AM/8AAMz//8z/" +
    "zMz/mcz/Zsz/M8z/AMzM/8zMzMzMmczMZszMM8zMAMyZ/8yZzMyZmcyZZsyZM8yZAMxm/8xmzMxmmcxmZsxmM8xmAMwz/8wzzMwzmcwzZswzM8wz" +
    "AMwA/8wAzMwAmcwAZswAM8wAAJn//5n/zJn/mZn/Zpn/M5n/AJnM/5nMzJnMmZnMZpnMM5nMAJmZ/5mZzJmZmZmZZpmZM5mZAJlm/5lmzJlmmZlm" +
    "ZplmM5lmAJkz/5kzzJkzmZkzZpkzM5kzAJkA/5kAzJkAmZkAZpkAM5kAAGb//2b/zGb/mWb/Zmb/M2b/AGbM/2bMzGbMmWbMZmbMM2bMAGaZ/2aZ" +
    "zGaZmWaZZmaZM2aZAGZm/2ZmzGZmmWZmZmZmM2ZmAGYz/2YzzGYzmWYzZmYzM2YzAGYA/2YAzGYAmWYAZmYAM2YAADP//zP/zDP/mTP/ZjP/MzP/" +
    "ADPM/zPMzDPMmTPMZjPMMzPMADOZ/zOZzDOZmTOZZjOZMzOZADNm/zNmzDNmmTNmZjNmMzNmADMz/zMzzDMzmTMzZjMzMzMzADMA/zMAzDMAmTMA" +
    "ZjMAMzMAAAD//wD/zAD/mQD/ZgD/MwD/AADM/wDMzADMmQDMZgDMMwDMAACZ/wCZzACZmQCZZgCZMwCZAABm/wBmzABmmQBmZgBmMwBmAAAz/wAz" +
    "zAAzmQAzZgAzMwAzAAAA/wAAzAAAmQAAZgAAM+4AAN0AALsAAKoAAIgAAHcAAFUAAEQAACIAABEAAADuAADdAAC7AACqAACIAAB3AABVAABEAAAi" +
    "AAARAAAA7gAA3QAAuwAAqgAAiAAAdwAAVQAARAAAIgAAEe7u7t3d3bu7u6qqqoiIiHd3d1VVVURERCIiIhEREQAAACH5BAEAAMYALAAAAAALABEA" +
    "AAg/AI0JFGhvoEGC+vodRKgv4UF7DSMqZBixoUKIFSv2w5jRIseOGztK/JgxpMiEJDWmHHkSZUuTIvvt60ezps2AADs=";
Medical_Image_Viewer.viewer.ColorTable.ARROW_ICON_WIDTH = 11;

Medical_Image_Viewer.viewer.ColorTable.DEFAULT_COLOR_TABLE = Medical_Image_Viewer.viewer.ColorTable.TABLE_GRAYSCALE;

Medical_Image_Viewer.viewer.ColorTable.PARAMETRIC_COLOR_TABLES = [Medical_Image_Viewer.viewer.ColorTable.TABLE_RED2YELLOW,
    Medical_Image_Viewer.viewer.ColorTable.TABLE_BLUE2GREEN];

Medical_Image_Viewer.viewer.ColorTable.OVERLAY_COLOR_TABLES = [
    Medical_Image_Viewer.viewer.ColorTable.TABLE_RED2WHITE,
    Medical_Image_Viewer.viewer.ColorTable.TABLE_GREEN2WHITE,
    Medical_Image_Viewer.viewer.ColorTable.TABLE_BLUE2WHITE
];

Medical_Image_Viewer.viewer.ColorTable.TABLE_ALL = [
    Medical_Image_Viewer.viewer.ColorTable.TABLE_GRAYSCALE,
    Medical_Image_Viewer.viewer.ColorTable.TABLE_SPECTRUM,
    Medical_Image_Viewer.viewer.ColorTable.TABLE_FIRE,
    Medical_Image_Viewer.viewer.ColorTable.TABLE_HOTANDCOLD,
    Medical_Image_Viewer.viewer.ColorTable.TABLE_GOLD,
    Medical_Image_Viewer.viewer.ColorTable.TABLE_RED2YELLOW,
    Medical_Image_Viewer.viewer.ColorTable.TABLE_BLUE2GREEN,
    Medical_Image_Viewer.viewer.ColorTable.TABLE_RED2WHITE,
    Medical_Image_Viewer.viewer.ColorTable.TABLE_GREEN2WHITE,
    Medical_Image_Viewer.viewer.ColorTable.TABLE_BLUE2WHITE
];

Medical_Image_Viewer.viewer.ColorTable.LUT_MIN = 0;
Medical_Image_Viewer.viewer.ColorTable.LUT_MAX = 255;
Medical_Image_Viewer.viewer.ColorTable.ICON_SIZE = 18;
Medical_Image_Viewer.viewer.ColorTable.COLOR_BAR_WIDTH = 100;
Medical_Image_Viewer.viewer.ColorTable.COLOR_BAR_HEIGHT = 15;


/*** Static Methods ***/

Medical_Image_Viewer.viewer.ColorTable.findLUT = function (name) {
    var ctr;

    for (ctr = 0; ctr < Medical_Image_Viewer.viewer.ColorTable.TABLE_ALL.length; ctr += 1) {
        if (Medical_Image_Viewer.viewer.ColorTable.TABLE_ALL[ctr].name == name) {  // needs to be ==, not ===
            return Medical_Image_Viewer.viewer.ColorTable.TABLE_ALL[ctr];
        }
    }

    return Medical_Image_Viewer.viewer.ColorTable.TABLE_GRAYSCALE;
};



Medical_Image_Viewer.viewer.ColorTable.addCustomLUT = function (lut) {
    if (Medical_Image_Viewer.viewer.ColorTable.findLUT(lut.name).data === Medical_Image_Viewer.viewer.ColorTable.TABLE_GRAYSCALE.data) {
        Medical_Image_Viewer.viewer.ColorTable.TABLE_ALL.push(lut);
    }
};


/*** Prototype Methods ***/

Medical_Image_Viewer.viewer.ColorTable.prototype.updateMinLUT = function (minLUTnew) {
    this.updateLUT(minLUTnew, this.maxLUT);
};



Medical_Image_Viewer.viewer.ColorTable.prototype.updateMaxLUT = function (maxLUTnew) {
    this.updateLUT(this.minLUT, maxLUTnew);
};



Medical_Image_Viewer.viewer.ColorTable.prototype.updateLUT = function (minLUTnew, maxLUTnew) {
    var range, ctr, ctrKnot, value;

    this.maxLUT = maxLUTnew;
    this.minLUT = minLUTnew;
    range = this.maxLUT - this.minLUT;

    for (ctr = 0; ctr < this.lutData.length; ctr += 1) {
        this.knotThresholds[ctr] = (this.lutData[ctr][0] * range) + this.minLUT;
    }

    for (ctr = 0; ctr < (this.lutData.length - 1); ctr += 1) {
        this.knotRangeRatios[ctr] = Medical_Image_Viewer.viewer.ColorTable.LUT_MAX / (this.knotThresholds[ctr + 1] -
            this.knotThresholds[ctr]);
    }

    for (ctr = 0; ctr < 256; ctr += 1) {
        if (ctr <= this.minLUT) {
            this.LUTarrayR[ctr] = this.knotMin[1] * Medical_Image_Viewer.viewer.ColorTable.LUT_MAX;
            this.LUTarrayG[ctr] = this.knotMin[2] * Medical_Image_Viewer.viewer.ColorTable.LUT_MAX;
            this.LUTarrayB[ctr] = this.knotMin[3] * Medical_Image_Viewer.viewer.ColorTable.LUT_MAX;
        } else if (ctr > this.maxLUT) {
            this.LUTarrayR[ctr] = this.knotMax[1] * Medical_Image_Viewer.viewer.ColorTable.LUT_MAX;
            this.LUTarrayG[ctr] = this.knotMax[2] * Medical_Image_Viewer.viewer.ColorTable.LUT_MAX;
            this.LUTarrayB[ctr] = this.knotMax[3] * Medical_Image_Viewer.viewer.ColorTable.LUT_MAX;
        } else {
            for (ctrKnot = 0; ctrKnot < (this.lutData.length - 1); ctrKnot += 1) {
                if ((ctr > this.knotThresholds[ctrKnot]) && (ctr <= this.knotThresholds[ctrKnot + 1])) {
                    if (this.useGradation) {
                        value = (((ctr - this.knotThresholds[ctrKnot]) * this.knotRangeRatios[ctrKnot]) + 0.5) /
                            Medical_Image_Viewer.viewer.ColorTable.LUT_MAX;

                        this.LUTarrayR[ctr] = (((1 - value) * this.lutData[ctrKnot][1]) +
                            (value * this.lutData[ctrKnot + 1][1])) * Medical_Image_Viewer.viewer.ColorTable.LUT_MAX;
                        this.LUTarrayG[ctr] = (((1 - value) * this.lutData[ctrKnot][2]) +
                            (value * this.lutData[ctrKnot + 1][2])) * Medical_Image_Viewer.viewer.ColorTable.LUT_MAX;
                        this.LUTarrayB[ctr] = (((1 - value) * this.lutData[ctrKnot][3]) +
                            (value * this.lutData[ctrKnot + 1][3])) * Medical_Image_Viewer.viewer.ColorTable.LUT_MAX;
                    } else {
                        this.LUTarrayR[ctr] = (this.lutData[ctrKnot][1]) * Medical_Image_Viewer.viewer.ColorTable.LUT_MAX;
                        this.LUTarrayG[ctr] = (this.lutData[ctrKnot][2]) * Medical_Image_Viewer.viewer.ColorTable.LUT_MAX;
                        this.LUTarrayB[ctr] = (this.lutData[ctrKnot][3]) * Medical_Image_Viewer.viewer.ColorTable.LUT_MAX;
                    }
                }
            }
        }
    }
};



Medical_Image_Viewer.viewer.ColorTable.prototype.lookupRed = function (index) {
    /*jslint bitwise: true */

    if ((index >= 0) && (index < 256)) {
        return (this.LUTarrayR[index] & 0xff);
    }

    return 0;
};



Medical_Image_Viewer.viewer.ColorTable.prototype.lookupGreen = function (index) {
    /*jslint bitwise: true */

    if ((index >= 0) && (index < 256)) {
        return (this.LUTarrayG[index] & 0xff);
    }

    return 0;
};



Medical_Image_Viewer.viewer.ColorTable.prototype.lookupBlue = function (index) {
    /*jslint bitwise: true */

    if ((index >= 0) && (index < 256)) {
        return (this.LUTarrayB[index] & 0xff);
    }

    return 0;
};
