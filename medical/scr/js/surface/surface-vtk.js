
/*jslint browser: true, node: true */
/*global  */

"use strict";

/*** Imports ***/
var Medical_Image_Viewer = Medical_Image_Viewer || {};
Medical_Image_Viewer.surface = Medical_Image_Viewer.surface || {};


/*** Constructor ***/
Medical_Image_Viewer.surface.SurfaceVTK = Medical_Image_Viewer.surface.SurfaceVTK || function () {
        this.error = null;
        this.onFinishedRead = null;
        this.dv = null;
        this.index = 0;
        this.littleEndian = true;
        this.numPoints = 0;
        this.pointData = null;
        this.triangleData = null;
        this.normalsData = null;
        this.colorsData = null;
        this.vtkVersion = null;
        this.description = null;
        this.ascii = false;
        this.volume = null;
        this.done = false;
        this.headerRead = false;
    };


/*** 包括VTK文件中不同部分和元素的标识符，如文件版本、数据格式、数据集类型，以及各种VTK数据元素，如点、多边形和法线。***/

Medical_Image_Viewer.surface.SurfaceVTK.MAGIC_NUMBER = "# vtk DataFile Version";
Medical_Image_Viewer.surface.SurfaceVTK.MAGIC_NUMBER_ASCII = "ASCII";
Medical_Image_Viewer.surface.SurfaceVTK.MAGIC_NUMBER_DATASET = "DATASET";
Medical_Image_Viewer.surface.SurfaceVTK.MAGIC_NUMBER_POLYDATA = "POLYDATA";
Medical_Image_Viewer.surface.SurfaceVTK.MAGIC_NUMBER_POINTS = "POINTS";
Medical_Image_Viewer.surface.SurfaceVTK.MAGIC_NUMBER_POLYGONS = "POLYGONS";
Medical_Image_Viewer.surface.SurfaceVTK.MAGIC_NUMBER_NORMALS = "NORMALS";


/*** Static Methods ***/

Medical_Image_Viewer.surface.SurfaceVTK.isThisFormat = function (filename) {
    return filename.endsWith(".vtk");
};



/*** Prototype Methods ***/

Medical_Image_Viewer.surface.SurfaceVTK.prototype.isSurfaceDataBinary = function () {
    return true;
};



Medical_Image_Viewer.surface.SurfaceVTK.prototype.hasOverlay = function () {
    return false;
};
//负责从DataView对象中读取下一行数据，DataView对象通常用于在JavaScript中读取二进制数据。
Medical_Image_Viewer.surface.SurfaceVTK.prototype.getNextLine = function (limit) {
    var ctr, val, array = [];

    if (!limit) {
        limit = 256;
    }

    for (ctr = 0; ctr < limit; ctr += 1) {
        if (this.index >= this.dv.byteLength) {
            this.done = true;
            break;
        }

        val = this.dv.getUint8(this.index++);
        if (val < 32) { // newline
            if ((!this.headerRead || this.ascii) && (this.index < this.dv.byteLength) && (this.dv.getUint8(this.index) < 32)) {
                this.index++;
            }
            break;
        }

        array[ctr] = val;
    }

    return String.fromCharCode.apply(null, array);
};


//处理数据，设置各种参数，并处理输入的不同部分
Medical_Image_Viewer.surface.SurfaceVTK.prototype.readData = function (data, progress, onFinishedRead, volume) {
    var surf = this, section;
    progress(0.2);

    this.onFinishedRead = onFinishedRead;
    this.dv = new DataView(data);
    this.volume = volume;

    this.vtkVersion = this.getNextLine().substring(Medical_Image_Viewer.surface.SurfaceVTK.MAGIC_NUMBER.length).trim();
    this.description = this.getNextLine().trim();
    this.ascii = (this.getNextLine() == Medical_Image_Viewer.surface.SurfaceVTK.MAGIC_NUMBER_ASCII);
    this.datasetType = this.getNextLine().substring(Medical_Image_Viewer.surface.SurfaceVTK.MAGIC_NUMBER_DATASET.length).trim();

    this.headerRead = true;

    if (this.datasetType != Medical_Image_Viewer.surface.SurfaceVTK.MAGIC_NUMBER_POLYDATA) {
        this.error = new Error("VTK: Only POLYDATA format is currently supported!");
        this.onFinishedRead();
    }

    section = this.getNextLine().split(" ");
    if (section[0] == Medical_Image_Viewer.surface.SurfaceVTK.MAGIC_NUMBER_POINTS) {
        setTimeout(function() { surf.readDataPoints(surf, section[1], progress); }, 0);
    }
};

/*看起来你分享了另一个与使用VTK（可视化工具包）的医学图像查看器相关的JavaScript函数。
这个函数处理下一组数据，更新进度，并根据正在读取的数据类型触发进一步的操作。
该函数检查不同类型的数据（点、法线、三角形），并相应地更新进度。它还检查是否已经读取了所有必需的数据，如果是，则触发`onFinishedRead`函数。如果没有，则根据遇到的部分类型继续处理下一组数据。
*/
Medical_Image_Viewer.surface.SurfaceVTK.prototype.readNextData = function (surf, progress) {
    var section, progressCount = 0.2;

    if (surf.pointData) {
        progressCount += 0.2;
    }

    if (surf.normalsData) {
        progressCount += 0.2;
    }

    if (surf.triangleData) {
        progressCount += 0.2;
    }

    progress(progressCount);

    if (surf.done || (surf.pointData && surf.normalsData && surf.triangleData)) {
        surf.onFinishedRead();
    } else {
        section = this.getNextLine().split(" ");

        if (section && (section[0] == Medical_Image_Viewer.surface.SurfaceVTK.MAGIC_NUMBER_POINTS)) {
            setTimeout(function() { surf.readDataPoints(surf, section[1], progress); }, 0);
        } else if (section && (section[0] == Medical_Image_Viewer.surface.SurfaceVTK.MAGIC_NUMBER_POLYGONS)) {
            setTimeout(function() { surf.readDataTriangles(surf, section[1], progress); }, 0);
        } else if (section && (section[0] == Medical_Image_Viewer.surface.SurfaceVTK.MAGIC_NUMBER_NORMALS)) {
            setTimeout(function() { surf.readDataNormals(surf, progress); }, 0);
        } else {
            setTimeout(function() { surf.readNextData(surf, progress); }, 0);
        }
    }
};

//用于读取和处理3D表面数据。readDataPoints和readDataNormals，它们分别读取表面的点数据和法线数据，
Medical_Image_Viewer.surface.SurfaceVTK.prototype.readDataPoints = function (surf, numPoints, progress) {
    var ctr, compIndex = 0, comps = [], parts, pointIndex = 0, numPointsVals = numPoints * 3;

    surf.numPoints = numPoints;
    surf.pointData = new Float32Array(numPointsVals);

    var orientation = surf.volume.header.orientation.orientation;
    var vd = surf.volume.header.voxelDimensions;
    var origin = surf.volume.header.origin;
    var colFlip = (orientation.charAt(3) === '-' ? 1 : -1) * (vd.flip ? -1 : 1);
    var rowFlip = (orientation.charAt(4) !== '-' ? 1 : -1);
    var sliceFlip = (orientation.charAt(5) !== '-' ? 1 : -1);
    var xIndex = orientation.indexOf('X');
    var yIndex = orientation.indexOf('Y');
    var zIndex = orientation.indexOf('Z');
    var xDiff = colFlip * origin.x * vd.xSize;
    var yDiff = rowFlip * origin.y * vd.ySize;
    var zDiff = sliceFlip * origin.z * vd.zSize;

    if (surf.ascii) {
        while (pointIndex < numPointsVals) {
            parts = surf.getNextLine().trim().split(" ");

            for (ctr = 0; ctr < parts.length; ctr += 1) {
                comps[compIndex] = parseFloat(parts[ctr]);

                if (compIndex === 2) {
                    surf.pointData[pointIndex++] = comps[xIndex] * colFlip - xDiff;
                    surf.pointData[pointIndex++] = comps[yIndex] * rowFlip - yDiff;
                    surf.pointData[pointIndex++] = comps[zIndex] * sliceFlip - zDiff;
                }

                compIndex++;
                compIndex %= 3;
            }
        }
    } else {
        for (ctr = 0; ctr < numPointsVals; ctr += 1, surf.index += 4) {
            comps[compIndex] = surf.dv.getFloat32(surf.index, false);

            if (compIndex === 2) {
                surf.pointData[pointIndex++] = comps[xIndex] * colFlip - xDiff;
                surf.pointData[pointIndex++] = comps[yIndex] * rowFlip - yDiff;
                surf.pointData[pointIndex++] = comps[zIndex] * sliceFlip - zDiff;
            }

            compIndex++;
            compIndex %= 3;
        }
    }

    surf.readNextData(surf, progress);
};
Medical_Image_Viewer.surface.SurfaceVTK.prototype.readDataNormals = function (surf, progress) {
    var ctr, parts, normalsIndex = 0, numNormalsVals = surf.numPoints * 3;

    surf.normalsData = new Float32Array(numNormalsVals);

    if (surf.ascii) {
        while (normalsIndex < numNormalsVals) {
            parts = surf.getNextLine().trim().split(" ");

            for (ctr = 0; ctr < parts.length; ctr += 1) {
                surf.normalsData[normalsIndex++] = parseFloat(parts[ctr]);
            }
        }
    } else {
        for (ctr = 0; ctr < numNormalsVals; ctr += 1, surf.index += 4) {
            surf.normalsData[ctr] = surf.dv.getFloat32(surf.index, false);
        }
    }

    surf.readNextData(surf, progress);
};

/*用于读取医学图像浏览器中表面的三角形数据。该函数接受表面对象、三角形数量和进度参数。

该函数首先创建一个新的 Uint32Array 来存储三角形数据。如果表面是 ASCII 格式，则读取每一行，
去除空格并按空格拆分。然后将每个值解析为整数并存储在 triangleData 数组中。

如果表面不是 ASCII 格式，则使用 for 循环遍历每个三角形。它使用 DataView 对象从二进制数据中获取三角形索引，
并将其存储在 triangleData 数组中。
最后，该函数调用表面对象的 readNextData 函数，并传入进度参数。
*/
Medical_Image_Viewer.surface.SurfaceVTK.prototype.readDataTriangles = function (surf, numTriangles, progress) {
    var ctr, parts, triIndex = 0, numIndexVals = numTriangles * 3;

    surf.triangleData = new Uint32Array(numIndexVals);

    if (surf.ascii) {
        while (triIndex < numIndexVals) {
            parts = surf.getNextLine().trim().split(" ");

            for (ctr = 1; ctr < parts.length; ctr += 1) {
                surf.triangleData[triIndex++] = parseInt(parts[ctr], 10);
            }
        }
    } else {
        for (ctr = 0; ctr < numTriangles; ctr += 1, surf.index += (4 * 4)) {
            surf.triangleData[(ctr * 3)] = surf.dv.getUint32(surf.index + 4, false);
            surf.triangleData[(ctr * 3) + 1] = surf.dv.getUint32(surf.index + 8, false);
            surf.triangleData[(ctr * 3) + 2] = surf.dv.getUint32(surf.index + 12, false);
        }
    }

    surf.readNextData(surf, progress);
};



Medical_Image_Viewer.surface.SurfaceVTK.prototype.getColorsData = function () {
    return null;
};



Medical_Image_Viewer.surface.SurfaceVTK.prototype.getNumSurfaces = function () {
    return 1;
};



Medical_Image_Viewer.surface.SurfaceVTK.prototype.getNumPoints = function () {
    return this.pointData.length / 3;
};



Medical_Image_Viewer.surface.SurfaceVTK.prototype.getNumTriangles = function () {
    return this.triangleData.length / 3;
};



Medical_Image_Viewer.surface.SurfaceVTK.prototype.getSolidColor = function () {
    return this.solidColor;
};



Medical_Image_Viewer.surface.SurfaceVTK.prototype.getPointData = function () {
    return this.pointData;
};



Medical_Image_Viewer.surface.SurfaceVTK.prototype.getNormalsData = function () {
    return this.normalsData;
};



Medical_Image_Viewer.surface.SurfaceVTK.prototype.getTriangleData = function () {
    return this.triangleData;
};
