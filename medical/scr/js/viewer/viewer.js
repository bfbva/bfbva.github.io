
/*jslint browser: true, node: true */
/*global $, Medical_Image_Viewer_SPACING, Medical_Image_ViewerContainers, Medical_Image_ViewerFloorFast, Medical_Image_ViewerRoundFast, Medical_Image_Viewer_CONTROL_DIRECTION_SLIDER,
 Medical_Image_Viewer_CONTROL_MAIN_SLIDER, Medical_Image_Viewer_CONTROL_SWAP_BUTTON_CSS, Medical_Image_Viewer_CONTROL_GOTO_ORIGIN_BUTTON_CSS,
 Medical_Image_Viewer_CONTROL_GOTO_CENTER_BUTTON_CSS,  Medical_Image_Viewer_CONTROL_MAIN_INCREMENT_BUTTON_CSS, Medical_Image_Viewer_PADDING,
 Medical_Image_Viewer_CONTROL_MAIN_DECREMENT_BUTTON_CSS, Medical_Image_Viewer_CONTROL_MAIN_SWAP_BUTTON_CSS, Medical_Image_Viewer_CONTROL_INCREMENT_BUTTON_CSS,
 Medical_Image_Viewer_CONTROL_MAIN_GOTO_CENTER_BUTTON_CSS, Medical_Image_Viewer_CONTROL_MAIN_GOTO_ORIGIN_BUTTON_CSS */

"use strict";
/*** Imports ***/
/*医学图像查看器的构造函数，用于创建一个图像查看器实例。
  该构造函数接受容器元素、宽度、高度和参数作为输入，并初始化了许多属性和事件监听器。 */
var Medical_Image_Viewer = Medical_Image_Viewer || {};
Medical_Image_Viewer.viewer = Medical_Image_Viewer.viewer || {};
var Medical_Image_Viewer_BUILD_NUM = Medical_Image_Viewer_BUILD_NUM || "0";
/*** Constructor ***/
/*创建一个 canvas 元素并设置其宽度和高度，获取 2D 上下文
  初始化一些属性，如容器、图像数据、鼠标位置等
  定义了一些事件监听器，用于处理鼠标、键盘和触摸事件，以及一些辅助方法，用于处理特定的键盘键码和控制键状态。*/
Medical_Image_Viewer.viewer.Viewer = Medical_Image_Viewer.viewer.Viewer || function (container, width, height, params) {
    this.container = container;
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.context = this.canvas.getContext("2d");
    this.canvas.style.padding = 0;
    this.canvas.style.margin = 0;
    this.canvas.style.border = "none";
    this.atlas = null;
    this.initialized = false;
    this.pageLoaded = false;
    this.loadingVolume = null;
    this.volume = new Medical_Image_Viewer.volume.Volume(this.container.display, this);
    this.screenVolumes = [];
    this.surfaces = [];
    this.currentScreenVolume = null;
    this.axialSlice = null;
    this.coronalSlice = null;
    this.sagittalSlice = null;
    this.surfaceView = null;
    this.selectedSlice = null;
    this.mainImage = null;
    this.lowerImageBot2 = null;
    this.lowerImageBot = null;
    this.lowerImageTop = null;
    this.viewerDim = 0;
    this.worldSpace = false;
    this.ignoreSync = false;
    this.currentCoord = new Medical_Image_Viewer.core.Coordinate(0, 0, 0);
    this.cursorPosition = new Medical_Image_Viewer.core.Coordinate(0, 0, 0);
    this.longestDim = 0;
    this.longestDimSize = 0;
    this.draggingSliceDir = 0;
    this.isDragging = false;
    this.isWindowControl = false;
    this.isZoomMode = false;
    this.isContextMode = false;
    this.isPanning = false;
    this.didLongTouch = false;
    this.isLongTouch = false;
    this.zoomFactor = Medical_Image_Viewer.viewer.Viewer.ZOOM_FACTOR_MIN;
    this.zoomFactorPrevious = Medical_Image_Viewer.viewer.Viewer.ZOOM_FACTOR_MIN;
    this.zoomLocX = 0;
    this.zoomLocY = 0;
    this.zoomLocZ = 0;
    this.panLocX = 0;
    this.panLocY = 0;
    this.panLocZ = 0;
    this.panAmountX = 0;
    this.panAmountY = 0;
    this.panAmountZ = 0;
    this.keyPressIgnored = false;
    this.previousMousePosition = new Medical_Image_Viewer.core.Point();
    this.isControlKeyDown = false;
    this.isAltKeyDown = false;
    this.isShiftKeyDown = false;
    this.toggleMainCrosshairs = true;
    this.bgColor = null;
    this.hasSeries = false;
    this.controlsHidden = false;
    this.loadingDTI = false;
    this.loadingDTIModRef = null;
    this.tempCoor = new Medical_Image_Viewer.core.Coordinate();

    this.listenerContextMenu = function (me) { me.preventDefault(); return false; };
    this.listenerMouseMove = Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.mouseMoveEvent);
    this.listenerMouseDown = Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.mouseDownEvent);
    this.listenerMouseOut = Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.mouseOutEvent);
    this.listenerMouseLeave = Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.mouseLeaveEvent);
    this.listenerMouseUp = Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.mouseUpEvent);
    this.listenerMouseDoubleClick = Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.mouseDoubleClickEvent);
    this.listenerKeyDown = Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.keyDownEvent);
    this.listenerKeyUp = Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.keyUpEvent);
    this.listenerTouchMove = Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.touchMoveEvent);
    this.listenerTouchStart = Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.touchStartEvent);
    this.listenerTouchEnd = Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.touchEndEvent);
    this.initialCoordinate = null;
    this.listenerScroll = Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.scrolled);
    this.longTouchTimer = null;
    this.updateTimer = null;
    this.updateTimerEvent = null;
    this.drawEmptyViewer();
    this.processParams(params);
};

/*** Static Pseudo-constants ***/
/*定义了一些静态常量和静态方法，用于处理键盘事件、控制键状态等 */
Medical_Image_Viewer.viewer.Viewer.GAP = Medical_Image_Viewer_SPACING;  // padding between slice views
Medical_Image_Viewer.viewer.Viewer.BACKGROUND_COLOR = "rgba(0, 0, 0, 255)";
Medical_Image_Viewer.viewer.Viewer.CROSSHAIRS_COLOR = "rgba(28, 134, 238, 255)";
Medical_Image_Viewer.viewer.Viewer.KEYCODE_ROTATE_VIEWS = 32;
Medical_Image_Viewer.viewer.Viewer.KEYCODE_CENTER = 67;
Medical_Image_Viewer.viewer.Viewer.KEYCODE_ORIGIN = 79;
Medical_Image_Viewer.viewer.Viewer.KEYCODE_ARROW_UP = 38;
Medical_Image_Viewer.viewer.Viewer.KEYCODE_ARROW_DOWN = 40;
Medical_Image_Viewer.viewer.Viewer.KEYCODE_ARROW_RIGHT = 39;
Medical_Image_Viewer.viewer.Viewer.KEYCODE_ARROW_LEFT = 37;
Medical_Image_Viewer.viewer.Viewer.KEYCODE_PAGE_UP = 33;
Medical_Image_Viewer.viewer.Viewer.KEYCODE_PAGE_DOWN = 34;
Medical_Image_Viewer.viewer.Viewer.KEYCODE_SINGLE_QUOTE = 222;
Medical_Image_Viewer.viewer.Viewer.KEYCODE_FORWARD_SLASH = 191;
Medical_Image_Viewer.viewer.Viewer.KEYCODE_INCREMENT_MAIN = 71;
Medical_Image_Viewer.viewer.Viewer.KEYCODE_DECREMENT_MAIN = 86;
Medical_Image_Viewer.viewer.Viewer.KEYCODE_TOGGLE_CROSSHAIRS = 65;
Medical_Image_Viewer.viewer.Viewer.KEYCODE_SERIES_BACK = 188;  // , <
Medical_Image_Viewer.viewer.Viewer.KEYCODE_SERIES_FORWARD = 190;  // . >
Medical_Image_Viewer.viewer.Viewer.KEYCODE_RULER = 82;
Medical_Image_Viewer.viewer.Viewer.MAX_OVERLAYS = 8;
Medical_Image_Viewer.viewer.Viewer.ORIENTATION_MARKER_SUPERIOR = "S";
Medical_Image_Viewer.viewer.Viewer.ORIENTATION_MARKER_INFERIOR = "I";
Medical_Image_Viewer.viewer.Viewer.ORIENTATION_MARKER_ANTERIOR = "A";
Medical_Image_Viewer.viewer.Viewer.ORIENTATION_MARKER_POSTERIOR = "P";
Medical_Image_Viewer.viewer.Viewer.ORIENTATION_MARKER_LEFT = "L";
Medical_Image_Viewer.viewer.Viewer.ORIENTATION_MARKER_RIGHT = "R";
Medical_Image_Viewer.viewer.Viewer.ORIENTATION_MARKER_SIZE = 16;
Medical_Image_Viewer.viewer.Viewer.ORIENTATION_CERTAINTY_UNKNOWN_COLOR = "red";
Medical_Image_Viewer.viewer.Viewer.ORIENTATION_CERTAINTY_LOW_COLOR = "yellow";
Medical_Image_Viewer.viewer.Viewer.ORIENTATION_CERTAINTY_HIGH_COLOR = "white";
Medical_Image_Viewer.viewer.Viewer.UPDATE_TIMER_INTERVAL = 250;
Medical_Image_Viewer.viewer.Viewer.ZOOM_FACTOR_MAX = 10.0;
Medical_Image_Viewer.viewer.Viewer.ZOOM_FACTOR_MIN = 1.0;
Medical_Image_Viewer.viewer.Viewer.MOUSE_SCROLL_THRESHLD = 0.25;
Medical_Image_Viewer.viewer.Viewer.TITLE_MAX_LENGTH = 30;

/*** Static Methods ***/
Medical_Image_Viewer.viewer.Viewer.validDimBounds = function (val, dimBound) {
    return (val < dimBound) ? val : dimBound - 1;
};

Medical_Image_Viewer.viewer.Viewer.getKeyCode = function (ev) {
    return (ev.keyCode || ev.charCode);
};

Medical_Image_Viewer.viewer.Viewer.isControlKey = function (ke) {
    var keyCode = Medical_Image_Viewer.viewer.Viewer.getKeyCode(ke);
    if ((Medical_Image_Viewer.utilities.PlatformUtils.os === "MacOS") && (
        (keyCode === 91) || // left command key
        (keyCode === 93) || // right command key
        (keyCode === 224)
        )) { // FF command key code
        return true;
    }
    return ((Medical_Image_Viewer.utilities.PlatformUtils.os !== "MacOS") && (keyCode === 17));
};

Medical_Image_Viewer.viewer.Viewer.isAltKey = function (ke) {
    var keyCode = Medical_Image_Viewer.viewer.Viewer.getKeyCode(ke);
    return (keyCode === 18);
};

Medical_Image_Viewer.viewer.Viewer.isShiftKey = function (ke) {
    var isShift = !!ke.shiftKey;
    if (!isShift && window.event) {
        isShift = !!window.event.shiftKey;
    }
    return isShift;
};
/*Medical_Image_Viewer.viewer.Viewer.getOffsetRect 方法用于获取指定元素的偏移矩形，包括元素的位置、滚动条位置等信息。 */
Medical_Image_Viewer.viewer.Viewer.getOffsetRect = function (elem) {
    // (1)
    var box = elem.getBoundingClientRect();
    var body = document.body;
    var docElem = document.documentElement;
    // (2)
    var scrollTop = window.pageYOffset || docElem.scrollTop;
    var scrollLeft = window.pageXOffset || docElem.scrollLeft;
    // (3)
    var clientTop = docElem.clientTop || body.clientTop || 0;
    var clientLeft = docElem.clientLeft || body.clientLeft || 0;
    // (4)
    var top  = box.top + scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;
    return { top: Math.round(top), left: Math.round(left) };
};

// http://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas
/*Medical_Image_Viewer.viewer.Viewer.drawRoundRect 方法用于在 HTML 画布上绘制具有圆角的矩形，可以设置是否填充和描边。 */
Medical_Image_Viewer.viewer.Viewer.drawRoundRect = function (ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke === "undefined" ) {
        stroke = true;
    }
    if (typeof radius === "undefined") {
        radius = 5;
    }
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (stroke) {
        ctx.stroke();
    }
    if (fill) {
        ctx.fill();
    }
};

/*** Prototype Methods ***/
/*加载图像：Medical_Image_Viewer.viewer.Viewer.prototype.loadImage  方法用于根据不同的情况加载图像数据。
  根据参数的不同，可以强制加载二进制数据、编码数据、URL 数据或文件数据，并在加载完成后调用 initializeOverlay 方法进行初始化。 */
Medical_Image_Viewer.viewer.Viewer.prototype.loadImage = function (refs, forceUrl, forceEncode, forceBinary) {
    if (this.screenVolumes.length === 0) {
        this.loadBaseImage(refs, forceUrl, forceEncode, forceBinary);
    } else {
        this.loadOverlay(refs, forceUrl, forceEncode, forceBinary);
    }
};
/*Medical_Image_Viewer.viewer.Viewer.prototype.showDialog 方法用于在图像查看器中显示对话框，包括标题、数据、数据源等信息，并提供回调函数处理交互。 */
Medical_Image_Viewer.viewer.Viewer.prototype.showDialog = function (title, data, datasource, callback, callbackOk) {
    var ctr, index = -1;
    for (ctr = 0; ctr < Medical_Image_ViewerContainers.length; ctr += 1) {
        if (Medical_Image_ViewerContainers[ctr] === this.container) {
            index = ctr;
            break;
        }
    }
    var dialog = new Medical_Image_Viewer.ui.Dialog(this.container, title, data, datasource, callback, callbackOk, index);
    dialog.showDialog();
};
/*loadBaseImage 方法用于加载基础图像，根据不同的参数（forceUrl、forceEncode、forceBinary）决定加载方式。
  如果需要强制加载二进制数据，则调用 readBinaryData 方法；如果需要强制加载编码数据，则调用 readEncodedData 方法；
  如果需要强制加载 URL 数据，则调用 readURLs 方法；否则调用 readFiles 方法。加载完成后调用 initializeViewer 方法进行初始化。 */
Medical_Image_Viewer.viewer.Viewer.prototype.loadBaseImage = function (refs, forceUrl, forceEncode, forceBinary) {
    var ctr, imageRefs = [], loadableImages = this.container.findLoadableImages(refs);
    this.volume = new Medical_Image_Viewer.volume.Volume(this.container.display, this, this.container.params);
    if (forceBinary) {
        if (loadableImages && loadableImages.length) {
            for (ctr = 0; ctr < loadableImages.length; ctr += 1) {
                imageRefs.push(loadableImages[ctr].encode);
            }
        } else {
            if (!Array.isArray(refs)) {
                refs = [refs];
            }
            imageRefs = refs;
        }
        this.volume.readBinaryData(imageRefs, Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.initializeViewer));
    } else if (forceEncode) {
        if (loadableImages) {
            for (ctr = 0; ctr < loadableImages.length; ctr += 1) {
                imageRefs.push(loadableImages[ctr].encode);
            }
        } else {
            imageRefs = refs;
        }
        this.volume.readEncodedData(imageRefs, Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.initializeViewer));
    } else if ((loadableImages !== null) && (loadableImages[0].encode !== undefined)) {
        for (ctr = 0; ctr < loadableImages.length; ctr += 1) {
            imageRefs.push(loadableImages[ctr].encode);
        }
        this.volume.readEncodedData(imageRefs, Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.initializeViewer));
    } else if (forceUrl) {
        this.volume.readURLs(refs, Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.initializeViewer));
    } else if ((loadableImages !== null) && (loadableImages[0].url !== undefined)) {
        if (loadableImages) {
            for (ctr = 0; ctr < loadableImages.length; ctr += 1) {
                imageRefs.push(loadableImages[ctr].url);
            }
        }
        this.volume.readURLs(imageRefs, Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.initializeViewer));
    } else {
        this.volume.readFiles(refs, Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.initializeViewer));
    }
};
/*loadOverlay 方法用于加载叠加图像，同样根据不同的参数（forceUrl、forceEncode、forceBinary）决定加载方式。
  如果叠加图像数量超过了最大限制，则显示错误信息并初始化叠加图像；否则根据参数调用相应的加载方法，并在加载完成后调用 initializeOverlay 方法进行初始化。 */
Medical_Image_Viewer.viewer.Viewer.prototype.loadOverlay = function (refs, forceUrl, forceEncode, forceBinary) {
    var imageRefs, loadableImage = this.container.findLoadableImage(refs);
    this.loadingVolume = new Medical_Image_Viewer.volume.Volume(this.container.display, this, this.container.params);
    if (this.screenVolumes.length > Medical_Image_Viewer.viewer.Viewer.MAX_OVERLAYS) {
        this.loadingVolume.error = new Error("Maximum number of overlays (" + Medical_Image_Viewer.viewer.Viewer.MAX_OVERLAYS +
            ") has been reached!");
        this.initializeOverlay();
    } else {
        if (forceBinary) {
            if (!Array.isArray(refs)) {
                refs = [refs];
            }
            imageRefs = refs;
            this.loadingVolume.readBinaryData(imageRefs, Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.initializeOverlay));
        } else if (forceEncode) {
            imageRefs = loadableImage.encode;
            if (!(imageRefs instanceof Array)) {
                imageRefs = [];
                imageRefs[0] = loadableImage.encode;
            }
            this.loadingVolume.readEncodedData(imageRefs, Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.initializeOverlay));
        } else if ((loadableImage !== null) && (loadableImage.encode !== undefined)) {
            imageRefs = loadableImage.encode;
            if (!(imageRefs instanceof Array)) {
                imageRefs = [];
                imageRefs[0] = loadableImage.encode;
            }
            this.loadingVolume.readEncodedData(imageRefs, Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.initializeOverlay));
        } else if (forceUrl) {
            this.loadingVolume.readURLs(refs, Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.initializeOverlay));
        } else if ((loadableImage !== null) && (loadableImage.url !== undefined)) {
            this.loadingVolume.readURLs([loadableImage.url], Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.initializeOverlay));
        } else {
            this.loadingVolume.readFiles(refs, Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.initializeOverlay));
        }
    }
};
/*Medical_Image_Viewer.viewer.Viewer.prototype.loadSurface 方法用于加载图像的表面数据。
  根据参数的不同，可以强制加载编码数据、URL 数据或文件数据，并在加载完成后调用 initializeSurface 方法进行初始化。 */
Medical_Image_Viewer.viewer.Viewer.prototype.loadSurface = function (ref, forceUrl, forceEncode) {
    var loadableImage = this.container.findLoadableImage(ref, true);
    if (this.screenVolumes.length == 0) {
        this.container.display.drawError("Load an image before loading a surface!");
        return;
    }
    var surface = new Medical_Image_Viewer.surface.Surface(this.container.display, this.container.params);
    if (forceEncode) {
        surface.readEncodedData(ref[0], this.volume, Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.initializeSurface));
    } else if ((loadableImage !== null) && (loadableImage.encode !== undefined)) {
        surface.readEncodedData(loadableImage.encode, this.volume, Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.initializeSurface));
    } else if (forceUrl) {
        surface.readURL(ref, this.volume, Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.initializeSurface));
    } else if ((loadableImage !== null) && (loadableImage.url !== undefined)) {
        surface.readURL(loadableImage.url, this.volume, Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.initializeSurface));
    } else {
        surface.readFile(ref[0], this.volume, Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.initializeSurface));
    }
};


/*initializeSurface 方法用于初始化叠加图像的屏幕表示对象。如果没有错误，则将其加入 surfaces 数组中，并根据是否存在 surfaceView 对象决定初始化方式。
  如果 surfaceView 对象不存在，则创建一个新的 ScreenSurface 对象作为 surfaceView 对象，并调整查看器组件大小。否则，根据当前的 surface 对象初始化 surfaceView 对象的缓冲区。
  如果参数中指定了 mainView 为 surface，则将 surfaceView 对象作为主视图。最后更新工具栏和图像按钮，并检查是否还有更多的图像需要加载。 */ 
Medical_Image_Viewer.viewer.Viewer.prototype.initializeSurface = function (surface) {
    var currentSurface = surface;
    if (!surface.error) {
        while (currentSurface !== null) {
            this.surfaces.push(currentSurface);
            currentSurface = currentSurface.nextSurface;
        }
        if (this.surfaceView === null) {
            this.lowerImageBot2 = this.surfaceView = new Medical_Image_Viewer.viewer.ScreenSurface(this.volume, this.surfaces, this, this.container.params);
            this.container.resizeViewerComponents(true);
        } else {
            currentSurface = surface;
            while (currentSurface !== null) {
                this.surfaceView.initBuffers(this.surfaceView.context, currentSurface);
                currentSurface = currentSurface.nextSurface;
            }
        }
        if (this.container.params.mainView && (this.container.params.mainView.toLowerCase() === "surface")) {
            this.mainImage = this.surfaceView;
            this.lowerImageTop = this.axialSlice;
            this.lowerImageBot = this.sagittalSlice;
            this.lowerImageBot2 = this.coronalSlice;
            this.viewsChanged();
        }
        this.container.toolbar.buildToolbar();
        this.container.toolbar.updateImageButtons();
        if (this.container.hasMoreToLoad()) {
            this.container.loadNext();
        } else {
            this.finishedLoading();
        }
    } else if (surface.error) {
        this.container.display.drawError(surface.error);
    }
};
/*atlasLoaded 方法用于在图像加载完成后调用，直接调用 finishedLoading 方法完成初始化。 */
Medical_Image_Viewer.viewer.Viewer.prototype.atlasLoaded = function () {
    this.finishedLoading();
};
/*initializeViewer 方法首先检查是否存在错误，如果有错误则显示错误信息并重置查看器。如果没有错误，则创建 ScreenVolume 对象表示基础图像，并创建三个 ScreenSlice 对象表示三个方向的切片图像。
  根据参数设置主视图和辅助视图。接着添加鼠标和键盘事件监听器，以及触摸事件监听器和双击事件监听器等。最后调用 finishedLoading 方法完成初始化。 */
Medical_Image_Viewer.viewer.Viewer.prototype.initializeViewer = function () {
    var message, viewer;
    viewer = this;
    if (this.volume.hasError()) {
        message = this.volume.error.message;
        this.resetViewer();
        this.container.clearParams();
        this.container.display.drawError(message);
    } else {
        this.screenVolumes[0] = new Medical_Image_Viewer.viewer.ScreenVolume(this.volume, this.container.params,
            Medical_Image_Viewer.viewer.ColorTable.DEFAULT_COLOR_TABLE.name, true, false, this.currentCoord);
        if (this.loadingDTI) {
            this.loadingDTI = false;
            this.screenVolumes[0].dti = true;
            if (this.screenVolumes[0].dti && (this.screenVolumes[0].volume.numTimepoints !== 3)) {
                this.screenVolumes[0].error = new Error("DTI vector series must have 3 series points!");
            }
            if (this.screenVolumes[0].dti) {
                this.screenVolumes[0].initDTI();
            }
        }
        if (this.screenVolumes[0].hasError()) {
            message = this.screenVolumes[0].error.message;
            this.resetViewer();
            this.container.clearParams();
            this.container.display.drawError(message);
            return;
        }
        this.setCurrentScreenVol(0);
        this.axialSlice = new Medical_Image_Viewer.viewer.ScreenSlice(this.volume, Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_AXIAL,
            this.volume.getXDim(), this.volume.getYDim(), this.volume.getXSize(), this.volume.getYSize(),
            this.screenVolumes, this);
        this.coronalSlice = new Medical_Image_Viewer.viewer.ScreenSlice(this.volume, Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_CORONAL,
            this.volume.getXDim(), this.volume.getZDim(), this.volume.getXSize(), this.volume.getZSize(),
            this.screenVolumes, this);
        this.sagittalSlice = new Medical_Image_Viewer.viewer.ScreenSlice(this.volume, Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_SAGITTAL,
            this.volume.getYDim(), this.volume.getZDim(), this.volume.getYSize(), this.volume.getZSize(),
            this.screenVolumes, this);
        if ((this.container.params.mainView === undefined) ||
            (this.container.params.mainView.toLowerCase() === "axial")) {
            this.mainImage = this.axialSlice;
            this.lowerImageTop = this.sagittalSlice;
            this.lowerImageBot = this.coronalSlice;
        } else if (this.container.params.mainView.toLowerCase() === "coronal") {
            this.mainImage = this.coronalSlice;
            this.lowerImageTop = this.axialSlice;
            this.lowerImageBot = this.sagittalSlice;
        } else if (this.container.params.mainView.toLowerCase() === "sagittal") {
            this.mainImage = this.sagittalSlice;
            this.lowerImageTop = this.coronalSlice;
            this.lowerImageBot = this.axialSlice;
        } else {
            this.mainImage = this.axialSlice;
            this.lowerImageTop = this.sagittalSlice;
            this.lowerImageBot = this.coronalSlice;
        }
        this.canvas.addEventListener("mousemove", this.listenerMouseMove, false);
        this.canvas.addEventListener("mousedown", this.listenerMouseDown, false);
        this.canvas.addEventListener("mouseout", this.listenerMouseOut, false);
        this.canvas.addEventListener("mouseleave", this.listenerMouseLeave, false);
        this.canvas.addEventListener("mouseup", this.listenerMouseUp, false);
        document.addEventListener("keydown", this.listenerKeyDown, true);
        document.addEventListener("keyup", this.listenerKeyUp, true);
        this.canvas.addEventListener("touchmove", this.listenerTouchMove, false);
        this.canvas.addEventListener("touchstart", this.listenerTouchStart, false);
        this.canvas.addEventListener("touchend", this.listenerTouchEnd, false);
        this.canvas.addEventListener("dblclick", this.listenerMouseDoubleClick, false);
        document.addEventListener("contextmenu", this.listenerContextMenu, false);
/*根据 showControlBar 和 showControls 的值来确定是否显示控制栏，然后根据不同的条件绑定了各种按钮的点击事件，包括主切片的增减按钮、三个方向切片的增减按钮、系列按钮、旋转视图按钮等。
  如果允许滚动，则添加滚动功能。接着对查看器进行一些初始化操作，包括设置背景颜色、判断是否处于世界空间、加载图谱等。最后完成了查看器的初始化，构建了工具栏，并更新了图像按钮等。 */
        if (this.container.showControlBar) {
            // main slice
            $(this.container.sliderControlHtml.find("." + Medical_Image_Viewer_CONTROL_MAIN_SLIDER).find("button")).eq(0).click(function () {
                if (viewer.mainImage.sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_AXIAL) {
                    viewer.incrementAxial(false);
                } else if (viewer.mainImage.sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_CORONAL) {
                    viewer.incrementCoronal(false);
                } else if (viewer.mainImage.sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
                    viewer.incrementSagittal(true);
                }
            });
            $(this.container.sliderControlHtml.find("." + Medical_Image_Viewer_CONTROL_MAIN_SLIDER).find("button")).eq(1).click(function () {
                if (viewer.mainImage.sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_AXIAL) {
                    viewer.incrementAxial(true);
                } else if (viewer.mainImage.sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_CORONAL) {
                    viewer.incrementCoronal(true);
                } else if (viewer.mainImage.sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
                    viewer.incrementSagittal(false);
                }
            });
            // axial slice
            $(this.container.sliderControlHtml.find("." + Medical_Image_Viewer_CONTROL_DIRECTION_SLIDER).eq(0).find("button").eq(0)).click(function () {
                viewer.incrementAxial(false);
            });
            $(this.container.sliderControlHtml.find("." + Medical_Image_Viewer_CONTROL_DIRECTION_SLIDER).eq(0).find("button").eq(1)).click(function () {
                viewer.incrementAxial(true);
            });
            // coronal slice
            $(this.container.sliderControlHtml.find("." + Medical_Image_Viewer_CONTROL_DIRECTION_SLIDER).eq(1).find("button").eq(0)).click(function () {
                viewer.incrementCoronal(false);
            });
            $(this.container.sliderControlHtml.find("." + Medical_Image_Viewer_CONTROL_DIRECTION_SLIDER).eq(1).find("button").eq(1)).click(function () {
                viewer.incrementCoronal(true);
            });
            // sagittal slice
            $(this.container.sliderControlHtml.find("." + Medical_Image_Viewer_CONTROL_DIRECTION_SLIDER).eq(2).find("button").eq(0)).click(function () {
                viewer.incrementSagittal(true);
            });
            $(this.container.sliderControlHtml.find("." + Medical_Image_Viewer_CONTROL_DIRECTION_SLIDER).eq(2).find("button").eq(1)).click(function () {
                viewer.incrementSagittal(false);
            });
            // series
            $(this.container.sliderControlHtml.find("." + Medical_Image_Viewer_CONTROL_DIRECTION_SLIDER).eq(3).find("button").eq(0)).click(function () {
                viewer.decrementSeriesPoint();
            });
            $(this.container.sliderControlHtml.find("." + Medical_Image_Viewer_CONTROL_DIRECTION_SLIDER).eq(3).find("button").eq(1)).click(function () {
                viewer.incrementSeriesPoint();
            });
            // buttons
            $(this.container.sliderControlHtml.find("." + Medical_Image_Viewer_CONTROL_SWAP_BUTTON_CSS)).click(function () {
                viewer.rotateViews();
            });
            $(this.container.sliderControlHtml.find("." + Medical_Image_Viewer_CONTROL_GOTO_CENTER_BUTTON_CSS)).click(function () {
                var center = new Medical_Image_Viewer.core.Coordinate(Math.floor(viewer.volume.header.imageDimensions.xDim / 2),
                    Math.floor(viewer.volume.header.imageDimensions.yDim / 2),
                    Math.floor(viewer.volume.header.imageDimensions.zDim / 2));
                viewer.gotoCoordinate(center);
            });
            $(this.container.sliderControlHtml.find("." + Medical_Image_Viewer_CONTROL_GOTO_ORIGIN_BUTTON_CSS)).click(function () {
                viewer.gotoCoordinate(viewer.volume.header.origin);
            });
            $("." + Medical_Image_Viewer_CONTROL_INCREMENT_BUTTON_CSS).prop('disabled', false);
            $("." + Medical_Image_Viewer_CONTROL_SWAP_BUTTON_CSS).prop('disabled', false);
            $("." + Medical_Image_Viewer_CONTROL_GOTO_CENTER_BUTTON_CSS).prop('disabled', false);
            $("." + Medical_Image_Viewer_CONTROL_GOTO_ORIGIN_BUTTON_CSS).prop('disabled', false);
        } else if (this.container.showControls) {
            $("#" + Medical_Image_Viewer_CONTROL_MAIN_INCREMENT_BUTTON_CSS + this.container.containerIndex).css({display: "inline"});
            $("#" + Medical_Image_Viewer_CONTROL_MAIN_DECREMENT_BUTTON_CSS + this.container.containerIndex).css({display: "inline"});
            $("#" + Medical_Image_Viewer_CONTROL_MAIN_SWAP_BUTTON_CSS + this.container.containerIndex).css({display: "inline"});
            $(this.container.containerHtml.find("#" + Medical_Image_Viewer_CONTROL_MAIN_SWAP_BUTTON_CSS + this.container.containerIndex)).click(function () {
                viewer.rotateViews();
            });
            $(this.container.containerHtml.find("#" + Medical_Image_Viewer_CONTROL_MAIN_INCREMENT_BUTTON_CSS + this.container.containerIndex)).click(function () {
                if (viewer.mainImage.sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_AXIAL) {
                    viewer.incrementAxial(false);
                } else if (viewer.mainImage.sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_CORONAL) {
                    viewer.incrementCoronal(false);
                } else if (viewer.mainImage.sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
                    viewer.incrementSagittal(true);
                }
            });
            $(this.container.containerHtml.find("#" + Medical_Image_Viewer_CONTROL_MAIN_DECREMENT_BUTTON_CSS + this.container.containerIndex)).click(function () {
                if (viewer.mainImage.sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_AXIAL) {
                    viewer.incrementAxial(true);
                } else if (viewer.mainImage.sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_CORONAL) {
                    viewer.incrementCoronal(true);
                } else if (viewer.mainImage.sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
                    viewer.incrementSagittal(false);
                }
            });
            $(this.container.containerHtml.find("#" + Medical_Image_Viewer_CONTROL_MAIN_GOTO_CENTER_BUTTON_CSS + this.container.containerIndex)).click(function () {
                var center = new Medical_Image_Viewer.core.Coordinate(Math.floor(viewer.volume.header.imageDimensions.xDim / 2),
                    Math.floor(viewer.volume.header.imageDimensions.yDim / 2),
                    Math.floor(viewer.volume.header.imageDimensions.zDim / 2));
                viewer.gotoCoordinate(center);
            });
            $(this.container.containerHtml.find("#" + Medical_Image_Viewer_CONTROL_MAIN_GOTO_ORIGIN_BUTTON_CSS + this.container.containerIndex)).click(function () {
                viewer.gotoCoordinate(viewer.volume.header.origin);
            });
        }
        this.hasSeries = (this.volume.header.imageDimensions.timepoints > 1);
        if (this.container.allowScroll) {
            this.addScroll();
        }
        this.setLongestDim(this.volume);
        this.calculateScreenSliceTransforms(this);
        this.currentCoord.setCoordinate(Medical_Image_ViewerFloorFast(this.volume.getXDim() / 2), Medical_Image_ViewerFloorFast(this.volume.getYDim() / 2),
            Medical_Image_ViewerFloorFast(this.volume.getZDim() / 2));
        this.updateOffsetRect();
        this.bgColor = $("body").css("background-color");

        if ((this.bgColor === "rgba(0, 0, 0, 0)") || ((this.bgColor === "transparent"))) {
            this.bgColor = "rgba(255, 255, 255, 255)";
        }
        this.context.fillStyle = this.bgColor;
        this.context.fillRect(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight);
        if (this.volume.isWorldSpaceOnly()) {
            if (this.ignoreNiftiTransforms) {
                this.volume.header.orientationCertainty = Medical_Image_Viewer.volume.Header.ORIENTATION_CERTAINTY_UNKNOWN;
            } else {
                this.worldSpace = true;
            }
        }
        if (Medical_Image_Viewer.Container.atlas) {
            this.atlas = Medical_Image_Viewer.Container.atlas;
        }
        this.initialized = true;
        this.container.resizeViewerComponents(true);
        this.drawViewer();
        this.container.toolbar.buildToolbar();
        this.container.toolbar.updateImageButtons();
        this.updateWindowTitle();
        this.container.loadingImageIndex = 1;
        if (this.container.hasMoreToLoad()) {
            this.container.loadNext();
        } else {
            this.finishedLoading();
        }
    }
};
/*finishedLoading 函数在加载完成后执行一系列操作，包括跳转到初始坐标、更新切片滑块控件、构建工具栏、更新图像按钮等。 */
Medical_Image_Viewer.viewer.Viewer.prototype.finishedLoading = function () {
    if (!this.pageLoaded) {
        this.goToInitialCoordinate();
        this.updateSliceSliderControl();
        this.pageLoaded = true;
    }
    if (this.container.loadingComplete) {
        this.container.loadingComplete();
        this.container.loadingComplete = null;
    }
    this.container.toolbar.buildToolbar();
    this.container.toolbar.updateImageButtons();
    this.updateWindowTitle();
};
/*addScroll 函数用于添加滚动事件的监听器 */
Medical_Image_Viewer.viewer.Viewer.prototype.addScroll = function () {
    // if (!this.container.nestedViewer) {
        window.addEventListener(Medical_Image_Viewer.utilities.PlatformUtils.getSupportedScrollEvent(), this.listenerScroll, false);
    // }
};
/*removeScroll 函数用于移除滚动事件的监听器 */
Medical_Image_Viewer.viewer.Viewer.prototype.removeScroll = function () {
    window.removeEventListener(Medical_Image_Viewer.utilities.PlatformUtils.getSupportedScrollEvent(), this.listenerScroll, false);
};
/*updateOffsetRect 函数用于更新画布的偏移矩形。 */
Medical_Image_Viewer.viewer.Viewer.prototype.updateOffsetRect = function () {
    this.canvasRect = Medical_Image_Viewer.viewer.Viewer.getOffsetRect(this.canvas);
};
/*initializeOverlay 函数用于初始化图像叠加层，包括处理参数图像、DTI（弥散张量成像）等，以及构建工具栏、更新图像按钮、绘制查看器等操作。 */
Medical_Image_Viewer.viewer.Viewer.prototype.initializeOverlay = function () {
    var screenParams, parametric, ctr, overlay, overlayNeg, dti, screenVolV1;
    if (this.loadingVolume.hasError()) {
        this.container.display.drawError(this.loadingVolume.error.message);
        this.container.clearParams();
        this.loadingVolume = null;
    } else {
        screenParams = this.container.params[this.loadingVolume.fileName];
        parametric = (screenParams && screenParams.parametric);
        dti = (screenParams && screenParams.dtiMod);
        if (this.loadingDTIModRef) {
            this.loadingDTIModRef.dtiVolumeMod = this.loadingVolume;
            this.loadingDTIModRef = null;
        } else if (dti) {
            screenVolV1 = this.getScreenVolumeByName(screenParams.dtiRef);
            if (screenVolV1) {
                screenVolV1.dtiVolumeMod = this.loadingVolume;
                if (screenParams.dtiModAlphaFactor !== undefined) {
                    screenVolV1.dtiAlphaFactor = screenParams.dtiModAlphaFactor;
                } else {
                    screenVolV1.dtiAlphaFactor = 1.0;
                }
            }
        } else {
            overlay = new Medical_Image_Viewer.viewer.ScreenVolume(this.loadingVolume,
                this.container.params, (parametric ? Medical_Image_Viewer.viewer.ColorTable.PARAMETRIC_COLOR_TABLES[0].name :
                    this.getNextColorTable()), false, false, this.currentCoord);
            if (this.loadingDTI) {
                this.loadingDTI = false;
                overlay.dti = true;
                if (overlay.dti && (overlay.volume.numTimepoints !== 3)) {
                    overlay.error = new Error("DTI vector series must have 3 series points!");
                }
                if (overlay.dti) {
                    overlay.initDTI();
                }
            }
            if (overlay.hasError()) {
                this.container.display.drawError(overlay.error.message);
                this.container.clearParams();
                this.loadingVolume = null;
                return;
            }
            this.screenVolumes[this.screenVolumes.length] = overlay;
            this.setCurrentScreenVol(this.screenVolumes.length - 1);
            // even if "parametric" is set to true we should not add another screenVolume if the value range does not cross
            // zero
            if (parametric) {
                this.screenVolumes[this.screenVolumes.length - 1].findImageRange();
                if (this.screenVolumes[this.screenVolumes.length - 1].volume.header.imageRange.imageMin < 0) {
                    this.screenVolumes[this.screenVolumes.length] = overlayNeg = new Medical_Image_Viewer.viewer.ScreenVolume(this.loadingVolume,
                        this.container.params, Medical_Image_Viewer.viewer.ColorTable.PARAMETRIC_COLOR_TABLES[1].name, false, true, this.currentCoord);
                    overlay.negativeScreenVol = overlayNeg;
                    this.setCurrentScreenVol(this.screenVolumes.length - 1);
                }
            }
        }
        this.container.toolbar.buildToolbar();
        this.container.toolbar.updateImageButtons();
        this.drawViewer(true);
        this.hasSeries = false;
        for (ctr = 0; ctr < this.screenVolumes.length; ctr += 1) {
            if (this.screenVolumes[ctr].volume.header.imageDimensions.timepoints > 1) {
                this.hasSeries = true;
                break;
            }
        }
        this.container.resizeViewerComponents();
        this.updateWindowTitle();
        this.loadingVolume = null;
        if (screenParams && screenParams.loadingComplete) {
            screenParams.loadingComplete();
        }
        if (this.container.hasMoreToLoad()) {
            this.container.loadNext();
        } else {
            this.finishedLoading();
        }
    }
};
/*closeOverlayByRef 和 closeOverlay 函数用于关闭叠加层，包括移除叠加层、重新绘制查看器、更新工具栏和图像按钮等操作。 */
Medical_Image_Viewer.viewer.Viewer.prototype.closeOverlayByRef = function (screenVol) {
    this.closeOverlay(this.getScreenVolumeIndex(screenVol));
};
Medical_Image_Viewer.viewer.Viewer.prototype.closeOverlay = function (index) {
    var ctr;
    for (ctr = 0; ctr < this.screenVolumes.length; ctr += 1) {
        if (this.screenVolumes[ctr].negativeScreenVol === this.screenVolumes[index]) {
            this.screenVolumes[ctr].negativeScreenVol = null;
        }
    }
    this.screenVolumes.splice(index, 1);
    this.setCurrentScreenVol(this.screenVolumes.length - 1);
    this.drawViewer(true);
    this.container.toolbar.buildToolbar();
    this.container.toolbar.updateImageButtons();
    this.updateWindowTitle();
    this.hasSeries = false;
    for (ctr = 0; ctr < this.screenVolumes.length; ctr += 1) {
        if (this.screenVolumes[ctr].volume.header.imageDimensions.timepoints > 1) {
            this.hasSeries = true;
            break;
        }
    }
    this.container.resizeViewerComponents();
};

/*hasDefinedAtlas 函数用于检查是否已定义了图谱数据，并返回相应的布尔值。 */
Medical_Image_Viewer.viewer.Viewer.prototype.hasDefinedAtlas = function () {
    var Medical_Image_ViewerDataType, Medical_Image_ViewerDataTalairachAtlasType;
    Medical_Image_ViewerDataType = (typeof Medical_Image_Viewer.data);
    if (Medical_Image_ViewerDataType !== "undefined") {
        Medical_Image_ViewerDataTalairachAtlasType = (typeof Medical_Image_Viewer.data.Atlas);
        if (Medical_Image_ViewerDataTalairachAtlasType !== "undefined") {
            return true;
        }
    }
    return false;
};
/*loadAtlas 函数用于加载图谱数据，如果当前未加载图谱，则创建一个新的图谱对象。 */
Medical_Image_Viewer.viewer.Viewer.prototype.loadAtlas = function () {
    var viewer = this;
    if (this.atlas === null) {
        this.atlas = new Medical_Image_Viewer.viewer.Atlas(Medical_Image_Viewer.data.Atlas, this.container, Medical_Image_Viewer.utilities.ObjectUtils.bind(viewer,
            viewer.atlasLoaded));
    }
};
/*isInsideMainSlice 函数用于判断给定的坐标是否位于主切片内部。 */
Medical_Image_Viewer.viewer.Viewer.prototype.isInsideMainSlice = function (xLoc, yLoc) {
    this.updateOffsetRect();
    xLoc = xLoc - this.canvasRect.left;
    yLoc = yLoc - this.canvasRect.top;
    if (this.mainImage === this.axialSlice) {
        return this.insideScreenSlice(this.axialSlice, xLoc, yLoc, this.volume.getXDim(), this.volume.getYDim());
    } else if (this.mainImage === this.coronalSlice) {
        return this.insideScreenSlice(this.coronalSlice, xLoc, yLoc, this.volume.getXDim(), this.volume.getZDim());
    } else if (this.mainImage === this.sagittalSlice) {
        return this.insideScreenSlice(this.sagittalSlice, xLoc, yLoc, this.volume.getYDim(), this.volume.getZDim());
    }
    return false;
};
/*updatePosition 函数用于更新当前位置的坐标，并根据所选的切片类型进行相应的处理。 */
Medical_Image_Viewer.viewer.Viewer.prototype.updatePosition = function (viewer, xLoc, yLoc, crosshairsOnly) {
    var xImageLoc, yImageLoc, temp, originalX, originalY, surfaceCoord;
    viewer.updateOffsetRect();
    originalX = xLoc;
    originalY = yLoc;
    xLoc = xLoc - this.canvasRect.left;
    yLoc = yLoc - this.canvasRect.top;
    if (this.insideScreenSlice(viewer.axialSlice, xLoc, yLoc, viewer.volume.getXDim(), viewer.volume.getYDim())) {
        if (!this.isDragging || (this.draggingSliceDir === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_AXIAL)) {
            xImageLoc = this.convertScreenToImageCoordinateX(xLoc, viewer.axialSlice);
            yImageLoc = this.convertScreenToImageCoordinateY(yLoc, viewer.axialSlice);
            if ((xImageLoc !== viewer.currentCoord.x) || (yImageLoc !== viewer.currentCoord.y)) {
                viewer.currentCoord.x = xImageLoc;
                viewer.currentCoord.y = yImageLoc;
                this.draggingSliceDir = Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_AXIAL;
            }
        }
    } else if (this.insideScreenSlice(viewer.coronalSlice, xLoc, yLoc, viewer.volume.getXDim(),
            viewer.volume.getZDim())) {
        if (!this.isDragging || (this.draggingSliceDir === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_CORONAL)) {
            xImageLoc = this.convertScreenToImageCoordinateX(xLoc, viewer.coronalSlice);
            yImageLoc = this.convertScreenToImageCoordinateY(yLoc, viewer.coronalSlice);
            if ((xImageLoc !== viewer.currentCoord.x) || (yImageLoc !== viewer.currentCoord.y)) {
                viewer.currentCoord.x = xImageLoc;
                viewer.currentCoord.z = yImageLoc;
                this.draggingSliceDir = Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_CORONAL;
            }
        }
    } else if (this.insideScreenSlice(viewer.sagittalSlice, xLoc, yLoc, viewer.volume.getYDim(),
            viewer.volume.getZDim())) {
        if (!this.isDragging || (this.draggingSliceDir === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_SAGITTAL)) {
            xImageLoc = this.convertScreenToImageCoordinateX(xLoc, viewer.sagittalSlice);
            yImageLoc = this.convertScreenToImageCoordinateY(yLoc, viewer.sagittalSlice);
            if ((xImageLoc !== viewer.currentCoord.x) || (yImageLoc !== viewer.currentCoord.y)) {
                temp = xImageLoc;
                viewer.currentCoord.y = temp;
                viewer.currentCoord.z = yImageLoc;
                this.draggingSliceDir = Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_SAGITTAL;
            }
        }
    } else if (viewer.surfaceView && this.insideScreenSlice(viewer.surfaceView, xLoc, yLoc, viewer.surfaceView.screenDim,
            viewer.surfaceView.screenDim)) {
        viewer.surfaceView.updateDynamic(originalX, originalY, (this.selectedSlice === this.mainImage) ? 1 : 3);
    }
    this.container.coordinateChanged(this);
    viewer.drawViewer(false, crosshairsOnly);
};
/*convertScreenToImageCoordinateX、convertScreenToImageCoordinateY 和 convertScreenToImageCoordinate 函数用于将屏幕坐标转换为图像坐标，以及将当前坐标转换为屏幕坐标。*/
Medical_Image_Viewer.viewer.Viewer.prototype.convertScreenToImageCoordinateX = function (xLoc, screenSlice) {
    return Medical_Image_Viewer.viewer.Viewer.validDimBounds(Medical_Image_ViewerFloorFast((xLoc - screenSlice.finalTransform[0][2]) / screenSlice.finalTransform[0][0]),
        screenSlice.xDim);
};
Medical_Image_Viewer.viewer.Viewer.prototype.convertScreenToImageCoordinateY = function (yLoc, screenSlice) {
    return Medical_Image_Viewer.viewer.Viewer.validDimBounds(Medical_Image_ViewerFloorFast((yLoc - screenSlice.finalTransform[1][2]) / screenSlice.finalTransform[1][1]),
        screenSlice.yDim);
};
Medical_Image_Viewer.viewer.Viewer.prototype.convertScreenToImageCoordinate = function (xLoc, yLoc, screenSlice) {
    var xImageLoc, yImageLoc, zImageLoc;
    if (screenSlice === undefined) {
        screenSlice = this.mainImage;
    }
    if (screenSlice.sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_AXIAL) {
        xImageLoc = this.convertScreenToImageCoordinateX(xLoc, screenSlice);
        yImageLoc = this.convertScreenToImageCoordinateY(yLoc, screenSlice);
        zImageLoc = this.axialSlice.currentSlice;
    } else if (screenSlice.sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_CORONAL) {
        xImageLoc = this.convertScreenToImageCoordinateX(xLoc, screenSlice);
        zImageLoc = this.convertScreenToImageCoordinateY(yLoc, screenSlice);
        yImageLoc = this.coronalSlice.currentSlice;
    } else if (screenSlice.sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
        yImageLoc = this.convertScreenToImageCoordinateX(xLoc, screenSlice);
        zImageLoc = this.convertScreenToImageCoordinateY(yLoc, screenSlice);
        xImageLoc = this.sagittalSlice.currentSlice;
    }
    return new Medical_Image_Viewer.core.Coordinate(xImageLoc, yImageLoc, zImageLoc);
};
Medical_Image_Viewer.viewer.Viewer.prototype.convertCurrentCoordinateToScreen = function (screenSlice) {
    return this.convertCoordinateToScreen(this.currentCoord, screenSlice);
};
/*intersectsMainSlice 函数用于判断给定的坐标是否与主切片相交。 */
Medical_Image_Viewer.viewer.Viewer.prototype.intersectsMainSlice = function (coord) {
    var sliceDirection = this.mainImage.sliceDirection;
    if (sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_AXIAL) {
        return (coord.z === this.mainImage.currentSlice);
    } else if (sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_CORONAL) {
        return (coord.y === this.mainImage.currentSlice);
    } else if (sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
        return (coord.x === this.mainImage.currentSlice);
    }
    return false;
};

/*convertCoordinateToScreen 函数用于将图像坐标转换为屏幕坐标，根据所选的切片类型进行相应的处理，并返回转换后的屏幕坐标点。 */
Medical_Image_Viewer.viewer.Viewer.prototype.convertCoordinateToScreen = function (coor, screenSlice) {
    var x, y, sliceDirection;
    if (screenSlice === undefined) {
        screenSlice = this.mainImage;
    }
    sliceDirection = screenSlice.sliceDirection;
    if (sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_AXIAL) {
        x = Medical_Image_ViewerFloorFast(screenSlice.finalTransform[0][2] + (coor.x + 0.5) * screenSlice.finalTransform[0][0]);
        y = Medical_Image_ViewerFloorFast(screenSlice.finalTransform[1][2] + (coor.y + 0.5) * screenSlice.finalTransform[1][1]);
    } else if (sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_CORONAL) {
        x = Medical_Image_ViewerFloorFast(screenSlice.finalTransform[0][2] + (coor.x + 0.5) * screenSlice.finalTransform[0][0]);
        y = Medical_Image_ViewerFloorFast(screenSlice.finalTransform[1][2] + (coor.z + 0.5) * screenSlice.finalTransform[1][1]);
    } else if (sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
        x = Medical_Image_ViewerFloorFast(screenSlice.finalTransform[0][2] + (coor.y + 0.5) * screenSlice.finalTransform[0][0]);
        y = Medical_Image_ViewerFloorFast(screenSlice.finalTransform[1][2] + (coor.z + 0.5) * screenSlice.finalTransform[1][1]);
    }
    return new Medical_Image_Viewer.core.Point(x, y);
};
/*updateCursorPosition 函数用于更新光标的位置，并根据光标所在位置进行相应的处理。根据光标所在的位置，可以判断光标在哪个切片上，并将光标位置转换为图像坐标，最后更新显示。 */
Medical_Image_Viewer.viewer.Viewer.prototype.updateCursorPosition = function (viewer, xLoc, yLoc) {
    var xImageLoc, yImageLoc, zImageLoc, surfaceCoord = null, found;
    if (this.container.display) {
        xLoc = xLoc - this.canvasRect.left;
        yLoc = yLoc - this.canvasRect.top;
        if (this.insideScreenSlice(viewer.axialSlice, xLoc, yLoc, viewer.volume.getXDim(), viewer.volume.getYDim())) {
            xImageLoc = this.convertScreenToImageCoordinateX(xLoc, viewer.axialSlice);
            yImageLoc = this.convertScreenToImageCoordinateY(yLoc, viewer.axialSlice);
            zImageLoc = viewer.axialSlice.currentSlice;
            found = true;
        } else if (this.insideScreenSlice(viewer.coronalSlice, xLoc, yLoc, viewer.volume.getXDim(), viewer.volume.getZDim())) {
            xImageLoc = this.convertScreenToImageCoordinateX(xLoc, viewer.coronalSlice);
            zImageLoc = this.convertScreenToImageCoordinateY(yLoc, viewer.coronalSlice);
            yImageLoc = viewer.coronalSlice.currentSlice;
            found = true;
        } else if (this.insideScreenSlice(viewer.sagittalSlice, xLoc, yLoc, viewer.volume.getYDim(), viewer.volume.getZDim())) {
            yImageLoc = this.convertScreenToImageCoordinateX(xLoc, viewer.sagittalSlice);
            zImageLoc = this.convertScreenToImageCoordinateY(yLoc, viewer.sagittalSlice);
            xImageLoc = viewer.sagittalSlice.currentSlice;
            found = true;
        } else if (this.insideScreenSlice(viewer.surfaceView, xLoc, yLoc)) {
            xLoc -= viewer.surfaceView.screenOffsetX;
            yLoc -= viewer.surfaceView.screenOffsetY;
            surfaceCoord = this.surfaceView.pick(xLoc, yLoc);
            if (surfaceCoord) {
                this.getIndexCoordinateAtWorld(surfaceCoord.coordinate[0], surfaceCoord.coordinate[1], surfaceCoord.coordinate[2], this.tempCoor);
                xImageLoc = this.tempCoor.x;
                yImageLoc = this.tempCoor.y;
                zImageLoc = this.tempCoor.z;
                found = true;
            }
        }
        if (found) {
            this.cursorPosition.x = xImageLoc;
            this.cursorPosition.y = yImageLoc;
            this.cursorPosition.z = zImageLoc;
            this.container.display.drawDisplay(xImageLoc, yImageLoc, zImageLoc);
        } else {
            this.container.display.drawEmptyDisplay();
        }
    }
};
/*insideScreenSlice 函数用于判断给定的屏幕坐标是否位于指定切片内部，根据切片类型和屏幕坐标的范围进行判断，并返回相应的布尔值。 */
Medical_Image_Viewer.viewer.Viewer.prototype.insideScreenSlice = function (screenSlice, xLoc, yLoc, xBound, yBound) {
    var xStart, xEnd, yStart, yEnd;
    if (!screenSlice) {
        return false;
    }
    if (screenSlice === this.surfaceView) {
        xStart = screenSlice.screenOffsetX;
        xEnd = screenSlice.screenOffsetX + screenSlice.screenDim;
        yStart = screenSlice.screenOffsetY;
        yEnd = screenSlice.screenOffsetY + screenSlice.screenDim;
    } else {
        xStart = Medical_Image_ViewerRoundFast(screenSlice.screenTransform[0][2]);
        xEnd = Medical_Image_ViewerRoundFast(screenSlice.screenTransform[0][2] + xBound * screenSlice.screenTransform[0][0]);
        yStart = Medical_Image_ViewerRoundFast(screenSlice.screenTransform[1][2]);
        yEnd = Medical_Image_ViewerRoundFast(screenSlice.screenTransform[1][2] + yBound * screenSlice.screenTransform[1][1]);
    }
    return ((xLoc >= xStart) && (xLoc < xEnd) && (yLoc >= yStart) && (yLoc < yEnd));
};
/*drawEmptyViewer 函数用于绘制空的查看器界面，包括清除画布、绘制拖放文本、绘制支持的格式信息以及绘制医学图像查看器的版本信息。 */
Medical_Image_Viewer.viewer.Viewer.prototype.drawEmptyViewer = function () {
    var locY, fontSize, text, metrics, textWidth;
    // clear area
    this.context.fillStyle = "#000000";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    // draw drop text
    this.context.fillStyle = "#AAAAAA";
    if (this.container.readyForDnD()) {
        fontSize = 18;
        this.context.font = fontSize + "px sans-serif";
        locY = this.canvas.height - 22;
        text = "拖放到此处或单击“文件”菜单";
        metrics = this.context.measureText(text);
        textWidth = metrics.width;
        this.context.fillText(text, (this.canvas.width / 2) - (textWidth / 2), locY);
    }
    if (this.canvas.width > 900) {
        // draw supported formats
        fontSize = 14;
        this.context.font = fontSize + "px sans-serif";
        locY = this.canvas.height - 20;
        text = "支持的格式：NIFTI" + (Medical_Image_Viewer.Container.DICOM_SUPPORT ? ", DICOM" : "");
        this.context.fillText(text, 20, locY);
        // draw Medical_Image_Viewer version info
        fontSize = 14;
        this.context.font = fontSize + "px sans-serif";
        locY = this.canvas.height - 20;
        text = "Medical_Image_Viewer (Build " + Medical_Image_Viewer_BUILD_NUM + ")";
        metrics = this.context.measureText(text);
        textWidth = metrics.width;
        this.context.fillText(text, this.canvas.width - textWidth - 20, locY);
    }
};
/*drawViewer 函数根据用户的偏好设置和当前的状态，绘制医学图像查看器的主要界面。根据用户的选择，可以绘制切片、方向标记、交叉线等元素。 */
Medical_Image_Viewer.viewer.Viewer.prototype.drawViewer = function (force, skipUpdate) {
    var radiological = (this.container.preferences.radiological === "Yes"),
        showOrientation = (this.container.preferences.showOrientation === "Yes");
    if (!this.initialized) {
        this.drawEmptyViewer();
        return;
    }
    this.context.save();
    if (skipUpdate) {
        this.axialSlice.repaint(this.currentCoord.z, force, this.worldSpace);
        this.coronalSlice.repaint(this.currentCoord.y, force, this.worldSpace);
        this.sagittalSlice.repaint(this.currentCoord.x, force, this.worldSpace);
    } else {
        if (force || (this.draggingSliceDir !== Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_AXIAL)) {
            this.axialSlice.updateSlice(this.currentCoord.z, force, this.worldSpace);
        }

        if (force || (this.draggingSliceDir !== Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_CORONAL)) {
            this.coronalSlice.updateSlice(this.currentCoord.y, force, this.worldSpace);
        }

        if (force || (this.draggingSliceDir !== Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_SAGITTAL)) {
            this.sagittalSlice.updateSlice(this.currentCoord.x, force, this.worldSpace);
        }
    }
    if (this.hasSurface() && (!Medical_Image_Viewer.utilities.PlatformUtils.smallScreen || force || (this.selectedSlice === this.surfaceView))) {
        this.surfaceView.draw();
    }
    // intialize screen slices
    if (this.container.preferences.smoothDisplay === "No") {
        this.context.imageSmoothingEnabled = false;
        this.context.mozImageSmoothingEnabled = false;
        this.context.msImageSmoothingEnabled = false;
    } else {
        this.context.imageSmoothingEnabled = true;
        this.context.mozImageSmoothingEnabled = true;
        this.context.msImageSmoothingEnabled = true;
    }
    // draw screen slices
    this.drawScreenSlice(this.mainImage);
    if (this.container.orthogonal) {
        this.drawScreenSlice(this.lowerImageTop);
        this.drawScreenSlice(this.lowerImageBot);
        if (this.hasSurface()) {
            this.drawScreenSlice(this.lowerImageBot2);
        }
    }
    if (showOrientation || radiological) {
        this.drawOrientation();
    }
    if (this.container.preferences.showCrosshairs === "Yes") {
        this.drawCrosshairs();
    }
    if (this.container.preferences.showRuler === "Yes") {
        this.drawRuler();
    }
    if (this.container.display) {
        this.container.display.drawDisplay(this.currentCoord.x, this.currentCoord.y, this.currentCoord.z);
    }
    if (this.container.contextManager && this.container.contextManager.drawToViewer) {
        this.container.contextManager.drawToViewer(this.context);
    }
};
/*hasSurface 函数用于检查是否存在表面视图，并且表面视图已经初始化。 */
Medical_Image_Viewer.viewer.Viewer.prototype.hasSurface = function () {
    return (this.container.hasSurface() && this.surfaceView && this.surfaceView.initialized);
};
/*drawScreenSlice 函数用于绘制屏幕切片，根据切片类型和是否存在表面视图进行相应的处理。 */
Medical_Image_Viewer.viewer.Viewer.prototype.drawScreenSlice = function (slice) {
    var textWidth, textWidthExample, offset, padding = 5;
    if (slice === this.surfaceView) {
        this.context.fillStyle = this.surfaceView.getBackgroundColor();
        this.context.fillRect(slice.screenOffsetX, slice.screenOffsetY, slice.screenDim, slice.screenDim);
        this.context.drawImage(slice.canvas, slice.screenOffsetX, slice.screenOffsetY);
        if (this.container.preferences.showRuler === "Yes") {
            if (this.surfaceView === this.mainImage) {
                this.context.font = Medical_Image_Viewer.viewer.Viewer.ORIENTATION_MARKER_SIZE + "px sans-serif";
                textWidth = this.context.measureText("Ruler Length: ").width;
                textWidthExample = this.context.measureText("Ruler Length: 000.00").width;
                offset = (textWidthExample / 2);
                this.context.fillStyle = "#ffb3db";
                this.context.fillText("Ruler Length:  ", slice.screenDim / 2 - (offset / 2), Medical_Image_Viewer.viewer.Viewer.ORIENTATION_MARKER_SIZE + padding);
                this.context.fillStyle = "#FFFFFF";
                this.context.fillText(this.surfaceView.getRulerLength().toFixed(2), (slice.screenDim / 2) + textWidth - (offset / 2), Medical_Image_Viewer.viewer.Viewer.ORIENTATION_MARKER_SIZE + padding);
            }
        }
    } else {
        this.context.fillStyle = Medical_Image_Viewer.viewer.Viewer.BACKGROUND_COLOR;
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.fillRect(slice.screenOffsetX, slice.screenOffsetY, slice.screenDim, slice.screenDim);
        this.context.save();
        this.context.beginPath();
        this.context.rect(slice.screenOffsetX, slice.screenOffsetY, slice.screenDim, slice.screenDim);
        this.context.clip();
        this.context.setTransform(slice.finalTransform[0][0], 0, 0, slice.finalTransform[1][1], slice.finalTransform[0][2], slice.finalTransform[1][2]);
        this.context.drawImage(slice.canvasMain, 0, 0);
        this.context.restore();
        if (slice.canvasDTILines) {
            this.context.drawImage(slice.canvasDTILines, slice.screenOffsetX, slice.screenOffsetY);
        }
    }
};
/*drawOrientation 函数用于绘制方向标记，根据用户的偏好设置和当前主要图像切片的类型进行相应的处理，绘制相应的方向标记。 */
Medical_Image_Viewer.viewer.Viewer.prototype.drawOrientation = function () {
    var metrics, textWidth, radiological, top, bottom, left, right, orientStartX, orientEndX, orientMidX,
        orientStartY, orientEndY, orientMidY,
        showOrientation = (this.container.preferences.showOrientation === "Yes");
    if (this.mainImage === this.surfaceView) {
        return;
    }
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.fillStyle = this.getOrientationCertaintyColor();
    this.context.font = Medical_Image_Viewer.viewer.Viewer.ORIENTATION_MARKER_SIZE + "px sans-serif";
    metrics = this.context.measureText("X");
    textWidth = metrics.width;
    radiological = (this.container.preferences.radiological === "Yes");
    if (this.mainImage === this.axialSlice) {
        top = Medical_Image_Viewer.viewer.Viewer.ORIENTATION_MARKER_ANTERIOR;
        bottom = Medical_Image_Viewer.viewer.Viewer.ORIENTATION_MARKER_POSTERIOR;
        if (radiological) {
            left = Medical_Image_Viewer.viewer.Viewer.ORIENTATION_MARKER_RIGHT;
            right = Medical_Image_Viewer.viewer.Viewer.ORIENTATION_MARKER_LEFT;
        } else {
            left = Medical_Image_Viewer.viewer.Viewer.ORIENTATION_MARKER_LEFT;
            right = Medical_Image_Viewer.viewer.Viewer.ORIENTATION_MARKER_RIGHT;
        }
    } else if (this.mainImage === this.coronalSlice) {
        top = Medical_Image_Viewer.viewer.Viewer.ORIENTATION_MARKER_SUPERIOR;
        bottom = Medical_Image_Viewer.viewer.Viewer.ORIENTATION_MARKER_INFERIOR;
        if (radiological) {
            left = Medical_Image_Viewer.viewer.Viewer.ORIENTATION_MARKER_RIGHT;
            right = Medical_Image_Viewer.viewer.Viewer.ORIENTATION_MARKER_LEFT;
        } else {
            left = Medical_Image_Viewer.viewer.Viewer.ORIENTATION_MARKER_LEFT;
            right = Medical_Image_Viewer.viewer.Viewer.ORIENTATION_MARKER_RIGHT;
        }
    } else if (this.mainImage === this.sagittalSlice) {
        top = Medical_Image_Viewer.viewer.Viewer.ORIENTATION_MARKER_SUPERIOR;
        bottom = Medical_Image_Viewer.viewer.Viewer.ORIENTATION_MARKER_INFERIOR;
        left = Medical_Image_Viewer.viewer.Viewer.ORIENTATION_MARKER_ANTERIOR;
        right = Medical_Image_Viewer.viewer.Viewer.ORIENTATION_MARKER_POSTERIOR;
    }
    orientStartX = this.mainImage.screenOffsetX;
    orientEndX = this.mainImage.screenOffsetX + this.mainImage.screenDim;
    orientMidX = Math.round(orientEndX / 2.0);
    orientStartY = this.mainImage.screenOffsetY;
    orientEndY = this.mainImage.screenOffsetY + this.mainImage.screenDim;
    orientMidY = Math.round(orientEndY / 2.0);
    if (showOrientation || this.mainImage.isRadiologicalSensitive()) {
        this.context.fillText(left, orientStartX + Medical_Image_Viewer.viewer.Viewer.ORIENTATION_MARKER_SIZE, orientMidY +
            (Medical_Image_Viewer.viewer.Viewer.ORIENTATION_MARKER_SIZE * 0.5));
        this.context.fillText(right, orientEndX - 1.5 * Medical_Image_Viewer.viewer.Viewer.ORIENTATION_MARKER_SIZE, orientMidY +
            (Medical_Image_Viewer.viewer.Viewer.ORIENTATION_MARKER_SIZE * 0.5));
    }
    if (showOrientation) {
        this.context.fillText(top, orientMidX - (textWidth / 2), orientStartY +
            Medical_Image_Viewer.viewer.Viewer.ORIENTATION_MARKER_SIZE * 1.5);
        this.context.fillText(bottom, orientMidX - (textWidth / 2), orientEndY -
            Medical_Image_Viewer.viewer.Viewer.ORIENTATION_MARKER_SIZE);
    }
};


/*drawRuler 函数用于绘制标尺，根据主要图像切片的类型和相应的标尺点进行计算，然后使用 Canvas API 绘制标尺线和标记，并显示标尺的数值。 */
Medical_Image_Viewer.viewer.Viewer.prototype.drawRuler = function () {
    var ruler1x, ruler1y, ruler2x, ruler2y, text, metrics, textWidth, textHeight, padding, xText, yText;
    if (this.mainImage === this.surfaceView) {
        return;
    }
    if (this.mainImage === this.axialSlice) {
        ruler1x = (this.axialSlice.finalTransform[0][2] + (this.axialSlice.rulerPoints[0].x + 0.5) *
            this.axialSlice.finalTransform[0][0]);
        ruler1y = (this.axialSlice.finalTransform[1][2] + (this.axialSlice.rulerPoints[0].y + 0.5) *
            this.axialSlice.finalTransform[1][1]);
        ruler2x = (this.axialSlice.finalTransform[0][2] + (this.axialSlice.rulerPoints[1].x + 0.5) *
            this.axialSlice.finalTransform[0][0]);
        ruler2y = (this.axialSlice.finalTransform[1][2] + (this.axialSlice.rulerPoints[1].y + 0.5) *
            this.axialSlice.finalTransform[1][1]);
    } else if (this.mainImage === this.coronalSlice) {
        ruler1x = (this.coronalSlice.finalTransform[0][2] + (this.coronalSlice.rulerPoints[0].x + 0.5) *
            this.coronalSlice.finalTransform[0][0]);
        ruler1y = (this.coronalSlice.finalTransform[1][2] + (this.coronalSlice.rulerPoints[0].y + 0.5) *
            this.coronalSlice.finalTransform[1][1]);
        ruler2x = (this.coronalSlice.finalTransform[0][2] + (this.coronalSlice.rulerPoints[1].x + 0.5) *
            this.coronalSlice.finalTransform[0][0]);
        ruler2y = (this.coronalSlice.finalTransform[1][2] + (this.coronalSlice.rulerPoints[1].y + 0.5) *
            this.coronalSlice.finalTransform[1][1]);
    } else if (this.mainImage === this.sagittalSlice) {
        ruler1x = (this.sagittalSlice.finalTransform[0][2] + (this.sagittalSlice.rulerPoints[0].x + 0.5) *
            this.sagittalSlice.finalTransform[0][0]);
        ruler1y = (this.sagittalSlice.finalTransform[1][2] + (this.sagittalSlice.rulerPoints[0].y + 0.5) *
            this.sagittalSlice.finalTransform[1][1]);
        ruler2x = (this.sagittalSlice.finalTransform[0][2] + (this.sagittalSlice.rulerPoints[1].x + 0.5) *
            this.sagittalSlice.finalTransform[0][0]);
        ruler2y = (this.sagittalSlice.finalTransform[1][2] + (this.sagittalSlice.rulerPoints[1].y + 0.5) *
            this.sagittalSlice.finalTransform[1][1]);
    }
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.strokeStyle = "#FF1493";
    this.context.fillStyle = "#FF1493";
    this.context.lineWidth = 2.0;
    this.context.save();
    this.context.beginPath();
    this.context.moveTo(ruler1x, ruler1y);
    this.context.lineTo(ruler2x, ruler2y);
    this.context.stroke();
    this.context.closePath();
    this.context.beginPath();
    this.context.arc(ruler1x, ruler1y, 3, 0, 2 * Math.PI, false);
    this.context.arc(ruler2x, ruler2y, 3, 0, 2 * Math.PI, false);
    this.context.fill();
    this.context.closePath();
    text = Medical_Image_Viewer.utilities.StringUtils.formatNumber(Medical_Image_Viewer.utilities.MathUtils.lineDistance(
        this.mainImage.rulerPoints[0].x * this.mainImage.xSize,
        this.mainImage.rulerPoints[0].y * this.mainImage.ySize,
        this.mainImage.rulerPoints[1].x * this.mainImage.xSize,
        this.mainImage.rulerPoints[1].y * this.mainImage.ySize), false);
    metrics = this.context.measureText(text);
    textWidth = metrics.width;
    textHeight = 14;
    padding = 2;
    xText = parseInt((ruler1x + ruler2x) / 2) - (textWidth / 2);
    yText = parseInt((ruler1y + ruler2y) / 2) + (textHeight / 2);
    this.context.fillStyle = "#FFFFFF";
    Medical_Image_Viewer.viewer.Viewer.drawRoundRect(this.context, xText - padding, yText - textHeight - padding + 1, textWidth + (padding * 2), textHeight+ (padding * 2), 5, true, false);
    this.context.font = Medical_Image_Viewer.viewer.Viewer.ORIENTATION_MARKER_SIZE + "px sans-serif";
    this.context.strokeStyle = "#FF1493";
    this.context.fillStyle = "#FF1493";
    this.context.fillText(text, xText, yText);
};

/*drawCrosshairs 函数用于绘制交叉线，根据当前的坐标位置和各个切片对象的最终变换参数，通过 Canvas API 绘制出在各个切片上交叉的线，以标识出当前的位置。 */
Medical_Image_Viewer.viewer.Viewer.prototype.drawCrosshairs = function () {
    var xLoc, yStart, yEnd, yLoc, xStart, xEnd;
    // initialize crosshairs
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.strokeStyle = Medical_Image_Viewer.viewer.Viewer.CROSSHAIRS_COLOR;
    this.context.lineWidth = 1.0;
    if ((this.mainImage !== this.axialSlice) || this.toggleMainCrosshairs) {
        // draw axial crosshairs
        this.context.save();
        this.context.beginPath();
        this.context.rect(this.axialSlice.screenOffsetX, this.axialSlice.screenOffsetY, this.axialSlice.screenDim,
            this.axialSlice.screenDim);
        this.context.closePath();
        this.context.clip();
        this.context.beginPath();
        xLoc = (this.axialSlice.finalTransform[0][2] + (this.currentCoord.x + 0.5) *
            this.axialSlice.finalTransform[0][0]);
        yStart = (this.axialSlice.finalTransform[1][2]);
        yEnd = (this.axialSlice.finalTransform[1][2] + this.axialSlice.yDim * this.axialSlice.finalTransform[1][1]);
        this.context.moveTo(xLoc, yStart);
        this.context.lineTo(xLoc, yEnd);
        yLoc = (this.axialSlice.finalTransform[1][2] + (this.currentCoord.y + 0.5) *
            this.axialSlice.finalTransform[1][1]);
        xStart = (this.axialSlice.finalTransform[0][2]);
        xEnd = (this.axialSlice.finalTransform[0][2] + this.axialSlice.xDim * this.axialSlice.finalTransform[0][0]);
        this.context.moveTo(xStart, yLoc);
        this.context.lineTo(xEnd, yLoc);
        this.context.closePath();
        this.context.stroke();
        this.context.restore();
    }
    if ((this.mainImage !== this.coronalSlice) || this.toggleMainCrosshairs) {
        // draw coronal crosshairs
        this.context.save();
        this.context.beginPath();
        this.context.rect(this.coronalSlice.screenOffsetX, this.coronalSlice.screenOffsetY, this.coronalSlice.screenDim,
            this.coronalSlice.screenDim);
        this.context.closePath();
        this.context.clip();
        this.context.beginPath();
        xLoc = (this.coronalSlice.finalTransform[0][2] + (this.currentCoord.x + 0.5) *
            this.coronalSlice.finalTransform[0][0]);
        yStart = (this.coronalSlice.finalTransform[1][2]);
        yEnd = (this.coronalSlice.finalTransform[1][2] + this.coronalSlice.yDim *
            this.coronalSlice.finalTransform[1][1]);
        this.context.moveTo(xLoc, yStart);
        this.context.lineTo(xLoc, yEnd);
        yLoc = (this.coronalSlice.finalTransform[1][2] + (this.currentCoord.z + 0.5) *
            this.coronalSlice.finalTransform[1][1]);
        xStart = (this.coronalSlice.finalTransform[0][2]);
        xEnd = (this.coronalSlice.finalTransform[0][2] + this.coronalSlice.xDim *
            this.coronalSlice.finalTransform[0][0]);
        this.context.moveTo(xStart, yLoc);
        this.context.lineTo(xEnd, yLoc);
        this.context.closePath();
        this.context.stroke();
        this.context.restore();
    }
    if ((this.mainImage !== this.sagittalSlice) || this.toggleMainCrosshairs) {
        // draw sagittal crosshairs
        this.context.save();
        this.context.beginPath();
        this.context.rect(this.sagittalSlice.screenOffsetX, this.sagittalSlice.screenOffsetY,
            this.sagittalSlice.screenDim, this.sagittalSlice.screenDim);
        this.context.closePath();
        this.context.clip();
        this.context.beginPath();
        xLoc = (this.sagittalSlice.finalTransform[0][2] + (this.currentCoord.y + 0.5) *
            this.sagittalSlice.finalTransform[0][0]);
        yStart = (this.sagittalSlice.finalTransform[1][2]);
        yEnd = (this.sagittalSlice.finalTransform[1][2] + this.sagittalSlice.yDim *
            this.sagittalSlice.finalTransform[1][1]);
        this.context.moveTo(xLoc, yStart);
        this.context.lineTo(xLoc, yEnd);
        yLoc = (this.sagittalSlice.finalTransform[1][2] + (this.currentCoord.z + 0.5) *
            this.sagittalSlice.finalTransform[1][1]);
        xStart = (this.sagittalSlice.finalTransform[0][2]);
        xEnd = (this.sagittalSlice.finalTransform[0][2] + this.sagittalSlice.xDim *
            this.sagittalSlice.finalTransform[0][0]);
        this.context.moveTo(xStart, yLoc);
        this.context.lineTo(xEnd, yLoc);
        this.context.closePath();
        this.context.stroke();
        this.context.restore();
    }
};
/*根据不同的查看器布局和是否包含表面，计算出主图像和下方图像的屏幕变换参数，以便在屏幕上正确显示各个图像切片。
  根据不同的情况，设置了不同的屏幕偏移和变换参数，以确保图像切片能够正确地显示在屏幕上。 */
Medical_Image_Viewer.viewer.Viewer.prototype.calculateScreenSliceTransforms = function () {
    if (this.container.orthogonalTall) {
        if (this.container.hasSurface()) {
            this.viewerDim = this.canvas.height / 1.333;
            this.getTransformParameters(this.mainImage, this.viewerDim, false, 3);
            this.mainImage.screenTransform[0][2] += this.mainImage.screenOffsetX = 0;
            this.mainImage.screenTransform[1][2] += this.mainImage.screenOffsetY = 0;
            this.getTransformParameters(this.lowerImageTop, this.viewerDim, true, 3);
            this.lowerImageTop.screenTransform[0][2] += this.lowerImageTop.screenOffsetX = 0;
            this.lowerImageTop.screenTransform[1][2] += this.lowerImageTop.screenOffsetY = this.viewerDim + (Medical_Image_Viewer.viewer.Viewer.GAP);
            this.getTransformParameters(this.lowerImageBot, this.viewerDim, true, 3);
            this.lowerImageBot.screenTransform[0][2] += this.lowerImageBot.screenOffsetX = (((this.viewerDim - Medical_Image_Viewer.viewer.Viewer.GAP) / 3) + (Medical_Image_Viewer.viewer.Viewer.GAP));
            this.lowerImageBot.screenTransform[1][2] += this.lowerImageBot.screenOffsetY =  this.viewerDim + (Medical_Image_Viewer.viewer.Viewer.GAP);
            this.getTransformParameters(this.lowerImageBot2, this.viewerDim, true, 3);
            this.lowerImageBot2.screenTransform[0][2] += this.lowerImageBot2.screenOffsetX = 2 * ((((this.viewerDim - Medical_Image_Viewer.viewer.Viewer.GAP) / 3) + (Medical_Image_Viewer.viewer.Viewer.GAP)));
            this.lowerImageBot2.screenTransform[1][2] += this.lowerImageBot2.screenOffsetY =  this.viewerDim + (Medical_Image_Viewer.viewer.Viewer.GAP);
        } else {
            this.viewerDim = this.canvas.height / 1.5;
            this.getTransformParameters(this.mainImage, this.viewerDim, false, 2);
            this.mainImage.screenTransform[0][2] += this.mainImage.screenOffsetX = 0;
            this.mainImage.screenTransform[1][2] += this.mainImage.screenOffsetY = 0;
            this.getTransformParameters(this.lowerImageBot, this.viewerDim, true, 2);
            this.lowerImageBot.screenTransform[0][2] += this.lowerImageBot.screenOffsetX = 0;
            this.lowerImageBot.screenTransform[1][2] += this.lowerImageBot.screenOffsetY = this.viewerDim + (Medical_Image_Viewer.viewer.Viewer.GAP);
            this.getTransformParameters(this.lowerImageTop, this.viewerDim, true, 2);
            this.lowerImageTop.screenTransform[0][2] += this.lowerImageTop.screenOffsetX = (((this.viewerDim - Medical_Image_Viewer.viewer.Viewer.GAP) / 2) + (Medical_Image_Viewer.viewer.Viewer.GAP));
            this.lowerImageTop.screenTransform[1][2] += this.lowerImageTop.screenOffsetY =  this.viewerDim + (Medical_Image_Viewer.viewer.Viewer.GAP);
        }
    } else {
        this.viewerDim = this.canvas.height;
        if (this.container.hasSurface()) {
            this.getTransformParameters(this.mainImage, this.viewerDim, false, 3);
            this.mainImage.screenTransform[0][2] += this.mainImage.screenOffsetX = 0;
            this.mainImage.screenTransform[1][2] += this.mainImage.screenOffsetY = 0;
            this.getTransformParameters(this.lowerImageTop, this.viewerDim, true, 3);
            this.lowerImageTop.screenTransform[0][2] += this.lowerImageTop.screenOffsetX =
                (this.viewerDim + (Medical_Image_Viewer.viewer.Viewer.GAP));
            this.lowerImageTop.screenTransform[1][2] += this.lowerImageTop.screenOffsetY = 0;
            this.getTransformParameters(this.lowerImageBot, this.viewerDim, true, 3);
            this.lowerImageBot.screenTransform[0][2] += this.lowerImageBot.screenOffsetX =
                (this.viewerDim + (Medical_Image_Viewer.viewer.Viewer.GAP));
            this.lowerImageBot.screenTransform[1][2] += this.lowerImageBot.screenOffsetY =
                (((this.viewerDim - Medical_Image_Viewer.viewer.Viewer.GAP) / 3) + (Medical_Image_Viewer.viewer.Viewer.GAP));
            this.getTransformParameters(this.lowerImageBot2, this.viewerDim, true, 3);
            this.lowerImageBot2.screenTransform[0][2] += this.lowerImageBot2.screenOffsetX =
                (this.viewerDim + (Medical_Image_Viewer.viewer.Viewer.GAP));
            this.lowerImageBot2.screenTransform[1][2] += this.lowerImageBot2.screenOffsetY =
                (((this.viewerDim - Medical_Image_Viewer.viewer.Viewer.GAP) / 3) * 2 + (Medical_Image_Viewer.viewer.Viewer.GAP) * 2);
        } else {
            this.getTransformParameters(this.mainImage, this.viewerDim, false, 2);
            this.mainImage.screenTransform[0][2] += this.mainImage.screenOffsetX = 0;
            this.mainImage.screenTransform[1][2] += this.mainImage.screenOffsetY = 0;
            this.getTransformParameters(this.lowerImageBot, this.viewerDim, true, 2);
            this.lowerImageBot.screenTransform[0][2] += this.lowerImageBot.screenOffsetX =
                (this.viewerDim + (Medical_Image_Viewer.viewer.Viewer.GAP));
            this.lowerImageBot.screenTransform[1][2] += this.lowerImageBot.screenOffsetY =
                (((this.viewerDim - Medical_Image_Viewer.viewer.Viewer.GAP) / 2) + (Medical_Image_Viewer.viewer.Viewer.GAP));
            this.getTransformParameters(this.lowerImageTop, this.viewerDim, true, 2);
            this.lowerImageTop.screenTransform[0][2] += this.lowerImageTop.screenOffsetX =
                (this.viewerDim + (Medical_Image_Viewer.viewer.Viewer.GAP));
            this.lowerImageTop.screenTransform[1][2] += this.lowerImageTop.screenOffsetY = 0;
        }
    }
    this.updateScreenSliceTransforms();
};

/*updateScreenSliceTransforms 函数用于更新切片的最终变换参数，调用各个切片对象的 updateFinalTransform 方法来更新最终的变换参数。 */
Medical_Image_Viewer.viewer.Viewer.prototype.updateScreenSliceTransforms = function () {
    this.axialSlice.updateFinalTransform();
    this.coronalSlice.updateFinalTransform();
    this.sagittalSlice.updateFinalTransform();
};
/*getTransformParameters 函数用于获取变换参数，根据传入的图像对象、高度、是否为较小尺度、缩放因子等参数，计算出图像的缩放、平移等变换参数，并更新图像对象的相关属性。 */
Medical_Image_Viewer.viewer.Viewer.prototype.getTransformParameters = function (image, height, lower, factor) {
    var bigScale, scaleX, scaleY, transX, transY;
    bigScale = lower ? factor : 1;
    if (image === this.surfaceView) {
        this.surfaceView.resize(this.viewerDim / bigScale);
        return;
    }
    if (image.getRealWidth() > image.getRealHeight()) {
        scaleX = (((lower ? height - Medical_Image_Viewer.viewer.Viewer.GAP : height) / this.longestDim) / bigScale) *
            (image.getXSize() / this.longestDimSize);
        scaleY = ((((lower ? height - Medical_Image_Viewer.viewer.Viewer.GAP : height) / this.longestDim) *
            image.getYXratio()) / bigScale) * (image.getXSize() / this.longestDimSize);
    } else {
        scaleX = ((((lower ? height - Medical_Image_Viewer.viewer.Viewer.GAP : height) / this.longestDim) *
            image.getXYratio()) / bigScale) * (image.getYSize() / this.longestDimSize);
        scaleY = (((lower ? height - Medical_Image_Viewer.viewer.Viewer.GAP : height) / this.longestDim) / bigScale) *
            (image.getYSize() / this.longestDimSize);
    }
    transX = (((lower ? height - Medical_Image_Viewer.viewer.Viewer.GAP : height) / bigScale) - (image.getXDim() * scaleX)) / 2;
    transY = (((lower ? height - Medical_Image_Viewer.viewer.Viewer.GAP : height) / bigScale) - (image.getYDim() * scaleY)) / 2;
    image.screenDim = (lower ? (height - Medical_Image_Viewer.viewer.Viewer.GAP) / factor : height);
    image.screenTransform[0][0] = scaleX;
    image.screenTransform[1][1] = scaleY;
    image.screenTransform[0][2] = transX;
    image.screenTransform[1][2] = transY;
    image.screenTransform2[0][0] = scaleX;
    image.screenTransform2[1][1] = scaleY;
    image.screenTransform2[0][2] = transX;
    image.screenTransform2[1][2] = transY;
};

/*setLongestDim 函数用于设置最长维度，根据传入的体积数据，计算出体积数据中最长的维度和其对应的尺寸，并更新查看器对象的相关属性。 */
Medical_Image_Viewer.viewer.Viewer.prototype.setLongestDim = function (volume) {
    this.longestDim = volume.getXDim();
    this.longestDimSize = volume.getXSize();
    if ((volume.getYDim() * volume.getYSize()) > (this.longestDim * this.longestDimSize)) {
        this.longestDim = volume.getYDim();
        this.longestDimSize = volume.getYSize();
    }
    if ((volume.getZDim() * volume.getZSize()) > (this.longestDim * this.longestDimSize)) {
        this.longestDim = volume.getZDim();
        this.longestDimSize = volume.getZSize();
    }
};

/*用于处理键盘事件的函数。根据按下的键盘按键，执行不同的操作，包括旋转视图、移动到特定坐标、增加或减少切片位置、切换显示交叉线、切换显示标尺等功能。 */
Medical_Image_Viewer.viewer.Viewer.prototype.keyDownEvent = function (ke) {
    var keyCode, center;
    this.keyPressIgnored = false;
    if (this.container.toolbar.isShowingMenus()) {
        return;
    }
    if (((Medical_Image_ViewerContainers.length > 1) || Medical_Image_ViewerContainers[0].nestedViewer) && (Medical_Image_Viewer.Container.Medical_Image_ViewerLastHoveredViewer !== this)) {
        return;
    }
    keyCode = Medical_Image_Viewer.viewer.Viewer.getKeyCode(ke);
    if (Medical_Image_Viewer.viewer.Viewer.isControlKey(ke)) {
        this.isControlKeyDown = true;
    } else if (Medical_Image_Viewer.viewer.Viewer.isAltKey(ke)) {
        this.isAltKeyDown = true;
    } else if (Medical_Image_Viewer.viewer.Viewer.isShiftKey(ke)) {
        this.isShiftKeyDown = true;
    } else if (keyCode === Medical_Image_Viewer.viewer.Viewer.KEYCODE_ROTATE_VIEWS) {
        this.rotateViews();
    } else if (keyCode === Medical_Image_Viewer.viewer.Viewer.KEYCODE_CENTER) {
        center = new Medical_Image_Viewer.core.Coordinate(Math.floor(this.volume.header.imageDimensions.xDim / 2),
            Math.floor(this.volume.header.imageDimensions.yDim / 2),
            Math.floor(this.volume.header.imageDimensions.zDim / 2));
        this.gotoCoordinate(center);
    } else if (keyCode === Medical_Image_Viewer.viewer.Viewer.KEYCODE_ORIGIN) {
        this.gotoCoordinate(this.volume.header.origin);
    } else if (keyCode === Medical_Image_Viewer.viewer.Viewer.KEYCODE_ARROW_UP) {
        this.incrementCoronal(false);
    } else if (keyCode === Medical_Image_Viewer.viewer.Viewer.KEYCODE_ARROW_DOWN) {
        this.incrementCoronal(true);
    } else if (keyCode === Medical_Image_Viewer.viewer.Viewer.KEYCODE_ARROW_LEFT) {
        this.incrementSagittal(true);
    } else if (keyCode === Medical_Image_Viewer.viewer.Viewer.KEYCODE_ARROW_RIGHT) {
        this.incrementSagittal(false);
    } else if ((keyCode === Medical_Image_Viewer.viewer.Viewer.KEYCODE_PAGE_DOWN) ||
        (keyCode === Medical_Image_Viewer.viewer.Viewer.KEYCODE_FORWARD_SLASH)) {
        this.incrementAxial(true);
    } else if ((keyCode === Medical_Image_Viewer.viewer.Viewer.KEYCODE_PAGE_UP) ||
        (keyCode === Medical_Image_Viewer.viewer.Viewer.KEYCODE_SINGLE_QUOTE)) {
        this.incrementAxial(false);
    } else if (keyCode === Medical_Image_Viewer.viewer.Viewer.KEYCODE_INCREMENT_MAIN) {
        if (this.mainImage.sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_AXIAL) {
            this.incrementAxial(false);
        } else if (this.mainImage.sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_CORONAL) {
            this.incrementCoronal(false);
        } else if (this.mainImage.sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
            this.incrementSagittal(true);
        }
    } else if (keyCode === Medical_Image_Viewer.viewer.Viewer.KEYCODE_DECREMENT_MAIN) {
        if (this.mainImage.sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_AXIAL) {
            this.incrementAxial(true);
        } else if (this.mainImage.sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_CORONAL) {
            this.incrementCoronal(true);
        } else if (this.mainImage.sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
            this.incrementSagittal(false);
        }
    } else if (keyCode === Medical_Image_Viewer.viewer.Viewer.KEYCODE_TOGGLE_CROSSHAIRS) {
        if (this.container.preferences.showCrosshairs === "Yes") {
            this.toggleMainCrosshairs = !this.toggleMainCrosshairs;
            this.drawViewer(true);
        }
    } else if (keyCode === Medical_Image_Viewer.viewer.Viewer.KEYCODE_SERIES_FORWARD) {
        this.incrementSeriesPoint();
    } else if (keyCode === Medical_Image_Viewer.viewer.Viewer.KEYCODE_SERIES_BACK) {
        this.decrementSeriesPoint();
    } else if (keyCode === Medical_Image_Viewer.viewer.Viewer.KEYCODE_RULER) {
        if (this.container.preferences.showRuler === "Yes") {
            this.container.preferences.showRuler = "No";
        } else {
            this.container.preferences.showRuler = "Yes";
        }
        this.drawViewer(true, true);
    } else {
        this.keyPressIgnored = true;
    }

    if (!this.keyPressIgnored) {
        ke.handled = true;
        ke.preventDefault();
    }
};

Medical_Image_Viewer.viewer.Viewer.prototype.keyUpEvent = function (ke) {
    if ((Medical_Image_ViewerContainers.length > 1) && (Medical_Image_Viewer.Container.Medical_Image_ViewerLastHoveredViewer !== this)) {
        return;
    }
    this.isControlKeyDown = false;
    this.isAltKeyDown = false;
    this.isShiftKeyDown = false;
    if (!this.keyPressIgnored) {
        ke.handled = true;
        ke.preventDefault();
    }
    if (this.hasSurface()) {
        if (Medical_Image_Viewer.utilities.PlatformUtils.smallScreen) {
            this.drawViewer(true, false);
        }
    }
};
/*rotateViews函数用于旋转视图。根据当前是否存在表面视图，交换主图像和辅助图像的位置，然后调用viewsChanged函数进行视图变化处理。 */
Medical_Image_Viewer.viewer.Viewer.prototype.rotateViews = function () {
    var temp;
    if (this.container.contextManager && this.container.contextManager.clearContext) {
        this.container.contextManager.clearContext();
    }
    if (this.hasSurface()) {
        temp = this.lowerImageBot2;
        this.lowerImageBot2 = this.lowerImageBot;
        this.lowerImageBot = this.lowerImageTop;
        this.lowerImageTop = this.mainImage;
        this.mainImage = temp;
    } else {
        temp = this.lowerImageBot;
        this.lowerImageBot = this.lowerImageTop;
        this.lowerImageTop = this.mainImage;
        this.mainImage = temp;
    }
    this.viewsChanged();
};
/*viewsChanged函数在视图发生变化时调用。该函数计算屏幕切片的变换，清除DTI线条图像，根据主图像是否为表面视图来控制控件的显示和隐藏，并绘制视图。 */
Medical_Image_Viewer.viewer.Viewer.prototype.viewsChanged = function () {
    this.calculateScreenSliceTransforms();
    if (this.hasSurface()) {
        this.lowerImageBot2.clearDTILinesImage();
    }
    this.lowerImageBot.clearDTILinesImage();
    this.lowerImageTop.clearDTILinesImage();
    this.mainImage.clearDTILinesImage();
    if (!this.controlsHidden) {
        if (this.mainImage !== this.surfaceView) {
            this.fadeInControls();
        } else {
            $("#" + Medical_Image_Viewer_CONTROL_MAIN_INCREMENT_BUTTON_CSS + this.container.containerIndex).fadeOut();
            $("#" + Medical_Image_Viewer_CONTROL_MAIN_DECREMENT_BUTTON_CSS + this.container.containerIndex).fadeOut();
        }
        $("#" + Medical_Image_Viewer_DEFAULT_SLIDER_ID + this.container.containerIndex + "main").find("button").prop("disabled",
            (this.mainImage === this.surfaceView));
    }
    this.drawViewer(true);
    this.updateSliceSliderControl();
};
/*timepointChanged函数当时间点发生变化时调用。该函数重新绘制视图，更新切片滑块控件，以及更新窗口标题。 */
Medical_Image_Viewer.viewer.Viewer.prototype.timepointChanged = function () {
    this.drawViewer(true);
    this.updateSliceSliderControl();
    this.updateWindowTitle();
};

/*resetUpdateTimer函数，其功能是重置更新定时器。该函数会清除之前的定时器，并根据传入的鼠标事件参数设置新的定时器，用于更新图像位置。 */
Medical_Image_Viewer.viewer.Viewer.prototype.resetUpdateTimer = function (me) {
    var viewer = this;
    if (this.updateTimer !== null) {
        window.clearTimeout(this.updateTimer);
        this.updateTimer = null;
        this.updateTimerEvent = null;
    }
    if (me !== null) {
        this.updateTimerEvent = me;
        this.updateTimer = window.setTimeout(Medical_Image_Viewer.utilities.ObjectUtils.bind(viewer,
            function () {
                viewer.updatePosition(this, Medical_Image_Viewer.utilities.PlatformUtils.getMousePositionX(viewer.updateTimerEvent),
                    Medical_Image_Viewer.utilities.PlatformUtils.getMousePositionY(viewer.updateTimerEvent));
            }),
            Medical_Image_Viewer.viewer.Viewer.UPDATE_TIMER_INTERVAL);
    }
};
/*mouseDownEvent函数，该函数处理鼠标按下事件。根据鼠标事件的不同条件和位置，执行不同的操作，包括显示上下文菜单、调整窗宽窗位、放大缩小图像等功能。根据鼠标事件类型和位置执行相应的操作，并在必要时更新视图显示。 */
Medical_Image_Viewer.viewer.Viewer.prototype.mouseDownEvent = function (me) {
    var draggingStarted = true, menuData, menu, pickedColor;
    if (!Medical_Image_Viewer.Container.allowPropagation) {
        me.stopPropagation();
    }
    me.preventDefault();
    if (this.showingContextMenu) {
        this.container.toolbar.closeAllMenus();
        me.handled = true;
        return;
    }
    if ((me.target.nodeName === "IMG") || (me.target.nodeName === "CANVAS")) {
        if (me.handled !== true) {
            this.container.toolbar.closeAllMenus();
            this.previousMousePosition.x = Medical_Image_Viewer.utilities.PlatformUtils.getMousePositionX(me);
            this.previousMousePosition.y = Medical_Image_Viewer.utilities.PlatformUtils.getMousePositionY(me);
            this.findClickedSlice(this, this.previousMousePosition.x, this.previousMousePosition.y);
            if (((me.button === 2) || this.isControlKeyDown || this.isLongTouch) && this.container.contextManager && (this.selectedSlice === this.mainImage) && (this.mainImage === this.surfaceView)) {
                this.contextMenuMousePositionX = this.previousMousePosition.x - this.canvasRect.left;
                this.contextMenuMousePositionY = this.previousMousePosition.y - this.canvasRect.top;
                if (this.container.contextManager.prefersColorPicking && this.container.contextManager.prefersColorPicking()) {
                    pickedColor = this.surfaceView.pickColor(this.contextMenuMousePositionX, this.contextMenuMousePositionY);
                    menuData = this.container.contextManager.getContextAtColor(pickedColor[0], pickedColor[1], pickedColor[2]);
                }
                if (menuData) {
                    this.isContextMode = true;
                    menu = this.container.toolbar.buildMenu(menuData, null, null, null, true);
                    Medical_Image_Viewer.ui.Toolbar.applyContextState(menu);
                    draggingStarted = false;
                    menu.showMenu();
                    this.showingContextMenu = true;
                }
                this.isContextMode = true;
            } else if (((me.button === 2) || this.isControlKeyDown || this.isLongTouch) && this.container.contextManager && (this.selectedSlice === this.mainImage)) {
                if (this.isLongTouch) {
                    var point = this.convertCurrentCoordinateToScreen(this.mainImage);
                    this.contextMenuMousePositionX = point.x;
                    this.contextMenuMousePositionY = point.y;
                    menuData = this.container.contextManager.getContextAtImagePosition(this.currentCoord.x, this.currentCoord.y, this.currentCoord.z);
                } else {
                    this.contextMenuMousePositionX = this.previousMousePosition.x - this.canvasRect.left;
                    this.contextMenuMousePositionY = this.previousMousePosition.y - this.canvasRect.top;
                    menuData = this.container.contextManager.getContextAtImagePosition(this.cursorPosition.x, this.cursorPosition.y, this.cursorPosition.z);
                }
                if (menuData) {
                    this.isContextMode = true;
                    menu = this.container.toolbar.buildMenu(menuData, null, null, null, true);
                    Medical_Image_Viewer.ui.Toolbar.applyContextState(menu);
                    draggingStarted = false;
                    menu.showMenu();
                    this.showingContextMenu = true;
                }
            } else if (((me.button === 2) || this.isControlKeyDown) && !this.currentScreenVolume.rgb) {
                this.isWindowControl = true;
                if (this.container.showImageButtons && (this.container.showControlBar || !this.container.kioskMode) &&
                        this.screenVolumes[this.getCurrentScreenVolIndex()].supportsDynamicColorTable()) {
                    this.container.toolbar.showImageMenu(this.getCurrentScreenVolIndex());
                }
            } else if (this.isAltKeyDown && this.selectedSlice) {
                this.isZoomMode = true;
                if (this.selectedSlice === this.surfaceView) {
                    this.isPanning = this.isShiftKeyDown;
                    this.surfaceView.setStartDynamic(this.previousMousePosition.x, this.previousMousePosition.y);
                } else if (this.isZooming() && this.isShiftKeyDown) {
                    this.isPanning = true;
                    this.setStartPanLocation(
                        this.convertScreenToImageCoordinateX(this.previousMousePosition.x, this.selectedSlice),
                        this.convertScreenToImageCoordinateY(this.previousMousePosition.y, this.selectedSlice),
                        this.selectedSlice.sliceDirection
                    );
                } else {
                    this.setZoomLocation();
                }
            } else {
                if (this.selectedSlice && (this.selectedSlice !== this.surfaceView)) {
                    this.grabbedHandle = this.selectedSlice.findProximalRulerHandle(this.convertScreenToImageCoordinateX(this.previousMousePosition.x - this.canvasRect.left, this.selectedSlice),
                        this.convertScreenToImageCoordinateY(this.previousMousePosition.y - this.canvasRect.top, this.selectedSlice));
                    if (this.grabbedHandle === null) {
                        this.updatePosition(this, Medical_Image_Viewer.utilities.PlatformUtils.getMousePositionX(me), Medical_Image_Viewer.utilities.PlatformUtils.getMousePositionY(me), false);
                        this.resetUpdateTimer(me);
                    }
                } else if (this.selectedSlice && (this.selectedSlice === this.surfaceView)) {
                    if (this.surfaceView.findProximalRulerHandle(this.previousMousePosition.x - this.canvasRect.left,
                            this.previousMousePosition.y - this.canvasRect.top)) {
                    } else {
                        this.isPanning = this.isShiftKeyDown;
                        this.surfaceView.setStartDynamic(this.previousMousePosition.x, this.previousMousePosition.y);
                    }
                    this.container.display.drawEmptyDisplay();
                }
            }
            this.isDragging = draggingStarted;
            me.handled = true;
        }
        if (!this.controlsHidden) {
            this.controlsHiddenPrimed = true;
        }
    }
};
/*mouseUpEvent函数处理鼠标松开事件。根据不同的条件和状态执行不同的操作，包括更新位置、更新光标位置、重置拖动状态、重置窗口控制状态、重置放大缩小状态、重置平移状态、清除选择的切片、更新窗口标题、更新切片滑块控件等。 */
Medical_Image_Viewer.viewer.Viewer.prototype.mouseUpEvent = function (me) {
    if (!Medical_Image_Viewer.Container.allowPropagation) {
        me.stopPropagation();
    }
    me.preventDefault();
    if (this.showingContextMenu) {
        this.showingContextMenu = false;
        me.handled = true;
        return;
    }
    if ((me.target.nodeName === "IMG") || (me.target.nodeName === "CANVAS")) {
        if (me.handled !== true) {
            if (!this.isWindowControl && !this.isZoomMode && !this.isContextMode && (this.grabbedHandle === null) && (!this.surfaceView || (this.surfaceView.grabbedRulerPoint === -1))) {
                this.updatePosition(this, Medical_Image_Viewer.utilities.PlatformUtils.getMousePositionX(me), Medical_Image_Viewer.utilities.PlatformUtils.getMousePositionY(me));
            }
            if (this.selectedSlice === this.surfaceView) {
                this.updateCursorPosition(this, Medical_Image_Viewer.utilities.PlatformUtils.getMousePositionX(me), Medical_Image_Viewer.utilities.PlatformUtils.getMousePositionY(me));
            }
            this.zoomFactorPrevious = this.zoomFactor;
            this.isDragging = false;
            this.isWindowControl = false;
            this.isZoomMode = false;
            this.isPanning = false;
            this.selectedSlice = null;
            this.controlsHiddenPrimed = false;
            me.handled = true;
        }
    }
    this.grabbedHandle = null;
    this.isContextMode = false;
    this.updateWindowTitle();
    this.updateSliceSliderControl();
    this.container.toolbar.closeAllMenus(true);
    if (this.hasSurface()) {
        if (this.surfaceView.grabbedRulerPoint === -1) {
            this.surfaceView.updateCurrent();
        } else {
            this.surfaceView.grabbedRulerPoint = -1;
        }

        if (Medical_Image_Viewer.utilities.PlatformUtils.smallScreen) {
            this.drawViewer(true, false);
        }
    }
    if (this.controlsHidden) {
        this.controlsHidden = false;
        this.fadeInControls();
    }
};

/*fadeOutControls函数用于淡出控件，通过选择对应的控件元素并调用jQuery的fadeOut方法来实现。 */
Medical_Image_Viewer.viewer.Viewer.prototype.fadeOutControls = function () {
    $("#" + Medical_Image_Viewer_CONTROL_MAIN_INCREMENT_BUTTON_CSS + this.container.containerIndex).fadeOut();
    $("#" + Medical_Image_Viewer_CONTROL_MAIN_DECREMENT_BUTTON_CSS + this.container.containerIndex).fadeOut();
    $("#" + Medical_Image_Viewer_CONTROL_MAIN_SWAP_BUTTON_CSS + this.container.containerIndex).fadeOut();
    $("#" + Medical_Image_Viewer_CONTROL_MAIN_GOTO_CENTER_BUTTON_CSS + this.container.containerIndex).fadeOut();
    $("#" + Medical_Image_Viewer_CONTROL_MAIN_GOTO_ORIGIN_BUTTON_CSS + this.container.containerIndex).fadeOut();
};
/*fadeInControls函数根据视图尺寸和主图像是否为表面视图来决定是否淡入控件。通过选择对应的控件元素并调用jQuery的fadeIn方法来实现。 */
Medical_Image_Viewer.viewer.Viewer.prototype.fadeInControls = function () {
    if (this.container.getViewerDimensions()[0] < 600) {
        if (this.mainImage !== this.surfaceView) {
            $("#" + Medical_Image_Viewer_CONTROL_MAIN_INCREMENT_BUTTON_CSS + this.container.containerIndex).fadeIn();
            $("#" + Medical_Image_Viewer_CONTROL_MAIN_DECREMENT_BUTTON_CSS + this.container.containerIndex).fadeIn();
        }
        $("#" + Medical_Image_Viewer_CONTROL_MAIN_SWAP_BUTTON_CSS + this.container.containerIndex).fadeIn();
    } else {
        if (this.mainImage !== this.surfaceView) {
            $("#" + Medical_Image_Viewer_CONTROL_MAIN_INCREMENT_BUTTON_CSS + this.container.containerIndex).fadeIn();
            $("#" + Medical_Image_Viewer_CONTROL_MAIN_DECREMENT_BUTTON_CSS + this.container.containerIndex).fadeIn();
        }
        $("#" + Medical_Image_Viewer_CONTROL_MAIN_SWAP_BUTTON_CSS + this.container.containerIndex).fadeIn();
        $("#" + Medical_Image_Viewer_CONTROL_MAIN_GOTO_CENTER_BUTTON_CSS + this.container.containerIndex).fadeIn();
        $("#" + Medical_Image_Viewer_CONTROL_MAIN_GOTO_ORIGIN_BUTTON_CSS + this.container.containerIndex).fadeIn();
    }
};
/*findClickedSlice函数根据鼠标点击的位置和视图的位置判断用户点击的是哪个切片，并将其设置为选定的切片。 */
Medical_Image_Viewer.viewer.Viewer.prototype.findClickedSlice = function (viewer, xLoc, yLoc) {
    xLoc = xLoc - this.canvasRect.left;
    yLoc = yLoc - this.canvasRect.top;
    if (this.insideScreenSlice(viewer.axialSlice, xLoc, yLoc, viewer.volume.getXDim(), viewer.volume.getYDim())) {
        this.selectedSlice = this.axialSlice;
    } else if (this.insideScreenSlice(viewer.coronalSlice, xLoc, yLoc, viewer.volume.getXDim(),
            viewer.volume.getZDim())) {
        this.selectedSlice = this.coronalSlice;
    } else if (this.insideScreenSlice(viewer.sagittalSlice, xLoc, yLoc, viewer.volume.getYDim(),
            viewer.volume.getZDim())) {
        this.selectedSlice = this.sagittalSlice;
    } else if (this.insideScreenSlice(viewer.surfaceView, xLoc, yLoc, viewer.volume.getYDim(),
            viewer.volume.getZDim())) {
        this.selectedSlice = this.surfaceView;
    } else {
        this.selectedSlice = null;
    }
};
/*mouseMoveEvent函数处理鼠标移动事件。根据不同的状态和条件执行不同的操作，包括处理拖动、窗位窗宽调整、平移、放大缩小、更新光标位置等。
  同时，根据控件是否隐藏的状态和定时器的状态来控制控件的显示和隐藏。 */
Medical_Image_Viewer.viewer.Viewer.prototype.mouseMoveEvent = function (me) {
    me.preventDefault();
    if (this.showingContextMenu) {
        me.handled = true;
        return;
    }
    var currentMouseX, currentMouseY, zoomFactorCurrent;
    Medical_Image_Viewer.Container.Medical_Image_ViewerLastHoveredViewer = this;
    currentMouseX = Medical_Image_Viewer.utilities.PlatformUtils.getMousePositionX(me);
    currentMouseY = Medical_Image_Viewer.utilities.PlatformUtils.getMousePositionY(me);
    if (this.isDragging) {
        if (this.grabbedHandle) {
            if (this.isInsideMainSlice(currentMouseX, currentMouseY)) {
                this.grabbedHandle.x = this.convertScreenToImageCoordinateX(currentMouseX - this.canvasRect.left, this.selectedSlice);
                this.grabbedHandle.y = this.convertScreenToImageCoordinateY(currentMouseY - this.canvasRect.top, this.selectedSlice);
                this.drawViewer(true, true);
            }
        } else if (this.isWindowControl) {
            this.windowLevelChanged(this.previousMousePosition.x - currentMouseX, this.previousMousePosition.y - currentMouseY);
            this.previousMousePosition.x = currentMouseX;
            this.previousMousePosition.y = currentMouseY;
        } else if (this.isPanning) {
            if (this.selectedSlice === this.surfaceView) {
                this.surfaceView.updateTranslateDynamic(Medical_Image_Viewer.utilities.PlatformUtils.getMousePositionX(me),
                    Medical_Image_Viewer.utilities.PlatformUtils.getMousePositionY(me), (this.selectedSlice === this.mainImage) ? 1 : 3);
                this.drawViewer(false, true);
            } else {
                this.setCurrentPanLocation(
                    this.convertScreenToImageCoordinateX(currentMouseX, this.selectedSlice),
                    this.convertScreenToImageCoordinateY(currentMouseY, this.selectedSlice),
                    this.selectedSlice.sliceDirection
                );
            }
        } else if (this.isZoomMode) {
            if (this.selectedSlice === this.surfaceView) {
                zoomFactorCurrent = ((this.previousMousePosition.y - currentMouseY) * 0.5) * this.surfaceView.scaleFactor;
                this.surfaceView.zoom += zoomFactorCurrent;
                this.previousMousePosition.x = currentMouseX;
                this.previousMousePosition.y = currentMouseY;
            } else {
                zoomFactorCurrent = ((this.previousMousePosition.y - currentMouseY) * 0.05);
                this.setZoomFactor(this.zoomFactorPrevious - zoomFactorCurrent);
                this.axialSlice.updateZoomTransform(this.zoomFactor, this.zoomLocX, this.zoomLocY, this.panAmountX,
                    this.panAmountY, this);
                this.coronalSlice.updateZoomTransform(this.zoomFactor, this.zoomLocX, this.zoomLocZ, this.panAmountX,
                    this.panAmountZ, this);
                this.sagittalSlice.updateZoomTransform(this.zoomFactor, this.zoomLocY, this.zoomLocZ, this.panAmountY,
                    this.panAmountZ, this);
            }
            this.drawViewer(true);
        } else {
            this.resetUpdateTimer(null);
            if (this.selectedSlice !== null) {
                if (this.selectedSlice === this.surfaceView) {
                    if (this.surfaceView.grabbedRulerPoint !== -1) {
                        this.surfaceView.pickRuler(currentMouseX - this.canvasRect.left,
                            currentMouseY - this.canvasRect.top);
                        this.drawViewer(false, true);
                    } else {
                        this.surfaceView.updateDynamic(Medical_Image_Viewer.utilities.PlatformUtils.getMousePositionX(me),
                            Medical_Image_Viewer.utilities.PlatformUtils.getMousePositionY(me), (this.selectedSlice === this.mainImage) ? 1 : 3);
                        this.drawViewer(false, true);
                        this.container.display.drawEmptyDisplay();
                    }
                } else {
                    this.updatePosition(this, Medical_Image_Viewer.utilities.PlatformUtils.getMousePositionX(me),
                        Medical_Image_Viewer.utilities.PlatformUtils.getMousePositionY(me));
                }
            }
        }
    } else {
        this.updateCursorPosition(this, Medical_Image_Viewer.utilities.PlatformUtils.getMousePositionX(me),
            Medical_Image_Viewer.utilities.PlatformUtils.getMousePositionY(me));
        this.isZoomMode = false;
    }
    if (this.controlsHidden && !this.isDragging) {
        this.controlsHidden = false;
        this.fadeInControls();
    }
    if (this.controlsTimer) {
        clearTimeout(this.controlsTimer);
        this.controlsTimer = null;
    }
    this.controlsTimer = setTimeout(Medical_Image_Viewer.utilities.ObjectUtils.bind(this, function () {
        this.controlsHidden = true;
        this.fadeOutControls();
        }), 8000);
    if (this.controlsHiddenPrimed) {
        this.controlsHiddenPrimed = false;
        this.controlsHidden = true;
        this.fadeOutControls();
    }
};

/*mouseDoubleClickEvent函数处理鼠标双击事件。如果当前按下了Alt键，则将缩放因子设置为1。 */
Medical_Image_Viewer.viewer.Viewer.prototype.mouseDoubleClickEvent = function () {
    if (this.isAltKeyDown) {
        this.zoomFactorPrevious = 1;
        this.setZoomFactor(1);
    }
};
/*mouseOutEvent函数处理鼠标移出事件。如果当前正在拖动，则调用mouseUpEvent函数。
  否则，如果容器显示存在，则调用drawEmptyDisplay函数绘制空的显示，并将grabbedHandle设置为null。 */
Medical_Image_Viewer.viewer.Viewer.prototype.mouseOutEvent = function (me) {
    Medical_Image_Viewer.Container.Medical_Image_ViewerLastHoveredViewer = null;
    if (this.isDragging) {
        this.mouseUpEvent(me);
    } else {
        if (this.container.display) {
            this.container.display.drawEmptyDisplay();
        }
        this.grabbedHandle = null;
    }
};
/*mouseLeaveEvent函数处理鼠标离开事件。该函数为空函数，没有实际的操作。 */
Medical_Image_Viewer.viewer.Viewer.prototype.mouseLeaveEvent = function () {};
/*touchMoveEvent函数处理触摸移动事件。如果没有进行长按操作，则调用mouseDownEvent和mouseMoveEvent函数，并将isDragging设置为true。 */
Medical_Image_Viewer.viewer.Viewer.prototype.touchMoveEvent = function (me) {
    if (!this.didLongTouch) {
        if (this.longTouchTimer) {
            clearTimeout(this.longTouchTimer);
            this.longTouchTimer = null;
        }
        if (!this.isDragging) {
            this.mouseDownEvent(me);
            this.isDragging = true;
        }
        this.mouseMoveEvent(me);
    }
};
/*touchStartEvent函数处理触摸开始事件。如果不允许事件传播，则调用stopPropagation函数。
  然后，调用preventDefault函数以防止默认行为发生。如果长按定时器存在，则清除它。然后，设置长按定时器，并在定时器超时后调用doLongTouch函数。 */
Medical_Image_Viewer.viewer.Viewer.prototype.touchStartEvent = function (me) {
    if (!Medical_Image_Viewer.Container.allowPropagation) {
        me.stopPropagation();
    }
    me.preventDefault();
    this.longTouchTimer = setTimeout(Medical_Image_Viewer.utilities.ObjectUtils.bind(this, function() {this.doLongTouch(me); }), 500);
};
/*touchEndEvent函数处理触摸结束事件。如果没有进行长按操作，则调用mouseDownEvent和mouseUpEvent函数。
  最后，将didLongTouch和isLongTouch设置为false。 */
Medical_Image_Viewer.viewer.Viewer.prototype.touchEndEvent = function (me) {
    if (!this.didLongTouch) {
        if (this.longTouchTimer) {
            clearTimeout(this.longTouchTimer);
            this.longTouchTimer = null;
        }
        if (!this.isDragging) {
            this.mouseDownEvent(me);
        }
        this.mouseUpEvent(me);
    }
    this.didLongTouch = false;
    this.isLongTouch = false;
};

/*doLongTouch函数处理长按事件。首先，将didLongTouch和isLongTouch设置为true。然后，更新光标位置并调用mouseDownEvent和mouseUpEvent函数。 */
Medical_Image_Viewer.viewer.Viewer.prototype.doLongTouch = function (me) {
    this.longTouchTimer = null;
    this.didLongTouch = true;
    this.isLongTouch = true;
    this.updateCursorPosition(this, Medical_Image_Viewer.utilities.PlatformUtils.getMousePositionX(me), Medical_Image_Viewer.utilities.PlatformUtils.getMousePositionY(me));
    this.mouseDownEvent(me);
    this.mouseUpEvent(me);
};
/*windowLevelChanged函数处理窗位窗宽调整事件。根据对比度变化和亮度变化的绝对值的大小来决定调整哪个参数。
  然后，根据调整后的参数值来设置当前屏幕体积的屏幕范围，并更新工具栏上的图像菜单范围。 */
Medical_Image_Viewer.viewer.Viewer.prototype.windowLevelChanged = function (contrastChange, brightnessChange) {
    var range, step, minFinal, maxFinal;
    range = this.currentScreenVolume.screenMax - this.currentScreenVolume.screenMin;
    step = range * 0.025;
    if (Math.abs(contrastChange) > Math.abs(brightnessChange)) {
        minFinal = this.currentScreenVolume.screenMin + (step * Medical_Image_Viewer.utilities.MathUtils.signum(contrastChange));
        maxFinal = this.currentScreenVolume.screenMax + (-1 * step * Medical_Image_Viewer.utilities.MathUtils.signum(contrastChange));
        if (maxFinal <= minFinal) {
            minFinal = this.currentScreenVolume.screenMin;
            maxFinal = this.currentScreenVolume.screenMin; // yes, min
        }
    } else {
        minFinal = this.currentScreenVolume.screenMin + (step * Medical_Image_Viewer.utilities.MathUtils.signum(brightnessChange));
        maxFinal = this.currentScreenVolume.screenMax + (step * Medical_Image_Viewer.utilities.MathUtils.signum(brightnessChange));
    }
    this.currentScreenVolume.setScreenRange(minFinal, maxFinal);
    if (this.container.showImageButtons) {
        this.container.toolbar.updateImageMenuRange(this.getCurrentScreenVolIndex(), parseFloat(minFinal.toPrecision(7)),
            parseFloat(maxFinal.toPrecision(7)));
    }
    this.drawViewer(true);
};
/*gotoCoordinate函数根据给定的坐标跳转到对应的位置。如果坐标越界，则将其限制在图像范围内。
  然后，调用drawViewer函数绘制视图，并更新切片滑块控件。最后，如果不是无同步模式，则调用coordinateChanged函数通知容器坐标已更改，并再次调用drawViewer函数 */
Medical_Image_Viewer.viewer.Viewer.prototype.gotoCoordinate = function (coor, nosync) {
    if (!this.initialized) {
        return;
    }
    var xDim = this.volume.header.imageDimensions.xDim;
    var yDim = this.volume.header.imageDimensions.yDim;
    var zDim = this.volume.header.imageDimensions.zDim;
    if (coor.x < 0) {
        this.currentCoord.x = 0;
    } else if (coor.x >= xDim) {
        this.currentCoord.x = (xDim - 1);
    } else {
        this.currentCoord.x = coor.x;
    }
    if (coor.y < 0) {
        this.currentCoord.y = 0;
    } else if (coor.y >= yDim) {
        this.currentCoord.y = (yDim - 1);
    } else {
        this.currentCoord.y = coor.y;
    }
    if (coor.z < 0) {
        this.currentCoord.z = 0;
    } else if (coor.z >= zDim) {
        this.currentCoord.z = (zDim - 1);
    } else {
        this.currentCoord.z = coor.z;
    }
    this.drawViewer(true);
    this.updateSliceSliderControl();
    if (nosync) {
        return;
    }
    this.container.coordinateChanged(this);
    this.drawViewer(false);
};

/*gotoWorldCoordinate函数根据给定的世界坐标跳转到对应的位置。首先创建一个新的坐标对象coor，然后调用getIndexCoordinateAtWorld函数将世界坐标转换为索引坐标，
  并最终调用gotoCoordinate函数进行跳转。 */
Medical_Image_Viewer.viewer.Viewer.prototype.gotoWorldCoordinate = function (coorWorld, nosync) {
    var coor = new Medical_Image_Viewer.core.Coordinate();
    this.gotoCoordinate(this.getIndexCoordinateAtWorld(coorWorld.x, coorWorld.y, coorWorld.z, coor), nosync);
};
/*resizeViewer函数调整查看器的大小。设置画布的宽度和高度，并在初始化后重新计算屏幕切片的变换。然后绘制视图并更新控件的位置。 */
Medical_Image_Viewer.viewer.Viewer.prototype.resizeViewer = function (dims) {
    var halfPadding = Medical_Image_Viewer_PADDING / 2, offset, swapButton, originButton, incButton, decButton, centerButton;
    this.canvas.width = dims[0];
    this.canvas.height = dims[1];
    if (this.initialized) {
        this.calculateScreenSliceTransforms();
        this.canvasRect = this.canvas.getBoundingClientRect();
        this.drawViewer(true);
        if (this.container.showControls) {
            offset = $(this.canvas).offset();
            incButton = $("#" + Medical_Image_Viewer_CONTROL_MAIN_INCREMENT_BUTTON_CSS + this.container.containerIndex);
            incButton.css({
                top: offset.top + halfPadding,
                left: offset.left + this.mainImage.screenDim - incButton.outerWidth() - halfPadding,
                position:'absolute'});
            decButton = $("#" + Medical_Image_Viewer_CONTROL_MAIN_DECREMENT_BUTTON_CSS + this.container.containerIndex);
            decButton.css({
                top: offset.top + decButton.outerHeight() + Medical_Image_Viewer_PADDING,
                left: offset.left + this.mainImage.screenDim - decButton.outerWidth() - halfPadding,
                position:'absolute'});
            swapButton = $("#" + Medical_Image_Viewer_CONTROL_MAIN_SWAP_BUTTON_CSS + this.container.containerIndex);
            swapButton.css({
                top: offset.top + this.mainImage.screenDim - swapButton.outerHeight() - halfPadding,
                left: offset.left + this.mainImage.screenDim - swapButton.outerWidth() - halfPadding,
                //width: swapButton.outerWidth(),
                position:'absolute'});
            centerButton = $("#" + Medical_Image_Viewer_CONTROL_MAIN_GOTO_CENTER_BUTTON_CSS + this.container.containerIndex);
            centerButton.css({
                top: offset.top + this.mainImage.screenDim - centerButton.outerHeight() - halfPadding,
                left: offset.left + halfPadding,
                position:'absolute'});

            originButton = $("#" + Medical_Image_Viewer_CONTROL_MAIN_GOTO_ORIGIN_BUTTON_CSS + this.container.containerIndex);
            originButton.css({
                top: offset.top + this.mainImage.screenDim - originButton.outerHeight() - halfPadding,
                left: offset.left + halfPadding + originButton.outerWidth() + Medical_Image_Viewer_PADDING,
                position:'absolute'});
        }
    }
};
/*getWorldCoordinateAtIndex函数根据给定的索引坐标计算世界坐标。通过将索引坐标乘以体素尺寸并加上体素原点的位置来实现。 */
Medical_Image_Viewer.viewer.Viewer.prototype.getWorldCoordinateAtIndex = function (ctrX, ctrY, ctrZ, coord) {
    coord.setCoordinate((ctrX - this.volume.header.origin.x) * this.volume.header.voxelDimensions.xSize,
        (this.volume.header.origin.y - ctrY) * this.volume.header.voxelDimensions.ySize,
        (this.volume.header.origin.z - ctrZ) * this.volume.header.voxelDimensions.zSize);
    return coord;
};
/*getIndexCoordinateAtWorld函数根据给定的世界坐标计算索引坐标。通过将世界坐标除以体素尺寸并加上体素原点的位置来实现。 */
Medical_Image_Viewer.viewer.Viewer.prototype.getIndexCoordinateAtWorld = function (ctrX, ctrY, ctrZ, coord) {
    coord.setCoordinate((ctrX / this.volume.header.voxelDimensions.xSize) + this.volume.header.origin.x,
        -1 * ((ctrY / this.volume.header.voxelDimensions.ySize) - this.volume.header.origin.y),
        -1 * ((ctrZ / this.volume.header.voxelDimensions.zSize) - this.volume.header.origin.z), true);
    return coord;
};
/*getNextColorTable函数获取下一个颜色表。根据已加载的屏幕体积的数量和已定义的颜色表的数量计算下一个颜色表的名称。 */
Medical_Image_Viewer.viewer.Viewer.prototype.getNextColorTable = function () {
    var ctr, count = 0, value;
    for (ctr = 1; ctr < this.screenVolumes.length; ctr += 1) {
        if (!this.screenVolumes[ctr].dti) {
            count += 1;
        }
    }
    value = count % Medical_Image_Viewer.viewer.ColorTable.OVERLAY_COLOR_TABLES.length;
    return Medical_Image_Viewer.viewer.ColorTable.OVERLAY_COLOR_TABLES[value].name;
};
/*getCurrentValueAt函数获取指定坐标处的像素值。根据指定的坐标和当前屏幕体积的插值设置，使用体积数据对象的getVoxelAtCoordinate或getVoxelAtMM函数获取像素值。 */
Medical_Image_Viewer.viewer.Viewer.prototype.getCurrentValueAt = function (ctrX, ctrY, ctrZ) {
    /*jslint bitwise: true */
    var interpolation = !this.currentScreenVolume.interpolation;
    interpolation &= (this.container.preferences.smoothDisplay === "Yes");
    if (this.worldSpace) {
        interpolation |= ((this.currentScreenVolume.volume === this.volume) && this.volume.isWorldSpaceOnly());
        return this.currentScreenVolume.volume.getVoxelAtCoordinate(
            (ctrX - this.volume.header.origin.x) * this.volume.header.voxelDimensions.xSize,
            (this.volume.header.origin.y - ctrY) * this.volume.header.voxelDimensions.ySize,
            (this.volume.header.origin.z - ctrZ) * this.volume.header.voxelDimensions.zSize,
            this.currentScreenVolume.currentTimepoint, !interpolation);
    } else {
        return this.currentScreenVolume.volume.getVoxelAtMM(
            ctrX * this.volume.header.voxelDimensions.xSize,
            ctrY * this.volume.header.voxelDimensions.ySize,
            ctrZ * this.volume.header.voxelDimensions.zSize,
            this.currentScreenVolume.currentTimepoint, !interpolation);
    }
};
/*resetViewer函数：重置查看器。将查看器的状态重置为初始状态，包括禁用控制按钮、清空数据、移除事件监听器等操作。 */
Medical_Image_Viewer.viewer.Viewer.prototype.resetViewer = function () {
    if (this.container.showControlBar) {
        $("." + Medical_Image_Viewer_CONTROL_INCREMENT_BUTTON_CSS).prop('disabled', true);
        $("." + Medical_Image_Viewer_CONTROL_SWAP_BUTTON_CSS).prop('disabled', true);
        $("." + Medical_Image_Viewer_CONTROL_GOTO_CENTER_BUTTON_CSS).prop('disabled', true);
        $("." + Medical_Image_Viewer_CONTROL_GOTO_ORIGIN_BUTTON_CSS).prop('disabled', true);
    } else if (this.container.showControls) {
        $("#" + Medical_Image_Viewer_CONTROL_MAIN_INCREMENT_BUTTON_CSS + this.container.containerIndex).css({display: "none"});
        $("#" + Medical_Image_Viewer_CONTROL_MAIN_DECREMENT_BUTTON_CSS + this.container.containerIndex).css({display: "none"});
        $("#" + Medical_Image_Viewer_CONTROL_MAIN_SWAP_BUTTON_CSS + this.container.containerIndex).css({display: "none"});
        $("#" + Medical_Image_Viewer_CONTROL_MAIN_GOTO_CENTER_BUTTON_CSS + this.container.containerIndex).css({display: "none"});
        $("#" + Medical_Image_Viewer_CONTROL_MAIN_GOTO_ORIGIN_BUTTON_CSS + this.container.containerIndex).css({display: "none"});
    }
    this.initialized = false;
    this.loadingVolume = null;
    this.volume = new Medical_Image_Viewer.volume.Volume(this.container.display, this);
    this.screenVolumes = [];
    this.surfaces = [];
    this.surfaceView = null;
    this.currentScreenVolume = null;
    this.axialSlice = null;
    this.coronalSlice = null;
    this.sagittalSlice = null;
    this.mainImage = null;
    this.lowerImageBot2 = null;
    this.lowerImageBot = null;
    this.lowerImageTop = null;
    this.viewerDim = 0;
    this.currentCoord = new Medical_Image_Viewer.core.Coordinate(0, 0, 0);
    this.longestDim = 0;
    this.longestDimSize = 0;
    this.draggingSliceDir = 0;
    this.isDragging = false;
    this.isWindowControl = false;
    this.hasSeries = false;
    this.previousMousePosition = new Medical_Image_Viewer.core.Point();
    this.canvas.removeEventListener("mousemove", this.listenerMouseMove, false);
    this.canvas.removeEventListener("mousedown", this.listenerMouseDown, false);
    this.canvas.removeEventListener("mouseout", this.listenerMouseOut, false);
    this.canvas.removeEventListener("mouseleave", this.listenerMouseLeave, false);
    this.canvas.removeEventListener("mouseup", this.listenerMouseUp, false);
    document.removeEventListener("keydown", this.listenerKeyDown, true);
    document.removeEventListener("keyup", this.listenerKeyUp, true);
    document.removeEventListener("contextmenu", this.listenerContextMenu, false);
    this.canvas.removeEventListener("touchmove", this.listenerTouchMove, false);
    this.canvas.removeEventListener("touchstart", this.listenerTouchStart, false);
    this.canvas.removeEventListener("touchend", this.listenerTouchEnd, false);
    this.canvas.removeEventListener("dblclick", this.listenerMouseDoubleClick, false);
    this.removeScroll();
    this.updateTimer = null;
    this.updateTimerEvent = null;
    this.drawEmptyViewer();
    if (this.container.display) {
        this.container.display.drawEmptyDisplay();
    }
    this.updateSliceSliderControl();
    this.container.toolbar.buildToolbar();
};
/*getHeaderDescription函数：获取指定索引的屏幕体积的头部描述。返回屏幕体积的体积头部对象的字符串表示。 */
Medical_Image_Viewer.viewer.Viewer.prototype.getHeaderDescription = function (index) {
    index = index || 0;
    return this.screenVolumes[index].volume.header.toString();
};
/*getImageDimensionsDescription函数：获取指定索引的屏幕体积的图像维度描述。返回屏幕体积的体积头部对象的方向和图像维度信息的字符串表示。 */
Medical_Image_Viewer.viewer.Viewer.prototype.getImageDimensionsDescription = function (index) {
    var orientationStr, imageDims;
    orientationStr = this.screenVolumes[index].volume.header.orientation.orientation;
    imageDims = this.screenVolumes[index].volume.header.imageDimensions;
    return ("(" + orientationStr.charAt(0) + ", " + orientationStr.charAt(1) + ", " + orientationStr.charAt(2) + ") " +
        imageDims.cols + " x " + imageDims.rows + " x " + imageDims.slices);
};

/*getVoxelDimensionsDescription函数：获取指定索引的屏幕体积的像素维度描述。
  返回屏幕体积的体积头部对象的方向和像素维度信息的字符串表示。 */
Medical_Image_Viewer.viewer.Viewer.prototype.getVoxelDimensionsDescription = function (index) {
    var orientationStr, voxelDims;
    orientationStr = this.screenVolumes[index].volume.header.orientation.orientation;
    voxelDims = this.screenVolumes[index].volume.header.voxelDimensions;
    return ("(" + orientationStr.charAt(0) + ", " + orientationStr.charAt(1) + ", " + orientationStr.charAt(2) + ") " +
        Medical_Image_Viewer.utilities.StringUtils.formatNumber(voxelDims.colSize, true) + " x " + Medical_Image_Viewer.utilities.StringUtils.formatNumber(voxelDims.rowSize, true) + " x " +
        Medical_Image_Viewer.utilities.StringUtils.formatNumber(voxelDims.sliceSize, true) + " " + voxelDims.getSpatialUnitString());
};
/*getSeriesDimensionsDescription函数：获取指定索引的屏幕体积的系列维度描述。
  返回屏幕体积的体积头部对象的时间点数的字符串表示。 */
Medical_Image_Viewer.viewer.Viewer.prototype.getSeriesDimensionsDescription = function (index) {
    var imageDims = this.screenVolumes[index].volume.header.imageDimensions;
    return (imageDims.timepoints.toString());
};
/*getSeriesSizeDescription函数：获取指定索引的屏幕体积的系列大小描述。返回屏幕体积的体积头部对象的时间维度大小和单位的字符串表示。 */
Medical_Image_Viewer.viewer.Viewer.prototype.getSeriesSizeDescription = function (index) {
    var voxelDims = this.screenVolumes[index].volume.header.voxelDimensions;
    return (voxelDims.timeSize.toString() + " " + voxelDims.getTemporalUnitString());
};
/*getFilename函数：获取指定索引的屏幕体积的文件名。返回屏幕体积的文件名字符串。 */
Medical_Image_Viewer.viewer.Viewer.prototype.getFilename = function (index) {
    return Medical_Image_Viewer.utilities.StringUtils.wordwrap(this.screenVolumes[index].volume.fileName, 25, "<br />", true);
};
/*getSurfaceFilename函数：获取指定索引的表面的文件名。返回表面的文件名字符串。 */
Medical_Image_Viewer.viewer.Viewer.prototype.getSurfaceFilename = function (index) {
    return Medical_Image_Viewer.utilities.StringUtils.wordwrap(this.surfaces[index].filename, 25, "<br />", true);
};
/*getSurfaceNumPoints函数：获取指定索引的表面的点数。返回表面的点数。 */
Medical_Image_Viewer.viewer.Viewer.prototype.getSurfaceNumPoints = function (index) {
    return this.surfaces[index].numPoints;
};
/*getSurfaceNumTriangles函数：获取指定索引的表面的三角形数。返回表面的三角形数。 */
Medical_Image_Viewer.viewer.Viewer.prototype.getSurfaceNumTriangles = function (index) {
    return this.surfaces[index].numTriangles;
};
/*getNiceFilename函数：获取指定索引的屏幕体积的漂亮文件名。返回屏幕体积的文件名字符串，
  如果长度超过了Viewer.TITLE_MAX_LENGTH，则截断字符串并在末尾添加省略号。 */
Medical_Image_Viewer.viewer.Viewer.prototype.getNiceFilename = function (index) {
    var truncateText, filename;
    truncateText = "...";
    filename = this.screenVolumes[index].volume.fileName.replace(".nii", "").replace(".gz", "");
    if (filename.length > Medical_Image_Viewer.viewer.Viewer.TITLE_MAX_LENGTH) {
        filename = filename.substr(0, Medical_Image_Viewer.viewer.Viewer.TITLE_MAX_LENGTH - truncateText.length) + truncateText;
    }
    return filename;
};
/*getFileLength函数：获取指定索引的屏幕体积的文件大小。返回屏幕体积的文件大小的字符串表示。 */
Medical_Image_Viewer.viewer.Viewer.prototype.getFileLength = function (index) {
    return Medical_Image_Viewer.utilities.StringUtils.getSizeString(this.screenVolumes[index].volume.fileLength);
};
/*getByteTypeDescription函数：获取指定索引的屏幕体积的字节类型描述。返回屏幕体积的体积头部对象的图像类型的字节数和类型描述的字符串表示。 */
Medical_Image_Viewer.viewer.Viewer.prototype.getByteTypeDescription = function (index) {
    return (this.screenVolumes[index].volume.header.imageType.numBytes + "-Byte " +
        this.screenVolumes[index].volume.header.imageType.getTypeDescription());
};
/*getByteOrderDescription函数：获取指定索引的屏幕体积的字节顺序描述。返回屏幕体积的体积头部对象的图像类型的字节顺序描述的字符串表示。 */
Medical_Image_Viewer.viewer.Viewer.prototype.getByteOrderDescription = function (index) {
    return this.screenVolumes[index].volume.header.imageType.getOrderDescription();
};
/*getCompressedDescription函数：获取指定索引的屏幕体积的压缩描述。返回屏幕体积的体积头部对象的图像类型是否压缩的字符串表示。 */
Medical_Image_Viewer.viewer.Viewer.prototype.getCompressedDescription = function (index) {
    if (this.screenVolumes[index].volume.header.imageType.compressed) {
        return "Yes";
    }
    return "No";
};
/*getOrientationDescription函数：获取指定索引的屏幕体积的方向描述。返回屏幕体积的体积头部对象的方向描述的字符串表示 */
Medical_Image_Viewer.viewer.Viewer.prototype.getOrientationDescription = function (index) {
    return this.screenVolumes[index].volume.header.orientation.getOrientationDescription();
};
/*getImageDescription函数：获取指定索引的屏幕体积的图像描述。返回屏幕体积的体积头部对象的图像描述的字符串表示。 */
Medical_Image_Viewer.viewer.Viewer.prototype.getImageDescription = function (index) {
    return Medical_Image_Viewer.utilities.StringUtils.wordwrap(this.screenVolumes[index].volume.header.imageDescription.notes, 35, "<br />", true);
};
/*setCurrentScreenVol函数：设置当前屏幕体积的索引。将当前屏幕体积设置为指定索引的屏幕体积。*/
Medical_Image_Viewer.viewer.Viewer.prototype.setCurrentScreenVol = function (index) {
    this.currentScreenVolume = this.screenVolumes[index];
    this.updateWindowTitle();
};
/*updateWindowTitle函数：更新窗口标题。根据当前屏幕体积、时间点和缩放级别等信息，更新窗口标题栏。 */
Medical_Image_Viewer.viewer.Viewer.prototype.updateWindowTitle = function () {
    var title;
    if (this.initialized) {
        title = this.getNiceFilename(this.getCurrentScreenVolIndex());
        if (this.currentScreenVolume.volume.numTimepoints > 1) {
            if (this.currentScreenVolume.seriesLabels && (this.currentScreenVolume.seriesLabels.length > this.currentScreenVolume.currentTimepoint)) {
                title = this.currentScreenVolume.seriesLabels[this.currentScreenVolume.currentTimepoint];
            } else {
                title = (title + " (" + (this.currentScreenVolume.currentTimepoint + 1) + " of " + this.currentScreenVolume.volume.numTimepoints + ")");
            }
        }
        if (this.isZooming()) {
            title = (title + " " + this.getZoomString());
        }
        this.container.toolbar.updateTitleBar(title);
    }
};
/*getCurrentScreenVolIndex函数：获取当前屏幕体积的索引。返回当前屏幕体积在屏幕体积数组中的索引，如果没有找到则返回-1。 */
Medical_Image_Viewer.viewer.Viewer.prototype.getCurrentScreenVolIndex = function () {
    var ctr;
    for (ctr = 0; ctr < this.screenVolumes.length; ctr += 1) {
        if (this.screenVolumes[ctr] === this.currentScreenVolume) {
            return ctr;
        }
    }
    return -1;
};
/*toggleWorldSpace函数：切换世界空间。将worldSpace属性的值取反，并在需要时调用reconcileOverlaySeriesPoint函数。 */
Medical_Image_Viewer.viewer.Viewer.prototype.toggleWorldSpace = function () {
    this.worldSpace = !this.worldSpace;
    if (this.container.syncOverlaySeries) {
        this.reconcileOverlaySeriesPoint(this.currentScreenVolume);
    }
};
/*isSelected函数：判断指定索引的屏幕体积是否被选中。返回当前屏幕体积是否可选且是否与指定索引相同的布尔值。 */
Medical_Image_Viewer.viewer.Viewer.prototype.isSelected = function (index) {
    return (this.isSelectable() && (index === this.getCurrentScreenVolIndex()));
};
/*isSelectable函数：判断是否可以选择屏幕体积。返回屏幕体积数组的长度是否大于1的布尔值。 */
Medical_Image_Viewer.viewer.Viewer.prototype.isSelectable = function () {
    return (this.screenVolumes.length > 1);
};
/*processParams函数：处理参数。根据传入的参数修改医学图像查看器的属性，如worldSpace、ignoreNiftiTransforms、coordinate、ignoreSync等。 */
Medical_Image_Viewer.viewer.Viewer.prototype.processParams = function (params) {
    if (params.worldSpace) {
        this.worldSpace = true;
    }
    if (params.ignoreNiftiTransforms) {
        this.ignoreNiftiTransforms = true;
    }
    if (params.coordinate) {
        this.initialCoordinate = params.coordinate;
    }
    if (params.ignoreSync) {
        this.ignoreSync = params.ignoreSync;
    }
    if (!this.container.isDesktopMode()) {
        if (params.showOrientation !== undefined) {
            this.container.preferences.showOrientation = (params.showOrientation ? "Yes" : "No");
        }
        if (params.smoothDisplay !== undefined) {
            this.container.preferences.smoothDisplay = (params.smoothDisplay ? "Yes" : "No");
        }
        if (params.radiological !== undefined) {
            this.container.preferences.radiological = (params.radiological ? "Yes" : "No");
        }
        if (params.showRuler !== undefined) {
            this.container.preferences.showRuler = (params.showRuler ? "Yes" : "No");
        }
        if (params.showSurfacePlanes !== undefined) {
            this.container.preferences.showSurfacePlanes = (params.showSurfacePlanes ? "Yes" : "No");
        }
        if (params.showSurfaceCrosshairs !== undefined) {
            this.container.preferences.showSurfaceCrosshairs = (params.showSurfaceCrosshairs ? "Yes" : "No");
        }
    }
};
/*hasLoadedDTI函数：判断是否已加载DTI图像。返回屏幕体积数组长度是否为1且该屏幕体积是否为DTI图像且未经过修改的布尔值。*/
Medical_Image_Viewer.viewer.Viewer.prototype.hasLoadedDTI = function () {
    return (this.screenVolumes.length === 1) && (this.screenVolumes[0].dti) && (this.screenVolumes[0].dtiVolumeMod === null);
};
/*goToInitialCoordinate函数：跳转到初始坐标。根据initialCoordinate属性的值，设置初始坐标并调用gotoCoordinate函数进行跳转。*/
Medical_Image_Viewer.viewer.Viewer.prototype.goToInitialCoordinate = function () {
    var coord = new Medical_Image_Viewer.core.Coordinate();
    if (this.screenVolumes.length > 0) {
        if (this.initialCoordinate === null) {
            coord.setCoordinate(Medical_Image_ViewerFloorFast(this.volume.header.imageDimensions.xDim / 2),
                Medical_Image_ViewerFloorFast(this.volume.header.imageDimensions.yDim / 2),
                Medical_Image_ViewerFloorFast(this.volume.header.imageDimensions.zDim / 2), true);
        } else {
            if (this.worldSpace) {
                this.getIndexCoordinateAtWorld(this.initialCoordinate[0], this.initialCoordinate[1],
                    this.initialCoordinate[2], coord);
            } else {
                coord.setCoordinate(this.initialCoordinate[0], this.initialCoordinate[1], this.initialCoordinate[2], true);
            }
            this.initialCoordinate = null;
        }
        this.gotoCoordinate(coord);
        if (this.container.display) {
            this.container.display.drawDisplay(this.currentCoord.x, this.currentCoord.y, this.currentCoord.z);
        }
    }
};
/*getOrientationCertaintyColor函数：获取方向确定性的颜色。根据屏幕体积的方向确定性属性，返回对应的颜色。*/
Medical_Image_Viewer.viewer.Viewer.prototype.getOrientationCertaintyColor = function () {
    var certainty = this.screenVolumes[0].volume.header.orientationCertainty;
    if (certainty === Medical_Image_Viewer.volume.Header.ORIENTATION_CERTAINTY_LOW) {
        return Medical_Image_Viewer.viewer.Viewer.ORIENTATION_CERTAINTY_LOW_COLOR;
    }
    if (certainty === Medical_Image_Viewer.volume.Header.ORIENTATION_CERTAINTY_HIGH) {
        return Medical_Image_Viewer.viewer.Viewer.ORIENTATION_CERTAINTY_HIGH_COLOR;
    }
    return Medical_Image_Viewer.viewer.Viewer.ORIENTATION_CERTAINTY_UNKNOWN_COLOR;
};
/*isUsingAtlas函数：判断是否使用指定名称的图谱。返回当前使用的图谱名称是否与指定名称相同的布尔值。*/
Medical_Image_Viewer.viewer.Viewer.prototype.isUsingAtlas = function (name) {
    return (name === this.atlas.currentAtlas);
};
/*scrolled函数：处理滚轮事件。根据滚轮事件的类型和方向，调用相应的函数进行缩放或切换切片，并更新当前 */
Medical_Image_Viewer.viewer.Viewer.prototype.scrolled = function (e) {
    var scrollSign, isSliceScroll;
    e = e || window.event;
    //If the scroll event happened outside the canvas don't handle it
    if(e.target != this.canvas) {
        return;
    }
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.returnValue = false;
    isSliceScroll = (this.container.preferences.scrollBehavior === "Increment Slice");
    scrollSign = Medical_Image_Viewer.utilities.PlatformUtils.getScrollSign(e, !isSliceScroll);
    if (isSliceScroll) {
        if (scrollSign < 0) {
            if (this.mainImage.sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_AXIAL) {
                this.incrementAxial(false, Math.abs(scrollSign));
            } else if (this.mainImage.sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_CORONAL) {
                this.incrementCoronal(false, Math.abs(scrollSign));
            } else if (this.mainImage.sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
                this.incrementSagittal(false, Math.abs(scrollSign));
            }
            this.gotoCoordinate(this.currentCoord);
        } else if (scrollSign > 0) {
            if (this.mainImage.sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_AXIAL) {
                this.incrementAxial(true, Math.abs(scrollSign));
            } else if (this.mainImage.sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_CORONAL) {
                this.incrementCoronal(true, Math.abs(scrollSign));
            } else if (this.mainImage.sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
                this.incrementSagittal(true, Math.abs(scrollSign));
            }
            this.gotoCoordinate(this.currentCoord);
        }
    } else {
        if (scrollSign !== 0) {
            this.isZoomMode = true;
            if (this.mainImage === this.surfaceView) {
                this.surfaceView.zoom += ((scrollSign * -5) * this.surfaceView.scaleFactor);
                this.drawViewer(false, true);
            } else {
                if (this.mainImage.sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_AXIAL) {
                    this.setZoomLocation(this.currentCoord.x, this.currentCoord.y, this.mainImage.sliceDirection);
                } else if (this.mainImage.sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_CORONAL) {
                    this.setZoomLocation(this.currentCoord.x, this.currentCoord.z, this.mainImage.sliceDirection);
                } else if (this.mainImage.sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
                    this.setZoomLocation(this.currentCoord.y, this.currentCoord.z, this.mainImage.sliceDirection);
                }
                this.setZoomFactor(this.zoomFactorPrevious + (scrollSign * 0.1 * this.zoomFactorPrevious));
            }
            this.zoomFactorPrevious = this.zoomFactor;
        }
    }
};
/*incrementAxial函数：增加或减少轴向切片的索引值，并根据最大索引值进行限制。
  根据increment参数的值，增加或减少currentCoord.z的值，并调用gotoCoordinate函数进行跳转。 */
Medical_Image_Viewer.viewer.Viewer.prototype.incrementAxial = function (increment, degree) {
    var max = this.volume.header.imageDimensions.zDim;
    if (degree === undefined) {
        degree = 1;
    }
    if (increment) {
        this.currentCoord.z += degree;
        if (this.currentCoord.z >= max) {
            this.currentCoord.z = max - 1;
        }
    } else {
        this.currentCoord.z -= degree;

        if (this.currentCoord.z < 0) {
            this.currentCoord.z = 0;
        }
    }
    this.gotoCoordinate(this.currentCoord);
};
/*incrementCoronal函数：增加或减少冠状面切片的索引值，并根据最大索引值进行限制。
  根据increment参数的值，增加或减少currentCoord.y的值，并调用gotoCoordinate函数进行跳转。 */
Medical_Image_Viewer.viewer.Viewer.prototype.incrementCoronal = function (increment, degree) {
    var max = this.volume.header.imageDimensions.yDim;
    if (degree === undefined) {
        degree = 1;
    }
    if (increment) {
        this.currentCoord.y += degree;
        if (this.currentCoord.y >= max) {
            this.currentCoord.y = max - 1;
        }
    } else {
        this.currentCoord.y -= degree;
        if (this.currentCoord.y < 0) {
            this.currentCoord.y = 0;
        }
    }
    this.gotoCoordinate(this.currentCoord);
};
/*incrementSagittal函数：增加或减少矢状面切片的索引值，并根据最大索引值进行限制。
  根据increment参数的值，增加或减少currentCoord.x的值，并调用gotoCoordinate函数进行跳转。 */
Medical_Image_Viewer.viewer.Viewer.prototype.incrementSagittal = function (increment, degree) {
    var max = this.volume.header.imageDimensions.xDim;
    if (degree === undefined) {
        degree = 1;
    }
    if (increment) {
        this.currentCoord.x -= degree;
        if (this.currentCoord.x < 0) {
            this.currentCoord.x = 0;
        }
    } else {
        this.currentCoord.x += degree;
        if (this.currentCoord.x >= max) {
            this.currentCoord.x = max - 1;
        }
    }
    this.gotoCoordinate(this.currentCoord);
};
/*setZoomFactor函数：设置缩放因子的值，并根据最大和最小值进行限制。根据新的缩放因子值，更新相关的变量，并调用drawViewer函数进行重新绘制图像。 */
Medical_Image_Viewer.viewer.Viewer.prototype.setZoomFactor = function (val) {
    if (val > Medical_Image_Viewer.viewer.Viewer.ZOOM_FACTOR_MAX) {
        val = Medical_Image_Viewer.viewer.Viewer.ZOOM_FACTOR_MAX;
    } else if (val < Medical_Image_Viewer.viewer.Viewer.ZOOM_FACTOR_MIN) {
        val = Medical_Image_Viewer.viewer.Viewer.ZOOM_FACTOR_MIN;
    }
    this.zoomFactor = val;
    if (this.zoomFactor === 1) {
        this.panAmountX = this.panAmountY = this.panAmountZ = 0;
    }
    this.axialSlice.updateZoomTransform(this.zoomFactor, this.zoomLocX, this.zoomLocY, this.panAmountX,
        this.panAmountY, this);
    this.coronalSlice.updateZoomTransform(this.zoomFactor, this.zoomLocX, this.zoomLocZ, this.panAmountX,
        this.panAmountZ, this);
    this.sagittalSlice.updateZoomTransform(this.zoomFactor, this.zoomLocY, this.zoomLocZ, this.panAmountY,
        this.panAmountZ, this);
    this.drawViewer(false, true);
    this.updateWindowTitle();
};
/*getZoomString函数：获取当前缩放因子的字符串表示形式（百分比）。 */
Medical_Image_Viewer.viewer.Viewer.prototype.getZoomString = function () {
    return (parseInt(this.zoomFactor * 100, 10) + "%");
};
/*isZooming函数：判断是否正在缩放。返回当前缩放因子是否大于1的布尔值。 */
Medical_Image_Viewer.viewer.Viewer.prototype.isZooming = function () {
    return (this.zoomFactor > 1);
};
/*setZoomLocation函数：设置缩放位置。如果当前缩放因子为1，更新缩放位置的值，并调用相关函数进行更新和重新绘制。 */
Medical_Image_Viewer.viewer.Viewer.prototype.setZoomLocation = function () {
    if (this.zoomFactor === 1) {
        this.zoomLocX = this.currentCoord.x;
        this.zoomLocY = this.currentCoord.y;
        this.zoomLocZ = this.currentCoord.z;
        this.axialSlice.updateZoomTransform(this.zoomFactor, this.zoomLocX, this.zoomLocY, this.panAmountX,
            this.panAmountY, this);
        this.coronalSlice.updateZoomTransform(this.zoomFactor, this.zoomLocX, this.zoomLocZ, this.panAmountX,
            this.panAmountZ, this);
        this.sagittalSlice.updateZoomTransform(this.zoomFactor, this.zoomLocY, this.zoomLocZ, this.panAmountY,
            this.panAmountZ, this);
        this.drawViewer(false, true);
    }
};
/*setStartPanLocation函数：设置初始平移位置。根据传入的坐标和切片方向，设置初始的平移位置。 */
Medical_Image_Viewer.viewer.Viewer.prototype.setStartPanLocation = function (xLoc, yLoc, sliceDirection) {
    var temp;
    if (this.zoomFactor > 1) {
        if (sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_AXIAL) {
            this.panLocX = xLoc;
            this.panLocY = yLoc;
            this.panLocZ = this.axialSlice.currentSlice;
        } else if (sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_CORONAL) {
            this.panLocX = xLoc;
            this.panLocY = this.coronalSlice.currentSlice;
            this.panLocZ = yLoc;
        } else if (sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
            this.panLocX = this.sagittalSlice.currentSlice;
            temp = xLoc;  // because of dumb IDE warning
            this.panLocY = temp;
            this.panLocZ = yLoc;
        }
    }
};

/*setCurrentPanLocation函数：设置当前平移位置。根据传入的坐标和切片方向，更新平移量的值，并调用相关函数进行更新和重新绘制。 */
Medical_Image_Viewer.viewer.Viewer.prototype.setCurrentPanLocation = function (xLoc, yLoc, sliceDirection) {
    if (this.zoomFactor > 1) {
        if (sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_AXIAL) {
            this.panAmountX += (xLoc - this.panLocX);
            this.panAmountY += (yLoc - this.panLocY);
            this.panAmountZ = 0;
        } else if (sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_CORONAL) {
            this.panAmountX += (xLoc - this.panLocX);
            this.panAmountY = 0;
            this.panAmountZ += (yLoc - this.panLocZ);
        } else if (sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
            this.panAmountX = 0;
            this.panAmountY += (xLoc - this.panLocY);
            this.panAmountZ += (yLoc - this.panLocZ);
        }
        this.axialSlice.updateZoomTransform(this.zoomFactor, this.zoomLocX, this.zoomLocY, this.panAmountX,
            this.panAmountY, this);
        this.coronalSlice.updateZoomTransform(this.zoomFactor, this.zoomLocX, this.zoomLocZ, this.panAmountX,
            this.panAmountZ, this);
        this.sagittalSlice.updateZoomTransform(this.zoomFactor, this.zoomLocY, this.zoomLocZ, this.panAmountY,
            this.panAmountZ, this);
        this.drawViewer(false, true);
    }
};
/*isWorldMode函数：判断当前是否处于世界模式。返回布尔值，指示是否处于世界模式。*/
Medical_Image_Viewer.viewer.Viewer.prototype.isWorldMode = function () {
    return this.worldSpace;
};
/*isRadiologicalMode函数：判断当前是否处于放射学模式。返回布尔值，指示是否处于放射学模式。 */
Medical_Image_Viewer.viewer.Viewer.prototype.isRadiologicalMode = function () {
    return (this.container.preferences.radiological === "Yes");
};
/*isCollapsable函数：判断当前查看器是否可以折叠。返回布尔值，指示是否可以折叠。 */
Medical_Image_Viewer.viewer.Viewer.prototype.isCollapsable = function () {
    return this.container.collapsable;
};
/*mainSliderControlChanged函数：主切片滑块控件数值改变时的操作。
  根据当前主切片的方向，更新当前坐标的值，并调用gotoCoordinate函数进行跳转。 */
Medical_Image_Viewer.viewer.Viewer.prototype.mainSliderControlChanged = function () {
    if (this.mainImage.sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_AXIAL) {
        this.currentCoord.z = parseInt(this.mainSliderControl.val(), 10);
    } else if (this.mainImage.sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_CORONAL) {
        this.currentCoord.y = parseInt(this.mainSliderControl.val(), 10);
    } else if (this.mainImage.sliceDirection === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
        this.currentCoord.x = parseInt(this.mainSliderControl.val(), 10);
    }
    this.gotoCoordinate(this.currentCoord);
};
/*axialSliderControlChanged函数：轴向切片滑块控件数值改变时的操作。
  更新当前坐标的z值，并调用gotoCoordinate函数进行跳转。 */
Medical_Image_Viewer.viewer.Viewer.prototype.axialSliderControlChanged = function () {
    this.currentCoord.z = parseInt(this.axialSliderControl.val(), 10);
    this.gotoCoordinate(this.currentCoord);
};
/*coronalSliderControlChanged函数：冠状面切片滑块控件数值改变时的操作。
  更新当前坐标的y值，并调用gotoCoordinate函数进行跳转。 */
Medical_Image_Viewer.viewer.Viewer.prototype.coronalSliderControlChanged = function () {
    this.currentCoord.y = parseInt(this.coronalSliderControl.val(), 10);
    this.gotoCoordinate(this.currentCoord);
};
/*sagittalSliderControlChanged函数：矢状面切片滑块控件数值改变时的操作。
  更新当前坐标的x值，并调用gotoCoordinate函数进行跳转。 */
Medical_Image_Viewer.viewer.Viewer.prototype.sagittalSliderControlChanged = function () {
    this.currentCoord.x = parseInt(this.sagittalSliderControl.val(), 10);
    this.gotoCoordinate(this.currentCoord);
};

/*seriesSliderControlChanged函数：系列滑块控件数值改变时的操作。
  更新当前屏幕体积的时间点，并根据情况调用相关函数进行处理。 */
Medical_Image_Viewer.viewer.Viewer.prototype.seriesSliderControlChanged = function () {
    this.currentScreenVolume.setTimepoint(parseInt(this.seriesSliderControl.val(), 10));
    if (this.currentScreenVolume.isOverlay() && this.container.syncOverlaySeries) {
        this.reconcileOverlaySeriesPoint(this.currentScreenVolume);
    }
    this.timepointChanged();
};

/*updateSliceSliderControl函数：更新切片滑块控件。根据当前的初始化状态，更新各个切片滑块控件的状态和数值。 */
Medical_Image_Viewer.viewer.Viewer.prototype.updateSliceSliderControl = function () {
    if (this.mainSliderControl) {
        this.doUpdateSliceSliderControl(this.mainSliderControl, this.mainImage.sliceDirection);
    }
    if (this.axialSliderControl) {
        this.doUpdateSliceSliderControl(this.axialSliderControl, Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_AXIAL);
    }
    if (this.coronalSliderControl) {
        this.doUpdateSliceSliderControl(this.coronalSliderControl, Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_CORONAL);
    }
    if (this.sagittalSliderControl) {
        this.doUpdateSliceSliderControl(this.sagittalSliderControl, Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_SAGITTAL);
    }
    if (this.seriesSliderControl) {
        this.doUpdateSliceSliderControl(this.seriesSliderControl, Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_TEMPORAL);
    }
};
/*doUpdateSliceSliderControl函数：实际更新切片滑块控件的操作。
  根据传入的滑块和方向，更新滑块的状态和数值。 */
Medical_Image_Viewer.viewer.Viewer.prototype.doUpdateSliceSliderControl = function (slider, direction) {
    if (this.initialized) {
        slider.prop("disabled", false);
        slider.prop("min", "0");
        slider.prop("step", "1");
        if (direction === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_AXIAL) {
            slider.prop("max", (this.volume.header.imageDimensions.zDim - 1).toString());
            slider.val(this.currentCoord.z);
        } else if (direction === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_CORONAL) {
            slider.prop("max", (this.volume.header.imageDimensions.yDim - 1).toString());
            slider.val(this.currentCoord.y);
        } else if (direction === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
            slider.prop("max", (this.volume.header.imageDimensions.xDim - 1).toString());
            slider.val(this.currentCoord.x);
        } else if (direction === Medical_Image_Viewer.viewer.ScreenSlice.DIRECTION_TEMPORAL) {
            slider.prop("max", (this.currentScreenVolume.volume.header.imageDimensions.timepoints - 1).toString());
            slider.val(this.currentScreenVolume.currentTimepoint);
        }
    } else {
        slider.prop("disabled", true);
        slider.prop("min", "0");
        slider.prop("step", "1");
        slider.prop("max", "1");
        slider.val(0);
    }
};


/*incrementSeriesPoint函数：增加当前屏幕体积的时间点。
  调用当前屏幕体积的incrementTimepoint函数，并根据情况调用相关函数进行处理。 */
Medical_Image_Viewer.viewer.Viewer.prototype.incrementSeriesPoint = function () {
    this.currentScreenVolume.incrementTimepoint();
    if (this.currentScreenVolume.isOverlay() && this.container.syncOverlaySeries) {
        this.reconcileOverlaySeriesPoint(this.currentScreenVolume);
    }
    this.timepointChanged();
};

/*decrementSeriesPoint函数：减少当前屏幕体积的时间点。
  调用当前屏幕体积的decrementTimepoint函数，并根据情况调用相关函数进行处理。 */
Medical_Image_Viewer.viewer.Viewer.prototype.decrementSeriesPoint = function () {
    this.currentScreenVolume.decrementTimepoint();
    if (this.currentScreenVolume.isOverlay() && this.container.syncOverlaySeries) {
        this.reconcileOverlaySeriesPoint(this.currentScreenVolume);
    }
    this.timepointChanged();
};
/*reconcileOverlaySeriesPoint函数：调整叠加屏幕体积的时间点。
  根据当前是否处于世界模式，将其他叠加屏幕体积的时间点设置为当前屏幕体积的时间点或秒数。 */
Medical_Image_Viewer.viewer.Viewer.prototype.reconcileOverlaySeriesPoint = function (screenVolume) {
    var ctr, seriesPoint, seriesPointSeconds;
    if (this.worldSpace) {
        seriesPointSeconds = screenVolume.getCurrentTime();
        for (ctr = 1; ctr < this.screenVolumes.length; ctr += 1) {
            if (this.screenVolumes[ctr] !== screenVolume) {
                this.screenVolumes[ctr].setCurrentTime(seriesPointSeconds);
            }
        }
    } else {
        seriesPoint = screenVolume.currentTimepoint;
        for (ctr = 1; ctr < this.screenVolumes.length; ctr += 1) {
            if (this.screenVolumes[ctr] !== screenVolume) {
                this.screenVolumes[ctr].setTimepoint(seriesPoint);
            }
        }
    }
};
/*hasParametricPair函数：判断当前屏幕体积是否有参数对。返回布尔值，指示当前屏幕体积是否有参数对。 */
Medical_Image_Viewer.viewer.Viewer.prototype.hasParametricPair = function (index) {
    if (index) {
        return (this.screenVolumes[index].negativeScreenVol !== null);
    } else {
        return false;
    }
};
/*getScreenVolumeIndex函数：获取屏幕体积的索引。根据传入的屏幕体积，返回其在screenVolumes数组中的索引值。 */
Medical_Image_Viewer.viewer.Viewer.prototype.getScreenVolumeIndex = function (screenVol) {
    var ctr;
    if (screenVol) {
        for (ctr = 0; ctr < this.screenVolumes.length; ctr += 1) {
            if (screenVol === this.screenVolumes[ctr]) {
                return ctr;
            }
        }
    }
    return -1;
};

/*getScreenVolumeByName函数：根据名称获取屏幕体积。
  根据传入的名称，返回screenVolumes数组中对应名称的屏幕体积。 */
Medical_Image_Viewer.viewer.Viewer.prototype.getScreenVolumeByName = function (name) {
    var ctr;
    for (ctr = 0; ctr < this.screenVolumes.length; ctr += 1) {
        if (name == this.screenVolumes[ctr].volume.fileName) {
            return this.screenVolumes[ctr];
        }
    }
    return null;
};
/*isShowingRuler函数：判断是否显示标尺。返回布尔值，指示是否显示标尺。 */
Medical_Image_Viewer.viewer.Viewer.prototype.isShowingRuler = function () {
    return (this.container.preferences.showRuler === "Yes");
};
/*isShowingOrientation函数：判断是否显示方向。返回布尔值，指示是否显示方向。*/
Medical_Image_Viewer.viewer.Viewer.prototype.isShowingOrientation = function () {
    return (this.container.preferences.showOrientation === "Yes");
};

/*isShowingCrosshairs函数：判断是否显示十字线。返回布尔值，指示是否显示十字线。 */
Medical_Image_Viewer.viewer.Viewer.prototype.isShowingCrosshairs = function () {
    return (this.container.preferences.showCrosshairs === "Yes");
};

/*isShowingSurfacePlanes函数：判断是否显示表面平面。返回布尔值，指示是否显示表面平面。 */
Medical_Image_Viewer.viewer.Viewer.prototype.isShowingSurfacePlanes = function () {
    return (this.surfaceView && this.surfaceView.showSurfacePlanes);
};
/*isShowingSurfaceCrosshairs函数：判断是否显示表面十字线。返回布尔值，指示是否显示表面十字线。 */
Medical_Image_Viewer.viewer.Viewer.prototype.isShowingSurfaceCrosshairs = function () {
    return (this.surfaceView && this.surfaceView.showSurfaceCrosshairs);
};

/*restart函数：重新开始查看器。调用resetViewer函数重置查看器，更新工具栏按钮，并调用loadImage函数加载图像。 */
Medical_Image_Viewer.viewer.Viewer.prototype.restart = function (refs, forceUrl, forceEncode, forceBinary) {
    this.resetViewer();
    this.container.toolbar.updateImageButtons();
    this.loadImage(refs, forceUrl, forceEncode, forceBinary);
};
/*removeOverlay函数：移除叠加屏幕体积。根据传入的索引值，关闭对应的叠加屏幕体积和参数对，并重新绘制查看器。 */
Medical_Image_Viewer.viewer.Viewer.prototype.removeOverlay = function (imageIndex) {
    var screenVol, screenVolNeg;
    screenVol = this.container.viewer.screenVolumes[imageIndex];
    screenVolNeg = screenVol.negativeScreenVol;
    this.closeOverlayByRef(screenVol);
    if (this.container.combineParametric) {
        this.closeOverlayByRef(screenVolNeg);
    }
    this.drawViewer(true, false);
};
/*toggleOverlay 函数用于切换图像叠加层的显示与隐藏。 */
Medical_Image_Viewer.viewer.Viewer.prototype.toggleOverlay = function (imageIndex) {
    var screenVol, screenVolNeg;
    screenVol = this.container.viewer.screenVolumes[imageIndex];
    screenVol.hidden = !screenVol.hidden;
    screenVolNeg = screenVol.negativeScreenVol;
    if (this.container.combineParametric && screenVolNeg) {
        screenVolNeg.hidden = !screenVolNeg.hidden;
    }
    this.drawViewer(true, false);
    return screenVol.hidden;
};
/*addParametric 函数用于向图像查看器中添加参数图像。 */
Medical_Image_Viewer.viewer.Viewer.prototype.addParametric = function (imageIndex) {
    var screenVol = this.container.viewer.screenVolumes[imageIndex],
        overlayNeg;
    if (screenVol.negativeScreenVol === null) {
        this.screenVolumes[this.screenVolumes.length] = overlayNeg = new Medical_Image_Viewer.viewer.ScreenVolume(screenVol.volume,
            {}, Medical_Image_Viewer.viewer.ColorTable.PARAMETRIC_COLOR_TABLES[1].name, false, true, this.currentCoord);
        screenVol.negativeScreenVol = overlayNeg;
        this.setCurrentScreenVol(this.screenVolumes.length - 1);
        this.drawViewer(true, false);
        this.container.toolbar.buildToolbar();
        this.container.toolbar.updateImageButtons();
    }
};
