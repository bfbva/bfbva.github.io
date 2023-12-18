
/*jslint browser: true, node: true */
/*global $, Medical_Image_Viewer_VIEWER_CSS, Medical_Image_Viewer_DEFAULT_TOOLBAR_ID, Medical_Image_Viewer_DEFAULT_VIEWER_ID, Medical_Image_Viewer_DEFAULT_DISPLAY_ID,
 Medical_Image_Viewer_TOOLBAR_CSS, Medical_Image_Viewer_DISPLAY_CSS, Medical_Image_Viewer_DEFAULT_SLIDER_ID, Medical_Image_Viewer_DEFAULT_CONTAINER_ID, Medical_Image_Viewer_SLIDER_CSS,
 Medical_Image_Viewer_UTILS_UNSUPPORTED_CSS, Medical_Image_Viewer_UTILS_UNSUPPORTED_MESSAGE_CSS, Medical_Image_Viewer_CONTAINER_CLASS_NAME,
 Medical_Image_Viewer_CONTAINER_FULLSCREEN, Medical_Image_Viewer_CONTAINER_CLASS_NAME, Medical_Image_Viewer_UTILS_CHECKFORJS_CSS, Medical_Image_Viewer_SPACING,
 Medical_Image_ViewerRoundFast, Medical_Image_Viewer_PADDING, Medical_Image_Viewer_CONTAINER_PADDING_TOP, Medical_Image_Viewer_CONTAINER_COLLAPSABLE_EXEMPT,
 Medical_Image_Viewer_CONTAINER_COLLAPSABLE, Medical_Image_Viewer_MANGO_INSTALLED, Medical_Image_Viewer_KIOSK_CONTROLS_CSS, Medical_Image_Viewer_CONTROL_INCREMENT_BUTTON_CSS,
 Medical_Image_Viewer_CONTROL_SLIDER_CSS, Medical_Image_Viewer_CONTROL_GOTO_CENTER_BUTTON_CSS, Medical_Image_Viewer_CONTROL_GOTO_ORIGIN_BUTTON_CSS,
 Medical_Image_Viewer_CONTROL_SWAP_BUTTON_CSS, Medical_Image_Viewer_CONTROL_DIRECTION_SLIDER, Medical_Image_Viewer_CONTROL_MAIN_SLIDER,
 Medical_Image_Viewer_CONTROL_MAIN_INCREMENT_BUTTON_CSS, Medical_Image_Viewer_CONTROL_MAIN_INCREMENT_BUTTON_CSS,
 Medical_Image_Viewer_CONTROL_MAIN_DECREMENT_BUTTON_CSS, Medical_Image_Viewer_CONTROL_MAIN_SWAP_BUTTON_CSS, Medical_Image_Viewer_CONTROL_BAR_LABELS_CSS,
 Medical_Image_Viewer_CONTROL_MAIN_GOTO_CENTER_BUTTON_CSS, Medical_Image_Viewer_CONTROL_MAIN_GOTO_ORIGIN_BUTTON_CSS
 */

"use strict";

/*** Imports ***/
var Medical_Image_Viewer = Medical_Image_Viewer || {};


/*** Global Fields ***/
var Medical_Image_ViewerContainers = [];
var Medical_Image_ViewerLoadableImages = Medical_Image_ViewerLoadableImages || [];
var Medical_Image_ViewerDroppedFiles = [];


/*** Constructor ***/
Medical_Image_Viewer.Container = Medical_Image_Viewer.Container || function (containerHtml) {
    this.containerHtml = containerHtml;
    this.containerIndex = null;
    this.toolbarHtml = null;
    this.viewerHtml = null;
    this.displayHtml = null;
    this.titlebarHtml = null;
    this.sliderControlHtml = null;
    this.viewer = null;
    this.display = null;
    this.toolbar = null;
    this.preferences = null;
    this.params = [];
    this.loadingImageIndex = 0;
    this.loadingSurfaceIndex = 0;
    this.nestedViewer = false;
    this.collapsable = false;
    this.orthogonal = true;
    this.orthogonalTall = false;
    this.orthogonalDynamic = false;
    this.kioskMode = false;
    this.noNewFiles = false;
    this.showControls = true;
    this.showControlBar = false;
    this.showImageButtons = true;
    this.fullScreenPadding = true;
    this.combineParametric = false;
    this.dropTimeout = null;
    this.showRuler = false;
    this.syncOverlaySeries = true;
    this.surfaceParams = {};
    this.contextManager = null;
    this.allowScroll = true;
    this.loadingComplete = null;
    this.resetComponents();
};


/*** Static Pseudo-constants ***/

Medical_Image_Viewer.Container.LICENSE_TEXT = "<p>该产品不适用于临床用途。<br /><br />" +
    "此软件可免费使用，按原样提供。从此软件衍生的软件和数据可能不得用于临床用途。<br /><br />" +
    "此软件的作者对软件的适用性不作任何明示或暗示的陈述或保证，包括但不限于对适销性、特定用途的适用性、非侵权性或符合规范或标准的暗示保证。此软件的作者对许可证人因使用或修改本软件或其衍生物而遭受的任何损害概不负责。<br /><br />" +
    "通过使用此软件，您同意受本许可证条款的约束。如果您不同意本许可证的条款，请不要使用此软件。</p>";

Medical_Image_Viewer.Container.KEYBOARD_REF_TEXT = "<span style='color:#B5CBD3'>[空格键]</span> 以顺时针旋转方式循环主切片视图。<br /><br />" +
    "<span style='color:#B5CBD3'>[上一页]</span> 或 <span style='color:#B5CBD3'>[']</span> 增加轴向切片。<br /><br />" +
    "<span style='color:#B5CBD3'>[下一页]</span> 或 <span style='color:#B5CBD3'>[/]</span> 减少轴向切片。<br /><br />" +
    "<span style='color:#B5CBD3'>[上箭头]</span> 和 <span style='color:#B5CBD3'>[下箭头]</span> 增加/减少冠状切片。<br /><br />" +
    "<span style='color:#B5CBD3'>[右箭头]</span> 和 <span style='color:#B5CBD3'>[左箭头]</span> 增加/减少矢状切片。<br /><br />" +
    "<span style='color:#B5CBD3'>[g]</span> 和 <span style='color:#B5CBD3'>[v]</span> 增加/减少主切片。<br /><br />" +
    "<span style='color:#B5CBD3'>[<]</span> 或 <span style='color:#B5CBD3'>[,]</span> 减少系列点。<br /><br />" +
    "<span style='color:#B5CBD3'>[>]</span> 或 <span style='color:#B5CBD3'>[.]</span> 增加系列点。<br /><br />" +
    "<span style='color:#B5CBD3'>[o]</span> 导航查看器至图像原点。<br /><br />" +
    "<span style='color:#B5CBD3'>[c]</span> 导航查看器至图像中心。<br /><br />" +
    "<span style='color:#B5CBD3'>[a]</span> 切换主游标开/关。";

Medical_Image_Viewer.Container.MOUSE_REF_TEXT = "<span style='color:#B5CBD3'>(左键单击并拖动)</span> 更改当前坐标。<br /><br />" +
    "<span style='color:#B5CBD3'>[Alt](左键单击并拖动)</span> 放大和缩小。<br /><br />" +
    "<span style='color:#B5CBD3'>[Alt](双击左键)</span> 重置缩放。<br /><br />" +
    "<span style='color:#B5CBD3'>[Alt][Shift](左键单击并拖动)</span> 平移缩放的图像。<br /><br />" +
    "<span style='color:#B5CBD3'>(右键单击并拖动)</span> 窗口级别控制。<br /><br />" +
    "<span style='color:#B5CBD3'>(滚轮)</span> 请参阅首选项。<br /><br />";

Medical_Image_Viewer.Container.DICOM_SUPPORT = true;


/*** Static Fields ***/

Medical_Image_Viewer.Container.syncViewers = false;
Medical_Image_Viewer.Container.syncViewersWorld = false;
Medical_Image_Viewer.Container.allowPropagation = false;
Medical_Image_Viewer.Container.Medical_Image_ViewerLastHoveredViewer = null;
Medical_Image_Viewer.Container.ignorePatterns = [/^[.]/];
Medical_Image_Viewer.Container.atlas = null;
Medical_Image_Viewer.Container.atlasWorldSpace = true;


/*** Static Methods ***/
/*
以下是“Medical_Image_Viewer.Container”原型中的其他方法，负责管理和操作医学图像查看器：

1. **'restartViewer'方法：**
 - 使用给定的引用在指定的索引处重新启动查看器，如果指定，则强制执行 URL、编码或二进制设置。

2. 'resetViewer' 方法：**
 - 在指定的索引处重置查看器。如果未提供参数，则使用现有参数，并根据加载的数据更新加载的图像、编码图像、二进制图像、曲面、编码曲面和文件。

3. **'removeImage' 方法：**
 - 删除指定索引处的图像叠加。如果尝试删除基础映像，它会记录错误。

4. **'hideImage' 方法：**
 - 在检视器中隐藏指定索引处的图像。

5. **'showImage' 方法：**
 - 在查看器中以指定的索引显示图像。

6. **'addImage' 方法：**
 - 使用给定的图像引用和参数将图像添加到指定索引处的查看器。它根据提供的参数处理不同类型的图像加载。

7. 'findParameters' 方法：**
 - 查找给定容器 HTML 的参数。它在容器或查看器 HTML 中查找“data-params”属性。如果找到，它将尝试从全局范围检索参数或直接使用提供的对象。

这些方法有助于对医学图像查看器进行动态操作和控制，从而允许执行重新启动、重置、删除、隐藏、显示和添加图像等操作。此外，“findParameters”方法有助于检索给定容器的参数。*/
Medical_Image_Viewer.Container.restartViewer = function (index, refs, forceUrl, forceEncode, forceBinary) {
    Medical_Image_ViewerContainers[index].viewer.restart(refs, forceUrl, forceEncode, forceBinary);
};



Medical_Image_Viewer.Container.resetViewer = function (index, params) {
    if (!params) {
        params = Medical_Image_ViewerContainers[index].params;

        if (params.loadedImages) {
            params.images = params.loadedImages;
        }

        if (params.loadedEncodedImages) {
            params.encodedImages = params.loadedEncodedImages;
        }

        if (params.loadedBinaryImages) {
            params.binaryImages = params.loadedBinaryImages;
        }


        if (params.loadedSurfaces) {
            params.surfaces = params.loadedSurfaces;
        }

        if (params.loadedEncodedSurfaces) {
            params.encodedSurfaces = params.loadedEncodedSurfaces;
        }

        if (params.loadedFiles) {
            params.files = params.loadedFiles;
        }
    }

    Medical_Image_ViewerContainers[index].viewer.resetViewer();
    Medical_Image_ViewerContainers[index].toolbar.updateImageButtons();
    Medical_Image_ViewerContainers[index].reset();
    Medical_Image_ViewerContainers[index].params = params;
    Medical_Image_ViewerContainers[index].readGlobalParams();
    Medical_Image_ViewerContainers[index].rebuildContainer(params, index);
    Medical_Image_ViewerContainers[index].viewer.processParams(params);
};



Medical_Image_Viewer.Container.removeImage = function (index, imageIndex) {
    if (imageIndex < 1) {
        console.log("Cannot remove the base image.  Try Medical_Image_Viewer.Container.resetViewer() instead.");
    }

    Medical_Image_ViewerContainers[index].viewer.removeOverlay(imageIndex);
};



Medical_Image_Viewer.Container.hideImage = function (index, imageIndex) {
    Medical_Image_ViewerContainers[index].viewer.screenVolumes[imageIndex].hidden = true;
    Medical_Image_ViewerContainers[index].viewer.drawViewer(true, false);
};



Medical_Image_Viewer.Container.showImage = function (index, imageIndex) {
    Medical_Image_ViewerContainers[index].viewer.screenVolumes[imageIndex].hidden = false;
    Medical_Image_ViewerContainers[index].viewer.drawViewer(true, false);
};



Medical_Image_Viewer.Container.addImage = function (index, imageRef, imageParams) {
    var imageRefs;

    if (imageParams) {
        Medical_Image_ViewerContainers[index].params = $.extend({}, Medical_Image_ViewerContainers[index].params, imageParams);
    }

    if (!(imageRef instanceof Array)) {
        imageRefs = [];
        imageRefs[0] = imageRef;
    } else {
        imageRefs = imageRef;
    }

    if (Medical_Image_ViewerContainers[index].params.images) {
        Medical_Image_ViewerContainers[index].viewer.loadImage(imageRefs, true, false, false);
    } else if(Medical_Image_ViewerContainers[index].params.binaryImages) {
        Medical_Image_ViewerContainers[index].viewer.loadImage(imageRefs, false, false, true);
    } else if (Medical_Image_ViewerContainers[index].params.encodedImages) {
        Medical_Image_ViewerContainers[index].viewer.loadImage(imageRefs, false, true, false);
    }
};



Medical_Image_Viewer.Container.findParameters = function (containerHTML) {
    var viewerHTML, paramsName, loadedParams = null;

    paramsName = containerHTML.data("params");

    if (!paramsName) {
        viewerHTML = containerHTML.find("." + Medical_Image_Viewer_VIEWER_CSS);

        if (viewerHTML) {
            paramsName = viewerHTML.data("params");
        }
    }

    /*
     if (paramsName) {
     loadedParams = window[paramsName];
     }
     */

    if (paramsName) {
        if (typeof paramsName === 'object') {
            loadedParams = paramsName;
        }
        else if (window[paramsName]) {
            loadedParams = window[paramsName];
        }
    }

    if (loadedParams) {
        Medical_Image_Viewer.utilities.UrlUtils.getQueryParams(loadedParams);
    }

    return loadedParams;
};

/*
以下是“Medical_Image_Viewer.Container”原型中的其他方法，负责填充、构建和重建医学图像查看器容器：

1. 'fillContainerHTML' 方法：**
 - 填充医学图像查看器容器的 HTML 结构。如果它是默认容器，则可确保工具栏、查看器和显示元素的存在。如果是自定义容器，则会分配 ID，添加工具栏、查看器和显示元素，并根据提供的参数追加控制按钮。

2. 'buildContainer' 方法：**
 - 构建医学图像查看器容器。它创建一个新的容器实例，设置其索引，删除任何检查 JavaScript 类，并使用参数初始化容器。然后，它构建查看器、显示、工具栏，并设置拖放功能。最后，它根据提供的参数加载图像。

3. 'rebuildContainer' 方法：**
 - 使用指定的参数和索引重建医学图像查看器容器。它清除容器的 HTML，重新填充和重新生成它，并确保全屏单个非嵌套查看器的正确样式。

这些方法有助于医学图像查看器容器的初始化、构建和重建，根据参数和容器类型处理不同的情况。*/

Medical_Image_Viewer.Container.fillContainerHTML = function (containerHTML, isDefault, params, replaceIndex) {
    var toolbarHTML, viewerHTML, displayHTML, index;

    if (isDefault) {
        toolbarHTML = containerHTML.find("#" + Medical_Image_Viewer_DEFAULT_TOOLBAR_ID);
        viewerHTML = containerHTML.find("#" + Medical_Image_Viewer_DEFAULT_VIEWER_ID);
        displayHTML = containerHTML.find("#" + Medical_Image_Viewer_DEFAULT_DISPLAY_ID);

        if (toolbarHTML) {
            toolbarHTML.addClass(Medical_Image_Viewer_TOOLBAR_CSS);
        } else {
            containerHTML.prepend("<div class='" + Medical_Image_Viewer_TOOLBAR_CSS + "' id='" +
                Medical_Image_Viewer_DEFAULT_TOOLBAR_ID + "'></div>");
        }

        if (viewerHTML) {
            viewerHTML.addClass(Medical_Image_Viewer_VIEWER_CSS);
        } else {
            $("<div class='" + Medical_Image_Viewer_VIEWER_CSS + "' id='" +
                Medical_Image_Viewer_DEFAULT_VIEWER_ID + "'></div>").insertAfter($("#" + Medical_Image_Viewer_DEFAULT_TOOLBAR_ID));
        }

        if (displayHTML) {
            displayHTML.addClass(Medical_Image_Viewer_DISPLAY_CSS);
        } else {
            $("<div class='" + Medical_Image_Viewer_DISPLAY_CSS + "' id='" +
                Medical_Image_Viewer_DEFAULT_DISPLAY_ID + "'></div>").insertAfter($("#" + Medical_Image_Viewer_DEFAULT_VIEWER_ID));
        }

        console.log("This method of adding a Medical_Image_Viewer container is deprecated.  " +
            "Try simply <div class='Medical_Image_Viewer' data-params='params'></div> instead...");
    } else {
        if (replaceIndex !== undefined) {
            index = replaceIndex;
        } else {
            index = Medical_Image_ViewerContainers.length;
        }

        containerHTML.attr("id", Medical_Image_Viewer_DEFAULT_CONTAINER_ID + index);

        if (!params || (params.kioskMode === undefined) || !params.kioskMode) {
            containerHTML.append("<div id='" + (Medical_Image_Viewer_DEFAULT_TOOLBAR_ID + index) +
            "' class='" + Medical_Image_Viewer_TOOLBAR_CSS + "'></div>");
        }

        containerHTML.append("<div id='" + (Medical_Image_Viewer_DEFAULT_VIEWER_ID + index) +
            "' class='" + Medical_Image_Viewer_VIEWER_CSS + "'></div>");
        containerHTML.append("<div id='" + (Medical_Image_Viewer_DEFAULT_DISPLAY_ID + index) +
            "' class='" + Medical_Image_Viewer_DISPLAY_CSS + "'></div>");

        if (params && params.showControlBar && ((params.showControls === undefined) || params.showControls)) {
            containerHTML.append(
                "<div id='" + Medical_Image_Viewer_KIOSK_CONTROLS_CSS + index + "' class='" + Medical_Image_Viewer_KIOSK_CONTROLS_CSS + "'>" +
                "<div id='" + (Medical_Image_Viewer_DEFAULT_SLIDER_ID + index) + "main" + "' class='" + Medical_Image_Viewer_SLIDER_CSS + " " + Medical_Image_Viewer_CONTROL_MAIN_SLIDER + "'>" +
                "<span class='" + Medical_Image_Viewer_CONTROL_BAR_LABELS_CSS+ "'>Slice: </span>" + " <button type='button' class='" + Medical_Image_Viewer_CONTROL_INCREMENT_BUTTON_CSS + "'>+</button>" + " <button type='button' class='" + Medical_Image_Viewer_CONTROL_INCREMENT_BUTTON_CSS + "'>-</button> "  +
                "</div>" +

                "<div id='" + (Medical_Image_Viewer_DEFAULT_SLIDER_ID + index) + "axial" + "' class='" + Medical_Image_Viewer_SLIDER_CSS + " " + Medical_Image_Viewer_CONTROL_DIRECTION_SLIDER + "'>" +
                "<span class='" + Medical_Image_Viewer_CONTROL_BAR_LABELS_CSS+ "'>Axial: </span>" + " <button type='button' class='" + Medical_Image_Viewer_CONTROL_INCREMENT_BUTTON_CSS + "'>+</button>" + " <button type='button' class='" + Medical_Image_Viewer_CONTROL_INCREMENT_BUTTON_CSS + "'>-</button> " +
                "</div>" +

                "<div id='" + (Medical_Image_Viewer_DEFAULT_SLIDER_ID + index) + "coronal" + "' class='" + Medical_Image_Viewer_SLIDER_CSS + " " + Medical_Image_Viewer_CONTROL_DIRECTION_SLIDER + "'>" +
                "<span class='" + Medical_Image_Viewer_CONTROL_BAR_LABELS_CSS+ "'>Coronal: </span>" + " <button type='button' class='" + Medical_Image_Viewer_CONTROL_INCREMENT_BUTTON_CSS + "'>+</button>"+ " <button type='button' class='" + Medical_Image_Viewer_CONTROL_INCREMENT_BUTTON_CSS + "'>-</button> "  +
                "</div>" +

                "<div id='" + (Medical_Image_Viewer_DEFAULT_SLIDER_ID + index) + "sagittal" + "' class='" + Medical_Image_Viewer_SLIDER_CSS + " " + Medical_Image_Viewer_CONTROL_DIRECTION_SLIDER + "'>" +
                "<span class='" + Medical_Image_Viewer_CONTROL_BAR_LABELS_CSS+ "'>Sagittal: </span>" + " <button type='button' class='" + Medical_Image_Viewer_CONTROL_INCREMENT_BUTTON_CSS + "'>+</button>"+ " <button type='button' class='" + Medical_Image_Viewer_CONTROL_INCREMENT_BUTTON_CSS + "'>-</button> "  +
                "</div>" +

                "<div id='" + (Medical_Image_Viewer_DEFAULT_SLIDER_ID + index) + "series" + "' class='" + Medical_Image_Viewer_SLIDER_CSS + " " + Medical_Image_Viewer_CONTROL_DIRECTION_SLIDER + "'>" +
                "<span class='" + Medical_Image_Viewer_CONTROL_BAR_LABELS_CSS+ "'>Series: </span>" + " <button type='button' class='" + Medical_Image_Viewer_CONTROL_INCREMENT_BUTTON_CSS + "'>&lt;</button>"+ " <button type='button' class='" + Medical_Image_Viewer_CONTROL_INCREMENT_BUTTON_CSS + "'>&gt;</button> "  +
                "</div>" +
                "&nbsp;&nbsp;&nbsp;" +
                "<button type='button' " + ((params.kioskMode && ((params.showImageButtons === undefined) || params.showImageButtons)) ? "" : "style='float:right;margin-left:5px;' ") + "class='" + Medical_Image_Viewer_CONTROL_SWAP_BUTTON_CSS + "'>交换视图</button> " +
                "<button type='button' " + ((params.kioskMode && ((params.showImageButtons === undefined) || params.showImageButtons)) ? "" : "style='float:right;margin-left:5px;' ") + "class='" + Medical_Image_Viewer_CONTROL_GOTO_CENTER_BUTTON_CSS + "'>前往中心</button> " +
                "<button type='button' " + ((params.kioskMode && ((params.showImageButtons === undefined) || params.showImageButtons)) ? "" : "style='float:right;margin-left:5px;' ") + "class='" + Medical_Image_Viewer_CONTROL_GOTO_ORIGIN_BUTTON_CSS + "'>前往原点</button> " +
                "</div>");

            $("." + Medical_Image_Viewer_CONTROL_INCREMENT_BUTTON_CSS).prop('disabled', true);
            $("." + Medical_Image_Viewer_CONTROL_SWAP_BUTTON_CSS).prop('disabled', true);
            $("." + Medical_Image_Viewer_CONTROL_GOTO_CENTER_BUTTON_CSS).prop('disabled', true);
            $("." + Medical_Image_Viewer_CONTROL_GOTO_ORIGIN_BUTTON_CSS).prop('disabled', true);
        } else if (params && ((params.showControls === undefined ) || params.showControls)) {
            containerHTML.append("<button type='button' id='"+ (Medical_Image_Viewer_CONTROL_MAIN_INCREMENT_BUTTON_CSS + index) + "' class='" + Medical_Image_Viewer_CONTROL_MAIN_INCREMENT_BUTTON_CSS + "'>+</button> ");
            containerHTML.append("<button type='button' id='"+ (Medical_Image_Viewer_CONTROL_MAIN_DECREMENT_BUTTON_CSS + index) + "' class='" + Medical_Image_Viewer_CONTROL_MAIN_DECREMENT_BUTTON_CSS + "'>-</button> ");
            containerHTML.append("<button type='button' id='"+ (Medical_Image_Viewer_CONTROL_MAIN_SWAP_BUTTON_CSS + index) + "' class='" + Medical_Image_Viewer_CONTROL_MAIN_SWAP_BUTTON_CSS + "'>交换视图</button> ");
            containerHTML.append("<button type='button' id='"+ (Medical_Image_Viewer_CONTROL_MAIN_GOTO_CENTER_BUTTON_CSS + index) + "' class='" + Medical_Image_Viewer_CONTROL_MAIN_GOTO_CENTER_BUTTON_CSS + "'>前往中心</button> ");
            containerHTML.append("<button type='button' id='"+ (Medical_Image_Viewer_CONTROL_MAIN_GOTO_ORIGIN_BUTTON_CSS + index) + "' class='" + Medical_Image_Viewer_CONTROL_MAIN_GOTO_ORIGIN_BUTTON_CSS + "'>前往原点</button> ");

            $("#" + Medical_Image_Viewer_CONTROL_MAIN_INCREMENT_BUTTON_CSS + index).css({display: "none"});
            $("#" + Medical_Image_Viewer_CONTROL_MAIN_DECREMENT_BUTTON_CSS + index).css({display: "none"});
            $("#" + Medical_Image_Viewer_CONTROL_MAIN_SWAP_BUTTON_CSS + index).css({display: "none"});
            $("#" + Medical_Image_Viewer_CONTROL_MAIN_GOTO_CENTER_BUTTON_CSS + index).css({display: "none"});
            $("#" + Medical_Image_Viewer_CONTROL_MAIN_GOTO_ORIGIN_BUTTON_CSS + index).css({display: "none"});
        }
    }

    return viewerHTML;
};



Medical_Image_Viewer.Container.buildContainer = function (containerHTML, params, replaceIndex) {

    var container, message, viewerHtml, loadUrl, index, imageRefs = null;

    message = Medical_Image_Viewer.utilities.PlatformUtils.checkForBrowserCompatibility();
    viewerHtml = containerHTML.find("." + Medical_Image_Viewer_VIEWER_CSS);

    if (message !== null) {
        Medical_Image_Viewer.Container.removeCheckForJSClasses(containerHTML, viewerHtml);
        containerHTML.addClass(Medical_Image_Viewer_UTILS_UNSUPPORTED_CSS);
        viewerHtml.addClass(Medical_Image_Viewer_UTILS_UNSUPPORTED_MESSAGE_CSS);
        viewerHtml.html(message);
    } else {
        if (replaceIndex !== undefined) {
            index = replaceIndex;
        } else {
            index = Medical_Image_ViewerContainers.length;
        }

        container = new Medical_Image_Viewer.Container(containerHTML);
        container.containerIndex = index;
        container.preferences = new Medical_Image_Viewer.viewer.Preferences();
        Medical_Image_Viewer.Container.removeCheckForJSClasses(containerHTML, viewerHtml);

        if (params) {
            container.params = $.extend(container.params, params);
        }

        container.nestedViewer = (containerHTML.parent()[0].tagName.toUpperCase() !== 'BODY');
        container.readGlobalParams();

        if (container.isDesktopMode()) {
            container.preferences.readPreferences();
        }

        container.buildViewer(container.params);
        container.buildDisplay();

        if (container.showControlBar) {
            container.buildSliderControl();
        }

        container.buildToolbar();

        container.setUpDnD();

        loadUrl = viewerHtml.data("load-url");

        if (loadUrl) {
            imageRefs = loadUrl;
            if (!(imageRefs instanceof Array)) {
                imageRefs = [];
                imageRefs[0] = loadUrl;
            }

            container.viewer.loadImage(imageRefs, true, false, false);
        } else if (container.params.images) {
            imageRefs = container.params.images[0];
            if (!(imageRefs instanceof Array)) {
                imageRefs = [];
                imageRefs[0] = container.params.images[0];
            }

            container.viewer.loadImage(imageRefs, true, false, false);
        } else if (container.params.encodedImages) {
            imageRefs = container.params.encodedImages[0];
            if (!(imageRefs instanceof Array)) {
                imageRefs = [];
                imageRefs[0] = container.params.encodedImages[0];
            }

            container.viewer.loadImage(imageRefs, false, true, false);
        } else if(container.params.binaryImages) {
            imageRefs = container.params.binaryImages[0];
            container.viewer.loadImage(imageRefs, false, false, true);
        } else if (container.params.files) {
            imageRefs = container.params.files[0];
            if (!(imageRefs instanceof Array)) {
                imageRefs = [];
                imageRefs[0] = container.params.files[0];
            }

            container.viewer.loadImage(imageRefs, false, false, false);
        } else {
            container.viewer.finishedLoading();
        }

        container.resizeViewerComponents(false);

        if (!container.nestedViewer) {
            containerHTML.parent().height("100%");
            containerHTML.parent().width("100%");
        }

        Medical_Image_ViewerContainers[index] = container;

        Medical_Image_Viewer.Container.showLicense(container, params);
    }
};



Medical_Image_Viewer.Container.prototype.rebuildContainer = function (params, index) {
    this.containerHtml.empty();
    Medical_Image_Viewer.Container.fillContainerHTML(this.containerHtml, false, params, index);
    Medical_Image_Viewer.Container.buildContainer(this.containerHtml, params, index);

    if ((Medical_Image_ViewerContainers.length === 1) && !Medical_Image_ViewerContainers[0].nestedViewer) {
        $("html").addClass(Medical_Image_Viewer_CONTAINER_FULLSCREEN);
        $("body").addClass(Medical_Image_Viewer_CONTAINER_FULLSCREEN);
        Medical_Image_Viewer.Container.setToFullPage();
    }
};

/*
以下是“Medical_Image_Viewer.Container”原型中的其他方法，负责初始化、构建和调整医学图像查看器的大小：

1. **静态方法：**
 - **'buildAllContainers' 方法：**
 - 初始化并构建所有医学图像查看器容器。它找到默认容器并首先构建它，然后遍历页面上的其他容器，填充 HTML 并构建每个容器。

- **'startMedical_Image_Viewer'方法：**
 - 启动医学图像查看器。它设置 DICOM 支持，生成所有容器，并滚动到窗口顶部。

- **'resizeMedical_Image_Viewer'方法：**
 - 处理调整医学图像查看器的大小。它更新正交状态并相应地调整查看器组件的大小。对于单个非嵌套查看器，它将滚动到窗口顶部。

- **'addViewer' 方法：**
 - 将新的查看器添加到指定的父元素。它创建一个新容器，填充 HTML，然后生成容器。

- **'removeCheckForJSClasses' 方法：**
 - 从查看器和容器 HTML 元素中删除检查 JavaScript 类，包括旧方法和新方法。

这些方法有助于医学图像查看器容器的初始化、构建和调整大小，从而确保正确的设置和功能。*/

Medical_Image_Viewer.Container.buildAllContainers = function () {
    var defaultContainer, params;

    defaultContainer = $("#" + Medical_Image_Viewer_DEFAULT_CONTAINER_ID);

    if (defaultContainer.length > 0) {
        Medical_Image_Viewer.Container.fillContainerHTML(defaultContainer, true);
        params = Medical_Image_Viewer.Container.findParameters(defaultContainer);
        Medical_Image_Viewer.Container.buildContainer(defaultContainer, params);
    } else {
        $("." + Medical_Image_Viewer_CONTAINER_CLASS_NAME).each(function () {
            params = Medical_Image_Viewer.Container.findParameters($(this));

            if (params === null) {
                params = [];
            }

            if (params.fullScreen === true) {
                params.fullScreenPadding = false;
                params.kioskMode = true;
                params.showControlBar = false;
                $('body').css({"background-color":"black"});
            }

            Medical_Image_Viewer.Container.fillContainerHTML($(this), false, params);
            Medical_Image_Viewer.Container.buildContainer($(this), params);
        });
    }

    if ((Medical_Image_ViewerContainers.length === 1) && !Medical_Image_ViewerContainers[0].nestedViewer) {
        $("html").addClass(Medical_Image_Viewer_CONTAINER_FULLSCREEN);
        $("body").addClass(Medical_Image_Viewer_CONTAINER_FULLSCREEN);
        Medical_Image_Viewer.Container.setToFullPage();

        Medical_Image_ViewerContainers[0].resizeViewerComponents(true);
    }
};



Medical_Image_Viewer.Container.startMedical_Image_Viewer = function () {
    setTimeout(function () {  // setTimeout necessary in Chrome
        window.scrollTo(0, 0);
    }, 0);

    Medical_Image_Viewer.Container.DICOM_SUPPORT = (typeof(daikon) !== "undefined");

    Medical_Image_Viewer.Container.buildAllContainers();
};



Medical_Image_Viewer.Container.resizeMedical_Image_Viewer = function (ev, force) {
    var ctr;

    Medical_Image_Viewer.Container.updateOrthogonalState();

    if ((Medical_Image_ViewerContainers.length === 1) && !Medical_Image_ViewerContainers[0].nestedViewer) {
        if (!Medical_Image_Viewer.utilities.PlatformUtils.smallScreen || force) {
            Medical_Image_ViewerContainers[0].resizeViewerComponents(true);
        }
    } else {
        for (ctr = 0; ctr < Medical_Image_ViewerContainers.length; ctr += 1) {
            Medical_Image_ViewerContainers[ctr].resizeViewerComponents(true);
        }
    }

    setTimeout(function () {  // setTimeout necessary in Chrome
        window.scrollTo(0, 0);
    }, 0);
};



Medical_Image_Viewer.Container.addViewer = function (parentName, params, callback) {
    var container, parent;

    parent = $("#" + parentName);
    container = $('<div class="Medical_Image_Viewer"></div>');

    parent.html(container);

    // remove parent click handler
    parent[0].onclick = '';
    parent.off("click");

    Medical_Image_Viewer.Container.fillContainerHTML(container, false, params);
    Medical_Image_Viewer.Container.buildContainer(container, params);

    if (callback) {
        callback();
    }
};



Medical_Image_Viewer.Container.removeCheckForJSClasses = function (containerHtml, viewerHtml) {
    // old way, here for backwards compatibility
    viewerHtml.removeClass(Medical_Image_Viewer_CONTAINER_CLASS_NAME);
    viewerHtml.removeClass(Medical_Image_Viewer_UTILS_CHECKFORJS_CSS);

    // new way
    containerHtml.removeClass(Medical_Image_Viewer_CONTAINER_CLASS_NAME);
    containerHtml.removeClass(Medical_Image_Viewer_UTILS_CHECKFORJS_CSS);
};

/*
以下是“Medical_Image_Viewer.Container”原型中的更多方法，涵盖各种功能、许可证管理和查看器配置：

1. **静态方法：**
 - **'setToFullPage' 方法：**
 - 在文档正文上设置 CSS 属性，使查看器占据整个页面。它调整边距、填充、溢出和尺寸。

- **'getLicense'， 'getKeyboardReference'， 'getMouseReference' 方法：**
 - 提供对许可证文本、键盘参考和鼠标参考信息的访问。

- **'setLicenseRead' 和 'isLicenseRead' 方法：**
 - 通过设置和检查cookie来管理许可证是否已被读取的状态。

- **'showLicense' 方法：**
 - 如果在参数中指定且尚未读取许可证，则显示许可证对话框。

- **'updateOrthogonalState' 和 'reorientMedical_Image_Viewer' 方法：**
 - 根据屏幕尺寸和查看器设置处理更新正交状态和重新定向查看器。

2. **原型制作方法：**
 - **'resetComponents' 方法：**
 - 重置容器 HTML 的各种 CSS 属性，使其适应不同的大小。

- **'hasSurface' 方法：**
 - 检查查看器是否有曲面。

- **'getViewerDimensions' 方法：**
 - 根据父宽度、正交设置、可折叠状态和其他因素计算并返回查看器的尺寸。

这些方法有助于医学图像查看器的整体功能、外观和配置，处理许可证管理、调整大小和适应不同查看场景等任务。*/

Medical_Image_Viewer.Container.setToFullPage = function () {
    document.body.style.marginTop = 0;
    document.body.style.marginBottom = 0;
    document.body.style.marginLeft = 'auto';
    document.body.style.marginRight = 'auto';
    document.body.style.padding = 0;
    document.body.style.overflow = 'hidden';
    document.body.style.width = "100%";
    document.body.style.height = "100%";
};



Medical_Image_Viewer.Container.getLicense = function () {
    return Medical_Image_Viewer.Container.LICENSE_TEXT;
};



Medical_Image_Viewer.Container.getKeyboardReference = function () {
    return Medical_Image_Viewer.Container.KEYBOARD_REF_TEXT;
};



Medical_Image_Viewer.Container.getMouseReference = function () {
    return Medical_Image_Viewer.Container.MOUSE_REF_TEXT;
};



Medical_Image_Viewer.Container.setLicenseRead = function () {
    Medical_Image_Viewer.utilities.UrlUtils.createCookie(Medical_Image_Viewer.viewer.Preferences.COOKIE_PREFIX + "eula", "Yes",
        Medical_Image_Viewer.viewer.Preferences.COOKIE_EXPIRY_DAYS);
};



Medical_Image_Viewer.Container.isLicenseRead = function () {
    var value = Medical_Image_Viewer.utilities.UrlUtils.readCookie(Medical_Image_Viewer.viewer.Preferences.COOKIE_PREFIX + "eula");
    return (value && (value === 'Yes'));
};



Medical_Image_Viewer.Container.showLicense = function (container, params) {
    var showEula = (params && params.showEULA !== undefined) && params.showEULA;

    if (showEula && !Medical_Image_Viewer.Container.isLicenseRead()) {
        var dialog = new Medical_Image_Viewer.ui.Dialog(container, "License", Medical_Image_Viewer.ui.Toolbar.LICENSE_DATA,
            Medical_Image_Viewer.Container, null, Medical_Image_Viewer.Container.setLicenseRead, null, true);
        dialog.showDialog();
    }
};



Medical_Image_Viewer.Container.updateOrthogonalState = function () {
    var ctr;

    for (ctr = 0; ctr < Medical_Image_ViewerContainers.length; ctr += 1) {
        if (Medical_Image_ViewerContainers[ctr].orthogonal &&
            ((Medical_Image_Viewer.utilities.PlatformUtils.mobile || Medical_Image_ViewerContainers[ctr].orthogonalDynamic))) {
            if ($(window).height() > $(window).width()) {
                Medical_Image_ViewerContainers[ctr].orthogonalTall = true;
            } else {
                Medical_Image_ViewerContainers[ctr].orthogonalTall = false;
            }
        }
    }
};



Medical_Image_Viewer.Container.reorientMedical_Image_Viewer = function () {
    var ctr;

    for (ctr = 0; ctr < Medical_Image_ViewerContainers.length; ctr += 1) {
        Medical_Image_ViewerContainers[ctr].toolbar.closeAllMenus();
    }

    Medical_Image_Viewer.Container.updateOrthogonalState();
    Medical_Image_Viewer.Container.resizeMedical_Image_Viewer(null, true);
};



/*** Prototype Methods ***/

Medical_Image_Viewer.Container.prototype.resetComponents = function () {
    this.containerHtml.css({height: "auto"});
    this.containerHtml.css({width: "auto"});
    this.containerHtml.css({margin: "auto"});
    $('head').append("<style>div#Medical_Image_ViewerViewer:before{ content:'' }</style>");
};



Medical_Image_Viewer.Container.prototype.hasSurface = function () {
    return (this.viewer && (this.viewer.surfaces.length > 0));
};




Medical_Image_Viewer.Container.prototype.getViewerDimensions = function () {
    var parentWidth, height, width, ratio, maxHeight, maxWidth;

    parentWidth = this.containerHtml.parent().width() - (this.fullScreenPadding ? (2 * Medical_Image_Viewer_PADDING) : 0);
    ratio = (this.orthogonal ? (this.hasSurface() ? 1.333 : 1.5) : 1);

    if (this.orthogonalTall || !this.orthogonal) {
        height = (this.collapsable ? window.innerHeight : this.containerHtml.parent().height()) - (Medical_Image_Viewer.viewer.Display.SIZE + (this.kioskMode ? 0 : (Medical_Image_Viewer.ui.Toolbar.SIZE +
            Medical_Image_Viewer_SPACING)) + Medical_Image_Viewer_SPACING + (this.fullScreenPadding && !this.nestedViewer ? (2 * Medical_Image_Viewer_CONTAINER_PADDING_TOP) : 0)) -
            (this.showControlBar ? 2*Medical_Image_Viewer.ui.Toolbar.SIZE : 0);

        width = Medical_Image_ViewerRoundFast(height / ratio);
    } else {

        width = parentWidth;
        height = Medical_Image_ViewerRoundFast(width / ratio);
    }

    if (!this.nestedViewer || this.collapsable) {

        if (this.orthogonalTall) {

            maxWidth = window.innerWidth - (this.fullScreenPadding ? (2 * Medical_Image_Viewer_PADDING) : 0);
            if (width > maxWidth) {
                width = maxWidth;
                height = Medical_Image_ViewerRoundFast(width * ratio);
            }
        } else {

            maxHeight = window.innerHeight - (Medical_Image_Viewer.viewer.Display.SIZE + (this.kioskMode ? 0 : (Medical_Image_Viewer.ui.Toolbar.SIZE +
                Medical_Image_Viewer_SPACING)) + Medical_Image_Viewer_SPACING + (this.fullScreenPadding ? (2 * Medical_Image_Viewer_CONTAINER_PADDING_TOP) : 0)) -
                (this.showControlBar ? 2*Medical_Image_Viewer.ui.Toolbar.SIZE : 0);
            if (height > maxHeight) {
                height = maxHeight;
                width = Medical_Image_ViewerRoundFast(height * ratio);
            }

        }
    }

    return [width, height];
};

/*
以下是“Medical_Image_Viewer.Container”原型中的更多方法，用于处理查看器大小调整、配置和样式：

1. 'getViewerPadding' 方法：**
 - 根据父宽度、查看器尺寸以及是否启用全屏填充来计算并返回查看器的填充。

2. 'readGlobalParams' 方法：**
 - 从“params”对象中读取全局参数，并在容器实例中设置相应的属性。
 - 参数包括 kiosk 模式、组合参数数据、加载完整性、控制可见性、全屏填充、正交视图、曲面参数、滚动、同步和上下文管理器。

3. **'reset'方法：**
 - 将容器实例的各种属性重置为默认值。
 - 属性包括加载索引、查看器模式、正交设置、展台模式、控件可见性、全屏填充、组合参数化数据和标尺可见性。

4. 'resizeViewerComponents' 方法：**
 - 调整查看器的各种组件的大小，包括工具栏、查看器、显示和滑块控件。
 - 根据查看器的尺寸调整可见性和布局。
 - 考虑控制可见性设置、系列信息和查看器初始化状态。

调整大小逻辑包括根据查看器的大小和配置设置调整不同 UI 元素的尺寸、填充和可见性。

这些方法通过处理基于各种参数和条件的大小调整、配置和样式，有助于医学图像查看器的动态行为和外观。*/

Medical_Image_Viewer.Container.prototype.getViewerPadding = function () {
    var parentWidth, viewerDims, padding;

    parentWidth = this.containerHtml.parent().width() - (this.fullScreenPadding ? (2 * Medical_Image_Viewer_PADDING) : 0);
    viewerDims = this.getViewerDimensions();
    padding = ((parentWidth - viewerDims[0]) / 2);

    return padding;
};



Medical_Image_Viewer.Container.prototype.readGlobalParams = function() {
    this.kioskMode = (this.params.kioskMode === true) || Medical_Image_Viewer.utilities.PlatformUtils.smallScreen;
    this.combineParametric = (this.params.combineParametric === true);

    if (this.params.loadingComplete) {
        this.loadingComplete = this.params.loadingComplete;
    }

    if (this.params.showControls !== undefined) {  // default is true
        this.showControls = this.params.showControls;
    }

    if (this.params.noNewFiles !== undefined) {  // default is false
        this.noNewFiles = this.params.noNewFiles;
    }

    if (this.params.showImageButtons !== undefined) {  // default is true
        this.showImageButtons = this.params.showImageButtons;
    }

    if (Medical_Image_Viewer.utilities.PlatformUtils.smallScreen) {
        this.showImageButtons = false;
    }

    if (this.params.fullScreenPadding !== undefined) {  // default is true
        this.fullScreenPadding = this.params.fullScreenPadding;
    }

    if (this.params.orthogonal !== undefined) {  // default is true
        this.orthogonal = this.params.orthogonal;
    }

    this.surfaceParams.showSurfacePlanes = (this.params.showSurfacePlanes === true);
    this.surfaceParams.showSurfaceCrosshairs = (this.params.showSurfaceCrosshairs === true);
    this.surfaceParams.surfaceBackground = this.params.surfaceBackground;

    this.orthogonalTall = this.orthogonal && (this.params.orthogonalTall === true);
    this.orthogonalDynamic = this.orthogonal && (this.params.orthogonalDynamic === true);

    if (this.params.allowScroll !== undefined) {  // default is true
        this.allowScroll = this.params.allowScroll;
    }

    if (Medical_Image_Viewer.utilities.PlatformUtils.mobile || this.orthogonalDynamic) {
        if (this.orthogonal) {
            if ($(window).height() > $(window).width()) {
                this.orthogonalTall = true;
            } else {
                this.orthogonalTall = false;
            }
        }
    }

    if (this.params.syncOverlaySeries !== undefined) {  // default is true
        this.syncOverlaySeries = this.params.syncOverlaySeries;
    }

    if (this.params.showControlBar !== undefined) {  // default is true
        this.showControlBar = this.showControls && this.params.showControlBar;
    }

    if (this.params.contextManager !== undefined) {
        this.contextManager = this.params.contextManager;
    }

    if (this.params.fullScreen === true) {
        this.fullScreenPadding = this.params.fullScreenPadding = false;
        this.kioskMode = this.params.kioskMode = true;
        this.showControlBar = this.params.showControlBar = false;
        $('body').css("background-color:'black'");
    }
};



Medical_Image_Viewer.Container.prototype.reset = function () {
    this.loadingImageIndex = 0;
    this.loadingSurfaceIndex = 0;
    this.nestedViewer = false;
    this.collapsable = false;
    this.orthogonal = true;
    this.orthogonalTall = false;
    this.orthogonalDynamic = false;
    this.kioskMode = false;
    this.noNewFiles = false;
    this.showControls = true;
    this.showControlBar = false;
    this.fullScreenPadding = true;
    this.combineParametric = false;
    this.showRuler = false;
};



Medical_Image_Viewer.Container.prototype.resizeViewerComponents = function (resize) {
    var dims, padding, diff = 0;

    this.toolbar.closeAllMenus();

    dims = this.getViewerDimensions();
    padding = this.getViewerPadding();

    this.toolbarHtml.css({width: dims[0] + "px"});
    this.toolbarHtml.css({height: Medical_Image_Viewer.ui.Toolbar.SIZE + "px"});
    this.toolbarHtml.css({paddingLeft: padding + "px"});
    this.toolbarHtml.css({paddingBottom: Medical_Image_Viewer_SPACING + "px"});

    this.viewerHtml.css({width: dims[0] + "px"});
    this.viewerHtml.css({height: dims[1] + "px"});
    this.viewerHtml.css({paddingLeft: padding + "px"});

    if (resize) {
        this.viewer.resizeViewer(dims);
    }

    this.displayHtml.css({height: Medical_Image_Viewer.viewer.Display.SIZE + "px"});
    this.displayHtml.css({paddingLeft: padding + "px"});
    this.displayHtml.css({paddingTop: Medical_Image_Viewer_SPACING + "px"});
    this.display.canvas.width = dims[0];

    if (this.showControls && this.showControlBar) {
        this.sliderControlHtml.css({width: dims[0] + "px"});
        this.sliderControlHtml.css({height: Medical_Image_Viewer.viewer.Display.SIZE + "px"});

        if (this.kioskMode) {
            diff += 0;
        } else {
            diff += -50;
        }

        if (this.viewer.hasSeries) {
            diff += 200;
        } else {
            diff += 0;
        }

        if (dims[0] < (775 + diff)) {
            $("." + Medical_Image_Viewer_CONTROL_GOTO_CENTER_BUTTON_CSS).css({display: "none"});
            $("." + Medical_Image_Viewer_CONTROL_GOTO_ORIGIN_BUTTON_CSS).css({display: "none"});
        } else {
            $("." + Medical_Image_Viewer_CONTROL_GOTO_CENTER_BUTTON_CSS).css({display: "inline"});
            $("." + Medical_Image_Viewer_CONTROL_GOTO_ORIGIN_BUTTON_CSS).css({display: "inline"});
        }

        if (dims[0] < (600 + diff)) {
            $("." + Medical_Image_Viewer_CONTROL_DIRECTION_SLIDER).css({display: "none"});
            $("." + Medical_Image_Viewer_CONTROL_MAIN_SLIDER).css({display: "inline"});
        } else {
            $("." + Medical_Image_Viewer_CONTROL_DIRECTION_SLIDER).css({display: "inline"});
            $("." + Medical_Image_Viewer_CONTROL_MAIN_SLIDER).css({display: "none"});
        }

        if (this.viewer.hasSeries && (dims[0] < (450 + diff))) {
            $("." + Medical_Image_Viewer_CONTROL_MAIN_SLIDER).css({display: "none"});
        }

        if (dims[0] < 200) {
            $("." + Medical_Image_Viewer_CONTROL_SWAP_BUTTON_CSS).css({display: "none"});
        } else {
            $("." + Medical_Image_Viewer_CONTROL_SWAP_BUTTON_CSS).css({display: "inline"});
        }

        if (this.viewer.hasSeries) {
            $("." + Medical_Image_Viewer_CONTROL_DIRECTION_SLIDER).eq(3).css({display: "inline"});
        } else {
            $("." + Medical_Image_Viewer_CONTROL_DIRECTION_SLIDER).eq(3).css({display: "none"});
        }
    } else if (this.showControls && this.viewer.initialized) {
        if (dims[0] < 600) {
            $("#" + Medical_Image_Viewer_CONTROL_MAIN_GOTO_CENTER_BUTTON_CSS + this.containerIndex).css({display: "none"});
            $("#" + Medical_Image_Viewer_CONTROL_MAIN_GOTO_ORIGIN_BUTTON_CSS + this.containerIndex).css({display: "none"});
        } else if (!this.viewer.controlsHidden) {
            $("#" + Medical_Image_Viewer_CONTROL_MAIN_GOTO_CENTER_BUTTON_CSS + this.containerIndex).css({display: "inline"});
            $("#" + Medical_Image_Viewer_CONTROL_MAIN_GOTO_ORIGIN_BUTTON_CSS + this.containerIndex).css({display: "inline"});
        }
    }

    if (this.isDesktopMode()) {
        if (dims[0] < 600) {
            this.titlebarHtml.css({visibility: "hidden"});
        } else {
            this.titlebarHtml.css({visibility: "visible"});
        }
    }

    if ((!this.nestedViewer || this.collapsable) && this.fullScreenPadding) {
        this.containerHtml.css({paddingTop: Medical_Image_Viewer_CONTAINER_PADDING_TOP + "px"});
    } else {
        this.containerHtml.css({paddingTop: "0"});
    }

    if (this.fullScreenPadding) {
        this.containerHtml.css({paddingLeft: Medical_Image_Viewer_PADDING + "px"});
        this.containerHtml.css({paddingRight: Medical_Image_Viewer_PADDING + "px"});
    }

    if (this.viewer.initialized) {
        this.viewer.drawViewer(false, true);
    } else {
        this.viewer.drawEmptyViewer();
        this.display.drawEmptyDisplay();
    }

    this.titlebarHtml.css({width: dims[0] + "px", top: (0)});
};

/*
以下是“Medical_Image_Viewer.Container”原型中的更多方法，这些方法处理构建查看器、设置拖放功能和管理文件加载的各个方面：

1. 'updateViewerSize' 方法：**
 - 关闭工具栏中的所有菜单，根据当前尺寸调整查看器的大小，并更新偏移矩形。

2. **'buildViewer' 方法：**
 - 通过创建“Medical_Image_Viewer.viewer.Viewer”的新实例来初始化查看器。
 - 设置查看器的 HTML 容器和尺寸。
 - 将查看器的画布附加到查看器 HTML。

3. **'buildDisplay' 方法：**
 - 通过创建“Medical_Image_Viewer.viewer.Display”的新实例来初始化显示。
 - 设置显示器的 HTML 容器和尺寸。
 - 将显示的画布附加到显示 HTML。

4. **'buildSliderControl'方法：**
 - 设置滑块控件的 HTML 容器。

5. **'buildToolbar' 方法：**
 - 通过创建“Medical_Image_Viewer.ui.Toolbar”的新实例来初始化工具栏。
 - 设置工具栏的 HTML 容器。
 - 构建工具栏并更新图像按钮。

6. 'readFile' 方法：**
 - 读取文件条目，如果文件不是隐藏文件，则使用该文件调用回调（文件名不以“.”开头）。
 - 用于处理已删除文件的上下文。

7. **'readDir' 方法：**
 - 通过创建目录读取器来启动读取目录条目的过程。

8. 'readDirNextEntries' 方法：**
 - 继续读取目录中的条目，直到没有更多条目。
 - 为每个文件条目调用“readFile”。

9. **'setUpDnD' 方法：**
 - 为容器 HTML 设置拖放 （DnD） 事件处理程序。
 - 启动对拖放事件的操作、拖拽离开、拖拽结束和拖放事件。

10. 'addDroppedFile' 方法：**
 - 将已删除的文件添加到要处理的文件列表中。
 - 为每个删除的文件调用，并设置超时以触发进一步处理。

11. 'droppedFilesFinishedLoading' 方法：**
 - 在删除的文件完成加载时调用。
 - 确定放置的文件是曲面还是图像，并在查看器中调用适当的加载方法。

12. **'clearParams' 方法：**
 - 清除“params”属性，该属性似乎包含各种配置参数。

13. **'loadNext' 方法：**
 - 决定接下来要加载的资源类型（图像、表面或图集），并调用相应的加载方法。

14. **'hasMoreToLoad' 方法：**
 - 检查是否有更多图像、曲面或图集要加载。

15. 'hasImageToLoad' 方法：**
 - 根据“params”对象中是否存在各种图像参数来检查是否有更多图像要加载。

这些方法共同管理医学图像查看器的设置、初始化和加载过程。*/

Medical_Image_Viewer.Container.prototype.updateViewerSize = function () {
    this.toolbar.closeAllMenus();
    this.viewer.resizeViewer(this.getViewerDimensions());
    this.viewer.updateOffsetRect();
};



Medical_Image_Viewer.Container.prototype.buildViewer = function (params) {
    var dims;

    this.viewerHtml = this.containerHtml.find("." + Medical_Image_Viewer_VIEWER_CSS);
    Medical_Image_Viewer.Container.removeCheckForJSClasses(this.containerHtml, this.viewerHtml);
    this.viewerHtml.html("");  // remove noscript message
    dims = this.getViewerDimensions();
    this.viewer = new Medical_Image_Viewer.viewer.Viewer(this, dims[0], dims[1], params);
    this.viewerHtml.append($(this.viewer.canvas));
    this.preferences.viewer = this.viewer;
};



Medical_Image_Viewer.Container.prototype.buildDisplay = function () {
    var dims;

    this.displayHtml = this.containerHtml.find("." + Medical_Image_Viewer_DISPLAY_CSS);
    dims = this.getViewerDimensions();
    this.display = new Medical_Image_Viewer.viewer.Display(this, dims[0]);
    this.displayHtml.append($(this.display.canvas));
};



Medical_Image_Viewer.Container.prototype.buildSliderControl = function () {
    this.sliderControlHtml = this.containerHtml.find("." + Medical_Image_Viewer_KIOSK_CONTROLS_CSS);
};



Medical_Image_Viewer.Container.prototype.buildToolbar = function () {
    this.toolbarHtml = this.containerHtml.find("." + Medical_Image_Viewer_TOOLBAR_CSS);
    this.toolbar = new Medical_Image_Viewer.ui.Toolbar(this);
    this.toolbar.buildToolbar();
    this.toolbar.updateImageButtons();
};



Medical_Image_Viewer.Container.prototype.readFile = function(fileEntry, callback) {
    fileEntry.file(function(callback, file){
        if (callback) {
            if (file.name.charAt(0) !== '.') {
                callback(file);
            }
        }
    }.bind(this, callback));
};



Medical_Image_Viewer.Container.prototype.readDir = function(itemEntry) {
    this.readDirNextEntries(itemEntry.createReader());
};



Medical_Image_Viewer.Container.prototype.readDirNextEntries = function(dirReader) {
    var container = this;

    dirReader.readEntries(function(entries) {
        var len = entries.length,
            ctr, entry;

        if (len > 0) {
            for (ctr = 0; ctr < len; ctr += 1) {
                entry = entries[ctr];
                if (entry.isFile) {
                    container.readFile(entry, Medical_Image_Viewer.utilities.ObjectUtils.bind(container, container.addDroppedFile));
                }
            }

            container.readDirNextEntries(dirReader);
        }
    });
};



Medical_Image_Viewer.Container.prototype.setUpDnD = function () {
    var container = this;

    this.containerHtml[0].ondragover = function () {
        container.viewer.draggingOver = true;
        if (!container.viewer.initialized) {
            container.viewer.drawEmptyViewer();
        }

        return false;
    };

    this.containerHtml[0].ondragleave = function () {
        container.viewer.draggingOver = false;
        if (!container.viewer.initialized) {
            container.viewer.drawEmptyViewer();
        }
        return false;
    };

    this.containerHtml[0].ondragend = function () {
        container.viewer.draggingOver = false;
        if (!container.viewer.initialized) {
            container.viewer.drawEmptyViewer();
        }
        return false;
    };

    this.containerHtml[0].ondrop = function (evt) {
        evt.preventDefault();

        var dataTransfer = evt.dataTransfer;

        container.display.drawProgress(0.1, "Loading");

        if (dataTransfer) {
            if (dataTransfer.items && (dataTransfer.items.length > 0)) {
                var items = dataTransfer.items,
                    len = items.length,
                    ctr, entry;

                for (ctr = 0; ctr<len; ctr += 1) {
                    entry = items[ctr];

                    if (entry.getAsEntry) {
                        entry = entry.getAsEntry();
                    } else if(entry.webkitGetAsEntry) {
                        entry = entry.webkitGetAsEntry();
                    }

                    if (entry.isFile) {
                        container.readFile(entry, Medical_Image_Viewer.utilities.ObjectUtils.bind(container,
                            container.addDroppedFile));
                    } else if (entry.isDirectory) {
                        container.readDir(entry);
                    }
                }
            }

            //else if (dataTransfer.mozGetDataAt) {  // permission denied :-(
            //    console.log(dataTransfer.mozGetDataAt('application/x-moz-file', 0));
            //}

            else if (dataTransfer.files && (dataTransfer.files.length > 0)) {
                container.viewer.loadImage(evt.dataTransfer.files);
            }
        }

        return false;
    };
};



Medical_Image_Viewer.Container.prototype.addDroppedFile = function (file) {
    clearTimeout(this.dropTimeout);
    Medical_Image_ViewerDroppedFiles.push(file);
    this.dropTimeout = setTimeout(Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.droppedFilesFinishedLoading), 100);
};



Medical_Image_Viewer.Container.prototype.droppedFilesFinishedLoading = function () {
    if (Medical_Image_Viewer.surface.Surface.findSurfaceType(Medical_Image_ViewerDroppedFiles[0].name) !== Medical_Image_Viewer.surface.Surface.SURFACE_TYPE_UNKNOWN) {
        this.viewer.loadSurface(Medical_Image_ViewerDroppedFiles);
    } else {
        this.viewer.loadImage(Medical_Image_ViewerDroppedFiles);
    }

    Medical_Image_ViewerDroppedFiles = [];
};



Medical_Image_Viewer.Container.prototype.clearParams = function () {
    this.params = [];
};



Medical_Image_Viewer.Container.prototype.loadNext = function () {
    if (this.hasImageToLoad()) {
        this.loadNextImage();
    } else if (this.hasSurfaceToLoad()) {
        this.loadNextSurface();
    } else if (this.hasAtlasToLoad()) {
        this.viewer.loadAtlas();
    }
};



Medical_Image_Viewer.Container.prototype.hasMoreToLoad = function () {
    return (this.hasImageToLoad() || this.hasSurfaceToLoad() || this.hasAtlasToLoad());
};



Medical_Image_Viewer.Container.prototype.hasImageToLoad = function () {
    if (this.params.images) {
        return (this.loadingImageIndex < this.params.images.length);
    } else if(this.params.binaryImages) {
        return (this.loadingImageIndex < this.params.binaryImages.length);
    } else if (this.params.encodedImages) {
        return (this.loadingImageIndex < this.params.encodedImages.length);
    } else if (this.params.files) {
        return (this.loadingImageIndex < this.params.files.length);
    }

    return false;
};

/*
这些方法是“Medical_Image_Viewer.Container”原型的一部分，与在医学图像查看器中加载图像、表面和处理拖放功能有关。以下是每种方法的概述：

1. 'hasAtlasToLoad' 方法：**
 - 如果未加载图集 （'Medical_Image_Viewer.Container.atlas == null'） 且查看器具有已定义的图集，则返回 'true'。

2. **'hasSurfaceToLoad' 方法：**
 - 检查查看器是否可以加载曲面。
 - 如果支持 WebGL，并且定义了 'params.surfaces' 或 'params.encodedSurfaces'，并且还有 surfaces 需要加载，则返回 'true'。

3. 'loadNextSurface' 方法：**
 - 为查看器加载下一个曲面。
 - 根据是否存在 'params.surfaces' 或 'params.encodedSurfaces' 来确定是否加载 surface。
 - 加载后递增“loadingSurfaceIndex”。

4. **'loadNextImage' 方法：**
 - 为查看器加载下一张图像。
 - 根据是否存在各种图片参数（'params.images'， 'params.binaryImages'， 'params.encodedImages'， 'params.files'）来判断是否加载图片。
 - 加载后递增“loadingImageIndex”。

5. **'readyForDnD' 方法：**
 - 检查查看器是否已准备好进行拖放 （DnD）。
 - 如果查看器未处于展台模式，并且没有更多图像或表面要加载，则返回“true”。

6. 'findLoadableImage' 方法：**
 - 根据图像名称查找可加载图像。
 - 搜索“Medical_Image_ViewerLoadableImages”数组，如果找到，则返回可加载的图像对象。
 - 如果未找到图像并且存在具有给定名称的全局变量，则返回一个对象，其“encode”属性设置为该名称。

7. 'findLoadableImages' 方法：**
 - 根据名称数组查找可加载的图像。
 - 为数组中的每个名称调用“findLoadableImage”，并收集数组中可加载的图像。
 - 返回可加载图像的数组，如果没有找到，则返回“null”。

这些方法似乎侧重于管理将图像和表面加载到医学图像查看器中，处理图像数据的不同配置和来源。*/

Medical_Image_Viewer.Container.prototype.hasAtlasToLoad = function () {
    return (Medical_Image_Viewer.Container.atlas == null) && this.viewer.hasDefinedAtlas();
};


Medical_Image_Viewer.Container.prototype.hasSurfaceToLoad = function () {
    if (!Medical_Image_Viewer.utilities.PlatformUtils.isWebGLSupported()) {
        console.log("Warning: This browser version is not able to load surfaces.");
        return false;
    }

    if (this.params.surfaces) {
        return (this.loadingSurfaceIndex < this.params.surfaces.length);
    } else if (this.params.encodedSurfaces) {
        return (this.loadingSurfaceIndex < this.params.encodedSurfaces.length);
    }

    return false;
};



Medical_Image_Viewer.Container.prototype.loadNextSurface = function () {
    var loadingNext = false, imageRefs;

    if (this.params.surfaces) {
        if (this.loadingSurfaceIndex < this.params.surfaces.length) {
            loadingNext = true;
            imageRefs = this.params.surfaces[this.loadingSurfaceIndex];
            this.loadingSurfaceIndex += 1;
            this.viewer.loadSurface(imageRefs, true, false);
        } else {
            this.params.loadedSurfaces = this.params.surfaces;
            this.params.surfaces = [];
        }
    } else if (this.params.encodedSurfaces) {
        if (this.loadingSurfaceIndex < this.params.encodedSurfaces.length) {
            loadingNext = true;
            imageRefs = this.params.encodedSurfaces[this.loadingSurfaceIndex];

            if (!(imageRefs instanceof Array)) {
                imageRefs = [];
                imageRefs[0] = this.params.encodedSurfaces[this.loadingSurfaceIndex];
            }

            this.viewer.loadSurface(imageRefs, false, true);
            this.loadingSurfaceIndex += 1;
        } else {
            this.params.loadedEncodedSurfaces = this.params.encodedSurfaces;
            this.params.encodedSurfaces = [];
        }
    }

    return loadingNext;
};



Medical_Image_Viewer.Container.prototype.loadNextImage = function () {
    var loadingNext = false, imageRefs;

    if (this.params.images) {
        if (this.loadingImageIndex < this.params.images.length) {
            loadingNext = true;
            imageRefs = this.params.images[this.loadingImageIndex];

            if (!(imageRefs instanceof Array)) {
                imageRefs = [];
                imageRefs[0] = this.params.images[this.loadingImageIndex];
            }

            this.viewer.loadImage(imageRefs, true, false, false);
            this.loadingImageIndex += 1;
        } else {
            this.params.loadedImages = this.params.images;
            this.params.images = [];
        }
    } else if(this.params.binaryImages) {
        if (this.loadingImageIndex < this.params.binaryImages.length) {
            loadingNext = true;
            imageRefs = this.params.binaryImages[this.loadingImageIndex];

            if (!(imageRefs instanceof Array)) {
                imageRefs = [];
                imageRefs[0] = this.params.binaryImages[this.loadingImageIndex];
            }

            this.viewer.loadImage(imageRefs, false, false, true);
            this.loadingImageIndex += 1;
        } else {
            this.params.loadedEncodedImages = this.params.binaryImages;
            this.params.binaryImages = [];
        }
    } else if (this.params.encodedImages) {
        if (this.loadingImageIndex < this.params.encodedImages.length) {
            loadingNext = true;
            imageRefs = this.params.encodedImages[this.loadingImageIndex];

            if (!(imageRefs instanceof Array)) {
                imageRefs = [];
                imageRefs[0] = this.params.encodedImages[this.loadingImageIndex];
            }

            this.viewer.loadImage(imageRefs, false, true, false);
            this.loadingImageIndex += 1;
        } else {
            this.params.loadedEncodedImages = this.params.encodedImages;
            this.params.encodedImages = [];
        }
    } else if (this.params.files) {
        if (this.loadingImageIndex < this.params.files.length) {
            loadingNext = true;
            imageRefs = this.params.files[this.loadingImageIndex];

            if (!(imageRefs instanceof Array)) {
                imageRefs = [];
                imageRefs[0] = this.params.files[this.loadingImageIndex];
            }

            this.viewer.loadImage(imageRefs, false, false, false);
            this.loadingImageIndex += 1;
        } else {
            this.params.loadedFiles = this.params.files;
            this.params.files = [];
        }
    }

    return loadingNext;
};



Medical_Image_Viewer.Container.prototype.readyForDnD = function () {
    return !this.kioskMode && ((this.params.images === undefined) ||
        (this.loadingImageIndex >= this.params.images.length)) &&
        ((this.params.binaryImages === undefined) ||
        (this.loadingImageIndex >= this.params.binaryImages.length)) &&
        ((this.params.encodedImages === undefined) ||
        (this.loadingImageIndex >= this.params.encodedImages.length)) &&
        ((this.params.encodedSurfaces === undefined) ||
        (this.loadingSurfaceIndex >= this.params.encodedSurfaces.length));
};



Medical_Image_Viewer.Container.prototype.findLoadableImage = function (name, surface) {
    var ctr;

    for (ctr = 0; ctr < Medical_Image_ViewerLoadableImages.length; ctr += 1) {
        if (surface) {
            if (Medical_Image_ViewerLoadableImages[ctr].surface) {
                if (Medical_Image_ViewerLoadableImages[ctr].name == name) {  // needs to be ==, not ===
                    return Medical_Image_ViewerLoadableImages[ctr];
                }
            }
        } else {
            if (Medical_Image_ViewerLoadableImages[ctr].name == name) {  // needs to be ==, not ===
                return Medical_Image_ViewerLoadableImages[ctr];
            }
        }
    }

    if (window[name] !== undefined) {
        return {encode:name};
    }

    return null;
};



Medical_Image_Viewer.Container.prototype.findLoadableImages = function (refs, surface) {
    var ctr, loadable, loadables = [];

    if (!Array.isArray(refs)) {
        refs = [refs];
    }

    if (refs) {
        for (ctr = 0; ctr < refs.length; ctr++) {
            loadable = this.findLoadableImage(refs[ctr], surface);

            if (loadable) {
                loadables.push(loadable);
            }
        }
    }

    if (loadables.length > 0) {
        return loadables;
    }

    return null;
};


/*此代码似乎是用于医学图像查看器的更大 JavaScript 脚本的一部分。它定义了用于处理查看器容器的扩展和折叠、多个查看器的同步以及各种与查看器相关的功能的方法。以下是主要功能的细分：

1. **扩展查看器（'expandViewer'方法）**：
 - 该方法扩展查看器以占据整个页面。
 - 它隐藏了页面上的其他元素，并保存了它们的原始样式以供以后恢复。
 - 它设置身体样式以适应扩展的查看器。
 - 扩展后，它会调整查看器组件、更新查看器大小并添加滚动功能。

2. **折叠查看器（'collapseViewer'方法）**：
 - 该方法将查看器折叠回其原始状态。
 - 它恢复了页面元素的原始样式。
 - 它将展开的查看器替换为原始容器。
 - 折叠后，它会调整查看器组件、更新查看器大小并删除滚动功能。

3. **检查查看器是否嵌套（'isNestedViewer'方法）**：
 - 如果查看器是嵌套的或可折叠的，则返回“true”。

4. **检查桌面模式（'isDesktopMode'方法）**：
 - 如果查看器未处于展台模式，则返回“true”。

5. 检查DTI（扩散张量成像）是否已加载（'hasLoadedDTI'方法）**：
 - 如果查看器已加载 DTI，则返回“true”。

6. **禁用滚轮（'disableScrollWheel' 方法）**：
 - 如果查看器是嵌套的，或者平台是 iOS，则返回 'true'。

7. 检查查看器是否可以在Mango中打开（'canOpenInMango'方法）**：
 - 返回 'params.canOpenInMango' 的值。

8. **检查查看器是否可扩展（'isExpandable'方法）**：
 - 如果查看器是可扩展和嵌套的，则返回“true”。

9. **检查参数组合（'isParametricCombined'方法）**：
 - 如果启用了参数组合，并且查看器在指定索引处具有参数对，则返回“true”。

10. **检查非参数组合（'isNonParametricCombined' 方法）**：
 - 如果启用了非参数组合，并且查看器在指定索引处没有参数对，则返回“true”。

11. **处理坐标变更（'coordinateChanged' 方法）**：
 - 根据当前查看者的坐标同步查看者的坐标。
 - 更新曲面视图的活动平面（如果适用）。
 - 如果上下文管理器可用，则清除上下文。

12. **检查当前叠加的负值加载（'canCurrentOverlayLoadNegatives'方法）**：
 - 如果当前覆盖层可以加载负值，则返回“true”。

13. **检查当前覆盖层的 Mod 加载（'canCurrentOverlayLoadMod' 方法）**：
 - 如果当前叠加层是 DTI 叠加层并且可以加载调制值，则返回“true”。

14. **检查电流叠加的调制（'canCurrentOverlayModulate'方法）**：
 - 如果当前叠加层是 DTI 叠加层并且可以调制，则返回“true”。

15. **窗口事件**：
 - 侦听窗口大小调整、方向更改和加载事件。
 - 侦听消息，特别是指示安装了 Mango（另一个查看器）的消息。
 这些方法表明，该代码是综合医学图像查看器的一部分，具有查看器操作、同步以及与不同类型的图像叠加交互的功能*/

Medical_Image_Viewer.Container.prototype.expandViewer = function () {
    var container = this;

    if (this.nestedViewer) {
        this.nestedViewer = false;
        this.collapsable = true;
        this.tempScrollTop = $(window).scrollTop();

        $(":hidden").addClass(Medical_Image_Viewer_CONTAINER_COLLAPSABLE_EXEMPT);
        $(document.body).children().hide();
        this.containerHtml.show();

        this.originalStyle = {};
        this.originalStyle.width = document.body.style.width;
        this.originalStyle.height = document.body.style.height;
        this.originalStyle.marginTop = document.body.style.marginTop;
        this.originalStyle.marginRight = document.body.style.marginRight;
        this.originalStyle.marginBottom = document.body.style.marginBottom;
        this.originalStyle.marginLeft = document.body.style.marginLeft;
        this.originalStyle.paddingTop = document.body.style.paddingTop;
        this.originalStyle.paddingRight = document.body.style.paddingRight;
        this.originalStyle.paddingBottom = document.body.style.paddingBottom;
        this.originalStyle.paddingLeft = document.body.style.paddingLeft;
        this.originalStyle.overflow = document.body.style.overflow;

        Medical_Image_Viewer.Container.setToFullPage();

        this.containerHtml.after('<div style="display:none" class="' + Medical_Image_Viewer_CONTAINER_COLLAPSABLE + '"></div>');
        $(document.body).prepend(this.containerHtml);

        this.resizeViewerComponents(true);
        this.viewer.updateOffsetRect();
        this.updateViewerSize();

        setTimeout(function () {
            window.scrollTo(0, 0);
            container.viewer.addScroll();
        }, 0);
    }
};


Medical_Image_Viewer.Container.prototype.collapseViewer = function () {
    var ctr, container;

    container = this;

    if (this.collapsable) {
        this.nestedViewer = true;
        this.collapsable = false;

        document.body.style.width = this.originalStyle.width;
        document.body.style.height = this.originalStyle.height;
        document.body.style.marginTop = this.originalStyle.marginTop;
        document.body.style.marginRight = this.originalStyle.marginRight;
        document.body.style.marginBottom = this.originalStyle.marginBottom;
        document.body.style.marginLeft = this.originalStyle.marginLeft;
        document.body.style.paddingTop = this.originalStyle.paddingTop;
        document.body.style.paddingRight = this.originalStyle.paddingRight;
        document.body.style.paddingBottom = this.originalStyle.paddingBottom;
        document.body.style.paddingLeft = this.originalStyle.paddingLeft;
        document.body.style.overflow = this.originalStyle.overflow;

        $("." + Medical_Image_Viewer_CONTAINER_COLLAPSABLE).replaceWith(this.containerHtml);
        $(document.body).children(":not(." + Medical_Image_Viewer_CONTAINER_COLLAPSABLE_EXEMPT + ")").show();
        $("." + Medical_Image_Viewer_CONTAINER_COLLAPSABLE_EXEMPT).removeClass(Medical_Image_Viewer_CONTAINER_COLLAPSABLE_EXEMPT);

        this.resizeViewerComponents(true);

        for (ctr = 0; ctr < Medical_Image_ViewerContainers.length; ctr += 1) {
            Medical_Image_ViewerContainers[ctr].updateViewerSize();
            Medical_Image_ViewerContainers[ctr].viewer.drawViewer(true);
        }

        setTimeout(function () {
            $(window).scrollTop(container.tempScrollTop);
            container.viewer.removeScroll();
        }, 0);
    }
};



Medical_Image_Viewer.Container.prototype.isNestedViewer = function () {
    return (this.nestedViewer || this.collapsable);
};



Medical_Image_Viewer.Container.prototype.isDesktopMode = function () {
    return !this.kioskMode;
};



Medical_Image_Viewer.Container.prototype.hasLoadedDTI = function () {
    return this.viewer.hasLoadedDTI();
};



Medical_Image_Viewer.Container.prototype.disableScrollWheel = function () {
    return (this.isNestedViewer() || Medical_Image_Viewer.utilities.PlatformUtils.ios);
};



Medical_Image_Viewer.Container.prototype.canOpenInMango = function () {
    return this.params.canOpenInMango;
};



Medical_Image_Viewer.Container.prototype.isExpandable = function () {
    return this.params.expandable && this.isNestedViewer();
};



Medical_Image_Viewer.Container.prototype.isParametricCombined = function (index) {
    return this.combineParametric && this.viewer.hasParametricPair(index);
};



Medical_Image_Viewer.Container.prototype.isNonParametricCombined = function (index) {
    return !this.isParametricCombined(index);
};



Medical_Image_Viewer.Container.prototype.coordinateChanged = function (viewer) {
    var ctr, coorWorld,
        coor = viewer.currentCoord;

    if (!viewer.ignoreSync) {
        if (Medical_Image_Viewer.Container.syncViewersWorld) {
            for (ctr = 0; ctr < Medical_Image_ViewerContainers.length; ctr += 1) {
                if ((Medical_Image_ViewerContainers[ctr].viewer !== viewer) && !Medical_Image_ViewerContainers[ctr].viewer.ignoreSync) {
                    coorWorld = new Medical_Image_Viewer.core.Coordinate();
                    Medical_Image_ViewerContainers[ctr].viewer.gotoWorldCoordinate(viewer.getWorldCoordinateAtIndex(coor.x, coor.y, coor.z, coorWorld), true);
                }
            }
        } else if (Medical_Image_Viewer.Container.syncViewers) {
            for (ctr = 0; ctr < Medical_Image_ViewerContainers.length; ctr += 1) {
                if ((Medical_Image_ViewerContainers[ctr].viewer !== viewer) && !Medical_Image_ViewerContainers[ctr].viewer.ignoreSync) {
                    Medical_Image_ViewerContainers[ctr].viewer.gotoCoordinate(coor, true);
                }
            }
        }
    }

    if (viewer.surfaceView) {
        viewer.surfaceView.updateActivePlanes();
    }

    if (this.contextManager && this.contextManager.clearContext) {
        this.contextManager.clearContext();
    }
};



Medical_Image_Viewer.Container.prototype.canCurrentOverlayLoadNegatives = function () {
    var overlay = this.viewer.currentScreenVolume;
    return (!overlay.negative && (overlay.negativeScreenVol === null));
};



Medical_Image_Viewer.Container.prototype.canCurrentOverlayLoadMod = function () {
    var overlay = this.viewer.currentScreenVolume;
    return (overlay.dti && (overlay.dtiVolumeMod === null));
};



Medical_Image_Viewer.Container.prototype.canCurrentOverlayModulate = function () {
    var overlay = this.viewer.currentScreenVolume;
    return (overlay.dti && (overlay.dtiVolumeMod !== null));
};



/*** Window Events ***/

window.addEventListener('resize', Medical_Image_Viewer.Container.resizeMedical_Image_Viewer, false);
window.addEventListener("orientationchange", Medical_Image_Viewer.Container.reorientMedical_Image_Viewer, false);
window.addEventListener("load", Medical_Image_Viewer.Container.startMedical_Image_Viewer, false);
window.addEventListener('message', function (msg) {
    if (msg.data === Medical_Image_Viewer_MANGO_INSTALLED) {
        Medical_Image_Viewer.mangoinstalled = true;
    }
}, false);
