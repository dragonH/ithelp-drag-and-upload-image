// ==UserScript==
// @name         ithelp image drag and upload
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  ithelp image drag and upload
// @author       dragonH
// @match        https://ithelp.ithome.com.tw/*
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
    uploadImage(e.originalEvent.dataTransfer.files, e.currentTarget);
    return false;
  }
  const uploadImage = (file, editor) => {
    const [image] = file;
    if (!image) {
      return false;
    }
    if (['image/jpg', 'image/jpeg', 'image/png'].indexOf(image.type) < 0) {
      alert('圖片必須是 jpg/jpeg/png');
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
      success: (res) => {
        if (res.status === 'failed') {
          alert(res.errorMsg);
          return false;
        }
        uploadSucceed(res, editor);
        alert(`上傳成功!\n圖片網址:\n${res.url}`)
      }
    })
  }
  const uploadSucceed = (res, editor) => {
    const resultMarkDown = `![${res.url}](${res.url})`;
    editor = editor.CodeMirror;
    if (!editor) {
      return false;
    }
    const doc = editor.getDoc();
    const { ch } = doc.getCursor();
    doc.replaceRange(`${ch ? '\n' : ''}${resultMarkDown}`, editor.getCursor());
    // editor.CodeMirror.replaceRange('replace', editor.CodeMirror.getCursor(), { line: editor.CodeMirror.getCursor().line, ch: editor.CodeMirror.getCursor().ch + 7 })
  }
  $(document).on('dragenter dragover dragleave', '.CodeMirror', myPrventDefault);
  $(document).on('drop', '.CodeMirror', onDrop);
})();