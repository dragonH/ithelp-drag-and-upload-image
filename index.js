// ==UserScript==
// @name         ithelp image drag and upload
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  ithelp image drag and upload
// @author       dragonH
// @match        https://ithelp.ithome.com.tw/
// @grant        none
// ==/UserScript==

(function() {
  'use strict';
  const myPrventDefault = (e) => {
    e.stopPropagation();
    e.preventDefault();
  }
  const onDrop = (e) => {
    e.stopPropagation();
    e.preventDefault();
    uploadImage(e.originalEvent.dataTransfer.files);
    return false;
  }
  const uploadImage = (file) => {
    const [image] = file;
    if (!image) {
      return false;
    }
    const url = '/api/upload';
    const myFormData = new FormData();
    myFormData.append('images[]', image);
    $.ajax({
      url,
      data: myFormData,
      processData: false,
      contentType: false,
      type: 'POST',
      success: uploadSucceed,
    })
  }
  const uploadSucceed = (res) => {
    const resultMarkDown = `![${res.url}](${res.url})`;
    const editor = $('.CodeMirror').length
      ? $('.CodeMirror')[0].CodeMirror
      : undefined;
    if (!editor) {
      return false;
    }
    const doc = editor.getDoc();
    const { ch } = doc.getCursor();
    doc.replaceRange(`${ch ? '\n' : ''}${resultMarkDown}`, editor.getCursor());
    // editor.CodeMirror.replaceRange('replace', editor.CodeMirror.getCursor(), { line: editor.CodeMirror.getCursor().line, ch: editor.CodeMirror.getCursor().ch + 7 })
  }
  $('.CodeMirror').on('dragenter', myPrventDefault);
  $('.CodeMirror').on('dragover', myPrventDefault);
  $('.CodeMirror').on('dragleave', myPrventDefault);
  $('.CodeMirror').on('drop', onDrop);
})();