
/*jslint browser: true, node: true */
/*global */
/*根据医学图像的特定格式和类型，将原始文件数据解析为特定类型的数据数组，并在解析完成后执行回调函数 */
"use strict";
/*** Imports ***/
var Medical_Image_Viewer = Medical_Image_Viewer || {};
Medical_Image_Viewer.volume = Medical_Image_Viewer.volume || {};

/*** Constructor ***/
/* 构造函数 Medical_Image_Viewer.volume.ImageData 接受一个参数 pad，并创建一个 ImageData 对象。
   该对象具有一个属性 data 用于存储解析后的图像数据，以及一个 pad 属性用于指示是否需要进行特定的填充操作*/
Medical_Image_Viewer.volume.ImageData = Medical_Image_Viewer.volume.ImageData || function (pad) {
    this.data = null;
    this.pad = pad;
};

/*** Prototype Methods ***/
/*readFileData 是用于解析文件数据的核心方法。
  它首先根据填充标志调用 padIsometric 方法进行填充操作。
  根据图像类型的不同，使用不同的 TypedArray 来存储数据，例如 Uint8Array、Int16Array、Float32Array 等。
  最后，在解析完成后调用传入的回调函数 onReadFinish。
 */
Medical_Image_Viewer.volume.ImageData.prototype.readFileData = function (header, buffer, onReadFinish) {
    var numVoxels, dv, ctr, numVoxels2, rgbBySample;
    if (this.pad) {
        buffer = this.padIsometric(header, buffer);
    }
    // create typed array
    if (header.imageType.datatype === Medical_Image_Viewer.volume.ImageType.DATATYPE_RGB) {
        /*jslint bitwise: true */
        numVoxels = buffer.byteLength / 3;
        numVoxels2 = 2 * numVoxels;
        rgbBySample = header.imageType.rgbBySample;
        dv = new DataView(buffer, 0);
        this.data = new Uint32Array(numVoxels);
        if (rgbBySample) {
            for (ctr = 0; ctr < numVoxels; ctr += 1) {
                this.data[ctr] |= ((dv.getUint8(ctr) << 16));
            }

            for (ctr = 0; ctr < numVoxels; ctr += 1) {
                this.data[ctr] |= ((dv.getUint8(ctr + numVoxels) << 8));
            }

            for (ctr = 0; ctr < numVoxels; ctr += 1) {
                this.data[ctr] |= ((dv.getUint8(ctr + numVoxels2)));
            }
        } else {
            for (ctr = 0; ctr < numVoxels; ctr += 1) {
                this.data[ctr] = ((dv.getUint8(ctr * 3) << 16) | (dv.getUint8(ctr * 3 + 1) << 8) | dv.getUint8(ctr * 3 + 2));
            }
        }
    } else if ((header.imageType.datatype === Medical_Image_Viewer.volume.ImageType.DATATYPE_INTEGER_SIGNED) &&
        (header.imageType.numBytes === 1)) {
        this.data = new Int8Array(buffer, 0, buffer.byteLength);
    } else if ((header.imageType.datatype === Medical_Image_Viewer.volume.ImageType.DATATYPE_INTEGER_UNSIGNED) &&
        (header.imageType.numBytes === 1)) {
        this.data = new Uint8Array(buffer, 0, buffer.byteLength);
    } else if ((header.imageType.datatype === Medical_Image_Viewer.volume.ImageType.DATATYPE_INTEGER_SIGNED) &&
        (header.imageType.numBytes === 2)) {
        this.data = new Int16Array(buffer, 0, buffer.byteLength / 2);
    } else if ((header.imageType.datatype === Medical_Image_Viewer.volume.ImageType.DATATYPE_INTEGER_UNSIGNED) &&
        (header.imageType.numBytes === 2)) {
        this.data = new Uint16Array(buffer, 0, buffer.byteLength / 2);
    } else if ((header.imageType.datatype === Medical_Image_Viewer.volume.ImageType.DATATYPE_INTEGER_SIGNED) &&
        (header.imageType.numBytes === 4)) {
        this.data = new Int32Array(buffer, 0, buffer.byteLength / 4);
    } else if ((header.imageType.datatype === Medical_Image_Viewer.volume.ImageType.DATATYPE_INTEGER_UNSIGNED) &&
        (header.imageType.numBytes === 4)) {
        this.data = new Uint32Array(buffer, 0, buffer.byteLength / 4);
    } else if ((header.imageType.datatype === Medical_Image_Viewer.volume.ImageType.DATATYPE_FLOAT) && (header.imageType.numBytes === 4)) {
        if (header.imageType.swapped) {
            numVoxels = buffer.byteLength / Float32Array.BYTES_PER_ELEMENT;
            dv = new DataView(buffer, 0);
            this.data = new Float32Array(numVoxels);
            for (ctr = 0; ctr < numVoxels; ctr += 1) {
                this.data[ctr] = dv.getFloat32(ctr * Float32Array.BYTES_PER_ELEMENT);
            }
        } else {
            this.data = new Float32Array(buffer, 0, buffer.byteLength / 4);
        }
    } else if ((header.imageType.datatype === Medical_Image_Viewer.volume.ImageType.DATATYPE_FLOAT) && (header.imageType.numBytes === 8)) {
        if (header.imageType.swapped) {
            numVoxels = buffer.byteLength / Float64Array.BYTES_PER_ELEMENT;
            dv = new DataView(buffer, 0);
            this.data = new Float64Array(numVoxels);

            for (ctr = 0; ctr < numVoxels; ctr += 1) {
                this.data[ctr] = dv.getFloat64(ctr * Float64Array.BYTES_PER_ELEMENT);
            }
        } else {
            this.data = new Float64Array(buffer, 0, buffer.byteLength / 8);
        }
    }

    onReadFinish();
};


/* padIsometric 用于对医学图像数据进行等距填充操作。
   在填充操作中，根据图像的原始尺寸和像素尺寸计算出需要填充的像素数量，然后在新的数据缓冲区中进行填充操作，最终返回填充后的数据缓冲区。*/
Medical_Image_Viewer.volume.ImageData.prototype.padIsometric = function (header, data) {
    var id = header.imageDimensions,
        vd = header.voxelDimensions,
        numBytes = header.imageType.numBytes,
        buf = new Uint8Array(data, 0, data.byteLength),
        cols = id.colsOrig,
        rows = id.rowsOrig,
        slices = id.slicesOrig,
        colExt = (cols * vd.colSize),
        rowExt = (rows * vd.rowSize),
        sliceExt = (slices * vd.sliceSize),
        largestDim = Math.max(Math.max(colExt, rowExt), sliceExt),
        colDiff = parseInt((largestDim - colExt) / vd.colSize / 2, 10),
        rowDiff = parseInt((largestDim - rowExt) / vd.rowSize / 2, 10),
        sliceDiff = parseInt((largestDim - sliceExt) / vd.sliceSize / 2, 10),
        colsNew = (cols+2*colDiff),
        rowsNew = (rows+2*rowDiff),
        slicesNew = (slices+2*sliceDiff),
        colsBytes = cols * numBytes,
        colDiffBytes = colDiff * numBytes,
        rowDiffBytes = rowDiff * colsNew * numBytes,
        sliceDiffBytes = sliceDiff * (colsNew * rowsNew) * numBytes,
        indexPadded = 0,
        index = 0;

    var dataPaddedBuffer = new ArrayBuffer(colsNew * rowsNew * slicesNew * numBytes);
    var dataPadded = new Uint8Array(dataPaddedBuffer, 0, dataPaddedBuffer.byteLength);

    indexPadded += sliceDiffBytes;
    for (var ctrS = 0; ctrS < slices; ctrS += 1) {
        indexPadded += rowDiffBytes;

        for (var ctrR = 0; ctrR < rows; ctrR += 1) {
            indexPadded += colDiffBytes;

            for (var ctrC = 0; ctrC < colsBytes; ctrC += 1, index++, indexPadded++) {
                dataPadded[indexPadded] = buf[index];
            }

            indexPadded += colDiffBytes;
        }

        indexPadded += rowDiffBytes;
    }

    return dataPaddedBuffer;
};
