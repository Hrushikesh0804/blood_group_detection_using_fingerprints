require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const historyRoutes =
    require("./routes/historyRoutes");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");


// =====================================================
// AUTHENTICATION
// =====================================================

const authMiddleware =
    require("./middleware/authMiddleware");


// =====================================================
// MONGODB MODEL
// =====================================================

const Prediction =
    require("./models/Prediction");


// =====================================================
// CONNECT TO MONGODB
// =====================================================

connectDB();


// =====================================================
// EXPRESS APPLICATION
// =====================================================

const app = express();


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

app.use(express.json());


// =====================================================
// AUTH ROUTES
// =====================================================

app.use(
    "/api/auth",
    authRoutes
);
app.use(
    "/api/history",
    historyRoutes
);

// =====================================================
// DIRECTORIES
// =====================================================

const SERVER_DIR = __dirname;

const ML_DIR = path.join(
    SERVER_DIR,
    "ml"
);

const UPLOAD_DIR = path.join(
    SERVER_DIR,
    "uploads"
);


// =====================================================
// ML FILE PATHS
// =====================================================

const PYTHON_SCRIPT = path.join(
    ML_DIR,
    "predict_local_weights.py"
);

const WEIGHTS_PATH = path.join(
    ML_DIR,
    "model_weights.weights.h5"
);


// =====================================================
// CREATE UPLOAD DIRECTORY
// =====================================================

if (!fs.existsSync(UPLOAD_DIR)) {

    fs.mkdirSync(
        UPLOAD_DIR,
        {
            recursive: true
        }
    );

}


// =====================================================
// MULTER STORAGE
// =====================================================

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(
            null,
            UPLOAD_DIR
        );

    },


    filename: function (req, file, cb) {

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(
                Math.random() * 1E9
            ) +
            path.extname(
                file.originalname
            );

        cb(
            null,
            uniqueName
        );

    }

});


// =====================================================
// MULTER
// =====================================================

const upload = multer({
    storage: storage
});


// =====================================================
// TEST ROUTE
// =====================================================

app.get("/", (req, res) => {

    res.json({

        message:
            "Blood Group Detection API is running"

    });

});


// =====================================================
// PREDICTION API
// =====================================================

app.post(
    "/api/predict",

    // -------------------------------------------------
    // FIRST: VERIFY JWT
    // -------------------------------------------------

    authMiddleware,

    // -------------------------------------------------
    // SECOND: RECEIVE IMAGE
    // -------------------------------------------------

    upload.single("image"),

    // -------------------------------------------------
    // THIRD: RUN ML MODEL
    // -------------------------------------------------

    (req, res) => {

        console.log(
            "\n===================================="
        );

        console.log(
            "PREDICTION REQUEST RECEIVED"
        );

        console.log(
            "===================================="
        );


        // =================================================
        // USER INFORMATION
        // =================================================

        console.log(
            "Logged-in User ID:",
            req.user.userId
        );


        // =================================================
        // CHECK FILE
        // =================================================

        console.log(
            "File received:",
            req.file
        );


        if (!req.file) {

            return res.status(400).json({

                error:
                    "No image uploaded"

            });

        }


        console.log(
            "Original filename:",
            req.file.originalname
        );


        console.log(
            "Saved filename:",
            req.file.filename
        );


        console.log(
            "Saved path:",
            req.file.path
        );


        // =================================================
        // CHECK PYTHON SCRIPT
        // =================================================

        if (!fs.existsSync(PYTHON_SCRIPT)) {

            return res.status(500).json({

                error:
                    "Python script not found",

                path:
                    PYTHON_SCRIPT

            });

        }


        // =================================================
        // CHECK MODEL WEIGHTS
        // =================================================

        if (!fs.existsSync(WEIGHTS_PATH)) {

            return res.status(500).json({

                error:
                    "Model weights not found",

                path:
                    WEIGHTS_PATH

            });

        }


        // =================================================
        // IMAGE PATH
        // =================================================

        const imagePath =
            path.resolve(
                req.file.path
            );


        console.log(
            "Python script:",
            PYTHON_SCRIPT
        );


        console.log(
            "Weights:",
            WEIGHTS_PATH
        );


        console.log(
            "Image:",
            imagePath
        );


        // =================================================
        // START PYTHON
        // =================================================

        const pythonCommand =
            process.platform === "win32"
                ? "python"
                : "python3";


        console.log(
            "\nStarting Python..."
        );


        const pythonProcess = spawn(

            pythonCommand,

            [

                PYTHON_SCRIPT,

                "--weights",
                WEIGHTS_PATH,

                "--image",
                imagePath

            ],

            {

                cwd: SERVER_DIR

            }

        );


        // =================================================
        // STORE PYTHON OUTPUT
        // =================================================

        let output = "";

        let errorOutput = "";


        // =================================================
        // PYTHON STDOUT
        // =================================================

        pythonProcess.stdout.on(
            "data",
            (data) => {

                const text =
                    data.toString();


                console.log(
                    "PYTHON:",
                    text
                );


                output += text;

            }
        );


        // =================================================
        // PYTHON STDERR
        // =================================================

        pythonProcess.stderr.on(
            "data",
            (data) => {

                const text =
                    data.toString();


                console.error(
                    "PYTHON ERROR:",
                    text
                );


                errorOutput += text;

            }
        );


        // =================================================
        // PYTHON START ERROR
        // =================================================

        pythonProcess.on(
            "error",
            (error) => {

                console.error(
                    "Could not start Python:"
                );


                console.error(
                    error
                );

            }
        );


        // =================================================
        // PYTHON FINISHED
        // =================================================

        pythonProcess.on(
            "close",

            // IMPORTANT:
            // async is required because we use
            // await Prediction.create() below.

            async (code) => {

                console.log(
                    "Python exit code:",
                    code
                );


                // =================================================
                // PYTHON ERROR
                // =================================================

                if (code !== 0) {

                    console.error(
                        errorOutput
                    );


                    return res.status(500).json({

                        error:
                            "ML prediction failed",

                        exitCode:
                            code,

                        details:
                            errorOutput

                    });

                }


                // =================================================
                // PROCESS PYTHON RESULT
                // =================================================

                try {

                    // -------------------------------------------------
                    // Convert Python JSON string into JavaScript object
                    // -------------------------------------------------

                    const result =
                        JSON.parse(
                            output.trim()
                        );


                    console.log(
                        "FINAL RESULT:",
                        result
                    );


                    // =================================================
                    // SAVE PREDICTION TO MONGODB
                    // =================================================

                    const predictionHistory =
                        await Prediction.create({

                            // ID of logged-in user
                            userId:
                                req.user.userId,


                            // Original uploaded image name
                            imageName:
                                req.file.originalname,


                            // ML prediction
                            prediction:
                                result.prediction,


                            // ML confidence
                            confidence:
                                result.confidence

                        });


                    console.log(
                        "Prediction saved to MongoDB:"
                    );


                    console.log(
                        predictionHistory._id
                    );


                    // =================================================
                    // SEND RESULT TO FRONTEND
                    // =================================================

                    return res.json({

                        prediction:
                            result.prediction,

                        confidence:
                            result.confidence,

                        probabilities:
                            result.probabilities

                    });


                } catch (error) {

                    console.error(
                        "Prediction processing error:",
                        error
                    );


                    return res.status(500).json({

                        error:
                            "Could not process prediction",

                        details:
                            error.message

                    });

                }

            }

        );

    }

);


// =====================================================
// MULTER / GLOBAL ERROR HANDLER
// =====================================================

app.use(

    (err, req, res, next) => {

        console.log(
            "\n===================================="
        );

        console.log(
            "ERROR HANDLER"
        );

        console.log(
            "===================================="
        );


        console.log(
            "Error name:",
            err.name
        );


        console.log(
            "Error message:",
            err.message
        );


        console.log(
            "Multer field:",
            err.field
        );


        // -------------------------------------------------
        // MULTER ERROR
        // -------------------------------------------------

        if (
            err instanceof multer.MulterError
        ) {

            return res.status(400).json({

                error:
                    "Multer error",

                code:
                    err.code,

                field:
                    err.field,

                message:
                    err.message

            });

        }


        // -------------------------------------------------
        // OTHER SERVER ERROR
        // -------------------------------------------------

        return res.status(500).json({

            error:
                "Server error",

            message:
                err.message

        });

    }

);


// =====================================================
// START SERVER
// =====================================================

const PORT =
    process.env.PORT || 5000;


app.listen(
    PORT,

    () => {

        console.log(
            "================================="
        );


        console.log(
            "Blood Group Detection Server"
        );


        console.log(
            "================================="
        );


        console.log(
            `Server running at http://localhost:${PORT}`
        );


        console.log(
            "\nPython:"
        );


        console.log(
            PYTHON_SCRIPT
        );


        console.log(
            "\nWeights:"
        );


        console.log(
            WEIGHTS_PATH
        );


        console.log(
            "\nUploads:"
        );


        console.log(
            UPLOAD_DIR
        );

    }
);