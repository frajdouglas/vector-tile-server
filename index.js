//HTTP handling
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
//Amazon AWS SDK
const AWS = require("aws-sdk");
//MapBox Vector Tiles handling
const geojsonvt = require("geojson-vt");
const vtpbf = require("vt-pbf");

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

// create a new express app instance
const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;
// we will server the built bundles from the "build" folder
app.use(express.static(path.join(__dirname, "../../build")));
/* we use the body parser middleware in case we 
want to handle response in JSON formats later on */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log("App is listening on port 5000");
});

// route for the Vector Tiles request
app.get("/tileserver", (req, res) => {
  const z = parseInt(req.query.z);
  const x = parseInt(req.query.x);
  const y = parseInt(req.query.y.replace(".pbf", ""));
  console.log(x, y, z, "Tile Coordinates to look up in index");
  /*open the connection to S3 and get 
the data from the bucket*/

  const getParams = {
    Bucket: bucketName,
    Key: `LSOA_Tiles/${z}/${x}/${y}.pbf`,
  };

  s3.getObject(getParams, (error, data) => {
    if (error) {
    //   console.log(error, error.stack);
    console.log("Doesn't exist")
      return res.status(204).end();
    } else {
      console.log(data.Body);
      res.header("Content-Encoding","gzip")
      res.send(data.Body);
    }
  });
});

// const getParams = {
//     Bucket: bucketName,
//     Prefix: `LSOA_Tiles`,
//   };

//   s3.listObjectsV2(getParams, (error, data) => {
//     if (error) {
//       console.log(error, error.stack);
//     //   return res.status(204).end();
//     } else {
//       console.log(data.body);
//       // res.send(data.body);
//     }
//   });