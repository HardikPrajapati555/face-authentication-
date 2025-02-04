const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const User = require('../models/userModel');

const router = express.Router();

// Multer setup for Cloudinary storage
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "face-login",  // Folder name in Cloudinary
        allowedFormats: ["jpg", "png", "jpeg"],
    },
});
const upload = multer({ storage });

// Register user with Cloudinary image upload
router.post('/register', upload.single('faceImage'), async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const imageUrl = req.file.path;  // Cloudinary image URL

        const newUser = new User({ name, email, password: hashedPassword, faceImage: imageUrl });
        await newUser.save();

        res.json({ message: "User Registered", imageUrl });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login with Face Recognition (Comparing Cloudinary image)
router.post('/face-login', async (req, res) => {
    try {
        const { email, faceImage } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: "User not found" });

        // Here, you'd typically use `face-api.js` to compare images.
        if (user.faceImage === faceImage) {
            const token = jwt.sign({ id: user._id }, "SECRET_KEY", { expiresIn: "1h" });
            res.json({ message: "Login successful", token });
        } else {
            res.status(400).json({ message: "Face not recognized" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
