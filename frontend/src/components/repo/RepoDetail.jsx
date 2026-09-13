import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../Navbar";

const RepoDetail = () => {
  const { id } = useParams();
  const [repository, setRepository] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [issues, setIssues] = useState([]);
  const [issuesError, setIssuesError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [issuesVersion, setIssuesVersion] = useState(0);

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

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/repo/${id}/issue/all`
        );
        const data = await response.json();

        if (!response.ok) {
          setIssuesError(data.error || "Unable to load issues.");
          return;
        }

        setIssues(data);
      } catch (err) {
        console.error("Error fetching issues: ", err);
        setIssuesError("Server error. Please try again.");
      }
    };

    fetchIssues();
  }, [id, issuesVersion]);

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    setIssuesError("");

    if (!title.trim() || !description.trim()) {
      setIssuesError("Title and description are required.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/repo/${id}/issue/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ title, description }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setIssuesError(data.error || "Failed to create issue.");
        return;
      }

      setTitle("");
      setDescription("");
      setIssuesVersion((v) => v + 1);
    } catch (err) {
      console.error("Error creating issue: ", err);
      setIssuesError("Server error. Please try again.");
    }
  };

  const handleToggleStatus = async (issue) => {
    try {
      const response = await fetch(
        `http://localhost:3000/issue/update/${issue._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            status: issue.status === "open" ? "closed" : "open",
          }),
        }
      );

      if (!response.ok) return;

      setIssuesVersion((v) => v + 1);
    } catch (err) {
      console.error("Error updating issue: ", err);
    }
  };

  const handleDeleteIssue = async (issueId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/issue/delete/${issueId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) return;

      setIssuesVersion((v) => v + 1);
    } catch (err) {
      console.error("Error deleting issue: ", err);
    }
  };

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

            <div id="issues">
              <h3>Issues</h3>

              {issuesError && <p style={{ color: "red" }}>{issuesError}</p>}

              <form onSubmit={handleCreateIssue}>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Issue title"
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue"
                />
                <button type="submit">New issue</button>
              </form>

              {issues.length === 0 && <p>No issues yet.</p>}

              <ul>
                {issues.map((issue) => (
                  <li key={issue._id}>
                    <strong>{issue.title}</strong> ({issue.status})
                    <p>{issue.description}</p>
                    <button onClick={() => handleToggleStatus(issue)}>
                      {issue.status === "open" ? "Close" : "Reopen"}
                    </button>
                    <button onClick={() => handleDeleteIssue(issue._id)}>
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default RepoDetail;