import { useEffect, useState } from "react";
import API from "../services/api";
import FoodCard from "../components/FoodCard";
import { useAuth } from "../context/AuthContext";

function AvailableFood() {
    const { user } = useAuth();

    const [foodList, setFoodList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Filter and search states
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");

    // Modal state for requesting food
    const [selectedFood, setSelectedFood] = useState(null);
    const [requestQuantity, setRequestQuantity] = useState(1);
    const [requestMessage, setRequestMessage] = useState("");
    const [submittingRequest, setSubmittingRequest] = useState(false);

    const loadAvailableFood = async () => {
        setLoading(true);
        setErrorMsg("");
        try {
            const response = await API.get("/food/available");
            setFoodList(response.data.food || []);
        } catch (error) {
            console.error("Load available food error:", error);
            setErrorMsg(error.response?.data?.message || "Failed to load food listings.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAvailableFood();
    }, []);

    const handleOpenRequestModal = (food) => {
        setSelectedFood(food);
        setRequestQuantity(food.quantity);
        setRequestMessage("");
        setErrorMsg("");
        setSuccessMsg("");
    };

    const handleCloseModal = () => {
        setSelectedFood(null);
    };

    const handleSubmitRequest = async (e) => {
        e.preventDefault();
        if (!selectedFood) return;

        setSubmittingRequest(true);
        try {
            await API.post("/requests", {
                foodId: selectedFood._id,
                quantity: Number(requestQuantity),
                message: requestMessage
            });

            setSuccessMsg(`Food request sent successfully for "${selectedFood.title}"!`);
            handleCloseModal();
            loadAvailableFood(); // Refresh list

            setTimeout(() => {
                setSuccessMsg("");
            }, 4000);

        } catch (error) {
            console.error("Request submit error:", error);
            setErrorMsg(error.response?.data?.message || "Failed to submit request.");
        } finally {
            setSubmittingRequest(false);
        }
    };

    // Filter logic
    const filteredFood = foodList.filter((item) => {
        const matchesSearch =
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesType = typeFilter === "all" || item.foodType === typeFilter;

        return matchesSearch && matchesType;
    });

    return (
        <div className="container">
            <div className="page-header">
                <div>
                    <h1>Available Food Donations</h1>
                    <p>Verified, safe surplus food ready for collection and distribution.</p>
                </div>
                <button onClick={loadAvailableFood} className="btn btn-secondary btn-sm">
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

            {/* Filter and Search Bar */}
            <div className="filter-bar">
                <input
                    type="text"
                    placeholder="Search by food name, dish, or location..."
                    className="filter-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <select
                    className="filter-select"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                >
                    <option value="all">All Food Types</option>
                    <option value="vegetarian">🥗 Vegetarian</option>
                    <option value="non-vegetarian">🍗 Non-Vegetarian</option>
                    <option value="vegan">🌱 Vegan</option>
                </select>
            </div>

            {/* Loading Indicator */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
                    Loading available food donations...
                </div>
            ) : filteredFood.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🍲</div>
                    <h3>No Food Donations Available</h3>
                    <p>
                        {searchTerm || typeFilter !== "all"
                            ? "No donations match your current filter or search criteria."
                            : "Currently there are no active food donations in your area. Check back soon!"}
                    </p>
                    {(searchTerm || typeFilter !== "all") && (
                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setTypeFilter("all");
                            }}
                            className="btn btn-secondary btn-sm"
                        >
                            Reset Filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="food-grid">
                    {filteredFood.map((food) => (
                        <FoodCard
                            key={food._id}
                            food={food}
                            isOwner={food.donor?._id === user?.id}
                            onRequest={handleOpenRequestModal}
                        />
                    ))}
                </div>
            )}

            {/* Request Modal */}
            {selectedFood && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Request Food Donation</h3>
                            <button onClick={handleCloseModal} className="modal-close-btn">
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleSubmitRequest} className="auth-form">
                            <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                                <div style={{ fontWeight: 600 }}>{selectedFood.title}</div>
                                <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
                                    Available: {selectedFood.quantity} {selectedFood.unit} | Location: {selectedFood.location}
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="reqQty">
                                    Quantity to Request ({selectedFood.unit}) <span className="required">*</span>
                                </label>
                                <input
                                    id="reqQty"
                                    type="number"
                                    min="1"
                                    max={selectedFood.quantity}
                                    value={requestQuantity}
                                    onChange={(e) => setRequestQuantity(e.target.value)}
                                    required
                                />
                                <span className="form-hint">Maximum available: {selectedFood.quantity}</span>
                            </div>

                            <div className="form-group">
                                <label htmlFor="reqMsg">Message to Donor (Optional)</label>
                                <textarea
                                    id="reqMsg"
                                    placeholder="Explain your purpose, expected pickup time, or distribution plan..."
                                    value={requestMessage}
                                    onChange={(e) => setRequestMessage(e.target.value)}
                                />
                            </div>

                            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="btn btn-secondary btn-block"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-block"
                                    disabled={submittingRequest}
                                >
                                    {submittingRequest ? "Sending..." : "Submit Request"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AvailableFood;