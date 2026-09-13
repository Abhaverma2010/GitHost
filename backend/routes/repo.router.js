const express = require("express");
const repoController = require("../controllers/repoController");
const authMiddleware = require("../middleware/authMiddleware");
const { authorizeRepoOwner } = require("../middleware/authorizeMiddleware");
const Repository = require("../models/repoModel");

const repoRouter = express.Router();

repoRouter.post("/repo/create", authMiddleware, repoController.createRepository);
repoRouter.get("/repo/all", repoController.getAllRepositories);
repoRouter.get("/repo/:id", repoController.fetchRepositoryById);
repoRouter.get("/repo/name/:name", repoController.fetchRepositoryByName);
repoRouter.get("/repo/user/:userID", repoController.fetchRepositoriesForCurrentUser);
repoRouter.put(
  "/repo/update/:id",
  authMiddleware,
  authorizeRepoOwner(Repository),
  repoController.updateRepositoryById
);
repoRouter.delete(
  "/repo/delete/:id",
  authMiddleware,
  authorizeRepoOwner(Repository),
  repoController.deleteRepositoryById
);
repoRouter.patch(
  "/repo/toggle/:id",
  authMiddleware,
  authorizeRepoOwner(Repository),
  repoController.toggleVisibilityById
);

module.exports = repoRouter;
