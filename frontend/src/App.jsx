import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddFood from "./pages/AddFood";
import AvailableFood from "./pages/AvailableFood";
import Requests from "./pages/Requests";
import Admin from "./pages/Admin";

// Root Route handler to send logged-in users to /dashboard and visitors to /login
function RootRedirect() {
    const { isAuthenticated } = useAuth();
    return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Navbar />
                <Routes>
                    {/* Default Route */}
                    <Route path="/" element={<RootRedirect />} />

                    {/* Public Auth Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected User Routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/food"
                        element={
                            <ProtectedRoute>
                                <AvailableFood />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/add-food"
                        element={
                            <ProtectedRoute allowedRoles={["donor", "admin"]}>
                                <AddFood />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/requests"
                        element={
                            <ProtectedRoute>
                                <Requests />
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin Only Route */}
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute allowedRoles={["admin"]}>
                                <Admin />
                            </ProtectedRoute>
                        }
                    />

                    {/* Fallback wildcard */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;