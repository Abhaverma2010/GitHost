import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../Navbar";
import { useAuth } from "../../useAuth";
import { API_BASE_URL } from "../../api";
import "./repo.css";

const RepoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [repository, setRepository] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [issues, setIssues] = useState([]);
  const [issuesError, setIssuesError] = useState("");
  const [issueTitle, setIssueTitle] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [issuesVersion, setIssuesVersion] = useState(0);

  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  const [repoActionError, setRepoActionError] = useState("");

  const isOwner =
    !!repository && String(repository.owner?._id ?? repository.owner) === String(currentUser);

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  useEffect(() => {
    const fetchRepository = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/repo/${id}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Repository not found.");
          return;
        }

        setRepository(data);
        setEditedDescription(data.description || "");
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
          `${API_BASE_URL}/repo/${id}/issue/all`
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

    if (!issueTitle.trim() || !issueDescription.trim()) {
      setIssuesError("Title and description are required.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/repo/${id}/issue/create`,
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ title: issueTitle, description: issueDescription }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setIssuesError(data.error || "Failed to create issue.");
        return;
      }

      setIssueTitle("");
      setIssueDescription("");
      setIssuesVersion((v) => v + 1);
    } catch (err) {
      console.error("Error creating issue: ", err);
      setIssuesError("Server error. Please try again.");
    }
  };

  const handleToggleStatus = async (issue) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/issue/update/${issue._id}`,
        {
          method: "PUT",
          headers: authHeaders(),
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
        `${API_BASE_URL}/issue/delete/${issueId}`,
        {
          method: "DELETE",
          headers: authHeaders(),
        }
      );

      if (!response.ok) return;

      setIssuesVersion((v) => v + 1);
    } catch (err) {
      console.error("Error deleting issue: ", err);
    }
  };

  const handleSaveDescription = async (e) => {
    e.preventDefault();
    setRepoActionError("");

    try {
      const response = await fetch(`${API_BASE_URL}/repo/update/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ description: editedDescription }),
      });

      const data = await response.json();

      if (!response.ok) {
        setRepoActionError(data.error || "Failed to update repository.");
        return;
      }

      setRepository(data.repository);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating repository: ", err);
      setRepoActionError("Server error. Please try again.");
    }
  };

  const handleToggleVisibility = async () => {
    setRepoActionError("");

    try {
      const response = await fetch(`${API_BASE_URL}/repo/toggle/${id}`, {
        method: "PATCH",
        headers: authHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        setRepoActionError(data.error || "Failed to toggle visibility.");
        return;
      }

      setRepository(data.repository);
    } catch (err) {
      console.error("Error toggling visibility: ", err);
      setRepoActionError("Server error. Please try again.");
    }
  };

  const handleDeleteRepo = async () => {
    if (!window.confirm(`Delete repository "${repository.name}"? This cannot be undone.`)) {
      return;
    }

    setRepoActionError("");

    try {
      const response = await fetch(`${API_BASE_URL}/repo/delete/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        setRepoActionError(data.error || "Failed to delete repository.");
        return;
      }

      navigate("/");
    } catch (err) {
      console.error("Error deleting repository: ", err);
      setRepoActionError("Server error. Please try again.");
    }
  };

  return (
    <>
      <Navbar />
      <section id="repo-detail">
        {loading && <p>Loading repository...</p>}

        {!loading && error && (
          <div>
            <p className="error-text">{error}</p>
            <Link to="/">Back to dashboard</Link>
          </div>
        )}

        {!loading && repository && (
          <div className="repo-detail-card">
            <div className="repo-detail-header">
              <h2>{repository.name}</h2>
              {isOwner && (
                <div className="repo-owner-actions">
                  <button onClick={handleToggleVisibility}>
                    Make {repository.visibility ? "Private" : "Public"}
                  </button>
                  <button onClick={() => setIsEditing((v) => !v)}>
                    {isEditing ? "Cancel" : "Edit"}
                  </button>
                  <button className="danger-btn" onClick={handleDeleteRepo}>
                    Delete
                  </button>
                </div>
              )}
            </div>

            {repoActionError && <p className="error-text">{repoActionError}</p>}

            {isEditing ? (
              <form className="edit-description-form" onSubmit={handleSaveDescription}>
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Repository description"
                />
                <button type="submit">Save</button>
              </form>
            ) : (
              <p>{repository.description || "No description provided."}</p>
            )}

            <p>
              <strong>Visibility:</strong>{" "}
              {repository.visibility ? "Public" : "Private"}
            </p>
            <Link to="/">Back to dashboard</Link>

            <div id="issues">
              <h3>Issues</h3>

              {issuesError && <p className="error-text">{issuesError}</p>}

              <form onSubmit={handleCreateIssue} className="new-issue-form">
                <input
                  type="text"
                  value={issueTitle}
                  onChange={(e) => setIssueTitle(e.target.value)}
                  placeholder="Issue title"
                />
                <textarea
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="Describe the issue"
                />
                <button type="submit">New issue</button>
              </form>

              {issues.length === 0 && <p>No issues yet.</p>}

              <ul className="issue-list">
                {issues.map((issue) => (
                  <li key={issue._id} className="issue-item">
                    <div className="issue-item-header">
                      <strong>{issue.title}</strong>
                      <span className={`issue-status issue-status-${issue.status}`}>
                        {issue.status}
                      </span>
                    </div>
                    <p>{issue.description}</p>
                    <div className="issue-actions">
                      <button onClick={() => handleToggleStatus(issue)}>
                        {issue.status === "open" ? "Close" : "Reopen"}
                      </button>
                      <button
                        className="danger-btn"
                        onClick={() => handleDeleteIssue(issue._id)}
                      >
                        Delete
                      </button>
                    </div>
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
