const express = require("express");
const issueController = require("../controllers/issueController");
const authMiddleware = require("../middleware/authMiddleware");

const issueRouter = express.Router();

issueRouter.post("/repo/:id/issue/create", authMiddleware, issueController.createIssue);
issueRouter.get("/repo/:id/issue/all", issueController.getAllIssues);
issueRouter.put("/issue/update/:id", authMiddleware, issueController.updateIssueById);
issueRouter.delete("/issue/delete/:id", authMiddleware, issueController.deleteIssueById);
issueRouter.get("/issue/:id", issueController.getIssueById);

module.exports = issueRouter;
