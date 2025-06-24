const config = {
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
    API_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
    TOKEN_KEY: 'auth_token',
    USER_KEY: 'user_data',
    // Add other configuration variables here
};

export default config;
