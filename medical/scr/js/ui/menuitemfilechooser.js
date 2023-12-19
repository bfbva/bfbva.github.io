
/*jslint browser: true, node: true */
/*global $, Medical_Image_Viewer_MENU_FILECHOOSER, Medical_Image_Viewer_MENU_UNSELECTABLE, Medical_Image_Viewer_MENU_HOVERING_CSS */

"use strict";

/*** Imports ***/
var Medical_Image_Viewer = Medical_Image_Viewer || {};
Medical_Image_Viewer.ui = Medical_Image_Viewer.ui || {};


/*** Constructor ***/
Medical_Image_Viewer.ui.MenuItemFileChooser = Medical_Image_Viewer.ui.MenuItemFileChooser || function (viewer, label, action, callback, folder, modifier) {
    this.viewer = viewer;
    this.label = label;

    this.modifier = "";
    if ((modifier !== undefined) && (modifier !== null)) {
        this.modifier = "-" + modifier;
    }

    this.action = action + this.modifier;
    this.id = this.action.replace(/ /g, "_") + this.viewer.container.containerIndex;
    this.fileChooserId = "fileChooser" + this.label.replace(/ /g, "_").replace(/\./g, "") + this.viewer.container.containerIndex + (folder ? "folder" : "");
    this.callback = callback;
    this.folder = folder;
};


/*** Prototype Methods ***/

Medical_Image_Viewer.ui.MenuItemFileChooser.prototype.buildHTML = function (parentId) {
    var filechooser, html;

    filechooser = this;

    html = "<li id='" + this.id + "'><span class='" + Medical_Image_Viewer_MENU_UNSELECTABLE + "'><label class='" +
        Medical_Image_Viewer_MENU_FILECHOOSER + "' for='" + this.fileChooserId + "'>" + this.label;

    if (this.folder) {
        html += "</label><input type='file' id='" + this.fileChooserId +
            "' multiple='multiple' webkitdirectory directory name='files' /></span></li>";
    } else {
        html += "</label><input type='file' id='" + this.fileChooserId +
            "' multiple='multiple' name='files' /></span></li>";
    }

    $("#" + parentId).append(html);

    $("#" + this.fileChooserId)[0].onchange = Medical_Image_Viewer.utilities.ObjectUtils.bind(filechooser, function () {
        filechooser.callback(filechooser.action, document.getElementById(filechooser.fileChooserId).files);
    });

    $("#" + this.id).hover(function () {$(this).toggleClass(Medical_Image_Viewer_MENU_HOVERING_CSS); });
};

/*
创建一个带有文件选择器的菜单项。
创建了一个名为Medical_Image_Viewer.ui.MenuItemFileChooser的构造函数，该函数接受多个参数，包括一个查看器对象、标签、操作、回调函数、文件夹标志和修饰符。
buildHTML原型方法，用于构建HTML元素并将其添加到指定的父元素中。
使用了一个带有标签和文件选择器的列表项，并根据文件夹标志添加了不同的文件选择器类型。
绑定了一个onchange事件处理程序，以便在用户选择文件后调用回调函数。 
*/

