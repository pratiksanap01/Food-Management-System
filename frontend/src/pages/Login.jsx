import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, loading } = useAuth();

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [errorMsg, setErrorMsg] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
        if (errorMsg) setErrorMsg("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        if (!form.email.trim() || !form.password) {
            setErrorMsg("Please enter both email and password.");
            return;
        }

        try {
            await login(form.email, form.password);

            // Redirect to where the user was heading, or /dashboard
            const from = location.state?.from?.pathname || "/dashboard";
            navigate(from, { replace: true });

        } catch (error) {
            console.error("Login error details:", error);

            const backendMessage = error.response?.data?.message;
            if (backendMessage) {
                setErrorMsg(backendMessage);
            } else if (error.code === "ERR_NETWORK") {
                setErrorMsg("Cannot connect to server. Please verify backend is running on http://localhost:5000");
            } else {
                setErrorMsg(error.message || "Login failed. Please check your credentials.");
            }
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-icon">🥗</div>
                    <h2>Welcome Back</h2>
                    <p>Log in to access your donations and requests</p>
                </div>

                {errorMsg && (
                    <div className="alert alert-error">
                        <span>⚠️</span>
                        <span>{errorMsg}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Enter your registered email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block btn-lg"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Log In"}
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account yet? <Link to="/register">Register here</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;