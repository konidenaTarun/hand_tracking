
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const cursor = document.getElementById("cursor");
const startBtn = document.getElementById("startBtn");
const statusDiv = document.getElementById("status");
const camStatus = document.getElementById("cam-status");
const handStatus = document.getElementById("hand-status");
const gestureStatus = document.getElementById("gesture-status");
const posStatus = document.getElementById("pos-status");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let curX = window.innerWidth / 2;
let curY = window.innerHeight / 2;
const smoothing = 0.3; 
function distance(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

hands.onResults((results) => {

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];

    handStatus.textContent = "Detected ✓";
    handStatus.style.color = "#00ff00";
    
    ctx.fillStyle = "#00ffff";
    for (let landmark of landmarks) {
      const x = (1 - landmark.x) * canvas.width; 
      const y = landmark.y * canvas.height;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    }
    

    const indexTip = landmarks[8];
    const targetX = (1 - indexTip.x) * window.innerWidth;
    const targetY = indexTip.y * window.innerHeight;
    
 
    curX += (targetX - curX) * smoothing;
    curY += (targetY - curY) * smoothing;
    

    cursor.style.left = curX + "px";
    cursor.style.top = curY + "px";
    

    posStatus.textContent = `${Math.round(curX)}, ${Math.round(curY)}`;
    
  
    const thumbTip = landmarks[4];
    const dist = distance(
      {x: thumbTip.x, y: thumbTip.y},
      {x: indexTip.x, y: indexTip.y}
    );
    
    if (dist < 0.05) {
      cursor.classList.add("pinch");
      gestureStatus.textContent = "Pinch 🤏";
    } else {
      cursor.classList.remove("pinch");
      gestureStatus.textContent = "Point 👆";
    }
  } else {
    handStatus.textContent = "Not detected";
    handStatus.style.color = "#ff6666";
    gestureStatus.textContent = "None";
  }
});

startBtn.addEventListener("click", async () => {
  startBtn.textContent = "⏳ Starting...";
  startBtn.disabled = true;
  
  try {

    const camera = new Camera(video, {
      onFrame: async () => {
        try {
          await hands.send({ image: video });
        } catch (err) {
          console.error("Error processing frame:", err);
        }
      },
      width: 640,
      height: 480
    });

    await camera.start();
   
    startBtn.classList.add("hidden");
    statusDiv.style.display = "block";
    camStatus.textContent = "Active ✓";
    camStatus.style.color = "#00ff00";
    
  } catch (err) {
    console.error("Camera error:", err);
    startBtn.textContent = "❌ Camera Access Denied";
    startBtn.style.background = "linear-gradient(135deg, #ff6666, #ff3333)";
    
    setTimeout(() => {
      startBtn.textContent = "🔄 Try Again";
      startBtn.disabled = false;
      startBtn.style.background = "linear-gradient(135deg, #00ffff, #00aaff)";
    }, 2000);
  }
});

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
