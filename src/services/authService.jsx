import config from "../config/config";

const authService = {
  async register(userData) {
    try {
      const formattedData = {
        ...userData,
        hobbies: Array.isArray(userData.hobbies)
          ? userData.hobbies
          : userData.hobbies.split(",").map((hobby) => hobby.trim()),
      };

      const response = await fetch(`${config.API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      const data = await response.json();
      if (data.token) {
        localStorage.setItem(config.TOKEN_KEY, data.token);
      }
      return data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  async login(credentials) {
    try {
      const response = await fetch(`${config.API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      if (data.token) {
        localStorage.setItem(config.TOKEN_KEY, data.token);
        localStorage.setItem(config.USER_KEY, JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  async _fetchWithAuth(url, options = {}) {
    const token = this.getToken();
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      if (response.status === 401) {
        this.logout();
        window.location.href = "/login";
        throw new Error("Session expired. Please log in again.");
      }
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || "API request failed");
      } catch (e) {
         throw new Error("API request failed with status " + response.status);
      }
    }
    
    if (response.status === 201 && (!response.headers.get("content-length") || response.headers.get("content-length") === "0")) {
        return { success: true, status: 201 };
    }

    const contentType = response.headers.get("Content-Type");
    if (contentType && contentType.includes("application/json")) {
        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse JSON:", text);
            throw new Error("Received malformed JSON from server");
        }
    }

    return response;
  },

  async getPrompts() {
    try {
      const url = `${config.API_URL}/auth/prompts`;
      return await this._fetchWithAuth(url, { method: "GET" });
    } catch (error) {
      console.error("Get prompts error:", error);
      throw error;
    }
  },

  async sendPrompt(promptText) {
    try {
      const url = `${config.API_URL}/auth/prompt`;
      return await this._fetchWithAuth(url, {
        method: "POST",
        body: JSON.stringify({ prompt: promptText }),
      });
    } catch (error) {
      console.error("Prompt submission error:", error);
      throw error;
    }
  },

  getCurrentUser() {
    const userStr = localStorage.getItem(config.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  logout() {
    localStorage.removeItem(config.TOKEN_KEY);
    localStorage.removeItem(config.USER_KEY);
  },

  getToken() {
    return localStorage.getItem(config.TOKEN_KEY);
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};

export default authService;
// This code defines an authentication service that handles user registration, login, and token management.
// It includes methods for registering a new user, logging in, retrieving the current user, logging out, checking authentication status, and sending prompts with dynamic data.
// The service uses the Fetch API to communicate with a backend API, handling errors and storing tokens in local storage.
// The `sendPrompt` method allows sending dynamic prompt data to the server, ensuring that the user is authenticated by checking for a valid token before making the request.
// The service is designed to be reusable and can be imported into other parts of the application where authentication functionality is needed.
// The code also includes error handling to provide feedback in case of issues during registration, login, or prompt submission.
// The configuration for the API URL and token keys is imported from a separate config file to maintain flexibility and ease of updates.
// The service is structured to be modular, making it easy to integrate into a larger application architecture.     