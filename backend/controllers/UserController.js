import bcrypt from "bcrypt";
import UserModel from "../models/User.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    try {
        const {email, fullName, password, avatarUrl} = req.body;

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const doc = new UserModel({
            email,
            fullName,
            passwordHash: hash,
            avatarUrl
        });

        const user = await doc.save();

        const token = jwt.sign(
            {
                _id: user._id
            },
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: '30d'
            });

        const { passwordHash, ...userData } = user._doc;

        res.json({...userData, token});
    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: 'Oops...Something went wrong!'
        });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: 'Email/password is not valid!'
            });
        }

        const isValidPass = await bcrypt.compare(password, user?._doc.passwordHash);

        if (!isValidPass) {
            return res.status(400).json({
                message: 'Email/password is not valid!'
            });
        }

        const token = jwt.sign(
            {
                _id: user._id
            },
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: '30d'
            });

        const { passwordHash, ...userData } = user._doc;

        res.json({...userData, token});
    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: 'Oops...Something went wrong!'
        })
    }
}

export const getMe = async (req, res) => {

    try {
        const user = await UserModel.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: 'User was not founded!'
            });
        }

        const { passwordHash, ...userData } = user._doc;

        res.json(userData);
    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: 'Oops...Something went wrong!'
        });
    }
}