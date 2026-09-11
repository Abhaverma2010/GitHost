const express = require("express");
const issueController = require("../controllers/issueController");

const issueRouter = express.Router();

issueRouter.post("/repo/:id/issue/create", issueController.createIssue);
issueRouter.get("/repo/:id/issue/all", issueController.getAllIssues);
issueRouter.put("/issue/update/:id", issueController.updateIssueById);
issueRouter.delete("/issue/delete/:id", issueController.deleteIssueById);
issueRouter.get("/issue/:id", issueController.getIssueById);

module.exports = issueRouter;