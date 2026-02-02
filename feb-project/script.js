/***********************
 * IMAGE PRELOAD
 ***********************/
const imageSources = [
  './images/1.jpg',
  './images/2.jpg',
  './images/3.jpg',
  './images/4.jpg',
  './images/5.jpg',
  './images/6.jpg',
  './images/7.png',
  './images/8.jpg',
  './images/9.jpg',
  './images/10.jpg',
  './images/11.jpg',
  './images/12.jpg',
  './images/13.png',
  './images/14.png',
  './images/15.png',
  './images/16.png',
  './images/17.jpg',
  './images/18.jpg',
  './images/19.jpg',
  './images/25.jpeg',
  './images/50.png',
  './images/26.jpg',
  './images/last1.jpg',
  './images/sh.png',

  // backgrounds & effects
  './images/bg.jpg',
  './images/heart.webp',
  './images/heartbg1.jpg',
  './images/heartbg2.jpg',
  './images/heartbg3.jpg'
];

imageSources.forEach(src => {
  const img = new Image();
  img.src = src;
});


/***********************
 * GLOBAL STATE
 ***********************/
let highestZ = 1;
let zoomApplied = false;
let musicStarted = false;


/***********************
 * AUDIO SETUP
 ***********************/
const playlist = [
  { audio: new Audio('/audio/4.mp3'), gain: 1.0 },
  { audio: new Audio('/audio/2.mp3'), gain: 1.4 },
  { audio: new Audio('/audio/bengali.mp3'), gain: 1.2 }
];

let currentTrack = 0;
const MAX_VOLUME = 0.25;
const FADE_DURATION = 1.5;

playlist.forEach(track => {
  track.audio.volume = 0;
  track.audio.preload = 'auto';
});

function fadeIn(track) {
  const audio = track.audio;
  const targetVolume = MAX_VOLUME * track.gain;
  audio.volume = 0;
  audio.play();

  let step = targetVolume / 30;
  let interval = setInterval(() => {
    if (audio.volume < targetVolume) {
      audio.volume = Math.min(targetVolume, audio.volume + step);
    } else {
      clearInterval(interval);
    }
  }, FADE_DURATION * 30);
}

function fadeOut(track, callback) {
  const audio = track.audio;
  let step = audio.volume / 30;

  let interval = setInterval(() => {
    if (audio.volume > 0) {
      audio.volume = Math.max(0, audio.volume - step);
    } else {
      clearInterval(interval);
      audio.pause();
      audio.currentTime = 0;
      if (callback) callback();
    }
  }, FADE_DURATION * 30);
}

function playNextTrack() {
  const track = playlist[currentTrack];
  fadeIn(track);

  track.audio.onended = () => {
    fadeOut(track, () => {
      currentTrack = (currentTrack + 1) % playlist.length;
      playNextTrack();
    });
  };
}


/***********************
 * PAPER CLASS
 ***********************/
class Paper {
  holdingPaper = false;
  mouseX = 0;
  mouseY = 0;
  prevMouseX = 0;
  prevMouseY = 0;
  velX = 0;
  velY = 0;
  rotation = Math.random() * 30 - 15;
  currentPaperX = 0;
  currentPaperY = 0;
  rotating = false;
  dragStartTime = 0;
  dragActivated = false;

  init(paper) {

    document.addEventListener('mousemove', (e) => {
      if (!this.rotating) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        this.velX = this.mouseX - this.prevMouseX;
        this.velY = this.mouseY - this.prevMouseY;
      }

      if (this.holdingPaper && !this.dragActivated) {
        if (
          Date.now() - this.dragStartTime > 120 ||
          Math.abs(this.velX) + Math.abs(this.velY) > 12
        ) {
          this.dragActivated = true;
          releaseHeart(this.mouseX, this.mouseY);
        } else return;
      }

      if (this.holdingPaper) {
        const speed = Math.abs(this.velX) + Math.abs(this.velY);
        if (speed > 6 && Math.random() < 0.04) {
          releaseHeart(this.mouseX, this.mouseY);
        }

        this.currentPaperX += this.velX;
        this.currentPaperY += this.velY;

        this.prevMouseX = this.mouseX;
        this.prevMouseY = this.mouseY;

        paper.style.transform = `
          translate(${this.currentPaperX}px, ${this.currentPaperY}px)
          rotateZ(${this.rotation}deg)
          scale(${zoomApplied ? 1.1 : 0.95})
        `;
      }
    });

    paper.addEventListener('mousedown', () => {
      if (!musicStarted) {
        musicStarted = true;
        playNextTrack();
      }

      this.dragStartTime = Date.now();
      this.dragActivated = false;
      this.holdingPaper = true;

      if (!zoomApplied) {
        zoomApplied = true;
        document.querySelectorAll('.paper').forEach(p => {
          p.style.transition = 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)';
        });
      }

      paper.style.zIndex = highestZ++;
      this.prevMouseX = this.mouseX;
      this.prevMouseY = this.mouseY;
    });

    window.addEventListener('mouseup', () => {
      this.holdingPaper = false;
      this.rotating = false;
    });
  }
}

document.querySelectorAll('.paper').forEach(paper => {
  const p = new Paper();
  p.init(paper);
  paper.style.transform = `scale(0.95) rotateZ(${Math.random() * 30 - 15}deg)`;
});


/***********************
 * PAPER BACKGROUNDS
 ***********************/
const paperBackgrounds = [
  './images/heartbg1.jpg',
  './images/heartbg3.jpg'
];

let bgIndex = 0;
document.querySelectorAll('.paper').forEach(paper => {
  paper.style.setProperty('--paper-bg', `url(${paperBackgrounds[bgIndex]})`);
  bgIndex = (bgIndex + 1) % paperBackgrounds.length;
});


/***********************
 * HEART EFFECT
 ***********************/
function releaseHeart(x, y) {
  const heart = document.createElement('div');
  heart.className = 'floating-heart';
  const hearts = ['💗', '💖', '💘'];
  heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
  heart.style.left = x + 'px';
  heart.style.top = y + 'px';
  heart.style.setProperty('--drift', Math.random() * 80 - 40 + 'px');
  document.body.appendChild(heart);

  setTimeout(() => heart.remove(), 3800);
}


/***********************
 * SIGNATURE CARD
 ***********************/
const signatureCard = document.getElementById('signature-card');
const signatureText = document.getElementById('signature-text');
const signatureMessage = "— from someone who chose you 🤍";
let sigIndex = 0;
let signatureRevealed = false;
let revealTimer = null;

function typeSignature() {
  if (signatureRevealed) return;
  signatureRevealed = true;
  signatureText.style.display = 'block';

  const interval = setInterval(() => {
    signatureText.textContent += signatureMessage[sigIndex];
    sigIndex++;
    if (sigIndex >= signatureMessage.length) clearInterval(interval);
  }, 90);
}

if (signatureCard) {
  signatureCard.addEventListener('mousedown', () => {
    revealTimer = setTimeout(() => {
      signatureCard.classList.add('revealed');
      signatureCard.querySelector('.hint')?.remove();
      typeSignature();
    }, 1000);
  });

  window.addEventListener('mouseup', () => {
    clearTimeout(revealTimer);
  });
}


/***********************
 * 🔥 DOWNLOAD FIX (IMPORTANT)
 ***********************/
function prepareCardsForDownload() {
  document.querySelectorAll('.paper').forEach(card => {
    card.dataset.prevTransform = card.style.transform || '';
    card.style.transform = 'none';
    card.style.transition = 'none';
    card.classList.add('force-visible');
  });
}

function restoreCardsAfterDownload() {
  document.querySelectorAll('.paper').forEach(card => {
    card.style.transform = card.dataset.prevTransform;
    card.style.transition = '';
    card.classList.remove('force-visible');
  });
}



/***********************
 * 💗 DOWNLOAD WITH PROGRESS + HEART BURST
 ***********************/

document.getElementById("downloadCards").addEventListener("click", async () => {
  const overlay = document.getElementById("downloadOverlay");
  const progressFill = document.getElementById("progressFill");
  const progressText = document.getElementById("progressText");
  const progressPercent = document.getElementById("progressPercent");
  const progressHeart = document.getElementById("progressHeart");

  // Show overlay
  overlay.classList.remove("hidden");
  overlay.style.opacity = "1";

  // Reset UI
  progressFill.style.width = "0%";
  progressPercent.textContent = "0%";
  progressHeart.style.left = "0%";
  progressHeart.textContent = "💗";
  progressText.textContent = "Preparing the cards… 🤍";

  prepareCardsForDownload();
  await document.fonts.ready;
  await new Promise(r => setTimeout(r, 300));

  const zip = new JSZip();
  const cards = document.querySelectorAll(".paper");
  const total = cards.length;

  for (let i = 0; i < total; i++) {

    // Let browser breathe
    await new Promise(r => requestAnimationFrame(r));

    const canvas = await html2canvas(cards[i], {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null
    });

    const imgData = canvas.toDataURL("image/png");
    zip.file(
      `card-${String(i + 1).padStart(2, "0")}.png`,
      imgData.split(",")[1],
      { base64: true }
    );

    // 🔥 PROGRESS UPDATE
    const percent = Math.round(((i + 1) / total) * 100);

    progressFill.style.width = percent + "%";
    progressPercent.textContent = percent + "%";
    progressHeart.style.left = percent + "%";
    progressText.textContent = `Preparing card ${i + 1} of ${total} 🤍`;

    // 💗 Heart stages
    if (percent < 40) {
      progressHeart.textContent = "💗";
    } else if (percent < 80) {
      progressHeart.textContent = "❤️";
    } else {
      progressHeart.textContent = "💘";
    }
  }

  /* 💥 HEART BURST AT 100% */
  progressText.textContent = "Made with love 💞";

  const heartRect = progressHeart.getBoundingClientRect();
  for (let i = 0; i < 8; i++) {
    const burst = document.createElement("div");
    burst.className = "floating-heart";
    burst.textContent = ["💗", "❤️", "💖", "💘"][Math.floor(Math.random() * 4)];
    burst.style.left = heartRect.left + heartRect.width / 2 + "px";
    burst.style.top = heartRect.top + "px";
    burst.style.setProperty("--drift", Math.random() * 120 - 60 + "px");
    document.body.appendChild(burst);

    setTimeout(() => burst.remove(), 4000);
  }

  // 🎁 Finalize ZIP
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "for-shweta-with-love.zip");

  restoreCardsAfterDownload();

  /* 🌙 SOFT FADE-OUT */
  overlay.style.transition = "opacity 0.8s ease";
  overlay.style.opacity = "0";

  setTimeout(() => {
    overlay.classList.add("hidden");
    overlay.style.transition = "";
    overlay.style.opacity = "1";
  }, 900);
});




/***********************
 * SNEAK PEEK OVERLAY
 ***********************/
const sneakOverlay = document.getElementById('sneakPeekOverlay');
const openSneakBtn = document.getElementById('openSneakPeek');
const closeSneakBtn = document.getElementById('closeSneakPeek');

openSneakBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  sneakOverlay.classList.add('active');
});

closeSneakBtn.addEventListener('click', () => {
  sneakOverlay.classList.remove('active');
});


/***********************
 * IMAGE SWITCH
 ***********************/
const sneakImages = document.querySelectorAll('.sneak-img');
let sneakIndex = 0;

function showSneakImage(index) {
  sneakImages.forEach((img, i) => {
    img.classList.toggle('active', i === index);
  });
}

document.getElementById('sneakNext').addEventListener('click', (e) => {
  e.stopPropagation();
  sneakIndex = (sneakIndex + 1) % sneakImages.length;
  showSneakImage(sneakIndex);
});

document.getElementById('sneakPrev').addEventListener('click', (e) => {
  e.stopPropagation();
  sneakIndex = (sneakIndex - 1 + sneakImages.length) % sneakImages.length;
  showSneakImage(sneakIndex);
});



function saveCardState(paper, state) {
  const id = paper.dataset.id;
  if (!id) return;

  localStorage.setItem(`paper-${id}`, JSON.stringify(state));
}
