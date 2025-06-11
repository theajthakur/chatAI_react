import { notyf } from "./notyf";

export async function authFetch(url, method = "GET", data = {}) {
  const apiURL = import.meta.env.VITE_API_URL;
  try {
    const token = localStorage.getItem("chat_room_token");
    if (!token) throw new Error("No auth token found. Please log in.");

    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    if (method !== "GET") {
      options.body = JSON.stringify(data);
    }

    const res = await fetch(apiURL + url, options);
    const result = await res.json();

    if (!res.ok) {
      const message = result.message || "Request failed";
      throw new Error(message);
    }

    if (result.message) notyf.success(result.message);
    return result;
  } catch (err) {
    notyf.error(err.message || "Something went wrong");
    return null;
  }
}
