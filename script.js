const EVENT_TIME = new Date("2027-07-07T19:00:00+03:00").getTime();
const WHATSAPP = "https://wa.me/970598494977";
const guest = /^g(?:0[1-9]|1\d|2[0-5])$/.test(new URLSearchParams(location.search).get("guest") || "")
  ? new URLSearchParams(location.search).get("guest") : "g01";

const intro = document.getElementById("intro");
const video = document.getElementById("introVideo");
const openButton = document.getElementById("openInvitation");
const soundButton = document.getElementById("soundButton");
const pages = document.getElementById("pages");

openButton.addEventListener("click", async () => {
  openButton.hidden = true;
  soundButton.hidden = false;
  video.muted = false;
  try { await video.play(); } catch { video.muted = true; await video.play(); }
});
soundButton.addEventListener("click", () => {
  video.muted = !video.muted;
  soundButton.textContent = video.muted ? "🔇" : "🔊";
  soundButton.setAttribute("aria-label", video.muted ? "تشغيل صوت الفيديو" : "إغلاق صوت الفيديو");
});
video.addEventListener("ended", () => {
  intro.hidden = true;
  pages.hidden = false;
  scrollTo(0, 0);
  requestAnimationFrame(paintScratch);
});

function updateCountdown() {
  const left = Math.max(0, EVENT_TIME - Date.now());
  const values = [
    Math.floor(left / 86400000),
    Math.floor((left / 3600000) % 24),
    Math.floor((left / 60000) % 60),
    Math.floor((left / 1000) % 60)
  ];
  ["days", "hours", "minutes", "seconds"].forEach((id, i) => {
    document.getElementById(id).textContent = String(values[i]).padStart(2, "0");
  });
}
updateCountdown();
setInterval(updateCountdown, 1000);

const prizes = {
  g04: "مبروك! ربحتِ ساعة أنيقة ⌚",
  g09: "مبروك! ربحتِ شنطة أنيقة 👜",
  g14: "مبروك! ربحتِ نظارة شمسية 🕶️",
  g19: "مبروك! ربحتِ هدية من سيفورا 💄",
  g24: "مبروك! ربحتِ هدية من سيفورا 🎁"
};
const scratchKey = `yasmeen-scratch-${guest}`;
const savedScratch = localStorage.getItem(scratchKey);
const canvas = document.getElementById("scratchCanvas");
const result = document.getElementById("scratchResult");
let drawing = false;

function prizeText() { return prizes[guest] || "ما ربحتِ هون… بس أحلى سهرة بانتظاركِ 💙🍋"; }
function revealScratch() {
  const text = prizeText();
  localStorage.setItem(scratchKey, text);
  result.textContent = text;
  canvas.hidden = true;
}
function paintScratch() {
  if (savedScratch) { result.textContent = savedScratch; canvas.hidden = true; return; }
  const rect = canvas.getBoundingClientRect();
  const ratio = devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);
  const ctx = canvas.getContext("2d");
  ctx.scale(ratio, ratio);
  const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
  gradient.addColorStop(0, "#f5f5f5"); gradient.addColorStop(.45, "#aeb4bd"); gradient.addColorStop(1, "#e8e8e8");
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, rect.width, rect.height);
  ctx.fillStyle = "#2454a6"; ctx.font = "600 16px Arial"; ctx.textAlign = "center";
  ctx.fillText("اكشطي هنا", rect.width / 2, rect.height / 2);
}
function scratchAt(event) {
  if (!drawing || canvas.hidden) return;
  const rect = canvas.getBoundingClientRect();
  const ratio = devicePixelRatio || 1;
  const ctx = canvas.getContext("2d");
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc((event.clientX - rect.left) * ratio, (event.clientY - rect.top) * ratio, 24 * ratio, 0, Math.PI * 2);
  ctx.fill();
}
canvas.addEventListener("pointerdown", e => { drawing = true; canvas.setPointerCapture(e.pointerId); scratchAt(e); });
canvas.addEventListener("pointermove", scratchAt);
canvas.addEventListener("pointerup", () => { drawing = false; revealScratch(); });
canvas.addEventListener("pointercancel", () => { drawing = false; });

const likeButton = document.getElementById("likeButton");
const likeKey = `yasmeen-liked-${guest}`;
if (localStorage.getItem(likeKey)) likeButton.classList.add("liked");
likeButton.addEventListener("click", () => {
  localStorage.setItem(likeKey, "1");
  likeButton.classList.add("liked");
});

document.getElementById("feedbackForm").addEventListener("submit", event => {
  event.preventDefault();
  const text = document.getElementById("feedback").value.trim();
  if (!text) return;
  localStorage.setItem(`yasmeen-feedback-${guest}`, text);
  open(`${WHATSAPP}?text=${encodeURIComponent(`رأيي في كرت Bridal Shower ياسمين: ${text}`)}`, "_blank", "noopener,noreferrer");
});
