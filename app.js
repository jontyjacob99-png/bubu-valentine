const $ = (sel) => document.querySelector(sel);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function showScene(id){
  document.querySelectorAll(".scene").forEach(s => {
    s.classList.add("scene--hidden");
    s.classList.remove("scene--active");
  });
  const el = document.getElementById(id);
  el.classList.remove("scene--hidden");
  el.classList.add("scene--active");
}

/* Clouds “video-like” canvas */
function startCloudsCanvas(){
  const canvas = $("#cloudsCanvas");
  const ctx = canvas.getContext("2d", { alpha: false });

  function resize(){
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(canvas.clientWidth * dpr);
    canvas.height = Math.floor(canvas.clientHeight * dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  window.addEventListener("resize", resize);
  resize();

  const blobs = Array.from({ length: 34 }).map((_, i) => ({
    x: Math.random() * canvas.clientWidth,
    y: Math.random() * canvas.clientHeight,
    r: 140 + Math.random() * 260,
    vx: 0.09 + Math.random() * 0.16,
    vy: 0.02 + Math.random() * 0.05,
    a: 0.12 + Math.random() * 0.16,
    layer: i % 3
  }));

  let t = 0;
  function frame(){
    const w = canvas.clientWidth, h = canvas.clientHeight;
    t += 0.003;

    const g = ctx.createLinearGradient(0,0,0,h);
    g.addColorStop(0, "#0b1020");
    g.addColorStop(0.55, "#070a14");
    g.addColorStop(1, "#050714");
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);

    for(const b of blobs){
      const speed = b.layer === 0 ? 0.35 : b.layer === 1 ? 0.65 : 1.0;

      b.x += b.vx * speed;
      b.y += b.vy * speed * Math.sin(t + b.x * 0.002);

      if(b.x - b.r > w) b.x = -b.r;
      if(b.y - b.r > h) b.y = -b.r;
      if(b.y + b.r < 0) b.y = h + b.r;

      const pulse = 1 + 0.05 * Math.sin(t * 3 + b.x * 0.01);
      const r = b.r * pulse;

      const cg = ctx.createRadialGradient(b.x, b.y, r*0.10, b.x, b.y, r);
      cg.addColorStop(0, `rgba(255,255,255,${0.26*b.a})`);
      cg.addColorStop(0.55, `rgba(255,255,255,${0.12*b.a})`);
      cg.addColorStop(1, "rgba(255,255,255,0)");

      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(b.x, b.y, r, 0, Math.PI*2);
      ctx.fill();
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* Compute just-touch without overlap, leaving gap for heart */
function computeTouchTransforms(){
  const stage = $("#worldStage");
  const left = $("#imgLeftWrap");
  const right = $("#imgRightWrap");

  left.style.transform = "translateY(-50%) translateX(0px)";
  right.style.transform = "translateY(-50%) translateX(0px)";

  const stageRect = stage.getBoundingClientRect();
  const leftRect = left.getBoundingClientRect();
  const rightRect = right.getBoundingClientRect();

  const targetGap = Math.min(54, Math.max(34, stageRect.width * 0.05)); // 34–54px
  const currentGap = rightRect.left - leftRect.right;
  const shrinkBy = currentGap - targetGap;

  const moveEach = Math.max(0, shrinkBy / 2);
  return { leftX: moveEach, rightX: -moveEach };
}

async function runScene1(){
  const text = $("#scene1Text");
  const left = $("#imgLeftWrap");
  const right = $("#imgRightWrap");
  const heart = $("#midHeart");

  heart.classList.remove("show", "thump");
  text.classList.remove("show");

  await sleep(60);

  const { leftX, rightX } = computeTouchTransforms();

  // Text appears immediately
  text.textContent = "Even though we are so far apart, you always keep me close.";
  text.classList.add("show");

  // Start moving closer immediately
  left.style.transform = `translateY(-50%) translateX(${leftX}px)`;
  right.style.transform = `translateY(-50%) translateX(${rightX}px)`;

  // Text stays 3s
  await sleep(3000);
  text.classList.remove("show");

  // Wait until they’re basically meeting (transition is 4200ms)
  await sleep(1350);

  // Heart pops + 2-beat thump
  heart.classList.add("show");
  heart.classList.remove("thump");
  void heart.offsetWidth; // restart animation reliably
  heart.classList.add("thump");

  text.textContent = "I love you more than you love PUTTU AND KADALA";
  await sleep(120);
  text.classList.add("show");

  // Keep this scene 4 seconds
  await sleep(4000);

  text.classList.remove("show");
  heart.classList.remove("show", "thump");
  await sleep(350);
}

async function runPuttuScene(){
  showScene("scenePut");

  const wrap = $("#putImgWrap");
  wrap.classList.remove("putPunchIn", "putShake", "putImpactOn");

  await sleep(120);
  wrap.classList.add("putPunchIn", "putImpactOn");
  await sleep(260);
  wrap.classList.add("putShake");

  await sleep(4000);

  wrap.classList.remove("putPunchIn", "putShake", "putImpactOn");
}

async function runScene2(){
  const l1 = $("#scene2Line1");
  const l2 = $("#scene2Line2");

  l1.classList.remove("show");
  l2.classList.remove("show");
  l1.textContent = "";
  l2.textContent = "";

  l1.textContent = "I KNOW YOURE MY VALENTINE, NOW AND FORVER.";
  await sleep(120);
  l1.classList.add("show");

  await sleep(2200);

  l2.textContent = "BUT STILL";
  await sleep(120);
  l2.classList.add("show");

  await sleep(1400);
}

/* Faster + more dense heart confetti */
function startHeartsConfetti(){
  const canvas = $("#confetti");
  const ctx = canvas.getContext("2d");

  let w, h, dpr;
  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  window.addEventListener("resize", resize);
  resize();

  const hearts = ["❤️","💖","💘","💕","💗","💓","💞"];
  const pieces = Array.from({ length: 240 }).map(() => ({
    x: Math.random() * w,
    y: -80 - Math.random() * h,
    s: 18 + Math.random() * 20,
    vx: -1.2 + Math.random() * 2.4,
    vy: 2.8 + Math.random() * 4.8,
    a: Math.random() * Math.PI * 2,
    va: -0.04 + Math.random() * 0.08,
    t: hearts[Math.floor(Math.random() * hearts.length)],
    life: 180 + Math.random() * 160
  }));

  function frame(){
    ctx.clearRect(0,0,w,h);

    for(const p of pieces){
      p.x += p.vx;
      p.y += p.vy;
      p.a += p.va;
      p.vy += 0.01;
      p.life -= 1;

      if(p.y > h + 90 || p.x < -120 || p.x > w + 120 || p.life <= 0){
        p.x = Math.random() * w;
        p.y = -80 - Math.random() * 220;
        p.s = 18 + Math.random() * 20;
        p.vx = -1.2 + Math.random() * 2.4;
        p.vy = 3.0 + Math.random() * 5.0;
        p.a = Math.random() * Math.PI * 2;
        p.va = -0.04 + Math.random() * 0.08;
        p.t = hearts[Math.floor(Math.random() * hearts.length)];
        p.life = 180 + Math.random() * 160;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.a);
      ctx.font = `${p.s}px Inter, system-ui, Apple Color Emoji, Segoe UI Emoji`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.globalAlpha = 0.98;
      ctx.fillText(p.t, 0, 0);
      ctx.restore();
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function bindYes(){
  document.querySelectorAll(".yesBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      showScene("scene4");

      const finalWrap = $("#finalWrap");
      finalWrap.classList.remove("finalHidden");
      finalWrap.classList.add("finalShow");

      startHeartsConfetti();
    });
  });
}

(async function main(){
  startCloudsCanvas();
  bindYes();

  window.addEventListener("resize", () => {
    if ($("#scene1").classList.contains("scene--active")) {
      const { leftX, rightX } = computeTouchTransforms();
      $("#imgLeftWrap").style.transform = `translateY(-50%) translateX(${leftX}px)`;
      $("#imgRightWrap").style.transform = `translateY(-50%) translateX(${rightX}px)`;
    }
  });

  $("#startBtn").addEventListener("click", async () => {
    showScene("scene1");
    await sleep(160);

    await runScene1();
    await runPuttuScene();

    showScene("scene2");
    await runScene2();

    showScene("scene3");
  });
})();
