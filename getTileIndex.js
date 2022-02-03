const AWS = require("aws-sdk");
// set the AWS region
const REGION = "eu-west-2"; // e.g., "us-east-1"
// set the bucket parameters
const bucketName = "www.tame-vector-tiles.xyz";
// create S3 initial config for connection
const config = {
  apiVersion: "2006-03-01",
  accessKeyId: "AKIA4VXTUMQKQKNOGVUA",
  secretAccessKey: "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",
  region: REGION,
};
const s3 = new AWS.S3(config);

const getParams = {
    Bucket: bucketName,
    Prefix: `LSOA_Tiles`,
  };

  s3.listObjectsV2(getParams, (error, data) => {
    if (error) {
      console.log(error, error.stack);
    //   return res.status(204).end();
    } else {
      console.log(data.contents);
      // res.send(data.body);
    }
  });