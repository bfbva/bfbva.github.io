/*
以下是代码中关键组件和功能的细分：
构造函数：构造函数用于创建卷对象的实例。
实例属性：
progressMeter：表示用于跟踪加载进度的进度条。
dialogHandler：处理与对话框相关的功能。
files：用于存储文件对象的数组。
rawData：用于存储原始数据的数组。
fileLength：表示文件的长度。
urls：用于存储 URL 的数组。
fileName：表示文件的名称。
compressed：指示文件是否被压缩的布尔值。
transform：转换信息。
numTimepoints：时间点数。
onFinishedRead：读取完成时调用的回调函数。
error：存储错误信息。
isLoaded：指示卷是否已加载。
loaded：指示是否加载数据。
params：其他参数。
header：的实例。Medical_Image_Viewer.volume.Header
imageData：的实例。Medical_Image_Viewer.volume.ImageData
静态伪常量：
Medical_Image_Viewer.volume.Volume.PROGRESS_LABEL_LOADING：表示加载进度标签的静态属性。
原型方法：
fileIsCompressed：检查文件是否根据其名称或数据进行压缩。
readFiles：读取文件数组并在完成后触发回调。
readNextFile：读取列表中的下一个文件。
readURLs：读取 URL 数组并在完成后触发回调。
loadURL：使用 AJAX 加载 URL。
readEachURL：异步读取每个 URL。
readBinaryData：读取二进制数据。
readNextBinaryData：读取下一个二进制数据。
readEncodedData：读取编码数据。
readNextEncodedData：读取下一个编码数据。
与获取体素数据和维度相关的各种方法。
decompress：如果数据被压缩，则解压缩数据。
finishedDecompress：完成解压的回调。
finishedReadData：完成读取数据的回调。
finishedReadHeaderData：完成读取标头数据的回调。
finishedReadImageData：完成图像数据读取的回调。
finishedLoad：完成加载的回调。
其他方法：
setOrigin和 ：设置并获取卷的原点。getOrigin
applyBestTransform：将最佳转换应用于卷。
isWorldSpaceOnly：检查卷是否仅在世界空间中。
getSeriesLabels：获取系列标签。
用于处理医学图像数据并提供加载、处理和可视化此类数据的功能。*/

/*jslint browser: true, node: true */
/*global GUNZIP_MAGIC_COOKIE1, GUNZIP_MAGIC_COOKIE2, Base64Binary, pako, numeric */

"use strict";

/*** Imports ***/
var Medical_Image_Viewer = Medical_Image_Viewer || {};
Medical_Image_Viewer.volume = Medical_Image_Viewer.volume || {};


/*** Constructor ***/
Medical_Image_Viewer.volume.Volume = Medical_Image_Viewer.volume.Volume || function (progressMeter, dialogHandler, params) {
    this.progressMeter = progressMeter;
    this.dialogHandler = dialogHandler;
    this.files = [];
    this.rawData = [];
    this.fileLength = 0;
    this.urls = null;
    this.fileName = null;
    this.compressed = false;
    this.transform = null;
    this.numTimepoints = 0;
    this.onFinishedRead = null;
    this.error = null;
    this.transform = null;
    this.isLoaded = false;
    this.numTimepoints = 1;
    this.loaded = false;
    this.params = params;

    this.header = new Medical_Image_Viewer.volume.Header((this.params !== undefined) && this.params.padAllImages);
    this.imageData = new Medical_Image_Viewer.volume.ImageData((this.params !== undefined) && this.params.padAllImages);
};


/*** Static Pseudo-constants ***/

Medical_Image_Viewer.volume.Volume.PROGRESS_LABEL_LOADING = "Loading";


/*** Prototype Methods ***/

Medical_Image_Viewer.volume.Volume.prototype.fileIsCompressed = function (filename, data) {
    var buf, magicCookie1, magicCookie2;

    if (filename && filename.indexOf(".gz") !== -1) {
        return true;
    }

    if (data) {
        buf = new DataView(data);

        magicCookie1 = buf.getUint8(0);
        magicCookie2 = buf.getUint8(1);

        if (magicCookie1 === GUNZIP_MAGIC_COOKIE1) {
            return true;
        }

        if (magicCookie2 === GUNZIP_MAGIC_COOKIE2) {
            return true;
        }
    }

    return false;
};



Medical_Image_Viewer.volume.Volume.prototype.readFiles = function (files, callback) {
    this.files = files;
    this.fileName = files[0].name;
    this.onFinishedRead = callback;
    this.compressed = this.fileIsCompressed(this.fileName);
    this.fileLength = this.files[0].size;
    this.readNextFile(this, 0);
};



Medical_Image_Viewer.volume.Volume.prototype.readNextFile = function (vol, index) {
    var blob;

    if (index < this.files.length) {
        blob = Medical_Image_Viewer.utilities.PlatformUtils.makeSlice(this.files[index], 0, this.files[index].size);

        try {
            var reader = new FileReader();

            reader.onloadend = Medical_Image_Viewer.utilities.ObjectUtils.bind(vol, function (evt) {
                if (evt.target.readyState === FileReader.DONE) {
                    vol.rawData[index] = evt.target.result;
                    setTimeout(function () {vol.readNextFile(vol, index + 1); }, 0);
                }
            });

            reader.onerror = Medical_Image_Viewer.utilities.ObjectUtils.bind(vol, function (evt) {
                vol.error = new Error("读取该文件时出现问题:\n\n" + evt.getMessage());
                vol.finishedLoad();
            });

            reader.readAsArrayBuffer(blob);
        } catch (err) {
            vol.error = new Error("读取该文件时出现问题:\n\n" + err.message);
            vol.finishedLoad();
        }
    } else {
        setTimeout(function () {vol.decompress(vol); }, 0);
    }
};



Medical_Image_Viewer.volume.Volume.prototype.readURLs = function (urls, callback) {
    var self = this;
    this.urls = urls;
    this.fileName = urls[0].substr(urls[0].lastIndexOf("/") + 1, urls[0].length);
    this.onFinishedRead = callback;
    this.compressed = this.fileIsCompressed(this.fileName);

    if (this.fileName.indexOf("?") !== -1) {
        this.fileName = this.fileName.substr(0, this.fileName.indexOf("?"));
    }

    this.rawData = [];
    this.loadedFileCount = 0;
    this.readEachURL(this)
        .done(function () {
            // recieves `arguments` which are results off xhr requests
            setTimeout(function () {self.decompress(self); }, 0);
        })
        .fail(function (vol, err, xhr) {

            var message = err.message || '';
            // if error came from ajax request
            if ( typeof xhr !== "undefined" ) {
                message = "Response status = " + xhr.status;
            }

            vol.error = new Error("读取该文件时出现问题 (" +
                vol.fileName + "):\n\n" + message);
            vol.finishedLoad();
        });
};



Medical_Image_Viewer.volume.Volume.prototype.loadURL = function (url, vol, index) {
    var supported, deferredLoading, xhr, progPerc, progressText;

    deferredLoading = jQuery.Deferred();

    supported = typeof new XMLHttpRequest().responseType === 'string';
    if (supported) {
        xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    vol.fileLength = vol.rawData.byteLength;
                    deferredLoading.resolve( xhr.response );
                } else {
                    deferredLoading.reject(vol,false,xhr);
                }
            }
        };

        xhr.onprogress = function (evt) {
            if(evt.lengthComputable) {
                deferredLoading.notify(evt.loaded, evt.total);
            }
        };

        xhr.send(null);
    } else {
        vol.error = new Error("读取该文件时出现问题 (" + vol.fileName +
            "):\n\n不支持响应类型。");
        vol.finishedLoad();
    }

    var promise = deferredLoading
        .promise()
        .done(function (file) {
            vol.loadedFileCount++;
            vol.rawData[index] = file;
        })
        .fail(function (vol, err, xhr) {
            console.error(vol, err, xhr);
        })
        .progress(function (loaded,total) {
            progPerc = parseInt(100 * (vol.loadedFileCount) / vol.urls.length, 10);
            progressText = Medical_Image_Viewer.volume.Volume.PROGRESS_LABEL_LOADING +
                ' image ' + (vol.loadedFileCount + 1) + ' of ' + vol.urls.length + ' (' + progPerc + '%)';
            vol.progressMeter.drawProgress(loaded / total, progressText);
        });

    return promise;
};


Medical_Image_Viewer.volume.Volume.prototype.readEachURL = function (vol) {
    var deferredLoads = [];

    for (var i = 0; i < vol.urls.length; i++) {
        var getFileDeferred = vol.loadURL(vol.urls[i], vol, i);
        deferredLoads.push(getFileDeferred);
    }

    return $.when.apply($, deferredLoads);
};


Medical_Image_Viewer.volume.Volume.prototype.readBinaryData = function (dataRefs, callback) {
    var vol = null;

    try {

        if (dataRefs[0] instanceof ArrayBuffer) {
            this.fileName = "未知";
        } else {
            this.fileName = dataRefs[0];
        }

        this.onFinishedRead = callback;
        vol = this;
        this.fileLength = 0;
        vol.readNextBinaryData(vol, 0, dataRefs);
    } catch (err) {
        if (vol) {
            vol.error = new Error("读取该文件时出现问题:\n\n" + err.message);
            vol.finishedLoad();
        }
    }
};

Medical_Image_Viewer.volume.Volume.prototype.readNextBinaryData = function (vol, index, dataRefs) {
    if (index < dataRefs.length) {
        try {
            if (dataRefs[index] instanceof ArrayBuffer) {
                vol.rawData[index] = dataRefs[index];
            } else {
                vol.rawData[index] = Medical_Image_Viewer.utilities.ObjectUtils.dereference(dataRefs[index]);
            }

            vol.compressed = this.fileIsCompressed(this.fileName, vol.rawData[index]);
            setTimeout(function () {vol.readNextBinaryData(vol, index + 1, dataRefs); }, 0);
        } catch (err) {
            if (vol) {
                vol.error = new Error("读取该文件时出现问题:\n\n" + err.message);
                vol.finishedLoad();
            }
        }
    } else {
        vol.decompress(vol);
    }
};

Medical_Image_Viewer.volume.Volume.prototype.readEncodedData = function (dataRefs, callback) {
    var vol = null;

    try {
        this.fileName = dataRefs[0];
        this.onFinishedRead = callback;
        vol = this;
        this.fileLength = 0;
        vol.readNextEncodedData(vol, 0, dataRefs);
    } catch (err) {
        if (vol) {
            vol.error = new Error("读取该文件时出现问题:\n\n" + err.message);
            vol.finishedLoad();
        }
    }
};



Medical_Image_Viewer.volume.Volume.prototype.readNextEncodedData = function (vol, index, dataRefs) {
    if (index < dataRefs.length) {
        try {
            var deref = Medical_Image_Viewer.utilities.ObjectUtils.dereference(dataRefs[index]);

            if (deref) {
                vol.rawData[index] = Base64Binary.decodeArrayBuffer(deref);
            } else {
                this.fileName = "未知";
                vol.rawData[index] = Base64Binary.decodeArrayBuffer(dataRefs[index]);
            }

            vol.compressed = this.fileIsCompressed(this.fileName, vol.rawData[index]);
            setTimeout(function () {vol.readNextEncodedData(vol, index + 1, dataRefs); }, 0);
        } catch (err) {
            if (vol) {
                vol.error = new Error("读取该文件时出现问题:\n\n" + err.message);
                vol.finishedLoad();
            }
        }
    } else {
        vol.decompress(vol);
    }
};



Medical_Image_Viewer.volume.Volume.prototype.getVoxelAtIndexNative = function (ctrX, ctrY, ctrZ, timepoint, useNN) {
    return this.transform.getVoxelAtIndexNative(ctrX, ctrY, ctrZ, 0, useNN);
};



Medical_Image_Viewer.volume.Volume.prototype.getVoxelAtIndex = function (ctrX, ctrY, ctrZ, timepoint, useNN) {
    return this.transform.getVoxelAtIndex(ctrX, ctrY, ctrZ, timepoint, useNN);
};



Medical_Image_Viewer.volume.Volume.prototype.getVoxelAtCoordinate = function (xLoc, yLoc, zLoc, timepoint, useNN) {
    return this.transform.getVoxelAtCoordinate(xLoc, yLoc, zLoc, timepoint, useNN);
};



Medical_Image_Viewer.volume.Volume.prototype.getVoxelAtMM = function (xLoc, yLoc, zLoc, timepoint, useNN) {
    return this.transform.getVoxelAtMM(xLoc, yLoc, zLoc, timepoint, useNN);
};



Medical_Image_Viewer.volume.Volume.prototype.hasError = function () {
    return (this.error !== null);
};



Medical_Image_Viewer.volume.Volume.prototype.getXDim = function () {
    return this.header.imageDimensions.xDim;
};



Medical_Image_Viewer.volume.Volume.prototype.getYDim = function () {
    return this.header.imageDimensions.yDim;
};



Medical_Image_Viewer.volume.Volume.prototype.getZDim = function () {
    return this.header.imageDimensions.zDim;
};



Medical_Image_Viewer.volume.Volume.prototype.getXSize = function () {
    return this.header.voxelDimensions.xSize;
};



Medical_Image_Viewer.volume.Volume.prototype.getYSize = function () {
    return this.header.voxelDimensions.ySize;
};



Medical_Image_Viewer.volume.Volume.prototype.getZSize = function () {
    return this.header.voxelDimensions.zSize;
};



Medical_Image_Viewer.volume.Volume.prototype.decompress = function (vol) {
    vol.compressed = vol.compressed || vol.fileIsCompressed(vol.fileName, vol.rawData[0]);

    if (vol.compressed) {
        try {
            pako.inflate(new Uint8Array(vol.rawData[0]), null, this.progressMeter,
                function (data) {vol.finishedDecompress(vol, data.buffer); });
        } catch (err) {
            console.log(err);
        }
    } else {
        setTimeout(function () {vol.finishedReadData(vol); }, 0);
    }
};



Medical_Image_Viewer.volume.Volume.prototype.finishedDecompress = function (vol, data) {
    vol.rawData[0] = data;
    setTimeout(function () {vol.finishedReadData(vol); }, 0);
};



Medical_Image_Viewer.volume.Volume.prototype.finishedReadData = function (vol) {
    vol.rawData = Medical_Image_Viewer.utilities.ArrayUtils.cleanArray(vol.rawData);

    vol.header.readHeaderData(vol.fileName, vol.rawData, this.progressMeter, this.dialogHandler,
        Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.finishedReadHeaderData));
};



Medical_Image_Viewer.volume.Volume.prototype.finishedReadHeaderData = function () {
    this.rawData = null;

    if (this.header.hasError()) {
        this.error = this.header.error;
        console.error(this.error.stack);
        this.onFinishedRead(this);
        return;
    }

    this.header.imageType.swapped = (this.header.imageType.littleEndian !== Medical_Image_Viewer.utilities.PlatformUtils.isPlatformLittleEndian());

    var name = this.header.getName();

    if (name) {
        this.fileName = this.header.getName();
    }

    this.header.readImageData(this.progressMeter, Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.finishedReadImageData));
};



Medical_Image_Viewer.volume.Volume.prototype.finishedReadImageData = function (imageData) {
    this.imageData.readFileData(this.header, imageData, Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.finishedLoad));
};



Medical_Image_Viewer.volume.Volume.prototype.finishedLoad = function () {
    if (!this.loaded) {
        this.loaded = true;
        if (this.onFinishedRead) {
            if (!this.hasError()) {
                this.transform = new Medical_Image_Viewer.volume.Transform(Medical_Image_Viewer.volume.Transform.IDENTITY.clone(), this);
                this.numTimepoints = this.header.imageDimensions.timepoints || 1;
                this.applyBestTransform();
            } else {
                console.log(this.error);
            }

            this.isLoaded = true;
            this.rawData = null;
            this.onFinishedRead(this);
        }
    }
};



Medical_Image_Viewer.volume.Volume.prototype.setOrigin = function (coord) {
    var coordNew = this.header.orientation.convertCoordinate(coord, new Medical_Image_Viewer.core.Coordinate(0, 0, 0));
    this.header.origin.setCoordinate(coordNew.x, coordNew.y, coordNew.z);
};



Medical_Image_Viewer.volume.Volume.prototype.getOrigin = function () {
    return this.header.orientation.convertCoordinate(this.header.origin, new Medical_Image_Viewer.core.Coordinate(0, 0, 0));
};



Medical_Image_Viewer.volume.Volume.prototype.applyBestTransform = function () {
    var bestXform = this.header.getBestTransform();

    if (bestXform !== null) {
        this.transform.worldMatNifti = numeric.inv(bestXform);
        this.setOrigin(this.header.getBestTransformOrigin());
        this.transform.updateWorldMat();
    }
};



Medical_Image_Viewer.volume.Volume.prototype.isWorldSpaceOnly = function () {
    /*jslint bitwise: true */

    var nifti, foundDataOrderTransform = false;

    if (this.header.fileFormat instanceof Medical_Image_Viewer.volume.nifti.HeaderNIFTI) {
        nifti = this.header.fileFormat;

        if (nifti.nifti.qform_code > 0) {
            foundDataOrderTransform |= !nifti.qFormHasRotations();
        }

        if (nifti.nifti.sform_code > 0) {
            foundDataOrderTransform |= !nifti.sFormHasRotations();
        }

        return !foundDataOrderTransform;
    }

    return false;
};



Medical_Image_Viewer.volume.Volume.prototype.getSeriesLabels = function () {
    return this.header.getSeriesLabels();
};
