// ==UserScript==
// @name         ithelp image drag and upload
// @namespace    https://github.com/dragonH/ithelp-drag-and-upload-image
// @version      0.2
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
    if (['image/jpg', 'image/jpeg', 'image/png'].indexOf(image.type) > -1) {
      uploadToIthelp(image, editor);
      return false;
    }
    if (['image/gif'].indexOf(image.type) > -1) {
      uploadToCC(image, editor);
      return false;
    }
  }
  const uploadSucceed = (url, editor) => {
    const resultMarkDown = `![${url}](${url})`;
    editor = editor.CodeMirror;
    if (!editor) {
      return false;
    }
    const doc = editor.getDoc();
    const { ch } = doc.getCursor();
    doc.replaceRange(`${ch ? '\n' : ''}${resultMarkDown}`, editor.getCursor());
    // editor.CodeMirror.replaceRange('replace', editor.CodeMirror.getCursor(), { line: editor.CodeMirror.getCursor().line, ch: editor.CodeMirror.getCursor().ch + 7 })
  }
  const uploadToIthelp = (image, editor) => {
    const myFormData = new FormData();
    myFormData.append('images[]', image);
    const url = '/api/upload';
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
        const imageUrl = res.url;
        uploadSucceed(imageUrl, editor);
        alert(`上傳成功!\n圖片網址:\n${imageUrl}`)
      }
    })
  };

  const uploadToCC = (image, editor) => {
    const url = 'https://cors-anywhere.herokuapp.com/https://upload.cc/image_upload';
    const myFormData = new FormData();
    myFormData.append('uploaded_file[]', image);
    $.ajax({
      url,
      data: myFormData,
      processData: false,
      contentType: false,
      type: 'POST',
      success: (res) => {
        const data = JSON.parse(res);
        if (data.total_error) {
          alert('上傳失敗');
          return false;
        }
        const imageUrl = `https://upload.cc/${data.success_image[0].url}`;
        uploadSucceed(imageUrl, editor);
        alert(`上傳成功!\n圖片網址:\nhttps://upload.cc/${imageUrl}`)
      }
    });
  };
  $(document).on('dragenter dragover dragleave', '.CodeMirror', myPrventDefault);
  $(document).on('drop', '.CodeMirror', onDrop);
})();