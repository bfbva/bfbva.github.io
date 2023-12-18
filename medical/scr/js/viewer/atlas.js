
/*jslint browser: true, node: true */
/*global */

"use strict";

/*** Imports ***/
var Medical_Image_Viewer = Medical_Image_Viewer || {};
Medical_Image_Viewer.viewer = Medical_Image_Viewer.viewer || {};


/*** Constructor ***/
Medical_Image_Viewer.viewer.Atlas = Medical_Image_Viewer.viewer.Atlas || function (atlas, container, callback) {
    this.container = container;
    this.callback = callback;
    this.name = null;
    this.transformedname = null;
    this.labels = [];
    this.atlasLabelData = atlas.labels;
    this.volume = new Medical_Image_Viewer.volume.Volume(container.display, container.viewer);
    this.displayColumns = null;
    this.returnLabels = null;
    this.transform = null;
    this.currentAtlas = null;
    this.maxLabels = 0;
    this.probabilistic = false;

    var loadableImage = container.findLoadableImage(atlas.labels.atlas.header.images.summaryimagefile);

    if (container.params.atlasURL) {
        this.volume.readURLs([container.params.atlasURL], Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.readFinished));
    } else if ((loadableImage !== null) && (loadableImage.encode !== undefined)) {
        this.volume.readEncodedData([loadableImage.encode], Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.readFinished));
    } else if ((loadableImage !== null) && (loadableImage.url !== undefined)) {
        this.volume.readURLs([loadableImage.url], Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.readFinished));
    }
};


/*** Static Pseudo-constants ***/

Medical_Image_Viewer.viewer.Atlas.MAX_LABELS = 4;
Medical_Image_Viewer.viewer.Atlas.PROBABILISTIC = [ "probabalistic", "probabilistic", "statistic" ]; // typo is in FSL < 5.0.2
Medical_Image_Viewer.viewer.Atlas.LABEL_SPLIT_REGEX = /\.|:|,|\//;  // possible delimiters


/*** Prototype Methods ***/

Medical_Image_Viewer.viewer.Atlas.prototype.getLabelAtCoordinate = function (xLoc, yLoc, zLoc) {
    var xTrans, yTrans, zTrans, val;

    if (this.transform && (this.currentAtlas === this.transformedname)) {
        xTrans = ((xLoc * this.transform[0][0]) + (yLoc * this.transform[0][1]) + (zLoc * this.transform[0][2]) +
            (this.transform[0][3]));
        yTrans = ((xLoc * this.transform[1][0]) + (yLoc * this.transform[1][1]) + (zLoc * this.transform[1][2]) +
            (this.transform[1][3]));
        zTrans = ((xLoc * this.transform[2][0]) + (yLoc * this.transform[2][1]) + (zLoc * this.transform[2][2]) +
            (this.transform[2][3]));
    } else {
        xTrans = xLoc;
        yTrans = yLoc;
        zTrans = zLoc;
    }

    if (Medical_Image_Viewer.Container.atlasWorldSpace) {
        val = (this.volume.getVoxelAtCoordinate(xTrans, yTrans, zTrans, 0, true));
    } else {
        val = (this.volume.getVoxelAtIndex(xLoc, yLoc, zLoc, 0, true));
    }

    if (this.probabilistic) {
        val -= 1;
    }

    return this.formatLabels(this.labels[val], this.returnLabels);
};



Medical_Image_Viewer.viewer.Atlas.prototype.readFinished = function () {
    this.parseTransform();
    this.parseLabels();
    this.parseDisplayColumns();
    this.maxLabels = this.findMaxLabelParts();
    this.probabilistic = this.atlasLabelData.atlas.header.type &&
    ((this.atlasLabelData.atlas.header.type.toLowerCase() === Medical_Image_Viewer.viewer.Atlas.PROBABILISTIC[0]) ||
    (this.atlasLabelData.atlas.header.type.toLowerCase() === Medical_Image_Viewer.viewer.Atlas.PROBABILISTIC[1]) ||
    (this.atlasLabelData.atlas.header.type.toLowerCase() === Medical_Image_Viewer.viewer.Atlas.PROBABILISTIC[2]));

    this.returnLabels = [];
    this.returnLabels.length = this.maxLabels;

    if (this.atlasLabelData.atlas.header.transformedname) {
        this.transformedname = this.atlasLabelData.atlas.header.transformedname;
    }

    this.name = this.atlasLabelData.atlas.header.name;
    this.currentAtlas = this.name;

    var params = this.container.params.atlas;
    if (params) {
        if (params === this.transformedname) {
            this.currentAtlas = this.transformedname;
        }
    }

    this.callback();
};



Medical_Image_Viewer.viewer.Atlas.prototype.parseDisplayColumns = function () {
    var index, columns, ctr;

    if (this.atlasLabelData.atlas.header.display) {  // uses "display" attribute
        this.displayColumns = [];
        index = 0;
        columns = this.atlasLabelData.atlas.header.display.split(Medical_Image_Viewer.viewer.Atlas.LABEL_SPLIT_REGEX);

        for (ctr = 0; ctr < columns.length; ctr += 1) {
            if (columns[ctr] === "*") {
                this.displayColumns[index] = ctr;
                index += 1;
            }
        }
    }
};



Medical_Image_Viewer.viewer.Atlas.prototype.parseTransform = function () {
    var parts, ctrOut, ctrIn;

    if (this.atlasLabelData.atlas.header.transform) {
        parts = this.atlasLabelData.atlas.header.transform.split(" ");
        this.transform = Medical_Image_Viewer.volume.Transform.IDENTITY.clone();

        if (parts.length === 16) {
            for (ctrOut = 0; ctrOut < 4; ctrOut += 1) {
                for (ctrIn = 0; ctrIn < 4; ctrIn += 1) {
                    this.transform[ctrOut][ctrIn] = parseFloat(parts[(ctrOut * 4) + ctrIn]);
                }
            }
        }
    }
};



Medical_Image_Viewer.viewer.Atlas.prototype.parseLabels = function () {
    var ctr, index, label;

    for (ctr = 0; ctr < this.atlasLabelData.atlas.data.label.length; ctr += 1) {
        label = this.atlasLabelData.atlas.data.label[ctr];

        if (label.index) {
            index = parseInt(label.index, 10);
        } else {
            index = ctr;
        }

        if (label.content) {
            this.labels[index] = label.content;
        } else {
            this.labels[index] = label;
        }
    }
};



Medical_Image_Viewer.viewer.Atlas.prototype.formatLabels = function (labelString, labelArray) {
    var ctr, start, labelParts, numLabels;

    if (labelString) {
        labelParts = labelString.split(Medical_Image_Viewer.viewer.Atlas.LABEL_SPLIT_REGEX);

        if (this.displayColumns) {
            for (ctr = 0; ctr < labelParts.length; ctr += 1) {
                if (ctr < this.displayColumns.length) {
                    labelArray[ctr] = labelParts[this.displayColumns[ctr]];
                }
            }
        } else {
            numLabels = labelParts.length;
            start = 0;

            if (numLabels > Medical_Image_Viewer.viewer.Atlas.MAX_LABELS) {
                start = (numLabels - Medical_Image_Viewer.viewer.Atlas.MAX_LABELS);
            }

            for (ctr = start; ctr < labelParts.length; ctr += 1) {
                labelArray[ctr] = labelParts[ctr].trim();
            }
        }
    } else {
        for (ctr = 0; ctr < labelArray.length; ctr += 1) {
            labelArray[ctr] = "";
        }
    }

    return labelArray;
};



Medical_Image_Viewer.viewer.Atlas.prototype.findMaxLabelParts = function () {
    var ctr, tempArray;

    if (this.displayColumns) {
        return this.displayColumns.length;
    }

    tempArray = [];

    for (ctr = 0; ctr < this.labels.length; ctr += 1) {
        this.formatLabels(this.labels[ctr], tempArray);
    }

    return tempArray.length;
};
