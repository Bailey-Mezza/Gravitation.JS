const canvas = document.querySelector('canvas');
let content = null;

if (canvas) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  content = canvas.getContext('2d');
  content.fillStyle = '#000000';
  content.fillRect(0, 0, canvas.width, canvas.height);
}

export { canvas, content };
