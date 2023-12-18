
/*jslint browser: true, node: true */
/*global $, Medical_Image_Viewer_DIALOG_CSS, Medical_Image_Viewer_DIALOG_CONTENT_CSS, Medical_Image_Viewer_DIALOG_CONTENT_LABEL_CSS, Medical_Image_Viewer_DIALOG_BACKGROUND,
 Medical_Image_Viewer_DIALOG_CONTENT_CONTROL_CSS, Medical_Image_Viewer_DIALOG_TITLE_CSS, Medical_Image_Viewer_DIALOG_STOPSCROLL, Medical_Image_Viewer_DIALOG_BUTTON_CSS,
 Medical_Image_Viewer_DIALOG_CONTENT_NOWRAP_CSS, Medical_Image_Viewer_DIALOG_CONTENT_HELP */

"use strict";

/*** Imports ***/
var Medical_Image_Viewer = Medical_Image_Viewer || {};
Medical_Image_Viewer.ui = Medical_Image_Viewer.ui || {};


/*** Constructor ***/
Medical_Image_Viewer.ui.Dialog = Medical_Image_Viewer.ui.Dialog || function (container, title, content, dataSource, callback, callbackOk, modifier,
                                                 wrap) {
    this.container = container;
    this.viewer = container.viewer;
    this.title = title;
    this.modifier = "";
    if (!Medical_Image_Viewer.utilities.StringUtils.isStringBlank(modifier)) {
        this.modifier = modifier;
    }
    this.id = this.title.replace(/ /g, "_");
    this.content = content;
    this.dataSource = dataSource;
    this.callback = callback;
    this.callbackOk = callbackOk;
    this.doWrap = wrap;
    this.scrollBehavior1 = null;
    this.scrollBehavior2 = null;
};


/*** Static Methods ***/
//显示模态对话框。它计算对话框的位置并将其设置为绝对定位然后将其显示出来。
Medical_Image_Viewer.ui.Dialog.showModalDialog = function (dialog, viewer, dialogHtml) {
    var viewerWidth, viewerHeight, dialogWidth, dialogHeight, left, top;

    var docElem = document.documentElement;
    var scrollTop = window.pageYOffset || docElem.scrollTop;

    viewerWidth = $(window).outerWidth();
    viewerHeight = $(window).outerHeight();

    dialogWidth = $(dialogHtml).outerWidth();
    dialogHeight = $(dialogHtml).outerHeight();

    left = (viewerWidth / 2) - (dialogWidth / 2) + "px";
    top = scrollTop + (viewerHeight / 2) - (dialogHeight / 2) + "px";

    $(dialogHtml).css({
        position: 'absolute',
        zIndex: 100,
        left: left,
        top: top
    });

    viewer.removeScroll();

    $(dialogHtml).hide().fadeIn(200);
};


/*** Prototype Methods ***/
//用于显示对话框
/*它首先创建一个HTML字符串，然后将其添加到页面中。对话框包含一个标题和一个内容区域，内容区域中包含一个表格，其中包含一些表单元素，
例如下拉列表框和只读文本框。对话框还包含一个“Ok”按钮，当用户单击该按钮时，将调用doOk方法。
在显示对话框之前，该方法还会设置表单元素的值，并为下拉列表框添加一个change事件处理程序。
*/
Medical_Image_Viewer.ui.Dialog.prototype.showDialog = function () {
    var ctr, ctrOpt, html, val, itemsHtml, thisHtml, thisHtmlId, disabled, bodyHtml;

    thisHtmlId = "#" + this.id;
    thisHtml = $(thisHtmlId);
    thisHtml.remove();

    bodyHtml = $("body");

    html = "<div id='" + this.id + "' class='" + Medical_Image_Viewer_DIALOG_CSS + "'><span class='" +
        Medical_Image_Viewer_DIALOG_TITLE_CSS + "'>" + this.title + "</span>";

    if (this.content) {
        html += "<div class='" + Medical_Image_Viewer_DIALOG_CONTENT_CSS + "'><table>";

        for (ctr = 0; ctr < this.content.items.length; ctr += 1) {
            if (this.content.items[ctr].spacer) {
                html += "<tr><td class='" + Medical_Image_Viewer_DIALOG_CONTENT_LABEL_CSS + "'>&nbsp;</td><td class='" +
                    Medical_Image_Viewer_DIALOG_CONTENT_CONTROL_CSS + "'>&nbsp;</td></tr>";
            } else if (this.content.items[ctr].readonly) {
                html += "<tr><td class='" + Medical_Image_Viewer_DIALOG_CONTENT_LABEL_CSS + "'>" + this.content.items[ctr].label +
                    "</td><td class='" + Medical_Image_Viewer_DIALOG_CONTENT_CONTROL_CSS + "' id='" + this.content.items[ctr].field +
                    "'></td></tr>";
            } else {
                if (this.content.items[ctr].disabled && (Medical_Image_Viewer.utilities.ObjectUtils.bind(this.container,
                        Medical_Image_Viewer.utilities.ObjectUtils.dereferenceIn(this, this.content.items[ctr].disabled)))() === true) {
                    disabled = "disabled='disabled'";
                } else {
                    disabled = "";
                }

                html += "<tr><td class='" + Medical_Image_Viewer_DIALOG_CONTENT_LABEL_CSS + "'>" + this.content.items[ctr].label +
                    "</td><td class='" + Medical_Image_Viewer_DIALOG_CONTENT_CONTROL_CSS + "'><select " + disabled +
                    " id='" + this.content.items[ctr].field + "'>";
                for (ctrOpt = 0; ctrOpt < this.content.items[ctr].options.length; ctrOpt += 1) {
                    html += "<option value='" + this.content.items[ctr].options[ctrOpt] + "'>" +
                        Medical_Image_Viewer.utilities.StringUtils.truncateMiddleString(this.content.items[ctr].options[ctrOpt].toString(), 40) + "</option>";
                }

                html += "</select></td></tr>";

                if (this.content.items[ctr].help) {
                    html += "<tr><td colspan='2' class='" + Medical_Image_Viewer_DIALOG_CONTENT_HELP + "'>" + this.content.items[ctr].help + "</td></tr>";
                }
            }
        }

        html += "</table></div>";
    }

    html += "<div class='" + Medical_Image_Viewer_DIALOG_BUTTON_CSS + "'><button type='button' id='" + this.id + "-Ok" +
        "'>Ok</button></div></div>";

    bodyHtml.append('<div class="' + Medical_Image_Viewer_DIALOG_BACKGROUND + '"></div>');
    bodyHtml.append(html);

    for (ctr = 0; ctr < this.content.items.length; ctr += 1) {
        if (this.content.items[ctr].readonly) {
            val = this.dataSource[this.content.items[ctr].field](this.modifier);
            if (val !== null) {
                $("#" + this.content.items[ctr].field).html(val);
            } else {
                $("#" + this.content.items[ctr].field).parent().remove();
            }
        } else if (!this.content.items[ctr].spacer) {
            itemsHtml = $("#" + this.content.items[ctr].field);
            itemsHtml.val(this.dataSource[this.content.items[ctr].field]);
            itemsHtml.change(Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.doAction, [this.content.items[ctr].field]));
        }
    }

    if (!this.doWrap) {
        $("." + Medical_Image_Viewer_DIALOG_CONTENT_CSS).addClass(Medical_Image_Viewer_DIALOG_CONTENT_NOWRAP_CSS);
    }

    $("#" + this.id + "-Ok").click(Medical_Image_Viewer.utilities.ObjectUtils.bind(this, this.doOk));

    thisHtml = $(thisHtmlId);
    bodyHtml.addClass(Medical_Image_Viewer_DIALOG_STOPSCROLL);
    Medical_Image_Viewer.ui.Dialog.showModalDialog(this, this.viewer, thisHtml[0]);
};

//用户点击对话框中的“确定”按钮时被调用，它隐藏并删除对话框，并在需要时调用回调函数。
Medical_Image_Viewer.ui.Dialog.prototype.doOk = function () {
    var modalDialogHtml, modelDialogBackgroundHtml;

    modalDialogHtml = $("." + Medical_Image_Viewer_DIALOG_CSS);
    modelDialogBackgroundHtml = $("." + Medical_Image_Viewer_DIALOG_BACKGROUND);

    modalDialogHtml.hide(100);
    modelDialogBackgroundHtml.hide(100);

    modalDialogHtml.remove();
    modelDialogBackgroundHtml.remove();

    window.onmousewheel = this.scrollBehavior1;
    document.onmousewheel = this.scrollBehavior2;

    if (this.callbackOk) {
        this.callbackOk();
    }

    $("body").removeClass(Medical_Image_Viewer_DIALOG_STOPSCROLL);
    this.container.viewer.addScroll();
};
//执行某些操作时被调用，它调用回调函数并传递操作和相关值作为参数。
Medical_Image_Viewer.ui.Dialog.prototype.doAction = function (action) {
    this.callback(action, $("#" + action).val());
};
