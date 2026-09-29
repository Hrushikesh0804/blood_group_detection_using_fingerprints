const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        imageName: {
            type: String,
            required: true
        },

        prediction: {
            type: String,
            required: true
        },

        confidence: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Prediction = mongoose.model(
    "Prediction",
    predictionSchema
);

module.exports = Prediction;