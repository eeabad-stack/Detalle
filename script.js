const screens = [...document.querySelectorAll(".screen")];
const music = document.getElementById("backgroundMusic");
const musicToggle = document.getElementById("musicToggle");
const musicLabel = document.getElementById("musicLabel");
const openLetter = document.getElementById("openLetter");
const letterText = document.getElementById("letterText");
const photoDialog = document.getElementById("photoDialog");
const photoMessage = document.getElementById("photoMessage");

// Los navegadores suelen bloquear el autoplay con sonido.
// Intenta iniciar la canción en la primera interacción de la usuaria.
let musicStartedByGesture = false;
async function startMusicOnFirstGesture() {
  if (musicStartedByGesture) return;
  musicStartedByGesture = true;
  try {
    await music.play();
    musicToggle.setAttribute("aria-pressed", "true");
    musicLabel.textContent = "Pausar música";
  } catch {
    musicToggle.setAttribute("aria-pressed", "false");
    musicLabel.textContent = "Activar música";
  }
  document.removeEventListener("pointerdown", startMusicOnFirstGesture);
  document.removeEventListener("keydown", startMusicOnFirstGesture);
}
document.addEventListener("pointerdown", startMusicOnFirstGesture, { once: true });
document.addEventListener("keydown", startMusicOnFirstGesture, { once: true });

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
    try {
      await music.play();
      musicToggle.setAttribute("aria-pressed", "true");
      musicLabel.textContent = "Pausar música";
    } catch {
      musicLabel.textContent = "Añade assets/audio/cancion.mp3";
    }
  } else {
    music.pause();
    musicToggle.setAttribute("aria-pressed", "false");
    musicLabel.textContent = "Reproducir música";
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
