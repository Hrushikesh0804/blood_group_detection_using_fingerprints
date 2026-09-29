const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();


// =====================================================
// SIGNUP
// =====================================================

router.post("/signup", async (req, res) => {

    try {

        // -------------------------------------------------
        // 1. Get data sent by React/Postman
        // -------------------------------------------------

        const {
            name,
            email,
            password
        } = req.body;


        console.log("Signup request received");

        console.log("Name:", name);
        console.log("Email:", email);


        // -------------------------------------------------
        // 2. Validate input
        // -------------------------------------------------

        if (
            !name ||
            !email ||
            !password
        ) {

            return res.status(400).json({

                message:
                    "Name, email and password are required"

            });

        }


        // -------------------------------------------------
        // 3. Check whether user already exists
        // -------------------------------------------------

        const existingUser =
            await User.findOne({
                email: email.toLowerCase()
            });


        if (existingUser) {

            return res.status(409).json({

                message:
                    "User with this email already exists"

            });

        }


        // -------------------------------------------------
        // 4. Hash password
        // -------------------------------------------------

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // -------------------------------------------------
        // 5. Create new user
        // -------------------------------------------------

        const user =
            await User.create({

                name: name,

                email:
                    email.toLowerCase(),

                password:
                    hashedPassword

            });


        // -------------------------------------------------
        // 6. Send response
        // -------------------------------------------------

        return res.status(201).json({

            message:
                "User registered successfully",

            user: {

                id: user._id,

                name: user.name,

                email: user.email

            }

        });


    } catch (error) {

        console.error(
            "Signup error:",
            error
        );


        return res.status(500).json({

            message:
                "Server error during signup",

            error:
                error.message

        });

    }

});
// =====================================================
// LOGIN
// =====================================================

router.post("/login", async (req, res) => {

    try {

        // -------------------------------------------------
        // 1. Get email and password from request
        // -------------------------------------------------

        const {
            email,
            password
        } = req.body;


        console.log("Login request received");

        console.log("Email:", email);


        // -------------------------------------------------
        // 2. Validate input
        // -------------------------------------------------

        if (!email || !password) {

            return res.status(400).json({

                message:
                    "Email and password are required"

            });

        }


        // -------------------------------------------------
        // 3. Find user in MongoDB
        // -------------------------------------------------

        const user = await User.findOne({

            email: email.toLowerCase()

        });


        // -------------------------------------------------
        // 4. Check whether user exists
        // -------------------------------------------------

        if (!user) {

            return res.status(401).json({

                message:
                    "Invalid email or password"

            });

        }


        // -------------------------------------------------
        // 5. Compare password
        // -------------------------------------------------

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        // -------------------------------------------------
        // 6. Check password
        // -------------------------------------------------

        if (!passwordMatch) {

            return res.status(401).json({

                message:
                    "Invalid email or password"

            });

        }


        // -------------------------------------------------
        // 7. Login successful
        // -------------------------------------------------

        // -------------------------------------------------
// Generate JWT token
// -------------------------------------------------

const token = jwt.sign(

    {
        userId: user._id
    },

    process.env.JWT_SECRET,

    {
        expiresIn: "1d"
    }

);


// -------------------------------------------------
// Send token to frontend
// -------------------------------------------------

return res.status(200).json({

    message:
        "Login successful",

    token: token,

    user: {

        id: user._id,

        name: user.name,

        email: user.email

    }

});


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        return res.status(500).json({

            message:
                "Server error during login"

        });

    }

});

module.exports = router;