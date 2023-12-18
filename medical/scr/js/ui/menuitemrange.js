
/*jslint browser: true, node: true */
/*global $, Medical_Image_Viewer_MENU_UNSELECTABLE, Medical_Image_Viewer_MENU_INPUT_FIELD, Medical_Image_Viewer_MENU_HOVERING_CSS */

"use strict";

/*** Imports ***/
var Medical_Image_Viewer = Medical_Image_Viewer || {};
Medical_Image_Viewer.ui = Medical_Image_Viewer.ui || {};


/*** Constructor ***/
Medical_Image_Viewer.ui.MenuItemRange = Medical_Image_Viewer.ui.MenuItemRange || function (viewer, label, action, callback, dataSource, method,
                                                               modifier) {
    if (action === "ChangeRangeNeg") {
        this.negatives = true;
        modifier = viewer.getScreenVolumeIndex(viewer.screenVolumes[parseInt(modifier)].negativeScreenVol).toString();
    }

    this.viewer = viewer;
    this.label = label;

    this.index = modifier;
    this.modifier = "";
    if (modifier !== undefined) {
        this.modifier = "-" + modifier;
    }

    this.action = action + this.modifier;
    this.minId = this.action.replace(/ /g, "_") + "Min" + this.viewer.container.containerIndex;
    this.maxId = this.action.replace(/ /g, "_") + "Max" + this.viewer.container.containerIndex;
    this.callback = callback;
    this.dataSource = dataSource;
    this.method = method;
    this.id = label + this.modifier + this.viewer.container.containerIndex;

    this.grabOffset = 0;
    this.screenVol = this.viewer.screenVolumes[this.index];
};


/***getRelativeMousePositionFromParentX函数中的parentOffset变量表示该元素的父元素相对于文档左上角的偏移量，
 *然后通过减去鼠标事件的水平位置和该偏移量，就可以得到鼠标相对于该元素的水平位置。
 而getRelativeMousePositionX函数中的parentOffset变量则表示该元素本身相对于文档左上角的偏移量***/

Medical_Image_Viewer.ui.MenuItemRange.getRelativeMousePositionFromParentX = function (elem, ev) {
    var parentOffset = elem.parent().offset();
    return Medical_Image_Viewer.utilities.PlatformUtils.getMousePositionX(ev) - parentOffset.left;
};



Medical_Image_Viewer.ui.MenuItemRange.getRelativeMousePositionX = function (elem, ev) {
    var parentOffset = elem.offset();
    return Medical_Image_Viewer.utilities.PlatformUtils.getMousePositionX(ev) - parentOffset.left;
};


/*** Prototype Methods ***/

/*这段代码是一个JavaScript函数，用于构建Medical_Image_Viewer.ui.MenuItemRange对象的HTML元素。
这个对象包含了一个范围选择器，用户可以通过拖动滑块来选择范围。函数中包含了一些HTML和CSS代码，用于创建和定位滑块和其他元素。
函数还包含了一些事件处理程序，用于响应用户的交互，例如拖动滑块时更新范围值并重新绘制视图。此外，函数还包含了一些工具函数，用于计算鼠标位置和更新颜色表等。 
*/
Medical_Image_Viewer.ui.MenuItemRange.prototype.buildHTML = function (parentId) {
    var range, html, menuItemRange, minHtml, maxHtml, minSliderId, minSliderHtml, maxSliderId, maxSliderHtml, sliderId,
        sliderHtml;

    minSliderId = this.id + "SliderMin";
    maxSliderId = this.id + "SliderMax";
    sliderId = this.id + "Slider";
    range = this.dataSource[this.method]();

    menuItemRange = this;

    html = "<li id='" + this.id + "'>" +
                "<span class='" + Medical_Image_Viewer_MENU_UNSELECTABLE + "' style=''>" +
                    "<input class='" + Medical_Image_Viewer_MENU_INPUT_FIELD + "' type='text' size='4' id='" + this.minId +
                        "' value='" + range[0] + "' />" +
                    "<div style='display:inline-block;position:relative;width:" +
                            (Medical_Image_Viewer.viewer.ColorTable.COLOR_BAR_WIDTH + Medical_Image_Viewer.viewer.ColorTable.ARROW_ICON_WIDTH) +
                            "px;top:-12px;'>" +
                        "<img id='" + minSliderId + "' class='" + Medical_Image_Viewer_MENU_UNSELECTABLE +
                            "' style='position:absolute;top:5px;left:" +
                            (menuItemRange.screenVol.colorTable.minLUT / Medical_Image_Viewer.viewer.ColorTable.LUT_MAX) *
                            (Medical_Image_Viewer.viewer.ColorTable.COLOR_BAR_WIDTH - 1) + "px;z-index:99' src='" +
                            Medical_Image_Viewer.viewer.ColorTable.ARROW_ICON + "' />" +
                        "<img id='" + maxSliderId + "' class='" + Medical_Image_Viewer_MENU_UNSELECTABLE +
                            "' style='position:absolute;top:5px;left:" +
                            (menuItemRange.screenVol.colorTable.maxLUT / Medical_Image_Viewer.viewer.ColorTable.LUT_MAX) *
                            (Medical_Image_Viewer.viewer.ColorTable.COLOR_BAR_WIDTH - 1) + "px;z-index:99' src='" +
                            Medical_Image_Viewer.viewer.ColorTable.ARROW_ICON + "' />" +
                        "<img id='" + sliderId + "' class='" + Medical_Image_Viewer_MENU_UNSELECTABLE +
                            "' style='position:absolute;top:0;left:" +
                            (parseInt(Medical_Image_Viewer.viewer.ColorTable.ARROW_ICON_WIDTH / 2, 10)) + "px;' src='" +
                            this.viewer.screenVolumes[parseInt(this.index, 10)].colorBar + "' />" +
                    "</div>" +
                    "<input class='" + Medical_Image_Viewer_MENU_INPUT_FIELD + "' type='text' size='4' id='" + this.maxId +
                        "' value='" + range[1] + "' />" +
                "</span>" +
           "</li>";

    $("#" + parentId).append(html);

    minHtml = $("#" + this.minId);
    maxHtml = $("#" + this.maxId);
    minSliderHtml = $("#" + minSliderId);
    maxSliderHtml = $("#" + maxSliderId);
    sliderHtml = $("#" + sliderId);

    if (Medical_Image_Viewer.utilities.PlatformUtils.ios) {
        minHtml[0].style.width = 35 + 'px';
        minHtml[0].style.marginRight = 4 + 'px';
        maxHtml[0].style.width = 35 + 'px';
        maxHtml[0].style.marginRight = 4 + 'px';
    }

    minSliderHtml.bind(Medical_Image_Viewer.utilities.PlatformUtils.ios ? 'touchstart' : 'mousedown', function (ev) {
        menuItemRange.grabOffset = Medical_Image_Viewer.ui.MenuItemRange.getRelativeMousePositionX(minSliderHtml, ev);

        $(window).bind(Medical_Image_Viewer.utilities.PlatformUtils.ios ? 'touchmove' : 'mousemove', function (ev) {
            var val, maxVal;

            maxVal = (menuItemRange.screenVol.colorTable.maxLUT / Medical_Image_Viewer.viewer.ColorTable.LUT_MAX) *
                (Medical_Image_Viewer.viewer.ColorTable.COLOR_BAR_WIDTH - 1);
            val = (Medical_Image_Viewer.ui.MenuItemRange.getRelativeMousePositionFromParentX(minSliderHtml, ev) - menuItemRange.grabOffset);

            if (val < 0) {
                val = 0;
            } else if (val >= Medical_Image_Viewer.viewer.ColorTable.COLOR_BAR_WIDTH) {
                val = (Medical_Image_Viewer.viewer.ColorTable.COLOR_BAR_WIDTH - 1);
            } else if (val > maxVal) {
                val = maxVal;
            }

            menuItemRange.screenVol.updateMinLUT(Math.round((val / (Medical_Image_Viewer.viewer.ColorTable.COLOR_BAR_WIDTH - 1)) *
                Medical_Image_Viewer.viewer.ColorTable.LUT_MAX));
            minSliderHtml.css({"left": val + "px"});
            menuItemRange.viewer.drawViewer(false, true);
            minHtml.val(menuItemRange.dataSource[menuItemRange.method]()[0]);
            menuItemRange.screenVol.updateColorBar();
            sliderHtml.attr("src", menuItemRange.screenVol.colorBar);
        });

        return false;  // disable img drag
    });

    maxSliderHtml.bind(Medical_Image_Viewer.utilities.PlatformUtils.ios ? 'touchstart' : 'mousedown', function (ev) {
        menuItemRange.grabOffset = Medical_Image_Viewer.ui.MenuItemRange.getRelativeMousePositionX(maxSliderHtml, ev);
        $(window).bind(Medical_Image_Viewer.utilities.PlatformUtils.ios ? 'touchmove' : 'mousemove', function (ev) {
            var val, minVal;

            minVal = (menuItemRange.screenVol.colorTable.minLUT / Medical_Image_Viewer.viewer.ColorTable.LUT_MAX) *
                (Medical_Image_Viewer.viewer.ColorTable.COLOR_BAR_WIDTH - 1);
            val = (Medical_Image_Viewer.ui.MenuItemRange.getRelativeMousePositionFromParentX(maxSliderHtml, ev) - menuItemRange.grabOffset);

            if (val < 0) {
                val = 0;
            } else if (val >= Medical_Image_Viewer.viewer.ColorTable.COLOR_BAR_WIDTH) {
                val = (Medical_Image_Viewer.viewer.ColorTable.COLOR_BAR_WIDTH - 1);
            } else if (val < minVal) {
                val = minVal;
            }

            menuItemRange.screenVol.updateMaxLUT(Math.round((val / (Medical_Image_Viewer.viewer.ColorTable.COLOR_BAR_WIDTH - 1)) *
                Medical_Image_Viewer.viewer.ColorTable.LUT_MAX));
            maxSliderHtml.css({"left": val + "px"});
            menuItemRange.viewer.drawViewer(false, true);
            maxHtml.val(menuItemRange.dataSource[menuItemRange.method]()[1]);
            menuItemRange.screenVol.updateColorBar();
            sliderHtml.attr("src", menuItemRange.screenVol.colorBar);
        });

        return false;  // disable img drag
    });

    $(window).bind(Medical_Image_Viewer.utilities.PlatformUtils.ios ? 'touchend' : 'mouseup', function () {
        $(window).unbind(Medical_Image_Viewer.utilities.PlatformUtils.ios ? 'touchmove' : 'mousemove');
    });

    $("#" + this.id).hover(function () {$(this).toggleClass(Medical_Image_Viewer_MENU_HOVERING_CSS); });

    minHtml.change(Medical_Image_Viewer.utilities.ObjectUtils.bind(this, function () {
        menuItemRange.rangeChanged(true);
    }));

    maxHtml.change(Medical_Image_Viewer.utilities.ObjectUtils.bind(this, function () {
        menuItemRange.rangeChanged(false);
    }));

    minHtml.keyup(Medical_Image_Viewer.utilities.ObjectUtils.bind(this, function (e) {
        if (e.keyCode === 13) {
            menuItemRange.rangeChanged(false);
            menuItemRange.viewer.container.toolbar.closeAllMenus();
        }
    }));

    maxHtml.keyup(Medical_Image_Viewer.utilities.ObjectUtils.bind(this, function (e) {
        if (e.keyCode === 13) {
            menuItemRange.rangeChanged(false);
            menuItemRange.viewer.container.toolbar.closeAllMenus();
        }
    }));

    if (!Medical_Image_Viewer.utilities.PlatformUtils.ios) {
        setTimeout(function () {  // IE wasn't picking up on the focus
            minHtml.focus();
            minHtml.select();
        }, 10);
    }
};



Medical_Image_Viewer.ui.MenuItemRange.prototype.rangeChanged = function (focusMax) {
    this.updateDataSource(focusMax);
    this.viewer.drawViewer(true);
    this.resetSlider();
};


/*这段代码是一个JavaScript函数，用于更新Medical_Image_Viewer的UI界面中的数据源。该函数接受一个参数focusMax，用于指定是否将焦点放在最大值输入框中。
函数中首先获取最大值和最小值的输入框，然后获取它们的值。如果输入框中没有值，则使用默认值。接下来，将最小值和最大值分别设置为输入框中的值。
如果negatives为true，则调用setScreenRangeNegatives函数，否则调用setScreenRange函数。最后，如果focusMax为true，则将焦点放在最大值输入框中。
resetSlider函数用于重置滑块的位置，并将颜色条的src属性设置为screenVol的colorBar属性。
*/

Medical_Image_Viewer.ui.MenuItemRange.prototype.updateDataSource = function (focusMax) {
    var max, min, maxHtml, minHtml;

    minHtml = $("#" + this.minId);
    maxHtml = $("#" + this.maxId);

    min = parseFloat(minHtml.val());
    if (isNaN(min)) {
        min = this.dataSource.screenMin;
    }

    max = parseFloat(maxHtml.val());
    if (isNaN(max)) {
        max = this.dataSource.screenMax;
    }

    minHtml.val(min);
    maxHtml.val(max);

    if (this.negatives) {
        this.dataSource.setScreenRangeNegatives(min, max);
    } else {
        this.dataSource.setScreenRange(min, max);
    }

    if (focusMax) {
        maxHtml.focus();
        maxHtml.select();
    }
};



Medical_Image_Viewer.ui.MenuItemRange.prototype.resetSlider = function () {
    var minSliderId, minSliderHtml, maxSliderId, maxSliderHtml, sliderId, sliderHtml;

    minSliderId = this.id + "SliderMin";
    maxSliderId = this.id + "SliderMax";
    sliderId = this.id + "Slider";
    minSliderHtml = $("#" + minSliderId);
    maxSliderHtml = $("#" + maxSliderId);
    sliderHtml = $("#" + sliderId);

    minSliderHtml.css({"left": 0});
    maxSliderHtml.css({"left": (Medical_Image_Viewer.viewer.ColorTable.COLOR_BAR_WIDTH - 1) + "px"});

    this.screenVol.resetDynamicRange();
    sliderHtml.attr("src", this.screenVol.colorBar);
};
