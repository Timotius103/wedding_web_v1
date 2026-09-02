import {
  collection,
  addDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { firebaseIsConfigured } from "./firebase-config.js";
import { getCommentsDb } from "./firebase-client.js";

const COMMENT_COLLECTION = "comment";

const MAX_NAME_LENGTH = 80;
const MAX_MESSAGE_LENGTH = 300;
const DUPLICATE_COOLDOWN_MS = 4000;

let guestContext = {
  id: null,
  name: null,
};

let lastSubmittedMessage = "";
let lastSubmittedAt = 0;

const form = document.getElementById("guestbookForm");
const nameInput = document.getElementById("nama");
const messageInput = document.getElementById("wishes");
const statusEl = document.getElementById("guestbookStatus");
const listEl = document.getElementById("wishesList");

function setStatus(message, type = "") {
  if (!statusEl) return;

  statusEl.textContent = message;
  statusEl.className = `guestbook-status${type ? ` ${type}` : ""}`;
}

function setSubmitState(isLoading) {
  if (!form) return;

  const button = form.querySelector('button[type="submit"]');

  if (!button) return;

  button.disabled = isLoading;
  button.classList.toggle("is-loading", isLoading);

  const label = button.querySelector("span");

  if (label) {
    label.textContent = isLoading ? "Mengirim..." : "Kirim Ucapan";
  }
}

function normalizeGuestId(value) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  return /^[a-z0-9-]{1,120}$/.test(normalized) ? normalized : null;
}

async function resolveGuestContext() {
  const params = new URLSearchParams(window.location.search);

  const guestId = normalizeGuestId(params.get("guest"));

  if (!guestId) {
    return guestContext;
  }

  try {
    const response = await fetch("./data/guests.json");

    if (!response.ok) {
      console.warn("Failed to load guests.json:", response.status);

      return guestContext;
    }

    const data = await response.json();

    const guest = data?.guests?.[guestId];

    if (guest && typeof guest.name === "string" && guest.name.trim()) {
      guestContext = {
        id: guestId,
        name: guest.name.trim(),
      };

      nameInput.value = guestContext.name;

      nameInput.readOnly = true;
    }
  } catch (error) {
    console.error("Failed to resolve guest:", error);

    // Guestbook tetap dapat digunakan
    // sebagai tamu yang tidak terdaftar.
  }

  return guestContext;
}

function formatDate(timestamp) {
  if (!timestamp?.toDate) {
    return "Baru saja";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(timestamp.toDate());
}

function getTimestampMillis(timestamp) {
  if (timestamp?.toMillis) {
    return timestamp.toMillis();
  }

  if (timestamp?.toDate) {
    return timestamp.toDate().getTime();
  }

  return 0;
}

function renderCommentDocs(commentDocs) {
  listEl.replaceChildren();

  if (!commentDocs.length) {
    const empty = document.createElement("p");

    empty.className = "guestbook-empty";

    empty.textContent =
      "Belum ada ucapan. Jadilah yang pertama memberikan doa.";

    listEl.append(empty);

    return;
  }

  commentDocs.forEach((commentSnapshot) => {
    const comment = commentSnapshot.data();

    const item = document.createElement("article");

    item.className = "wish-item is-live";

    const avatar = document.createElement("div");

    avatar.className = "avatar";

    avatar.textContent = (comment.name || "?").trim().charAt(0).toUpperCase();

    const content = document.createElement("div");

    content.className = "content";

    const name = document.createElement("h4");

    name.textContent = comment.name || "Tamu";

    const message = document.createElement("p");

    message.textContent = comment.message || "";

    const date = document.createElement("span");

    date.textContent = formatDate(comment.createdAt);

    content.append(name, message, date);

    item.append(avatar, content);

    listEl.append(item);
  });
}

function renderComments(snapshot) {
  renderCommentDocs(snapshot.docs);
}

function renderSortedComments(snapshot) {
  const commentDocs = [...snapshot.docs]
    .sort((first, second) => {
      return (
        getTimestampMillis(second.data().createdAt) -
        getTimestampMillis(first.data().createdAt)
      );
    })
    .slice(0, 100);

  renderCommentDocs(commentDocs);
}

function renderLoadError(error) {
  console.error("Failed to load approved comments:", error);

  console.error("Firebase error code:", error?.code);

  console.error("Firebase error message:", error?.message);

  listEl.replaceChildren();

  const errorMessage = document.createElement("p");

  errorMessage.className = "guestbook-empty";

  errorMessage.textContent =
    "Ucapan belum dapat dimuat. Silakan coba lagi nanti.";

  listEl.append(errorMessage);
}

function subscribeToApprovedComments() {
  if (!firebaseIsConfigured) {
    setStatus("Guestbook Firebase belum dikonfigurasi.", "info");

    listEl.replaceChildren();

    return;
  }

  const db = getCommentsDb();

  if (!db) {
    console.error("Firestore database instance is unavailable.");

    setStatus("Database guestbook belum tersedia.", "error");

    return;
  }

  const commentsCollection = collection(db, COMMENT_COLLECTION);

  const commentsQuery = query(
    commentsCollection,
    where("status", "==", "approved"),
    orderBy("createdAt", "desc"),
    limit(100),
  );

  const fallbackCommentsQuery = query(
    commentsCollection,
    where("status", "==", "approved"),
  );

  onSnapshot(commentsQuery, renderComments, (error) => {
    if (error?.code === "failed-precondition") {
      console.warn(
        "Indexed guestbook query failed. Falling back to client-side sorting.",
        error,
      );

      onSnapshot(fallbackCommentsQuery, renderSortedComments, renderLoadError);

      return;
    }

    renderLoadError(error);
  });
}

async function submitComment(event) {
  event.preventDefault();

  const name = nameInput.value.trim();

  const message = messageInput.value.trim();

  const now = Date.now();

  const fingerprint = `${name}\n${message}`;

  if (!name || name.length > MAX_NAME_LENGTH) {
    setStatus(
      `Nama wajib diisi dan maksimal ${MAX_NAME_LENGTH} karakter.`,
      "error",
    );

    return;
  }

  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    setStatus(
      `Ucapan wajib diisi dan maksimal ${MAX_MESSAGE_LENGTH} karakter.`,
      "error",
    );

    return;
  }

  if (
    fingerprint === lastSubmittedMessage &&
    now - lastSubmittedAt < DUPLICATE_COOLDOWN_MS
  ) {
    setStatus("Ucapan yang sama baru saja dikirim.", "error");

    return;
  }

  if (!firebaseIsConfigured) {
    setStatus(
      "Guestbook belum siap digunakan. Konfigurasi Firebase terlebih dahulu.",
      "error",
    );

    return;
  }

  const db = getCommentsDb();

  if (!db) {
    setStatus("Database guestbook belum tersedia.", "error");

    return;
  }

  setSubmitState(true);

  setStatus("Mengirim ucapan...", "info");

  try {
    await addDoc(collection(db, COMMENT_COLLECTION), {
      guestId: guestContext.id,
      name,
      message,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    lastSubmittedMessage = fingerprint;

    lastSubmittedAt = Date.now();

    if (!nameInput.readOnly) {
      nameInput.value = "";
    }

    messageInput.value = "";

    setStatus("Terima kasih. Ucapan Anda menunggu persetujuan.", "success");
  } catch (error) {
    console.error("Failed to submit comment:", error);

    console.error("Firebase error code:", error?.code);

    console.error("Firebase error message:", error?.message);

    setStatus("Ucapan belum dapat dikirim. Silakan coba lagi nanti.", "error");
  } finally {
    setSubmitState(false);
  }
}

if (form && nameInput && messageInput && statusEl && listEl) {
  form.addEventListener("submit", submitComment);

  resolveGuestContext()
    .then(() => {
      subscribeToApprovedComments();
    })
    .catch((error) => {
      console.error("Guestbook initialization failed:", error);

      subscribeToApprovedComments();
    });
}
