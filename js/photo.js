// Bowl photo input: use the device camera when available, or choose an image.
const MealPhoto = (() => {
  let photoData = null;

  function setStatus(message, isError = false) {
    const status = document.getElementById('photo-status');
    status.textContent = message;
    status.className = isError ? 'status bad' : 'status';
    status.hidden = !message;
  }

  // Resize and encode photos before storing them with a meal in localStorage.
  function prepareImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Could not read this image.'));
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => reject(new Error('This image format could not be opened.'));
        image.onload = () => {
          const maxSize = 1280;
          const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(image.naturalWidth * scale);
          canvas.height = Math.round(image.naturalHeight * scale);
          canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.78));
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function clear() {
    photoData = null;
    document.getElementById('photo-preview').hidden = true;
    document.getElementById('photo-preview').removeAttribute('src');
    document.getElementById('photo-retake').hidden = true;
    document.getElementById('photo-camera').value = '';
    document.getElementById('photo-gallery').value = '';
    setStatus('');
  }

  async function handleFile(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setStatus('Please choose an image file.', true);
      event.target.value = '';
      return;
    }
    setStatus('Preparing photo…');
    try {
      photoData = await prepareImage(file);
      const preview = document.getElementById('photo-preview');
      preview.src = photoData;
      preview.hidden = false;
      document.getElementById('photo-retake').hidden = false;
      setStatus('Photo ready. It will be saved with this meal.');
    } catch (error) {
      photoData = null;
      setStatus(error.message || 'Could not prepare this image.', true);
    }
  }

  return { getData: () => photoData, clear, handleFile };
})();

App.register('log', {
  init() {
    document.getElementById('photo-take').addEventListener('click', () => document.getElementById('photo-camera').click());
    document.getElementById('photo-pick').addEventListener('click', () => document.getElementById('photo-gallery').click());
    document.getElementById('photo-camera').addEventListener('change', MealPhoto.handleFile);
    document.getElementById('photo-gallery').addEventListener('change', MealPhoto.handleFile);
    document.getElementById('photo-retake').addEventListener('click', () => {
      MealPhoto.clear();
      document.getElementById('photo-camera').click();
    });
  },
  onShow() { MealPhoto.clear(); }
});
