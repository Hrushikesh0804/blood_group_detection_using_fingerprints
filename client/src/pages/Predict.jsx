import { useState } from "react";

function Predict() {
  const [image, setImage] = useState(null);

  const [preview, setPreview] = useState("");

  const [result, setResult] = useState(null);

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  // =====================================================
  // IMAGE SELECT
  // =====================================================

  const handleImageChange = (event) => {
    const selectedImage = event.target.files[0];

    if (!selectedImage) {
      return;
    }

    setImage(selectedImage);

    setPreview(URL.createObjectURL(selectedImage));

    setResult(null);
    setError("");
  };

  // =====================================================
  // PREDICT
  // =====================================================

  const handlePredict = async () => {
    if (!image) {
      setError("Please select an image");

      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // =================================================
      // GET JWT
      // =================================================

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login first");
      }

      // =================================================
      // CREATE FORMDATA
      // =================================================

      const formData = new FormData();

      formData.append("image", image);

      // =================================================
      // SEND IMAGE + JWT
      // =================================================

      const response = await fetch("http://localhost:5000/api/predict", {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
        },

        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Prediction failed");
      }

      // =================================================
      // STORE RESULT
      // =================================================

      setResult(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "40px auto",
      }}
    >
      <h1>Blood Group Detection</h1>

      <p>Upload a fingerprint image to predict the blood group.</p>

      {/* =================================================
                IMAGE INPUT
            ================================================= */}

      <input type="file" accept="image/*" onChange={handleImageChange} />

      {/* =================================================
                IMAGE PREVIEW
            ================================================= */}

      {preview && (
        <div
          style={{
            marginTop: "20px",
          }}
        >
          <img
            src={preview}
            alt="Selected fingerprint"
            style={{
              width: "300px",
              maxHeight: "300px",
              objectFit: "contain",
            }}
          />
        </div>
      )}

      <br />

      {/* =================================================
                PREDICT BUTTON
            ================================================= */}

      <button onClick={handlePredict} disabled={loading}>
        {loading ? "Predicting..." : "Predict Blood Group"}
      </button>

      {/* =================================================
                ERROR
            ================================================= */}

      {error && (
        <div
          style={{
            marginTop: "20px",
          }}
        >
          <p>{error}</p>
        </div>
      )}

      {/* =================================================
                RESULT
            ================================================= */}

      {result && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            border: "1px solid #ddd",
          }}
        >
          <h2>Prediction Result</h2>

          <h3>Blood Group: {result.prediction}</h3>

          <p>Confidence: {Number(result.confidence).toFixed(2)}%</p>

          {/* =================================================
                        PROBABILITIES
                    ================================================= */}

          {result.probabilities && (
            <div>
              <h3>Class Probabilities</h3>

              <pre>{JSON.stringify(result.probabilities, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Predict;
