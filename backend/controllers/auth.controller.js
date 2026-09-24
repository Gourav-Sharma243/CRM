import {User} from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateToken } from "../utils/generateToken.js";
import { ApiError } from "../utils/ApiError.js";

const toClientUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    company: user.company,
    avtar: user.avtar,
})

export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, company } = req.body;
    
    if (!name || !email || !password) {
        throw new ApiError(400, "Name, email, and password are required");
    }

    const existingUser = await User.findOne({ email : email.toLowerCase() });
    if (existingUser) {
        throw new ApiError(400, "User already exists with this email");
    }

    const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        company});

    res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: toClientUser(user),
    });
});


export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if(!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
        throw new ApiError(401, "Invalid email or password");
    }

    res.json({
        success: true,
        token: generateToken(user._id),
        user: toClientUser(user),
    });
}); 

export const getMe = asyncHandler(async (req, res) => {
    res.json({success: true, user: toClientUser(req.user)});
});

export const updateProfile = asyncHandler(async (req, res) => {
    const { name, company, avatar, password } = req.body;
    const user = req.user;
    if(name !== undefined) user.name = name;
    if(company !== undefined) user.company = company;
    if(avatar !== undefined) user.avatar = avatar;
    if(password) {
        user.password = password;
    }
    await user.save();
    res.json({success: true, user: toClientUser(user)});
});