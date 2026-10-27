import jwt from "jsonwebtoken";

const generateToken = (user) => {
    const secret = process.env.JWT_SECRET || "waste_food_management_jwt_secret_fallback_key";

    return jwt.sign(
        {
            id: user._id,
            role: user.role,
            name: user.name,
            email: user.email
        },
        secret,
        {
            expiresIn: "7d"
        }
    );
};

export default generateToken;