import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
    {
        donor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Donor reference is required"]
        },

        title: {
            type: String,
            required: [true, "Food title is required"],
            trim: true
        },

        description: {
            type: String,
            default: "",
            trim: true
        },

        foodType: {
            type: String,
            enum: {
                values: ["vegetarian", "non-vegetarian", "vegan"],
                message: "{VALUE} is not a valid food type"
            },
            required: [true, "Food type is required"]
        },

        quantity: {
            type: Number,
            required: [true, "Quantity is required"],
            min: [1, "Quantity must be at least 1"]
        },

        unit: {
            type: String,
            enum: {
                values: ["kg", "plates", "packets"],
                message: "{VALUE} is not a valid unit"
            },
            required: [true, "Unit is required"]
        },

        location: {
            type: String,
            required: [true, "Pickup location is required"],
            trim: true
        },

        availableUntil: {
            type: Date,
            required: [true, "Expiry date/time is required"]
        },

        image: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            enum: ["available", "requested", "claimed", "completed", "expired"],
            default: "available"
        }
    },
    {
        timestamps: true
    }
);

export const Food = mongoose.model("Food", foodSchema);
export default Food;
