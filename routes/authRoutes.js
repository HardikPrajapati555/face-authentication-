const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const User = require('../models/userModel');
const router = express.Router();

// Multer config for storing images
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// Register user
router.post('/register', upload.single('faceImage'), async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, faceImage: req.file.path });

        await newUser.save();
        res.json({ message: "User Registered" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login with Face Recognition
router.post('/face-login', async (req, res) => {
    try {
        const { email, faceImage } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: "User not found" });

        // Compare face image (You'd actually need to compare facial descriptors using face-api.js)
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
