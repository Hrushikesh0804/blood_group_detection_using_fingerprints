# Blood Group Detection Using Fingerprints

A full-stack AI/ML application that predicts a person's blood group from a fingerprint image using a deep-learning model based on ResNet50.

## Features

- Fingerprint image upload
- Blood group prediction using a trained ResNet50 model
- User signup and login
- JWT-based authentication
- Password hashing using bcrypt
- Prediction history stored in MongoDB
- React frontend
- Node.js + Express backend
- Python/TensorFlow ML inference

## Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS

### Backend
- Node.js
- Express.js
- MongoDB / MongoDB Atlas
- Mongoose
- JWT
- bcrypt

### Machine Learning
- Python
- TensorFlow / Keras
- ResNet50
- Transfer Learning
- Fingerprint image classification

## Project Structure

```text
blood_group_detection/
│
├── client/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
│
├── server/
│   ├── config/
│   ├── middleware/
│   ├── ml/
│   │   ├── model_weights.weights.h5
│   │   ├── predict_local_weights.py
│   │   └── requirements_local.txt
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── package.json
│   └── ...
│
└── README.md
```

## How the Application Works

```text
User
  ↓
React Frontend
  ↓
Node.js + Express API
  ↓
JWT Authentication + Multer
  ↓
Python ML Prediction Script
  ↓
ResNet50 Model
  ↓
Blood Group Prediction
  ↓
MongoDB
  ↓
Prediction History
```

## Prerequisites

Install the following before running the project:

- Node.js
- npm
- Python 3.x
- MongoDB Atlas account or local MongoDB
- Git

## 1. Clone the Repository

```bash
git clone https://github.com/Hrushikesh0804/blood_group_detection_using_fingerprints.git
cd blood_group_detection_using_fingerprints
```

## 2. Setup the Backend

Open a terminal in the server folder:

```bash
cd server
npm install
```

Create a `.env` file inside `server/`.

Add your backend configuration, for example:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

Use the exact variable names expected by your backend source code if they differ.

## 3. Setup the Python ML Environment

From the `server` folder:

### Windows

```powershell
python -m venv venv
venv\Scripts\activate
```

Then install the ML dependencies:

```bash
pip install -r ml/requirements_local.txt
```

The trained model should be available at:

```text
server/ml/model_weights.weights.h5
```

## 4. Start the Backend

From the `server` folder:

```bash
npm start
```

If your `package.json` uses a different development script, use:

```bash
npm run dev
```

The backend will normally run on the port configured in your `.env` file.

## 5. Setup the Frontend

Open a **new terminal** and run:

```bash
cd client
npm install
```

## 6. Start the Frontend

```bash
npm run dev
```

Vite will display the local URL in the terminal, usually:

```text
http://localhost:5173
```

Open that URL in your browser.

## Running the Complete Project

You need two terminals.

### Terminal 1 - Backend

```bash
cd blood_group_detection/server
npm install
npm start
```

### Terminal 2 - Frontend

```bash
cd blood_group_detection/client
npm install
npm run dev
```

Then open the frontend URL shown by Vite.

## Machine Learning Model

The application uses a ResNet50-based CNN model for fingerprint image classification.

The trained weights are stored in:

```text
server/ml/model_weights.weights.h5
```

The Python inference script loads the model architecture, loads the trained weights, preprocesses the uploaded fingerprint image, performs prediction, and returns the predicted blood-group class to the Node.js backend.

## Authentication

The application uses:

- bcrypt for password hashing
- JWT for authentication
- MongoDB for storing user information
- Protected routes for prediction history

## Important GitHub Notes

Do not commit sensitive files such as:

```text
server/.env
```

Do not commit generated dependencies or virtual environments:

```text
node_modules/
venv/
uploads/
```

These should be included in `.gitignore`.

## Troubleshooting

### Python command not found

Install Python and make sure Python is added to the system PATH.

Check:

```bash
python --version
```

### Node.js command not found

Install Node.js and check:

```bash
node --version
npm --version
```

### MongoDB connection error

Check:

- MongoDB Atlas is accessible
- Your connection string is correct
- The required environment variable is present in `server/.env`
- Your IP address is allowed in MongoDB Atlas Network Access

### Model file not found

Make sure this file exists:

```text
server/ml/model_weights.weights.h5
```

### Python dependency error

Activate the virtual environment and reinstall:

```powershell
cd server
venv\Scripts\activate
pip install -r ml/requirements_local.txt
```

## Author

**Kottur Hrushikesh Reddy**

B.Tech - Computer Science Engineering

GitHub: https://github.com/Hrushikesh0804
