import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

function Dashboard() {
    const { user } = useAuth();

    const [donorStats, setDonorStats] = useState({
        myDonationsCount: 0,
        availableCount: 0,
        receivedRequestsCount: 0,
        completedCount: 0,
        recentDonations: []
    });

    const [receiverStats, setReceiverStats] = useState({
        availableFoodCount: 0,
        myRequestsCount: 0,
        acceptedCount: 0,
        completedCount: 0,
        recentRequests: []
    });

    const [adminStats, setAdminStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                if (user?.role === "donor") {
                    const [myFoodRes, receivedReqRes, availRes] = await Promise.all([
                        API.get("/food/my"),
                        API.get("/requests/received"),
                        API.get("/food/available")
                    ]);

                    const myFoods = myFoodRes.data.food || [];
                    const receivedReqs = receivedReqRes.data.requests || [];
                    const completed = receivedReqs.filter(r => r.status === "completed").length;

                    setDonorStats({
                        myDonationsCount: myFoods.length,
                        availableCount: myFoods.filter(f => f.status === "available").length,
                        receivedRequestsCount: receivedReqs.length,
                        completedCount: completed,
                        recentDonations: myFoods.slice(0, 4)
                    });

                } else if (user?.role === "receiver") {
                    const [availRes, myReqRes] = await Promise.all([
                        API.get("/food/available"),
                        API.get("/requests/my")
                    ]);

                    const availableFoods = availRes.data.food || [];
                    const myReqs = myReqRes.data.requests || [];
                    const accepted = myReqs.filter(r => r.status === "accepted").length;
                    const completed = myReqs.filter(r => r.status === "completed").length;

                    setReceiverStats({
                        availableFoodCount: availableFoods.length,
                        myRequestsCount: myReqs.length,
                        acceptedCount: accepted,
                        completedCount: completed,
                        recentRequests: myReqs.slice(0, 4)
                    });

                } else if (user?.role === "admin") {
                    const adminRes = await API.get("/admin/dashboard");
                    setAdminStats(adminRes.data.dashboard);
                }
            } catch (error) {
                console.error("Dashboard fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    return (
        <div className="container">
            {/* Header Hero */}
            <div className="dashboard-hero">
                <div>
                    <h2>Welcome back, {user?.name}! 👋</h2>
                    <p>
                        {user?.role === "donor" && "Thank you for sharing surplus food and making a difference in the community."}
                        {user?.role === "receiver" && "Explore available food donations and submit requests for your NGO or shelter."}
                        {user?.role === "admin" && "Monitor all food donations, requests, and registered users across the platform."}
                    </p>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                    {user?.role === "donor" && (
                        <Link to="/add-food" className="btn btn-primary" style={{ background: "#ffffff", color: "var(--primary-dark)" }}>
                            + Add Food Donation
                        </Link>
                    )}
                    {user?.role === "receiver" && (
                        <Link to="/food" className="btn btn-primary" style={{ background: "#ffffff", color: "var(--primary-dark)" }}>
                            🍲 Browse Food
                        </Link>
                    )}
                    {user?.role === "admin" && (
                        <Link to="/admin" className="btn btn-primary" style={{ background: "#ffffff", color: "var(--primary-dark)" }}>
                            📊 Open Admin Panel
                        </Link>
                    )}
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    Loading your dashboard statistics...
                </div>
            ) : (
                <>
                    {/* ================= DONOR DASHBOARD ================= */}
                    {user?.role === "donor" && (
                        <>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon green">🍲</div>
                                    <div className="stat-info">
                                        <h3>{donorStats.myDonationsCount}</h3>
                                        <p>My Total Donations</p>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon blue">✨</div>
                                    <div className="stat-info">
                                        <h3>{donorStats.availableCount}</h3>
                                        <p>Currently Available</p>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon orange">📬</div>
                                    <div className="stat-info">
                                        <h3>{donorStats.receivedRequestsCount}</h3>
                                        <p>Requests Received</p>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon purple">✅</div>
                                    <div className="stat-info">
                                        <h3>{donorStats.completedCount}</h3>
                                        <p>Completed Donations</p>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Donations List */}
                            <div className="section-card">
                                <div className="section-card-header">
                                    <h2>My Recent Food Donations</h2>
                                    <Link to="/requests" className="btn btn-secondary btn-sm">
                                        View Received Requests
                                    </Link>
                                </div>

                                {donorStats.recentDonations.length === 0 ? (
                                    <div className="empty-state">
                                        <div className="empty-state-icon">🍲</div>
                                        <h3>No donations listed yet</h3>
                                        <p>You haven't added any food donations. Share surplus food to help prevent wastage.</p>
                                        <Link to="/add-food" className="btn btn-primary">
                                            + Donate Food Now
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Title</th>
                                                    <th>Type</th>
                                                    <th>Quantity</th>
                                                    <th>Location</th>
                                                    <th>Status</th>
                                                    <th>Expiry</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {donorStats.recentDonations.map((item) => (
                                                    <tr key={item._id}>
                                                        <td><strong>{item.title}</strong></td>
                                                        <td style={{ textTransform: "capitalize" }}>{item.foodType}</td>
                                                        <td>{item.quantity} {item.unit}</td>
                                                        <td>{item.location}</td>
                                                        <td>
                                                            <span className={`status-badge status-${item.status}`} style={{ position: "static" }}>
                                                                {item.status}
                                                            </span>
                                                        </td>
                                                        <td>{new Date(item.availableUntil).toLocaleDateString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* ================= RECEIVER DASHBOARD ================= */}
                    {user?.role === "receiver" && (
                        <>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon green">🍲</div>
                                    <div className="stat-info">
                                        <h3>{receiverStats.availableFoodCount}</h3>
                                        <p>Available Food Donations</p>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon blue">📝</div>
                                    <div className="stat-info">
                                        <h3>{receiverStats.myRequestsCount}</h3>
                                        <p>My Total Requests</p>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon orange">🎉</div>
                                    <div className="stat-info">
                                        <h3>{receiverStats.acceptedCount}</h3>
                                        <p>Accepted Requests</p>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon purple">✅</div>
                                    <div className="stat-info">
                                        <h3>{receiverStats.completedCount}</h3>
                                        <p>Completed Collections</p>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Requests Section */}
                            <div className="section-card">
                                <div className="section-card-header">
                                    <h2>My Recent Requests</h2>
                                    <Link to="/requests" className="btn btn-secondary btn-sm">
                                        View All My Requests
                                    </Link>
                                </div>

                                {receiverStats.recentRequests.length === 0 ? (
                                    <div className="empty-state">
                                        <div className="empty-state-icon">🤝</div>
                                        <h3>No food requests yet</h3>
                                        <p>Browse available food donations from local restaurants, hotels, and canteens.</p>
                                        <Link to="/food" className="btn btn-primary">
                                            Find Food to Claim
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Food Item</th>
                                                    <th>Requested Qty</th>
                                                    <th>Donor</th>
                                                    <th>Donor Phone</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {receiverStats.recentRequests.map((req) => (
                                                    <tr key={req._id}>
                                                        <td><strong>{req.food?.title || "N/A"}</strong></td>
                                                        <td>{req.quantity} {req.food?.unit || ""}</td>
                                                        <td>{req.food?.donor?.name || "N/A"}</td>
                                                        <td>{req.food?.donor?.phone || "N/A"}</td>
                                                        <td>
                                                            <span className={`status-badge status-${req.status}`} style={{ position: "static" }}>
                                                                {req.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* ================= ADMIN DASHBOARD ================= */}
                    {user?.role === "admin" && adminStats && (
                        <>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon green">👥</div>
                                    <div className="stat-info">
                                        <h3>{adminStats.totalUsers}</h3>
                                        <p>Total Registered Users</p>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon blue">🍲</div>
                                    <div className="stat-info">
                                        <h3>{adminStats.totalDonors}</h3>
                                        <p>Food Donors</p>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon orange">🏢</div>
                                    <div className="stat-info">
                                        <h3>{adminStats.totalReceivers}</h3>
                                        <p>Receivers / NGOs</p>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon purple">📦</div>
                                    <div className="stat-info">
                                        <h3>{adminStats.totalFood}</h3>
                                        <p>Total Food Listings</p>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon green">✨</div>
                                    <div className="stat-info">
                                        <h3>{adminStats.availableFood}</h3>
                                        <p>Active Available Food</p>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon orange">📬</div>
                                    <div className="stat-info">
                                        <h3>{adminStats.totalRequests}</h3>
                                        <p>Total Food Requests</p>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon purple">🎯</div>
                                    <div className="stat-info">
                                        <h3>{adminStats.completedRequests}</h3>
                                        <p>Completed Deliveries</p>
                                    </div>
                                </div>
                            </div>

                            <div className="section-card">
                                <div className="section-card-header">
                                    <h2>Administrative Actions</h2>
                                </div>
                                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                                    <Link to="/admin" className="btn btn-primary">
                                        Manage All Users, Food & Requests
                                    </Link>
                                    <Link to="/food" className="btn btn-secondary">
                                        View Public Food Listings
                                    </Link>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export default Dashboard;