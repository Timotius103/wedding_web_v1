import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  getDocs,
  orderBy,
  query,
  updateDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { firebaseIsConfigured } from "../firebase-config.js";
import { getCommentsDb, getFirebaseAuth } from "../firebase-client.js";

// Replace with UID from:
// Firebase Console > Authentication > Users
const ADMIN_UID = "n8nlyecJeKRJVL3nv8PRulYlvfx2";

const COMMENT_COLLECTION = "comment";

const loginView = document.getElementById("loginView");
const dashboardView = document.getElementById("dashboardView");
const loginForm = document.getElementById("loginForm");
const loginStatus = document.getElementById("loginStatus");
const dashboardStatus = document.getElementById("dashboardStatus");
const commentsList = document.getElementById("commentsList");
const counts = document.getElementById("counts");
const logoutButton = document.getElementById("logoutButton");

const auth = firebaseIsConfigured ? getFirebaseAuth() : null;

let activeStatus = "pending";

function setStatus(element, message, type = "") {
  if (!element) return;

  element.textContent = message;
  element.className = `status${type ? ` ${type}` : ""}`;
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

function showLogin() {
  loginView.hidden = false;
  dashboardView.hidden = true;
}

function showDashboard() {
  loginView.hidden = true;
  dashboardView.hidden = false;

  loadComments();
}

async function loadComments() {
  const db = getCommentsDb();

  if (!db) {
    setStatus(dashboardStatus, "Konfigurasi Firebase belum diisi.", "error");
    return;
  }

  setStatus(dashboardStatus, "Memuat komentar...", "info");

  try {
    const commentsQuery = query(
      collection(db, COMMENT_COLLECTION),
      orderBy("createdAt", "desc"),
    );

    const snapshot = await getDocs(commentsQuery);

    const comments = snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    }));

    renderCounts(comments);

    const filteredComments = comments.filter(
      (comment) => comment.status === activeStatus,
    );

    renderComments(filteredComments);

    setStatus(dashboardStatus, "");
  } catch (error) {
    console.error("Failed to load comments:", error);
    console.error("Firebase error code:", error?.code);
    console.error("Firebase error message:", error?.message);

    setStatus(
      dashboardStatus,
      `Komentar belum dapat dimuat: ${error?.code || "unknown-error"}`,
      "error",
    );
  }
}

function renderCounts(comments) {
  counts.replaceChildren();

  ["pending", "approved", "rejected"].forEach((status) => {
    const item = document.createElement("div");
    item.className = "count";

    const value = document.createElement("strong");

    value.textContent = String(
      comments.filter((comment) => comment.status === status).length,
    );

    const label = document.createElement("span");
    label.textContent = status;

    item.append(value, label);
    counts.append(item);
  });
}

function renderComments(comments) {
  commentsList.replaceChildren();

  if (!comments.length) {
    const empty = document.createElement("p");

    empty.className = "empty";
    empty.textContent = "Tidak ada komentar pada kategori ini.";

    commentsList.append(empty);

    return;
  }

  comments.forEach((comment) => {
    const card = document.createElement("article");
    card.className = "comment-card";

    const heading = document.createElement("div");
    heading.className = "comment-heading";

    const name = document.createElement("h2");
    name.textContent = comment.name || "Tamu";

    const date = document.createElement("time");
    date.textContent = formatDate(comment.createdAt);

    heading.append(name, date);

    const message = document.createElement("p");
    message.textContent = comment.message || "";

    const meta = document.createElement("small");
    meta.textContent = `Guest ID: ${comment.guestId || "tidak terdaftar"}`;

    card.append(heading, message, meta);

    if (comment.status === "pending") {
      const actions = document.createElement("div");
      actions.className = "actions";

      const approveButton = document.createElement("button");

      approveButton.type = "button";
      approveButton.textContent = "Approve";

      approveButton.addEventListener("click", () => {
        moderate(comment.id, "approved", approveButton);
      });

      const rejectButton = document.createElement("button");

      rejectButton.type = "button";
      rejectButton.className = "danger";
      rejectButton.textContent = "Reject";

      rejectButton.addEventListener("click", () => {
        moderate(comment.id, "rejected", rejectButton);
      });

      actions.append(approveButton, rejectButton);

      card.append(actions);
    }

    commentsList.append(card);
  });
}

async function moderate(commentId, status, button) {
  const db = getCommentsDb();

  if (!db) {
    setStatus(dashboardStatus, "Firebase database tidak tersedia.", "error");
    return;
  }

  button.disabled = true;

  try {
    const commentRef = doc(db, COMMENT_COLLECTION, commentId);

    await updateDoc(commentRef, { status });

    setStatus(
      dashboardStatus,
      `Komentar berhasil diubah menjadi ${status}.`,
      "success",
    );

    await loadComments();
  } catch (error) {
    console.error("Failed to moderate comment:", error);

    button.disabled = false;

    setStatus(dashboardStatus, "Komentar belum dapat diubah.", "error");
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!auth) {
    setStatus(loginStatus, "Konfigurasi Firebase belum diisi.", "error");

    return;
  }

  const emailInput = document.getElementById("emailInput");

  const passwordInput = document.getElementById("passwordInput");

  const email = emailInput.value.trim();

  const password = passwordInput.value;

  if (!email || !password) {
    setStatus(loginStatus, "Email dan password wajib diisi.", "error");

    return;
  }

  setStatus(loginStatus, "Memeriksa akun...", "info");

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Login failed:", error);

    setStatus(loginStatus, "Email atau password tidak valid.", "error");
  }
});

if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    if (!auth) return;

    await signOut(auth);
  });
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    const activeTab = document.querySelector(".tab.active");

    if (activeTab) {
      activeTab.classList.remove("active");
    }

    tab.classList.add("active");

    activeStatus = tab.dataset.status || "pending";

    loadComments();
  });
});

if (auth) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      showLogin();
      return;
    }

    if (user.uid !== ADMIN_UID) {
      setStatus(loginStatus, "Akun ini tidak memiliki akses admin.", "error");

      await signOut(auth);

      return;
    }

    setStatus(loginStatus, "");

    showDashboard();
  });
} else {
  showLogin();
}
