function FoodCard({ food, onRequest, isOwner, onDelete }) {
    if (!food) return null;

    const {
        _id,
        title,
        description,
        foodType,
        quantity,
        unit,
        location,
        availableUntil,
        donor,
        image,
        status
    } = food;

    // Check if expired
    const isExpired = new Date(availableUntil) < new Date();
    const formattedExpiry = new Date(availableUntil).toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short"
    });

    return (
        <div className="food-card">
            {/* Image & Badges */}
            <div className="food-card-img-wrapper">
                {image ? (
                    <img src={image} alt={title} className="food-card-img" />
                ) : (
                    <div className="food-card-placeholder">
                        {foodType === "vegetarian" ? "🥗" : foodType === "vegan" ? "🌱" : "🍗"}
                    </div>
                )}

                <span className={`food-type-tag food-type-${foodType}`}>
                    {foodType}
                </span>

                <span className={`status-badge status-${isExpired ? "expired" : status}`}>
                    {isExpired ? "Expired" : status}
                </span>
            </div>

            {/* Content Body */}
            <div className="food-card-body">
                <h3 className="food-card-title">{title}</h3>
                <p className="food-card-desc">
                    {description || "No additional description provided."}
                </p>

                {/* Key Metrics */}
                <div className="food-card-details">
                    <div className="food-detail-item">
                        <span>📦</span>
                        <span>
                            Quantity: <strong>{quantity} {unit}</strong>
                        </span>
                    </div>

                    <div className="food-detail-item">
                        <span>📍</span>
                        <span>
                            Location: <strong>{location}</strong>
                        </span>
                    </div>

                    <div className="food-detail-item">
                        <span>⏰</span>
                        <span>
                            Available Until: <strong>{formattedExpiry}</strong>
                        </span>
                    </div>

                    {donor && (
                        <div className="food-detail-item">
                            <span>👤</span>
                            <span>
                                Donor: <strong>{donor.name || "Anonymous Donor"}</strong>
                                {donor.phone && ` (${donor.phone})`}
                            </span>
                        </div>
                    )}
                </div>

                {/* Action Footer */}
                <div className="food-card-footer">
                    {isOwner ? (
                        <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                            {onDelete && (
                                <button
                                    onClick={() => onDelete(_id)}
                                    className="btn btn-outline-danger btn-sm btn-block"
                                >
                                    Delete Listing
                                </button>
                            )}
                        </div>
                    ) : (
                        status === "available" && !isExpired && onRequest && (
                            <button
                                onClick={() => onRequest(food)}
                                className="btn btn-primary btn-block"
                            >
                                Request Food
                            </button>
                        )
                    )}

                    {status !== "available" && !isOwner && (
                        <span style={{ fontSize: "13px", color: "var(--text-muted)", fontStyle: "italic" }}>
                            {status === "claimed" ? "Claimed by NGO" : status === "requested" ? "Request Pending" : "Completed"}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FoodCard;
