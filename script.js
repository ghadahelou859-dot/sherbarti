const EVENT_TIME = new Date("2027-07-07T19:00:00+03:00").getTime();
const WHATSAPP = "https://wa.me/970598494977";
const guest = /^g(?:0[1-9]|1\d|2[0-5])$/.test(new URLSearchParams(location.search).get("guest") || "")
  ? new URLSearchParams(location.search).get("guest") : "g01";

const intro = document.getElementById("intro");
const video = document.getElementById("introVideo");
const openButton = document.getElementById("openInvitation");
const soundButton = document.getElementById("soundButton");
const pages = document.getElementById("pages");
const backgroundMusic = document.getElementById("backgroundMusic");
const musicControl = document.getElementById("musicControl");

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
  backgroundMusic.volume = 0.55;
  backgroundMusic.play().then(() => {
    musicControl.hidden = false;
    musicControl.classList.add("playing");
  }).catch(() => {
    musicControl.hidden = false;
    musicControl.classList.remove("playing");
    musicControl.textContent = "♪";
  });
});

musicControl.addEventListener("click", async () => {
  if (backgroundMusic.paused) {
    try {
      await backgroundMusic.play();
      musicControl.textContent = "♫";
      musicControl.classList.add("playing");
      musicControl.setAttribute("aria-label", "إيقاف الموسيقى");
    } catch (error) {
      console.error("Music playback error:", error);
    }
  } else {
    backgroundMusic.pause();
    musicControl.textContent = "♪";
    musicControl.classList.remove("playing");
    musicControl.setAttribute("aria-label", "تشغيل الموسيقى");
  }
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

const SUPABASE_URL = "https://jzswtwicvgppisasrkqe.supabase.co";
const SUPABASE_KEY = "sb_publishable_qJGOZoWBOrZ952qJnYTqNg_oaMSIStu";
const INVITATION_SLUG = "yasmeen-bridal-shower";
const likeButton = document.getElementById("likeButton");
const likeCount = document.getElementById("likeCount");
const feedbackStatus = document.getElementById("feedbackStatus");
const ratingButtons = [...document.querySelectorAll("[data-rating]")];
let selectedRating = 0;

function getVisitorKey() {
  const storageKey = "invitation-visitor-key";
  let key = localStorage.getItem(storageKey);
  if (!key) {
    key = self.crypto?.randomUUID?.() || `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(storageKey, key);
  }
  return key;
}
const visitorKey = getVisitorKey();

async function rpc(name, candidates) {
  let lastError;
  for (const body of candidates) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    if (response.ok) {
      const raw = await response.text();
      return raw ? JSON.parse(raw) : null;
    }
    lastError = new Error(await response.text());
    if (![400, 404].includes(response.status)) break;
  }
  throw lastError;
}

const twoArgBodies = () => [
  { p_slug: INVITATION_SLUG, p_visitor_key: visitorKey },
  { p_invitation_slug: INVITATION_SLUG, p_visitor_key: visitorKey },
  { invitation_slug: INVITATION_SLUG, visitor_key: visitorKey }
];

function oneRow(value) {
  return Array.isArray(value) ? (value[0] || {}) : (value || {});
}

function paintLike(stats) {
  const row = oneRow(stats);
  const count = row.likes_count ?? row.like_count ?? row.total_likes ?? row.likes ?? 0;
  const liked = Boolean(row.liked ?? row.has_liked ?? row.is_liked ?? row.user_liked);
  likeCount.textContent = String(count);
  likeButton.classList.toggle("liked", liked);
  likeButton.querySelector("span").textContent = liked ? "♥" : "♡";
  likeButton.setAttribute("aria-pressed", String(liked));
}

async function refreshStats() {
  const stats = await rpc("get_invitation_stats", twoArgBodies());
  paintLike(stats);
}

async function startTracking() {
  try {
    await rpc("record_invitation_view", twoArgBodies());
    await refreshStats();
    likeButton.hidden = false;
  } catch (error) {
    console.error("Supabase tracking error:", error);
  }
}

likeButton.addEventListener("click", async () => {
  if (likeButton.disabled) return;
  likeButton.disabled = true;
  try {
    await rpc("toggle_invitation_like", twoArgBodies());
    await refreshStats();
  } catch (error) {
    console.error("Supabase like error:", error);
  } finally {
    likeButton.disabled = false;
  }
});

ratingButtons.forEach(button => {
  button.addEventListener("click", () => {
    selectedRating = Number(button.dataset.rating);
    ratingButtons.forEach(item => item.classList.toggle("selected", Number(item.dataset.rating) <= selectedRating));
  });
});

document.getElementById("feedbackForm").addEventListener("submit", async event => {
  event.preventDefault();
  const text = document.getElementById("feedback").value.trim();
  if (!text && !selectedRating) {
    feedbackStatus.textContent = "اختاري تقييمًا أو اكتبي اقتراحكِ";
    return;
  }

  const opinion = [
    selectedRating ? `التقييم: ${selectedRating}/5` : "",
    text ? `الاقتراح: ${text}` : ""
  ].filter(Boolean).join("\\n");
  const author = `ضيفة ياسمين (${guest})`;
  const submitButton = event.currentTarget.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  feedbackStatus.textContent = "جاري الحفظ…";

  const bodies = [
    { p_slug: INVITATION_SLUG, p_visitor_key: visitorKey, p_name: author, p_opinion: opinion },
    { p_slug: INVITATION_SLUG, p_visitor_key: visitorKey, p_author: author, p_body: opinion },
    { p_slug: INVITATION_SLUG, p_visitor_key: visitorKey, p_guest_name: author, p_opinion_text: opinion },
    { p_slug: INVITATION_SLUG, p_visitor_key: visitorKey, p_author_name: author, p_opinion: opinion },
    { p_invitation_slug: INVITATION_SLUG, p_visitor_key: visitorKey, p_name: author, p_opinion: opinion },
    { p_invitation_slug: INVITATION_SLUG, p_visitor_key: visitorKey, p_author_name: author, p_opinion_text: opinion },
    { invitation_slug: INVITATION_SLUG, visitor_key: visitorKey, author_name: author, opinion_text: opinion },
    { invitation_slug: INVITATION_SLUG, visitor_key: visitorKey, name: author, opinion }
  ];

  try {
    await rpc("submit_invitation_opinion", bodies);
    feedbackStatus.textContent = "شكرًا! تم حفظ تقييمكِ واقتراحكِ ✓";
    document.getElementById("feedback").value = "";
    selectedRating = 0;
    ratingButtons.forEach(item => item.classList.remove("selected"));
  } catch (error) {
    console.error("Supabase feedback error:", error);
    feedbackStatus.textContent = "تعذر الحفظ، حاولي مرة ثانية";
  } finally {
    submitButton.disabled = false;
  }
});

startTracking();
