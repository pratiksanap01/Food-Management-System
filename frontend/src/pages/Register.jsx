import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
    const navigate = useNavigate();
    const { register, loading } = useAuth();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "donor",
        phone: "",
        address: ""
    });

    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
        if (errorMsg) setErrorMsg("");
    };

    const handleRoleSelect = (selectedRole) => {
        setForm({
            ...form,
            role: selectedRole
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        // Frontend preliminary validations
        if (!form.name.trim() || !form.email.trim() || !form.password) {
            setErrorMsg("Please fill in all required fields (Name, Email, and Password).");
            return;
        }

        if (form.password.length < 6) {
            setErrorMsg("Password must be at least 6 characters long.");
            return;
        }

        try {
            const data = await register(form);

            setSuccessMsg(data.message || "Registration successful! Redirecting to login...");

            // Redirect after 1.5 seconds
            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (error) {
            console.error("Registration error details:", error);

            // Extract useful backend error message or provide helpful fallback
            const backendMessage = error.response?.data?.message;
            if (backendMessage) {
                setErrorMsg(backendMessage);
            } else if (error.code === "ERR_NETWORK") {
                setErrorMsg("Cannot connect to server. Please verify backend is running on http://localhost:5000");
            } else {
                setErrorMsg(error.message || "Registration failed. Please check your details and try again.");
            }
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-icon">🌱</div>
                    <h2>Create an Account</h2>
                    <p>Join the movement to prevent food wastage</p>
                </div>

                {errorMsg && (
                    <div className="alert alert-error">
                        <span>⚠️</span>
                        <span>{errorMsg}</span>
                    </div>
                )}

                {successMsg && (
                    <div className="alert alert-success">
                        <span>✅</span>
                        <span>{successMsg}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    {/* Role Selection */}
                    <div className="form-group">
                        <label>I want to:</label>
                        <div className="role-options">
                            <div
                                className={`role-card ${form.role === "donor" ? "selected" : ""}`}
                                onClick={() => handleRoleSelect("donor")}
                            >
                                <div className="role-title">🍲 Donate Food</div>
                                <div className="role-desc">Restaurants, Hotels, Canteens, Individuals</div>
                            </div>

                            <div
                                className={`role-card ${form.role === "receiver" ? "selected" : ""}`}
                                onClick={() => handleRoleSelect("receiver")}
                            >
                                <div className="role-title">🤝 Receive Food</div>
                                <div className="role-desc">NGOs, Charities, Shelters, Community</div>
                            </div>
                        </div>
                    </div>

                    {/* Full Name */}
                    <div className="form-group">
                        <label htmlFor="name">
                            Full Name / Organization Name <span className="required">*</span>
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="e.g. John Doe or Green Earth NGO"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <label htmlFor="email">
                            Email Address <span className="required">*</span>
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="e.g. john@example.com"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label htmlFor="password">
                            Password <span className="required">*</span>
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Minimum 6 characters"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                        <span className="form-hint">At least 6 characters</span>
                    </div>

                    {/* Phone */}
                    <div className="form-group">
                        <label htmlFor="phone">Phone Number</label>
                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="e.g. 9876543210"
                            value={form.phone}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Address */}
                    <div className="form-group">
                        <label htmlFor="address">Address / City</label>
                        <textarea
                            id="address"
                            name="address"
                            placeholder="e.g. 123 Main Road, Pune, Maharashtra"
                            value={form.address}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="btn btn-primary btn-block btn-lg"
                        disabled={loading}
                    >
                        {loading ? "Registering..." : "Create Account"}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Log in here</Link>
                </div>
            </div>
        </div>
    );
}

export default Register;