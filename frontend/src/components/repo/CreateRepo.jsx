import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import { API_BASE_URL } from "../../api";

const CreateRepo = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [isPublic, setIsPublic] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Repository name is required!");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/repo/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name,
          description,
          visibility: isPublic ,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create repository.");
        return;
      }

      navigate(`/repo/${data.repositoryID}`);
    } catch (err) {
      console.error("Error creating repository: ", err);
      setError("Server error. Please try again.");
    }
  };

  return (
    <>
      <Navbar />
      <section id="create-repo">
        <h2>Create a new repository</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Repository name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="my-awesome-project"
              required
            />
          </label>

          <label>
            Description (optional)
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short description of your repository"
            />
          </label>

          <fieldset>
            <legend>Visibility</legend>
            <label>
              <input
                type="radio"
                name="visibility"
                checked={isPublic === true}
                onChange={() => setIsPublic(true)}
              />
              Public
            </label>
            <label>
              <input
                type="radio"
                name="visibility"
                checked={isPublic === false}
                onChange={() => setIsPublic(false)}
              />
              Private
            </label>
          </fieldset>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <button type="submit">Create repository</button>
        </form>
      </section>
    </>
  );
};

export default CreateRepo;
