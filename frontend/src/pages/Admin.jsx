import { useState, useEffect } from "react";
import API from "../services/api";

function Admin() {
    const [activeTab, setActiveTab] = useState("overview");

    const [dashboard, setDashboard] = useState(null);
    const [users, setUsers] = useState([]);
    const [foodList, setFoodList] = useState([]);
    const [requests, setRequests] = useState([]);

    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    const loadAdminData = async () => {
        setLoading(true);
        setErrorMsg("");
        try {
            const [dashRes, usersRes, foodRes, reqsRes] = await Promise.all([
                API.get("/admin/dashboard"),
                API.get("/admin/users"),
                API.get("/admin/food"),
                API.get("/admin/requests")
            ]);

            setDashboard(dashRes.data.dashboard);
            setUsers(usersRes.data.users || []);
            setFoodList(foodRes.data.food || []);
            setRequests(reqsRes.data.requests || []);

        } catch (error) {
            console.error("Admin data load error:", error);
            setErrorMsg(error.response?.data?.message || "Failed to load admin data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAdminData();
    }, []);

    return (
        <div className="container">
            <div className="page-header">
                <div>
                    <h1>Admin Control Panel</h1>
                    <p>System oversight, platform analytics, and database monitoring.</p>
                </div>
                <button onClick={loadAdminData} className="btn btn-secondary btn-sm">
                    🔄 Refresh Data
                </button>
            </div>

            {errorMsg && (
                <div className="alert alert-error">
                    <span>⚠️</span>
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="tabs">
                <button
                    className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
                    onClick={() => setActiveTab("overview")}
                >
                    📊 Overview
                </button>
                <button
                    className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
                    onClick={() => setActiveTab("users")}
                >
                    👥 Users ({users.length})
                </button>
                <button
                    className={`tab-btn ${activeTab === "food" ? "active" : ""}`}
                    onClick={() => setActiveTab("food")}
                >
                    🍲 Food Donations ({foodList.length})
                </button>
                <button
                    className={`tab-btn ${activeTab === "requests" ? "active" : ""}`}
                    onClick={() => setActiveTab("requests")}
                >
                    📬 Requests ({requests.length})
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
                    Loading system administration records...
                </div>
            ) : (
                <>
                    {/* TAB 1: OVERVIEW */}
                    {activeTab === "overview" && dashboard && (
                        <div>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon green">👥</div>
                                    <div className="stat-info">
                                        <h3>{dashboard.totalUsers}</h3>
                                        <p>Total Users</p>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon green">🍲</div>
                                    <div className="stat-info">
                                        <h3>{dashboard.totalDonors}</h3>
                                        <p>Donors</p>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon blue">🏢</div>
                                    <div className="stat-info">
                                        <h3>{dashboard.totalReceivers}</h3>
                                        <p>Receivers / NGOs</p>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon purple">📦</div>
                                    <div className="stat-info">
                                        <h3>{dashboard.totalFood}</h3>
                                        <p>Total Food Posted</p>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon green">✨</div>
                                    <div className="stat-info">
                                        <h3>{dashboard.availableFood}</h3>
                                        <p>Available Listings</p>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon orange">📬</div>
                                    <div className="stat-info">
                                        <h3>{dashboard.totalRequests}</h3>
                                        <p>Total Claims</p>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon purple">🎯</div>
                                    <div className="stat-info">
                                        <h3>{dashboard.completedRequests}</h3>
                                        <p>Completed Deliveries</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: ALL USERS */}
                    {activeTab === "users" && (
                        <div className="section-card">
                            <div className="section-card-header">
                                <h2>Registered Users ({users.length})</h2>
                            </div>

                            <div className="table-responsive">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Phone</th>
                                            <th>Address</th>
                                            <th>Joined Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u._id}>
                                                <td><strong>{u.name}</strong></td>
                                                <td>{u.email}</td>
                                                <td>
                                                    <span className={`user-role role-${u.role}`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td>{u.phone || "—"}</td>
                                                <td>{u.address || "—"}</td>
                                                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: ALL FOOD */}
                    {activeTab === "food" && (
                        <div className="section-card">
                            <div className="section-card-header">
                                <h2>All Food Donations ({foodList.length})</h2>
                            </div>

                            <div className="table-responsive">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Donor</th>
                                            <th>Type</th>
                                            <th>Quantity</th>
                                            <th>Location</th>
                                            <th>Status</th>
                                            <th>Expiry</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {foodList.map((f) => (
                                            <tr key={f._id}>
                                                <td><strong>{f.title}</strong></td>
                                                <td>
                                                    <div>{f.donor?.name || "N/A"}</div>
                                                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{f.donor?.email}</div>
                                                </td>
                                                <td style={{ textTransform: "capitalize" }}>{f.foodType}</td>
                                                <td>{f.quantity} {f.unit}</td>
                                                <td>{f.location}</td>
                                                <td>
                                                    <span className={`status-badge status-${f.status}`} style={{ position: "static" }}>
                                                        {f.status}
                                                    </span>
                                                </td>
                                                <td>{new Date(f.availableUntil).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: ALL REQUESTS */}
                    {activeTab === "requests" && (
                        <div className="section-card">
                            <div className="section-card-header">
                                <h2>All Food Requests ({requests.length})</h2>
                            </div>

                            <div className="table-responsive">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Food Item</th>
                                            <th>Receiver / NGO</th>
                                            <th>Requested Qty</th>
                                            <th>Message</th>
                                            <th>Status</th>
                                            <th>Created At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requests.map((r) => (
                                            <tr key={r._id}>
                                                <td><strong>{r.food?.title || "N/A"}</strong></td>
                                                <td>
                                                    <div>{r.receiver?.name || "N/A"}</div>
                                                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{r.receiver?.email}</div>
                                                </td>
                                                <td>{r.quantity} {r.food?.unit}</td>
                                                <td>{r.message || "—"}</td>
                                                <td>
                                                    <span className={`status-badge status-${r.status}`} style={{ position: "static" }}>
                                                        {r.status}
                                                    </span>
                                                </td>
                                                <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default Admin;
