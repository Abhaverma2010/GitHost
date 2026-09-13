function authorizeRepoOwner(Repository) {
  return async (req, res, next) => {
    try {
      const repository = await Repository.findById(req.params.id);
      if (!repository) {
        return res.status(404).json({ error: "Repository not found!" });
      }
      if (String(repository.owner) !== String(req.userId)) {
        return res.status(403).json({ error: "Not authorized" });
      }
      req.repository = repository;
      next();
    } catch (err) {
      res.status(500).send("Server error");
    }
  };
}

module.exports = { authorizeRepoOwner };
