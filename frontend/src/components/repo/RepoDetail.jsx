import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../Navbar";

const RepoDetail = () => {
  const { id } = useParams();
  const [repository, setRepository] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepository = async () => {
      try {
        const response = await fetch(`http://localhost:3000/repo/${id}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Repository not found.");
          return;
        }

        setRepository(data);
      } catch (err) {
        console.error("Error fetching repository: ", err);
        setError("Server error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRepository();
  }, [id]);

  return (
    <>
      <Navbar />
      <section id="repo-detail">
        {loading && <p>Loading repository...</p>}

        {!loading && error && (
          <div>
            <p style={{ color: "red" }}>{error}</p>
            <Link to="/">Back to dashboard</Link>
          </div>
        )}

        {!loading && repository && (
          <div>
            <h2>{repository.name}</h2>
            <p>{repository.description || "No description provided."}</p>
            <p>
              <strong>Visibility:</strong>{" "}
              {repository.visibility ? "Public" : "Private"}
            </p>
            <Link to="/">Back to dashboard</Link>
          </div>
        )}
      </section>
    </>
  );
};

export default RepoDetail;