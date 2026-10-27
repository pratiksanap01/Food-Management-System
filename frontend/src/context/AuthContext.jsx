import { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem("user");
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (e) {
            return null;
        }
    });

    const [token, setToken] = useState(() => {
        return localStorage.getItem("token") || null;
    });

    const [loading, setLoading] = useState(false);

    // Keep token in localStorage synchronized
    useEffect(() => {
        if (token) {
            localStorage.setItem("token", token);
        } else {
            localStorage.removeItem("token");
        }
    }, [token]);

    // Keep user in localStorage synchronized
    useEffect(() => {
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        } else {
            localStorage.removeItem("user");
        }
    }, [user]);

    // Login action
    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await API.post("/auth/login", {
                email,
                password
            });

            const { token: receivedToken, user: receivedUser } = response.data;

            setToken(receivedToken);
            setUser(receivedUser);
            localStorage.setItem("token", receivedToken);
            localStorage.setItem("user", JSON.stringify(receivedUser));

            return response.data;
        } finally {
            setLoading(false);
        }
    };

    // Register action
    const register = async (userData) => {
        setLoading(true);
        try {
            const response = await API.post("/auth/register", userData);
            return response.data;
        } finally {
            setLoading(false);
        }
    };

    // Logout action
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                register,
                logout,
                isAuthenticated: Boolean(user && token)
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export default AuthContext;