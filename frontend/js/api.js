const API_BASE_URL = window.location.hostname.includes("app.github.dev")
  ? window.location.origin.replace("-3000.", "-5000.") + "/api"
  : window.location.origin + "/api";

function getToken() {
  return localStorage.getItem("token");
}

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  if (token) defaultHeaders.Authorization = `Bearer ${token}`;

  const headers = {
    ...defaultHeaders,
    ...(options.headers || {}),
  };

  const fetchOptions = {
    ...options,
    headers,
  };

  if (
    fetchOptions.body &&
    typeof fetchOptions.body === "object" &&
    !(fetchOptions.body instanceof FormData)
  ) {
    fetchOptions.body = JSON.stringify(fetchOptions.body);
  }

  const res = await fetch(url, fetchOptions);

  let data = null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const message =
  data?.message ||
  data?.error ||
  res.statusText ||
  "Request failed";
    throw new Error(message);
  }

  return data;
}

// Exports removed so functions are available globally to pages

async function loadCategoriesIntoSelect(selectEl, selectedValue = null, includeAllOption = false) {
  if (!selectEl) return;
  try {
    const categories = await apiRequest("/categories");
    selectEl.innerHTML = "";
    
    if (includeAllOption) {
      const opt = document.createElement("option");
      opt.value = "ALL";
      opt.textContent = "All Categories";
      selectEl.appendChild(opt);
    }
    
    if (Array.isArray(categories)) {
      categories.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat.name;
        opt.textContent = cat.name;
        if (selectedValue && cat.name === selectedValue) {
          opt.selected = true;
        }
        selectEl.appendChild(opt);
      });
    }
  } catch (err) {
    console.error("Failed to load categories into select:", err);
  }
}

// Global Custom Premium Dialog Overlays
function showToast(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.style.cssText = "position: fixed; top: 20px; right: 20px; z-index: 10000; display: flex; flex-direction: column; gap: 10px; pointer-events: none;";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  const bg = type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#3b82f6";
  toast.style.cssText = `background: ${bg}; color: white; padding: 14px 24px; border-radius: 8px; font-weight: 500; font-size: 14px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); min-width: 250px; transform: translateY(-20px); opacity: 0; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); pointer-events: auto; display: flex; align-items: center; justify-content: space-between; gap: 12px; font-family: inherit;`;
  toast.textContent = message;

  const close = document.createElement("span");
  close.innerHTML = "&times;";
  close.style.cssText = "cursor: pointer; font-size: 18px; font-weight: bold; opacity: 0.8; transition: opacity 0.2s; margin-left: 10px;";
  close.onmouseover = () => close.style.opacity = 1;
  close.onmouseout = () => close.style.opacity = 0.8;
  close.onclick = () => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100px)";
    setTimeout(() => toast.remove(), 300);
  };
  toast.appendChild(close);
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transform = "translateY(0)";
    toast.style.opacity = "1";
  }, 10);

  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-20px)";
      setTimeout(() => toast.remove(), 300);
    }
  }, 3500);
}

function showAlert(message, title = "System Message") {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 10000; opacity: 0; transition: opacity 0.2s ease; font-family: inherit;";

    const modal = document.createElement("div");
    modal.style.cssText = "background: white; border-radius: 16px; width: 400px; max-width: 90%; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); transform: scale(0.9); transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; gap: 16px;";

    modal.innerHTML = `
      <div style="font-size: 18px; font-weight: 700; color: #0f172a; border-bottom: 1.5px solid #f1f5f9; padding-bottom: 8px;">${title}</div>
      <div style="font-size: 14px; color: #475569; line-height: 1.5; white-space: pre-wrap;">${message}</div>
      <div style="display: flex; justify-content: flex-end; margin-top: 8px;">
        <button id="alert-ok-btn" style="margin: 0; padding: 10px 20px; font-size: 14px; font-weight: 600; color: white; background: #4f46e5; border: none; border-radius: 8px; cursor: pointer; transition: background 0.2s;">OK</button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.style.opacity = "1";
      modal.style.transform = "scale(1)";
    }, 10);

    const okBtn = modal.querySelector("#alert-ok-btn");
    okBtn.onmouseover = () => okBtn.style.background = "#4338ca";
    okBtn.onmouseout = () => okBtn.style.background = "#4f46e5";
    okBtn.focus();

    okBtn.onclick = () => {
      overlay.style.opacity = "0";
      modal.style.transform = "scale(0.9)";
      setTimeout(() => {
        overlay.remove();
        resolve();
      }, 200);
    };
  });
}

function showConfirm(message, title = "Confirm Action") {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 10000; opacity: 0; transition: opacity 0.2s ease; font-family: inherit;";

    const modal = document.createElement("div");
    modal.style.cssText = "background: white; border-radius: 16px; width: 420px; max-width: 90%; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); transform: scale(0.9); transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; gap: 16px;";

    modal.innerHTML = `
      <div style="font-size: 18px; font-weight: 700; color: #0f172a; border-bottom: 1.5px solid #f1f5f9; padding-bottom: 8px;">${title}</div>
      <div style="font-size: 14px; color: #475569; line-height: 1.5;">${message}</div>
      <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px;">
        <button id="confirm-cancel-btn" style="background: #e2e8f0; color: #475569; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; transition: background 0.2s;">Cancel</button>
        <button id="confirm-ok-btn" style="margin: 0; padding: 10px 20px; font-size: 14px; font-weight: 600; color: white; background: #4f46e5; border: none; border-radius: 8px; cursor: pointer; transition: background 0.2s;">Confirm</button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.style.opacity = "1";
      modal.style.transform = "scale(1)";
    }, 10);

    const cancelBtn = modal.querySelector("#confirm-cancel-btn");
    const okBtn = modal.querySelector("#confirm-ok-btn");
    
    cancelBtn.onmouseover = () => cancelBtn.style.background = "#cbd5e1";
    cancelBtn.onmouseout = () => cancelBtn.style.background = "#e2e8f0";
    okBtn.onmouseover = () => okBtn.style.background = "#4338ca";
    okBtn.onmouseout = () => okBtn.style.background = "#4f46e5";

    cancelBtn.onclick = () => {
      overlay.style.opacity = "0";
      modal.style.transform = "scale(0.9)";
      setTimeout(() => {
        overlay.remove();
        resolve(false);
      }, 200);
    };

    okBtn.onclick = () => {
      overlay.style.opacity = "0";
      modal.style.transform = "scale(0.9)";
      setTimeout(() => {
        overlay.remove();
        resolve(true);
      }, 200);
    };
  });
}

function setupDynamicSidebar() {
  // Automatically swap logo to light version inside dark sidebars
  const sidebarLogo = document.querySelector(".sidebar img, .sidebar-logo-container img");
  if (sidebarLogo && sidebarLogo.src.includes("logo.svg")) {
    sidebarLogo.src = sidebarLogo.src.replace("logo.svg", "logo-light.svg");
  }

  const sidebarUl = document.querySelector(".sidebar ul");
  if (!sidebarUl) return;

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role ? user.role.toUpperCase() : "LEARNER";
  const path = window.location.pathname;

  if (role === "ADMIN") {
    sidebarUl.innerHTML = `
      <li><a href="admin-dashboard.html" class="${path.includes('admin-dashboard') ? 'active' : ''}">Dashboard</a></li>
      <li><a href="users.html" class="${path.includes('users') ? 'active' : ''}">Users</a></li>
      <li><a href="admin-courses.html" class="${path.includes('admin-courses') || path.includes('course-details') ? 'active' : ''}">Courses</a></li>
      <li><a href="reports.html" class="${path.includes('reports') ? 'active' : ''}">Reports</a></li>
      <li><a href="admin-certificates.html" class="${path.includes('admin-certificates') ? 'active' : ''}">Certificates</a></li>
      <li><a href="admin-settings.html" class="${path.includes('admin-settings') ? 'active' : ''}">Settings</a></li>
      <li><a href="admin-profile.html" class="${path.includes('admin-profile') ? 'active' : ''}">Profile</a></li>
    `;
  }
}

// Automatically setup sidebar on load
document.addEventListener("DOMContentLoaded", setupDynamicSidebar);