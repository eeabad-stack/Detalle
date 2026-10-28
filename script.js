const screens = [...document.querySelectorAll(".screen")];
const music = document.getElementById("backgroundMusic");
const musicToggle = document.getElementById("musicToggle");
const musicLabel = document.getElementById("musicLabel");
const openLetter = document.getElementById("openLetter");
const letterText = document.getElementById("letterText");
const photoDialog = document.getElementById("photoDialog");
const photoMessage = document.getElementById("photoMessage");

// En móviles, el autoplay con sonido puede estar bloqueado por el navegador.
// Se intenta al cargar la página y se vuelve a intentar en la primera interacción.
// Este mismo elemento de audio se mantiene activo al cambiar de pantalla.
let musicStarted = false;

function updateMusicButton(playing) {
  musicToggle.setAttribute("aria-pressed", playing ? "true" : "false");
  musicLabel.textContent = playing ? "Pausar música" : "Activar música";
}

async function tryStartMusic() {
  if (!music.paused) {
    musicStarted = true;
    updateMusicButton(true);
    return true;
  }
  try {
    await music.play();
    musicStarted = true;
    updateMusicButton(true);
    return true;
  } catch (error) {
    updateMusicButton(false);
    return false;
  }
}

// Intento automático al abrir. Si el navegador lo permite, sonará inmediatamente.
music.loop = true;
music.preload = "auto";
window.addEventListener("load", () => {
  tryStartMusic();
});

// En móviles suele ser necesario un primer toque. Escuchamos varias clases
// de interacción para cubrir Safari/Chrome sin exigir que se pulse un botón concreto.
function startMusicFromGesture() {
  tryStartMusic();
  document.removeEventListener("touchstart", startMusicFromGesture, true);
  document.removeEventListener("pointerdown", startMusicFromGesture, true);
  document.removeEventListener("click", startMusicFromGesture, true);
  document.removeEventListener("keydown", startMusicFromGesture, true);
}
document.addEventListener("touchstart", startMusicFromGesture, { capture: true, passive: true });
document.addEventListener("pointerdown", startMusicFromGesture, true);
document.addEventListener("click", startMusicFromGesture, true);
document.addEventListener("keydown", startMusicFromGesture, true);

function showScreen(id) {
  screens.forEach((screen) => {
    const active = screen.id === id;
    screen.hidden = !active;
    screen.classList.toggle("active", active);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll("[data-go]").forEach((button) => {
  button.addEventListener("click", () => showScreen(button.dataset.go));
});

musicToggle.addEventListener("click", async () => {
  if (music.paused) {
    const started = await tryStartMusic();
    if (!started) musicLabel.textContent = "Toca para activar música";
  } else {
    music.pause();
    updateMusicButton(false);
  }
});

let letterAnimationTimer;
openLetter.addEventListener("click", () => {
  const isOpen = letterText.classList.contains("is-open");
  window.clearTimeout(letterAnimationTimer);

  if (isOpen) {
    letterText.classList.remove("is-open");
    letterText.setAttribute("aria-hidden", "true");
    openLetter.classList.remove("is-opening", "is-unrolling");
    openLetter.setAttribute("aria-expanded", "false");
    document.getElementById("envelopeLabel").textContent = "Toca para desatar el lazo";
    return;
  }

  // Primero se desata y sale el lazo rojo; después el pergamino comienza a desenrollarse.
  openLetter.classList.add("is-opening");
  openLetter.setAttribute("aria-expanded", "true");
  document.getElementById("envelopeLabel").textContent = "El lazo se está soltando…";
  letterAnimationTimer = window.setTimeout(() => {
    openLetter.classList.add("is-unrolling");
    document.getElementById("envelopeLabel").textContent = "Tu mensaje está apareciendo ♡";
    letterText.classList.add("is-open");
    letterText.setAttribute("aria-hidden", "false");
    letterAnimationTimer = window.setTimeout(() => {
      document.getElementById("envelopeLabel").textContent = "Tu carta está abierta ♡";
      letterText.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 850);
  }, 950);
});

document.querySelectorAll(".photo-card").forEach((card) => {
  card.addEventListener("click", () => {
    photoMessage.textContent = card.dataset.caption;
    if (typeof photoDialog.showModal === "function") {
      photoDialog.showModal();
    } else {
      alert(card.dataset.caption);
    }
  });
});

document.getElementById("closePhoto").addEventListener("click", () => photoDialog.close());
photoDialog.addEventListener("click", (event) => {
  if (event.target === photoDialog) photoDialog.close();
});
