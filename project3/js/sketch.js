let model3D;
let gfx;
let asciiOutput;
let detailSlider;
let detailValue;

const ASCII_CHARS = " +*#%@";
let rotationY = 0;

function preload() {
  // Load OBJ file here (duh)
  model3D = loadModel("./assets/model.obj", true);
}

function setup() {
  noCanvas();

  asciiOutput = select("#ascii-output");
  detailSlider = select("#detail-slider");
  detailValue = select("#detail-value");

  // Offscreen WEBGL buffer where the model is rendered
  gfx = createGraphics(500, 500, WEBGL);
  gfx.pixelDensity(1);

  detailSlider.input(() => {
    detailValue.html(detailSlider.value());
  });

  detailValue.html(detailSlider.value());

  frameRate(24);
}

function draw() {
  renderModelToBuffer();
  convertBufferToASCII();
  rotationY += 0.01;
}

function renderModelToBuffer() {
  gfx.background(0);

  // lighting
  gfx.ambientLight(60);
  gfx.directionalLight(255, 255, 255, 0.4, 0.3, -1);
  gfx.pointLight(180, 180, 180, 0, 0, 250);

  // camera-like transformations 
  gfx.push();
  gfx.noStroke();
  gfx.normalMaterial();

  // Move model slightly upward (only  needed if the model is not centered)
  gfx.rotateY(rotationY);
  gfx.rotateX(-0.2);

  // Adjust scale (might need to adjust depending on the size of the model...god I hate p5)
  gfx.scale(1.8);

  gfx.model(model3D);
  gfx.pop();
}

function convertBufferToASCII() {
  gfx.loadPixels();

  const step = parseInt(detailSlider.value(), 10);

  let asciiText = "";

  // Because WEBGL buffer origin behavior can be different,
  // reading top-to-bottom may appear flipped depending on model/camera. WEIRD.
  for (let y = 0; y < gfx.height; y += step) {
    for (let x = 0; x < gfx.width; x += step) {
      const index = 4 * (x + y * gfx.width);

      const r = gfx.pixels[index + 0];
      const g = gfx.pixels[index + 1];
      const b = gfx.pixels[index + 2];

      const brightness = (r + g + b) / 3;
      const charIndex = floor(map(brightness, 0, 255, 0, ASCII_CHARS.length - 1));
      const c = ASCII_CHARS.charAt(charIndex);

      // Non-breaking space so dark regions still preserve layout 
      asciiText += c === " " ? "&nbsp;" : c;
    }
    asciiText += "<br/>";
  }

  asciiOutput.html(asciiText);
}

function windowResized() {
  // Keeps the render buffer fixed for stability.
  // I don't need to do anything here (I think?).
}