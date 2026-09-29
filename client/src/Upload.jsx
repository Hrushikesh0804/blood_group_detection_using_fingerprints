import { useState } from "react";
import axios from "axios";

function Upload() {
  // Stores the image selected by the user
  const [image, setImage] = useState(null);

  // Stores the prediction returned by backend
  const [result, setResult] = useState(null);

  // Used to show loading status
  const [loading, setLoading] = useState(false);

  // Stores error messages
  const [error, setError] = useState("");

  // =====================================================
  // WHEN USER SELECTS AN IMAGE
  // =====================================================

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) {
      return;
    }

    console.log("Selected image:", selectedFile);

    setImage(selectedFile);

    // Clear old prediction
    setResult(null);

    // Clear old error
    setError("");
  };

  // =====================================================
  // SEND IMAGE TO EXPRESS
  // =====================================================

  const handlePredict = async () => {
    // Check whether image is selected

    if (!image) {
      setError("Please select an image first.");

      return;
    }

    // Create FormData

    const formData = new FormData();

    // IMPORTANT:
    // "image" must match:
    //
    // upload.single("image")
    //
    // in Express

    formData.append("image", image);

    try {
      // Start loading

      setLoading(true);

      setError("");

      setResult(null);

      console.log("Sending image to backend...");

      // Send image to Express

      const response = await axios.post(
        "http://localhost:5000/api/predict",

        formData,
      );

      console.log("Backend response:", response.data);

      // Store prediction result

      setResult(response.data);
    } catch (error) {
      console.error("Prediction error:", error);

      // Try to display backend error

      if (error.response) {
        setError(error.response.data?.error || "Prediction failed");
      } else {
        setError("Could not connect to backend server.");
      }
    } finally {
      // Stop loading

      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div>
      <h1>Blood Group Detection</h1>

      {/* -----------------------------------------
                IMAGE UPLOAD
            ------------------------------------------ */}

      <input type="file" accept="image/*" onChange={handleFileChange} />

      {/* -----------------------------------------
                SHOW SELECTED FILE
            ------------------------------------------ */}

      {image && <p>Selected image: {image.name}</p>}

      {/* -----------------------------------------
                PREDICT BUTTON
            ------------------------------------------ */}

      <button onClick={handlePredict} disabled={loading}>
        {loading ? "Predicting..." : "Predict Blood Group"}
      </button>

      {/* -----------------------------------------
                ERROR
            ------------------------------------------ */}

      {error && <p>{error}</p>}

      {/* -----------------------------------------
                RESULT
            ------------------------------------------ */}

      {result && (
        <div>
          <h2>Prediction Result</h2>

          <h3>Blood Group: {result.prediction}</h3>

          <p>Confidence: {result.confidence}%</p>

          {/* ---------------------------------
                        ALL PROBABILITIES
                    ---------------------------------- */}

          {result.probabilities && (
            <div>
              <h3>Class Probabilities</h3>

              {Object.entries(result.probabilities).map(
                ([label, probability]) => (
                  <p key={label}>
                    {label}
                    {" : "}
                    {probability}%
                  </p>
                ),
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Upload;
