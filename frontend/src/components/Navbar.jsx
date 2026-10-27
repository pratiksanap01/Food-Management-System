import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to={isAuthenticated ? "/dashboard" : "/login"} className="nav-brand">
                    <div className="nav-logo-icon">🍲</div>
                    <span>Waste Food Management</span>
                </Link>

                <div className="nav-links">
                    {!isAuthenticated ? (
                        <>
                            <NavLink
                                to="/login"
                                className={({ isActive }) =>
                                    `nav-link ${isActive ? "active" : ""}`
                                }
                            >
                                Login
                            </NavLink>
                            <NavLink
                                to="/register"
                                className={({ isActive }) =>
                                    `nav-link ${isActive ? "active" : ""}`
                                }
                            >
                                Register
                            </NavLink>
                        </>
                    ) : (
                        <>
                            <NavLink
                                to="/dashboard"
                                className={({ isActive }) =>
                                    `nav-link ${isActive ? "active" : ""}`
                                }
                            >
                                Dashboard
                            </NavLink>

                            <NavLink
                                to="/food"
                                className={({ isActive }) =>
                                    `nav-link ${isActive ? "active" : ""}`
                                }
                            >
                                Available Food
                            </NavLink>

                            {/* Only donors or admins can add food */}
                            {(user.role === "donor" || user.role === "admin") && (
                                <NavLink
                                    to="/add-food"
                                    className={({ isActive }) =>
                                        `nav-link ${isActive ? "active" : ""}`
                                    }
                                >
                                    + Add Food
                                </NavLink>
                            )}

                            <NavLink
                                to="/requests"
                                className={({ isActive }) =>
                                    `nav-link ${isActive ? "active" : ""}`
                                }
                            >
                                Requests
                            </NavLink>

                            {/* Admin-only navigation link */}
                            {user.role === "admin" && (
                                <NavLink
                                    to="/admin"
                                    className={({ isActive }) =>
                                        `nav-link ${isActive ? "active" : ""}`
                                    }
                                >
                                    Admin Panel
                                </NavLink>
                            )}

                            <div className="nav-user">
                                <div className="user-badge">
                                    <span className="user-name">{user.name}</span>
                                    <span className={`user-role role-${user.role}`}>
                                        {user.role}
                                    </span>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="btn btn-secondary btn-sm"
                                    title="Sign out"
                                >
                                    Logout
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;