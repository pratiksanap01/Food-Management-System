import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function Requests() {
    const { user } = useAuth();

    // Default tab based on role
    const [activeTab, setActiveTab] = useState(
        user?.role === "donor" ? "received" : "my"
    );

    const [myRequests, setMyRequests] = useState([]);
    const [receivedRequests, setReceivedRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [actionLoadingId, setActionLoadingId] = useState(null);

    const loadRequests = async () => {
        setLoading(true);
        setErrorMsg("");
        try {
            if (user?.role === "donor" || user?.role === "admin") {
                const receivedRes = await API.get("/requests/received");
                setReceivedRequests(receivedRes.data.requests || []);
            }

            if (user?.role === "receiver" || user?.role === "admin") {
                const myRes = await API.get("/requests/my");
                setMyRequests(myRes.data.requests || []);
            }
        } catch (error) {
            console.error("Load requests error:", error);
            setErrorMsg(error.response?.data?.message || "Failed to load requests.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            loadRequests();
        }
    }, [user]);

    // Handle Accept Request
    const handleAccept = async (requestId) => {
        setActionLoadingId(requestId);
        setErrorMsg("");
        setSuccessMsg("");
        try {
            await API.put(`/requests/${requestId}/accept`);
            setSuccessMsg("Request accepted successfully! Food is marked as claimed.");
            loadRequests();
        } catch (error) {
            console.error("Accept error:", error);
            setErrorMsg(error.response?.data?.message || "Failed to accept request.");
        } finally {
            setActionLoadingId(null);
        }
    };

    // Handle Reject Request
    const handleReject = async (requestId) => {
        if (!window.confirm("Are you sure you want to reject this request? The food will become available again.")) {
            return;
        }

        setActionLoadingId(requestId);
        setErrorMsg("");
        setSuccessMsg("");
        try {
            await API.put(`/requests/${requestId}/reject`);
            setSuccessMsg("Request rejected. Food status restored to available.");
            loadRequests();
        } catch (error) {
            console.error("Reject error:", error);
            setErrorMsg(error.response?.data?.message || "Failed to reject request.");
        } finally {
            setActionLoadingId(null);
        }
    };

    // Handle Complete Request
    const handleComplete = async (requestId) => {
        setActionLoadingId(requestId);
        setErrorMsg("");
        setSuccessMsg("");
        try {
            await API.put(`/requests/${requestId}/complete`);
            setSuccessMsg("Request completed! The food has been delivered/collected.");
            loadRequests();
        } catch (error) {
            console.error("Complete error:", error);
            setErrorMsg(error.response?.data?.message || "Failed to complete request.");
        } finally {
            setActionLoadingId(null);
        }
    };

    return (
        <div className="container">
            <div className="page-header">
                <div>
                    <h1>Food Claim Requests</h1>
                    <p>Track incoming requests from NGOs or your own food requests.</p>
                </div>
                <button onClick={loadRequests} className="btn btn-secondary btn-sm">
                    🔄 Refresh
                </button>
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

            {/* Navigation Tabs */}
            <div className="tabs">
                {(user?.role === "donor" || user?.role === "admin") && (
                    <button
                        className={`tab-btn ${activeTab === "received" ? "active" : ""}`}
                        onClick={() => setActiveTab("received")}
                    >
                        Received Requests ({receivedRequests.length})
                    </button>
                )}

                {(user?.role === "receiver" || user?.role === "admin") && (
                    <button
                        className={`tab-btn ${activeTab === "my" ? "active" : ""}`}
                        onClick={() => setActiveTab("my")}
                    >
                        My Requests ({myRequests.length})
                    </button>
                )}
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
                    Loading requests...
                </div>
            ) : (
                <>
                    {/* RECEIVED REQUESTS VIEW (For Donors) */}
                    {activeTab === "received" && (
                        <div className="section-card">
                            <div className="section-card-header">
                                <h2>Requests for Your Donated Food</h2>
                            </div>

                            {receivedRequests.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-state-icon">📬</div>
                                    <h3>No requests received yet</h3>
                                    <p>When an NGO or receiver claims your available food, their request will appear here.</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Food Item</th>
                                                <th>Requested Qty</th>
                                                <th>Receiver / NGO</th>
                                                <th>Contact & Address</th>
                                                <th>Message</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {receivedRequests.map((req) => (
                                                <tr key={req._id}>
                                                    <td>
                                                        <strong>{req.food?.title || "Unknown Food"}</strong>
                                                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                                            Total available: {req.food?.quantity} {req.food?.unit}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <strong>{req.quantity}</strong> {req.food?.unit}
                                                    </td>
                                                    <td>
                                                        <div><strong>{req.receiver?.name}</strong></div>
                                                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{req.receiver?.email}</div>
                                                    </td>
                                                    <td>
                                                        <div>📞 {req.receiver?.phone || "No phone provided"}</div>
                                                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>📍 {req.receiver?.address || "No address"}</div>
                                                    </td>
                                                    <td>
                                                        <span style={{ fontSize: "13px", color: req.message ? "inherit" : "var(--text-muted)", fontStyle: req.message ? "normal" : "italic" }}>
                                                            {req.message || "No message attached"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge status-${req.status}`} style={{ position: "static" }}>
                                                            {req.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                                            {req.status === "pending" && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleAccept(req._id)}
                                                                        className="btn btn-success btn-sm"
                                                                        disabled={actionLoadingId === req._id}
                                                                    >
                                                                        Accept
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleReject(req._id)}
                                                                        className="btn btn-danger btn-sm"
                                                                        disabled={actionLoadingId === req._id}
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </>
                                                            )}

                                                            {req.status === "accepted" && (
                                                                <button
                                                                    onClick={() => handleComplete(req._id)}
                                                                    className="btn btn-primary btn-sm"
                                                                    disabled={actionLoadingId === req._id}
                                                                >
                                                                    Mark Completed
                                                                </button>
                                                            )}

                                                            {req.status === "completed" && (
                                                                <span style={{ fontSize: "13px", color: "var(--primary)", fontWeight: 600 }}>
                                                                    ✓ Done
                                                                </span>
                                                            )}

                                                            {req.status === "rejected" && (
                                                                <span style={{ fontSize: "13px", color: "var(--danger)" }}>
                                                                    Rejected
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* MY REQUESTS VIEW (For Receivers) */}
                    {activeTab === "my" && (
                        <div className="section-card">
                            <div className="section-card-header">
                                <h2>My Food Requests</h2>
                                <Link to="/food" className="btn btn-primary btn-sm">
                                    + Browse More Food
                                </Link>
                            </div>

                            {myRequests.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-state-icon">📝</div>
                                    <h3>You haven't requested any food yet</h3>
                                    <p>Find available surplus meals from local restaurants and event venues.</p>
                                    <Link to="/food" className="btn btn-primary">
                                        Browse Available Food
                                    </Link>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Food Title</th>
                                                <th>Quantity</th>
                                                <th>Donor & Contact</th>
                                                <th>Pickup Location</th>
                                                <th>Status</th>
                                                <th>Requested Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {myRequests.map((req) => (
                                                <tr key={req._id}>
                                                    <td>
                                                        <strong>{req.food?.title || "Food item"}</strong>
                                                        <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "capitalize" }}>
                                                            {req.food?.foodType}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <strong>{req.quantity}</strong> {req.food?.unit || "units"}
                                                    </td>
                                                    <td>
                                                        <div><strong>{req.food?.donor?.name || "Donor"}</strong></div>
                                                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                                            📞 {req.food?.donor?.phone || "N/A"}
                                                        </div>
                                                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                                            ✉️ {req.food?.donor?.email || "N/A"}
                                                        </div>
                                                    </td>
                                                    <td>{req.food?.location || "N/A"}</td>
                                                    <td>
                                                        <span className={`status-badge status-${req.status}`} style={{ position: "static" }}>
                                                            {req.status}
                                                        </span>
                                                    </td>
                                                    <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default Requests;