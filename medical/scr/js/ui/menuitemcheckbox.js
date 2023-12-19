
/*jslint browser: true, node: true */
/*global $, Medical_Image_Viewer_MENU_HOVERING_CSS, Medical_Image_Viewer_MENU_COLORTABLE_CSS, Medical_Image_Viewer_MENU_UNSELECTABLE */

"use strict";

/*** Imports ***/
var Medical_Image_Viewer = Medical_Image_Viewer || {};
Medical_Image_Viewer.ui = Medical_Image_Viewer.ui || {};


/*** Constructor ***/
Medical_Image_Viewer.ui.MenuItemCheckBox = Medical_Image_Viewer.ui.MenuItemCheckBox || function (viewer, label, action, callback, dataSource,
                                                                           method, modifier) {
    this.viewer = viewer;
    this.label = label;

    this.modifier = "";
    if ((modifier !== undefined) && (modifier !== null)) {
        this.modifier = "-" + modifier;
    }

    this.action = action + this.modifier;
    this.method = method;
    this.id = this.action.replace(/ /g, "_").replace(/\(/g, "").replace(/\)/g, "") +
    this.viewer.container.containerIndex;
    this.callback = callback;
    this.dataSource = dataSource;
};


/*** Prototype Methods ***/

Medical_Image_Viewer.ui.MenuItemCheckBox.prototype.buildHTML = function (parentId) {
    var selected, checked, html, thisHtml;

    selected = this.dataSource[this.method](this.label);
    checked = "";

    if (selected) {
        checked = "checked='checked'";
    }

    html = "<li id='" + this.id + "'><input type='checkbox' class='" + Medical_Image_Viewer_MENU_COLORTABLE_CSS + "' name='" +
    Medical_Image_Viewer_MENU_COLORTABLE_CSS + "' id='" + this.id + "' value='" + this.id  + "' " + checked + "><span class='" +
    Medical_Image_Viewer_MENU_UNSELECTABLE + "'>&nbsp;" + this.label + "</span></li>";
    $("#" + parentId).append(html);
    thisHtml = $("#" + this.id);
    thisHtml.click(Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.doAction));
    thisHtml.hover(function () { $(this).toggleClass(Medical_Image_Viewer_MENU_HOVERING_CSS); });
};



Medical_Image_Viewer.ui.MenuItemCheckBox.prototype.doAction = function () {
    $("." + Medical_Image_Viewer_MENU_COLORTABLE_CSS).removeAttr('checked');
    $("#" + this.id + " > input")[0].checked = true;
    this.callback(this.action, null, true);
};
/*
这段代码定义了一个名为Medical_Image_Viewer.ui.MenuItemCheckBox的构造函数和它的原型方法。构造函数接受七个参数，分别是viewer、label、action、callback、dataSource、method和modifier。
它们分别表示查看器、标签、动作、回调函数、数据源、方法和修饰符。原型方法包括buildHTML和doAction，buildHTML方法用于构建HTML元素，doAction方法用于执行动作。
具体来说，buildHTML方法会根据传入的parentId参数构建一个li元素，其中包含一个checkbox和一个span元素，checkbox的选中状态由dataSource和method决定，span元素的文本内容为label。
doAction方法会将所有checkbox的选中状态都取消，并将当前checkbox的选中状态设置为true，然后执行回调函数callback，并将action和true作为参数传递给它。 
*/

