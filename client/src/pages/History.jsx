import { useEffect, useState } from "react";

function History() {
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =====================================================
  // FETCH HISTORY
  // =====================================================

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login first");
      }

      const response = await fetch("http://localhost:5000/api/history", {
        method: "GET",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch history");
      }

      setHistory(data.history || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RUN WHEN PAGE LOADS
  // =====================================================

  useEffect(() => {
    fetchHistory();
  }, []);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div>
        <h2>Loading history...</h2>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "40px auto",
      }}
    >
      <h1>Prediction History</h1>

      {error && <p>{error}</p>}

      {!error && history.length === 0 && <p>No predictions found.</p>}

      {/* =================================================
                HISTORY LIST
            ================================================= */}

      <div>
        {history.map((item) => (
          <div
            key={item._id}
            style={{
              border: "1px solid #ddd",

              padding: "20px",

              marginBottom: "15px",

              borderRadius: "8px",
            }}
          >
            <h3>Blood Group: {item.prediction}</h3>

            <p>Image: {item.imageName}</p>

            <p>Confidence: {Number(item.confidence).toFixed(2)}%</p>

            <p>Date: {new Date(item.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default History;
