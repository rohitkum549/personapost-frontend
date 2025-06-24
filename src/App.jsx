import React, { useState, useEffect, useCallback } from "react";
import authService from "./services/authService.jsx";
import Logo from "./components/Logo.jsx";
import config from "./config/config.jsx";

// Main App Component - Acts as the router and main container
const App = () => {
  // State to manage the current page/route
  const [page, setPage] = useState(
    window.location.pathname.replace("/", "") || "home"
  );
  // State to track login status
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // State to store user data after registration
  const [user, setUser] = useState(null);

  // Function to handle navigation between pages
  const navigate = useCallback((path) => {
    window.history.pushState({}, "", `/${path}`);
    setPage(path);
  }, []);

  // Effect to handle browser navigation (back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      setPage(window.location.pathname.replace("/", "") || "home");
    };
    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    // Check for existing auth
    const token = authService.getToken();
    if (token) {
      setIsLoggedIn(true);
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      if (["", "home", "login", "register"].includes(page)) {
        navigate("dashboard");
      }
    }
  }, [page, navigate]);

  // Handlers for user authentication
  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUser(userData.user); // Assuming login returns { user: {...}, token: ... }
    navigate("dashboard");
  };

  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    setUser(null);
    navigate("home");
  };

  const handleRegister = async (userData) => {
    try {
      const response = await authService.register(userData);
      // Assuming register also logs the user in
      handleLogin(response);
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  // Main render logic to switch between pages
  const renderPage = () => {
    if (isLoggedIn) {
      return <DashboardPage user={user} onLogout={handleLogout} />;
    }

    switch (page) {
      case "login":
        return <LoginPage navigate={navigate} onLogin={handleLogin} />;
      case "register":
        return <RegisterPage navigate={navigate} onRegister={handleRegister} />;
      case "about":
        return <AboutPage navigate={navigate} />;
      default:
        return <HomePage navigate={navigate} />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">{renderPage()}</div>
  );
};

// --- Reusable Components ---

// Navigation Bar Component
const Navbar = ({ navigate }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Simulate currentUser for demo; in a real app, pass as prop or from context
  const currentUser = null; // or { fullName: "John Doe" }

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button
            onClick={() => navigate("home")}
            className="focus:outline-none"
          >
            <Logo />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {currentUser ? (
              <>
                <button
                  onClick={() => navigate("dashboard")}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </button>
                <button className="text-gray-600 hover:text-gray-900 transition-colors">
                  Analytics
                </button>
                <button className="text-gray-600 hover:text-gray-900 transition-colors">
                  Settings
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("features")}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Features
                </button>
                <button
                  onClick={() => navigate("home")}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Pricing
                </button>
                <button
                  onClick={() => navigate("about")}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  About
                </button>
              </>
            )}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!currentUser ? (
              <>
                <button
                  onClick={() => navigate("login")}
                  className="text-gray-600 hover:text-gray-900 font-medium px-3 py-2 rounded transition"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("register")}
                  className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Get Started Now
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {currentUser.fullName?.charAt(0)}
                  </span>
                </div>
                <span className="text-sm font-medium">
                  {currentUser.fullName}
                </span>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded focus:outline-none"
            >
              {isOpen ? (
                // X icon
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                // Menu icon
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-4">
            {currentUser ? (
              <>
                <button
                  onClick={() => {
                    navigate("dashboard");
                    setIsOpen(false);
                  }}
                  className="block text-gray-600 hover:text-gray-900"
                >
                  Dashboard
                </button>
                <button className="block text-gray-600 hover:text-gray-900">
                  Analytics
                </button>
                <button className="block text-gray-600 hover:text-gray-900">
                  Settings
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    navigate("features");
                    setIsOpen(false);
                  }}
                  className="block text-gray-600 hover:text-gray-900"
                >
                  Features
                </button>
                <button
                  onClick={() => {
                    navigate("home");
                    setIsOpen(false);
                  }}
                  className="block text-gray-600 hover:text-gray-900"
                >
                  Pricing
                </button>
                <button
                  onClick={() => {
                    navigate("about");
                    setIsOpen(false);
                  }}
                  className="block text-gray-600 hover:text-gray-900"
                >
                  About
                </button>
                <div className="space-y-2 pt-4 border-t">
                  <button
                    onClick={() => {
                      navigate("login");
                      setIsOpen(false);
                    }}
                    className="w-full border border-gray-300 rounded px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      navigate("register");
                      setIsOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white px-4 py-2 rounded"
                  >
                    Get Started Now
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

// Footer Component
const Footer = () => (
  <footer className="bg-white">
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex justify-center space-x-6 md:order-2">
          {/* Footer icons will be added later */}
        </div>
        <div className="mt-8 md:mt-0 md:order-1">
          <p className="text-center text-base text-gray-400">
            &copy; 2024 PersonaPost AI. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </footer>
);

// --- Page Components ---

// Landing Page Component
const HomePage = ({ navigate }) => {
  return (
    <div>
      <Navbar navigate={navigate} />
      <main>
        {/* Hero Section */}
        <header className="bg-white pt-32 pb-16 md:pt-48 md:pb-24">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800 leading-tight">
              Create Engaging{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">Social Content</span> with AI
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
              PersonaPost AI is your personal social media agent. Generate
              personalized posts, captions, and hashtags based on trends,
              schedule across platforms, and maintain an impactful online
              presence effortlessly.
            </p>
            <div className="mt-8 flex justify-center items-center flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate("register")}
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300"
              >
                Start Creating Now &rarr;
              </button>
              <button className="w-full sm:w-auto bg-white text-gray-700 font-bold py-3 px-8 rounded-lg border border-gray-300 hover:bg-gray-100 transition duration-300">
                Watch Demo &#9658;
              </button>
            </div>
          </div>
        </header>

        {/* Features Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800">
                Why PersonaPost AI?
              </h2>
              <p className="text-gray-600 mt-2">
                Everything you need to supercharge your social media.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
                <div className="bg-purple-100 text-purple-600 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2ZM16,14H8V12h8Zm0-4H8V8h8Z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  AI-Powered Content
                </h3>
                <p className="text-gray-600">
                  Get perfectly tailored captions, posts, and hashtags that
                  resonate with your audience.
                </p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
                <div className="bg-green-100 text-green-600 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M19,4H18V2H16V4H8V2H6V4H5A2,2,0,0,0,3,6V20a2,2,0,0,0,2,2H19a2,2,0,0,0,2-2V6A2,2,0,0,0,19,4Zm0,16H5V10H19ZM5,8V6H19V8Z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Smart Scheduling
                </h3>
                <p className="text-gray-600">
                  Plan and schedule your content across multiple social media
                  platforms with ease.
                </p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
                <div className="bg-pink-100 text-pink-600 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M16,6H10.41l5.3-5.29L14.29,0,7.07,7.22,9.29,9.43,3.7,15.01,5,16.29,10.59,10.7,12.8,12.92,19,6.83Z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Trend Analysis
                </h3>
                <p className="text-gray-600">
                  Stay ahead of the curve with AI-driven analysis and
                  personalized content suggestions.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

// About Page Component
const AboutPage = ({ navigate }) => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar navigate={navigate} />
      <main className="py-20 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            About PersonaPost AI
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl text-gray-600">
            We are on a mission to revolutionize social media management with the power of artificial intelligence.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Our Story</h2>
              <p className="mt-4 text-gray-600">
                PersonaPost AI was born from a simple idea: to make social media management effortless and effective for everyone. Whether you're a busy professional, a small business owner, an influencer, or just someone who wants to build a personal brand, we understand that creating engaging content consistently is a challenge. We saw a need for a smarter, more personalized approach to content creation—one that understands the user's unique voice and audience.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Our Mission</h2>
              <p className="mt-4 text-gray-600">
                Our mission is to empower you with a smart tool that acts as your personal content strategist. We leverage the power of artificial intelligence to understand your unique persona—your interests, your voice, your audience—and generate content that truly resonates. We aim to take the guesswork out of social media, allowing you to focus on what you do best while maintaining a vibrant and impactful online presence.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">What We Do</h2>
              <p className="mt-4 text-gray-600">
                PersonaPost AI goes beyond simple content generation. We provide a comprehensive suite of tools to manage your entire social media presence:
              </p>
              <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600">
                <li><strong>AI-Powered Content Creation:</strong> Generate creative and personalized posts, captions, and hashtags in seconds.</li>
                <li><strong>Smart Scheduling:</strong> Plan your content calendar and automatically publish posts across multiple platforms.</li>
                <li><strong>Trend Analysis:</strong> Stay ahead of the curve with insights on trending topics and content ideas relevant to your field.</li>
                <li><strong>Persona Customization:</strong> Fine-tune the AI to match your specific style, tone, and objectives.</li>
              </ul>
            </div>
             <div className="text-center pt-6">
                <p className="text-gray-600">
                  Thank you for joining us on this journey. Let's create something amazing together!
                </p>
                <button
                    onClick={() => navigate("register")}
                    className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300"
                  >
                    Get Started
                </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Registration Page Component
const RegisterPage = ({ navigate, onRegister }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    age: "",
    gender: "",
    phone: "",
    profession: "",
    hobbies: "",
    themes: [],
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contentThemes = [
    { id: "lifestyle", label: "Lifestyle" },
    { id: "business", label: "Business" },
    { id: "technology", label: "Technology" },
    { id: "travel", label: "Travel" },
    { id: "food", label: "Food" },
    { id: "fitness", label: "Fitness" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleThemeChange = (themeId, checked) => {
    setFormData((prev) => ({
      ...prev,
      themes: checked
        ? [...prev.themes, themeId]
        : prev.themes.filter((id) => id !== themeId),
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = "Full name is required.";
    if (!formData.email) newErrors.email = "Email is required.";
    if (!formData.username) newErrors.username = "Username is required.";
    if (!formData.password) newErrors.password = "Password is required.";
    if (!formData.age) newErrors.age = "Age is required.";
    else if (isNaN(formData.age) || +formData.age <= 0)
      newErrors.age = "Please enter a valid age.";
    if (!formData.phone) newErrors.phone = "Phone number is required.";
    if (!formData.hobbies) newErrors.hobbies = "Hobbies are required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      try {
        const response = await onRegister(formData);
        if (response?.user) {
          navigate("dashboard");
        }
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          submit: error.message || "Registration failed. Please try again.",
        }));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      <button
        onClick={() => window.history.back()}
        className="absolute top-8 left-8 text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        Back
      </button>
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex flex-col items-center space-y-4">
            <Logo size="large" />
            <h2 className="text-center text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
          </div>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <button
              onClick={() => navigate("login")}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              sign in to your existing account
            </button>
          </p>
        </div>
        <form
          className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg"
          onSubmit={handleSubmit}
        >
          {errors.submit && (
            <div
              className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">{errors.submit}</span>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px flex flex-col gap-y-4">
            <div>
              <label htmlFor="fullName" className="sr-only">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                className={`appearance-none rounded-md relative block w-full px-3 py-3 border ${
                  errors.fullName ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Full Name"
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`appearance-none rounded-md relative block w-full px-3 py-3 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Email"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className={`appearance-none rounded-md relative block w-full px-3 py-3 border ${
                  errors.username ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Username"
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={`appearance-none rounded-md relative block w-full px-3 py-3 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Password"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>
            <div>
              <label htmlFor="age" className="sr-only">
                Age
              </label>
              <input
                id="age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                className={`appearance-none rounded-md relative block w-full px-3 py-3 border ${
                  errors.age ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Age"
              />
              {errors.age && (
                <p className="text-red-500 text-xs mt-1">{errors.age}</p>
              )}
            </div>
            <div>
              <label htmlFor="gender" className="sr-only">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="phone" className="sr-only">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className={`appearance-none rounded-md relative block w-full px-3 py-3 border ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Phone Number"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>
            <div>
              <label htmlFor="profession" className="sr-only">
                Profession
              </label>
              <input
                id="profession"
                name="profession"
                type="text"
                value={formData.profession}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Profession"
              />
            </div>
            <div>
              <label htmlFor="hobbies" className="sr-only">
                Hobbies
              </label>
              <textarea
                id="hobbies"
                name="hobbies"
                rows="3"
                value={formData.hobbies}
                onChange={handleChange}
                className={`appearance-none rounded-md relative block w-full px-3 py-3 border ${
                  errors.hobbies ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Your Hobbies (e.g., hiking, reading, coding)"
              ></textarea>
              {errors.hobbies && (
                <p className="text-red-500 text-xs mt-1">{errors.hobbies}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Content Themes
              </label>
              <div className="grid grid-cols-2 gap-2">
                {contentThemes.map((theme) => (
                  <label key={theme.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.themes.includes(theme.id)}
                      onChange={(e) =>
                        handleThemeChange(theme.id, e.target.checked)
                      }
                    />
                    <span>{theme.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input id="terms" type="checkbox" required />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I agree to the Terms of Service and Privacy Policy
            </label>
          </div>
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </form>
        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <button
            onClick={() => navigate("login")}
            className="text-indigo-600 hover:underline font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

// Login Page Component
const LoginPage = ({ navigate, onLogin }) => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!credentials.email || !credentials.password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      onLogin(response.user);
      navigate("dashboard");
    } catch (error) {
      setError(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      <button
        onClick={() => window.history.back()}
        className="absolute top-8 left-8 text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        Back
      </button>
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex flex-col items-center space-y-4">
            <Logo size="large" />
            <h2 className="text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
          </div>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <button
              onClick={() => navigate("register")}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              start for free
            </button>
          </p>
        </div>
        <form
          className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg"
          onSubmit={handleSubmit}
        >
          <div className="rounded-md shadow-sm -space-y-px flex flex-col gap-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={credentials.email}
                onChange={handleChange}
                required
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={credentials.password}
                onChange={handleChange}
                required
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Password"
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Implement password reset logic
                }}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Forgot your password?
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DashboardPage = ({ user, onLogout }) => {
  const [prompt, setPrompt] = useState("");
  const [prompts, setPrompts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("generate");
  const [hoveredPostId, setHoveredPostId] = useState(null);
  const hoverTimeoutRef = React.useRef(null);

  const handleMouseEnter = (postId) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredPostId(postId);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredPostId(null);
    }, 10000); // 10-second delay
  };
  
  const fetchPrompts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.getPrompts();
      setPrompts(response?.data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch prompts.");
      setPrompts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    if (activeTab === 'posts') {
        fetchPrompts();
    }
  }, [activeTab, fetchPrompts]);

  useEffect(() => {
    // Initial fetch
    fetchPrompts();
     // Cleanup timeout on unmount
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [fetchPrompts]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await authService.sendPrompt(prompt);
      setPrompt("");
      await fetchPrompts();
      setActiveTab("posts");
    } catch (err) {
      setError(err.message || "Failed to generate post.");
    } finally {
      setIsLoading(false);
    }
  }, [prompt, fetchPrompts]);

  const userGeneratedTags = [];
  if (user?.profession) {
    userGeneratedTags.push(user.profession);
  }
  if (user?.hobbies) {
    if (typeof user.hobbies === 'string') {
      const hobbyList = user.hobbies.split(',').map(h => h.trim()).filter(h => h);
      userGeneratedTags.push(...hobbyList);
    } else if (Array.isArray(user.hobbies)) {
      userGeneratedTags.push(...user.hobbies.map(h => h.trim()).filter(h => h));
    }
  }

  const allTags = [...new Set(["Generate image", "Gibli", "Text", ...userGeneratedTags])];

  const handleTagClick = (tag) => {
    setPrompt(prev => prev ? `${prev} ${tag}` : tag);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-6">
          <Logo />
        </div>
        <nav className="mt-6">
          <button
            onClick={() => setActiveTab("generate")}
            className={`flex items-center px-6 py-3 text-gray-700 w-full text-left ${
              activeTab === "generate" ? "bg-gray-200" : ""
            }`}
          >
            Generate Post
          </button>
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex items-center px-6 py-3 text-gray-600 hover:bg-gray-200 w-full text-left ${
              activeTab === "posts" ? "bg-gray-200" : ""
            }`}
          >
            Generated Posts
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center p-4 bg-white border-b">
          <h1 className="text-xl font-semibold text-gray-800">
            {activeTab === "generate" ? "Generate New Post" : "Generated Posts"}
          </h1>
          <div className="flex items-center space-x-4">
            <span className="font-semibold text-gray-700">
              Welcome,  {user?.username }!
            </span>
            <button
              onClick={onLogout}
              className="bg-red-500 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md">
              <p>{error}</p>
            </div>
          )}

          {activeTab === "generate" && (
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">
                What do you want to post about?
              </h2>
              {allTags.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Click to add to your prompt:</p>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag, index) => (
                      <button
                        key={index}
                        onClick={() => handleTagClick(tag)}
                        className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm hover:bg-gray-300 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full p-3 border rounded-lg"
                rows="4"
                placeholder="e.g., A photo of a cat programming on a laptop"
              />
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {isLoading ? "Generating..." : "Generate Post"}
              </button>
            </div>
          )}

          {activeTab === "posts" && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {isLoading && <p>Loading posts...</p>}
              {!isLoading && prompts.length === 0 && <p>No posts found.</p>}
              {prompts.map((p) => {
                  const postUrl = encodeURIComponent(`${config.API_BASE_URL}${p.metadata.imageUrl}`);
                  const postCaption = encodeURIComponent(p.metadata?.caption || "");
                  
                  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${postUrl}&quote=${postCaption}`;
                  const instagramUrl = "https://www.instagram.com";
                  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${postUrl}`;

                  return (
                <div
                  key={p.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden relative"
                  onMouseEnter={() => handleMouseEnter(p.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="w-full h-56 bg-black">
                    <img
                      src={`${config.API_BASE_URL}${p.metadata.imageUrl}`}
                      alt="Generated content"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {hoveredPostId === p.id && (
                    <div className="absolute top-0 left-0 w-full h-56 bg-black bg-opacity-60 flex items-center justify-center space-x-4">
                        <a href={facebookShareUrl} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" className="text-white hover:text-gray-300">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.142v3.24h-1.918c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.732 0 1.325-.593 1.325-1.325V1.325C24 .593 23.407 0 22.675 0z"/></svg>
                        </a>
                        <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Share on Instagram" className="text-white hover:text-gray-300">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.07 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.849-.07c-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919C8.416 2.175 8.744 2.163 12 2.163m0-2.163C8.74 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.667.072 4.947.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98C15.667.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z"/></svg>
                        </a>
                        <a href={linkedinShareUrl} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" className="text-white hover:text-gray-300">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14C2.761 0 0 2.239 0 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5V5c0-2.761-2.238-5-5-5zM8 19H5V8h3v11zM6.5 6.732c-.966 0-1.75-.788-1.75-1.764s.784-1.764 1.75-1.764 1.75.788 1.75 1.764S7.466 6.732 6.5 6.732zM20 19h-3v-5.604c0-3.368-4-3.113-4 0V19h-3V8h3v1.765c1.396-2.586 7-2.777 7 2.476V19z"/></svg>
                        </a>
                    </div>
                  )}

                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">
                      {p.metadata?.caption || "Generated Post"}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      <strong>Original Prompt:</strong> {p.originalPrompt}
                    </p>
                    {p.metadata?.hashtags && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {p.metadata.hashtags.map((tag, index) => (
                          <span key={index} className="bg-gray-200 rounded-full px-2 py-1 text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
