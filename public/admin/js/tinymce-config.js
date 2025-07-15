tinymce.init({
  selector: "textarea.textarea-tinymce",
  plugins: [
    "advlist", "anchor", "autolink", "charmap", "code", "fullscreen",
    "help", "image", "insertdatetime", "link", "lists", "media",
    "preview", "searchreplace", "table", "visualblocks", "accordion"
  ],
  toolbar: "undo redo | link image accordion | styles | bold italic underline strikethrough | align | bullist numlist",
  height: 300,

  automatic_uploads: false,
  paste_data_images: true, // ✅ Phải có dòng này
  file_picker_types: 'image',
  file_picker_callback: (cb, value, meta) => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.addEventListener('change', function () {
      const file = this.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const id = 'blobid' + Date.now();
        const base64 = reader.result.split(',')[1];
        const blobCache = tinymce.activeEditor.editorUpload.blobCache;
        const blobInfo = blobCache.create(id, file, base64);
        blobCache.add(blobInfo);
        cb(blobInfo.blobUri(), { title: file.name });
      };
      reader.readAsDataURL(file);
    });
    input.click();
  }
});
