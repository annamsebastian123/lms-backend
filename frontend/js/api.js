const API_BASE_URL = window.location.hostname.includes("app.github.dev")
  ? window.location.origin.replace("-3000.", "-5000.") + "/api"
  : "http://localhost:5000/api";

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