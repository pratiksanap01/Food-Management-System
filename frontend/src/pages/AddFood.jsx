import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function AddFood() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: "",
        description: "",
        foodType: "vegetarian",
        quantity: "",
        unit: "plates",
        location: "",
        availableUntil: "",
        image: ""
    });

    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
        if (errorMsg) setErrorMsg("");
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        if (!form.title.trim() || !form.quantity || !form.location.trim() || !form.availableUntil) {
            setErrorMsg("Please fill in all required fields (Title, Quantity, Location, and Expiry).");
            return;
        }

        if (Number(form.quantity) <= 0) {
            setErrorMsg("Quantity must be a positive number.");
            return;
        }

        setLoading(true);
        try {
            // Check if file upload is being used
            if (imageFile) {
                const formData = new FormData();
                formData.append("title", form.title);
                formData.append("description", form.description);
                formData.append("foodType", form.foodType);
                formData.append("quantity", form.quantity);
                formData.append("unit", form.unit);
                formData.append("location", form.location);
                formData.append("availableUntil", form.availableUntil);
                formData.append("image", imageFile);

                await API.post("/food", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                });
            } else {
                await API.post("/food", form);
            }

            setSuccessMsg("Food donation listed successfully! Helping someone in need.");

            setTimeout(() => {
                navigate("/food");
            }, 1200);

        } catch (error) {
            console.error("Add food error:", error);
            setErrorMsg(
                error.response?.data?.message ||
                error.message ||
                "Failed to create food donation. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: "700px" }}>
            <div className="section-card">
                <div className="section-card-header">
                    <div>
                        <h2>Donate Surplus Food</h2>
                        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
                            Enter the details of your available food to connect with local charities and receivers.
                        </p>
                    </div>
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
                    {/* Food Title */}
                    <div className="form-group">
                        <label htmlFor="title">
                            Food Title / Name <span className="required">*</span>
                        </label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            placeholder="e.g. Cooked Biryani & Dal, Fresh Sandwiches, Bakery Bread"
                            value={form.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label htmlFor="description">Description & Packaging Details</label>
                        <textarea
                            id="description"
                            name="description"
                            placeholder="e.g. Freshly prepared 3 hours ago, packed in hygienic aluminum containers, untouched."
                            value={form.description}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Food Type */}
                    <div className="form-group">
                        <label htmlFor="foodType">
                            Food Category <span className="required">*</span>
                        </label>
                        <select
                            id="foodType"
                            name="foodType"
                            value={form.foodType}
                            onChange={handleChange}
                        >
                            <option value="vegetarian">🥗 Vegetarian</option>
                            <option value="non-vegetarian">🍗 Non-Vegetarian</option>
                            <option value="vegan">🌱 Vegan</option>
                        </select>
                    </div>

                    {/* Quantity & Unit Inline */}
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="quantity">
                                Quantity <span className="required">*</span>
                            </label>
                            <input
                                id="quantity"
                                name="quantity"
                                type="number"
                                min="1"
                                placeholder="e.g. 20"
                                value={form.quantity}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="unit">
                                Unit <span className="required">*</span>
                            </label>
                            <select
                                id="unit"
                                name="unit"
                                value={form.unit}
                                onChange={handleChange}
                            >
                                <option value="plates">Plates</option>
                                <option value="kg">Kilograms (kg)</option>
                                <option value="packets">Packets / Boxes</option>
                            </select>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="form-group">
                        <label htmlFor="location">
                            Pickup Address / Landmark <span className="required">*</span>
                        </label>
                        <input
                            id="location"
                            name="location"
                            type="text"
                            placeholder="e.g. Hotel Green Park, MG Road, Pune"
                            value={form.location}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Available Until */}
                    <div className="form-group">
                        <label htmlFor="availableUntil">
                            Safe to Consume Until <span className="required">*</span>
                        </label>
                        <input
                            id="availableUntil"
                            name="availableUntil"
                            type="datetime-local"
                            value={form.availableUntil}
                            onChange={handleChange}
                            required
                        />
                        <span className="form-hint">Specify date and time before food spoils</span>
                    </div>

                    {/* Optional Image */}
                    <div className="form-group">
                        <label htmlFor="imageFile">Food Image (Optional)</label>
                        <input
                            id="imageFile"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <span className="form-hint">Or paste direct image URL below:</span>
                        <input
                            name="image"
                            type="url"
                            placeholder="https://example.com/food-photo.jpg"
                            value={form.image}
                            onChange={handleChange}
                            style={{ marginTop: "4px" }}
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="btn btn-primary btn-lg btn-block"
                        disabled={loading}
                    >
                        {loading ? "Publishing Donation..." : "Publish Food Donation"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddFood;