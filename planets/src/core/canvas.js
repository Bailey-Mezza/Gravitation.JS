const canvas = document.querySelector('canvas');
// 2D drawing context (may be null if no canvas found).
let content = null;

if (canvas) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

   // One-time clear: paint a black background.
  content = canvas.getContext('2d');
  content.fillStyle = '#000000';
  content.fillRect(0, 0, canvas.width, canvas.height);
}

export { canvas, content };
