const AWS = require("aws-sdk");

AWS.config.update({ region: "ap-south-1" });

const s3 = new AWS.S3();
const S3_BUCKET = "abhasbucckket";

module.exports = { s3, S3_BUCKET };
//1dN/7NqkCYqtzEW3VuXzWLxuhyg00nWSRlD82luw - secret access key
//AKIATLT3C5BZVTBBHUDR - access key