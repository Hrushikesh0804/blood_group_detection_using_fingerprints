const express = require("express");

const Prediction = require("../models/Prediction");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// GET USER PREDICTION HISTORY
// =====================================================

router.get(
    "/",
    authMiddleware,
    async (req, res) => {

        try {

            console.log(
                "History request received"
            );

            console.log(
                "User ID:",
                req.user.userId
            );


            // -------------------------------------------------
            // Find predictions belonging to logged-in user
            // -------------------------------------------------

            const history = await Prediction.find({

                userId: req.user.userId

            }).sort({

                createdAt: -1

            });


            // -------------------------------------------------
            // Send history
            // -------------------------------------------------

            return res.status(200).json({

                history: history

            });


        } catch (error) {

            console.error(
                "History error:",
                error
            );


            return res.status(500).json({

                message:
                    "Failed to fetch prediction history"

            });

        }

    }
);


module.exports = router;