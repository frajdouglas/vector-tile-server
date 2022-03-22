const style_light = require("./style_light.json");

//HTTP handling
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
//Amazon AWS SDK
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
// Style url
app.get("/tileserver/style.json", (req, res) => {
    console.log("Style has been requested by map")
    res.send(style_light)
})

// app.get("/tileserver/:tileName/style.json", (req, res) => {
//   console.log("Style has been requested by map")
//   const tileName = req.params.tileName;
// console.log(tileName)
//   const getParams = {
//     Bucket: bucketName,
//         Key: `${tileName}/tiles/style_light.json`,
//   };
//   s3.getObject(getParams, (error, data) => {
//     if (error) {
//       console.log("Doesn't exist");
//       return res.status(204).end();
//     } else {
//       console.log(data.Body);
//       // res.header("Content-Encoding", "gzip");
//       res.send(data.Body);
//     }
//   })
// })

// get Sprites

app.get("/tileserver/basemap/sprites/sprites.json", (req, res) => {
  console.log("Sprites.json have been requested by map")
  const getParams = {
    Bucket: bucketName,
        Key: `basemap/sprites/sprites.json`,
  };
  s3.getObject(getParams, (error, data) => {
    if (error) {
      console.log("Doesn't exist");
      return res.status(204).end();
    } else {
      console.log(data.Body, "SPRITES JSON");
      res.send(data.Body);
    }
  })
})

app.get("/tileserver/basemap/sprites/sprites.png", (req, res) => {
  console.log("Sprites.png have been requested by map")

  const getParams = {
    Bucket: bucketName,
        Key: `basemap/sprites/sprites.png`,
  };
  s3.getObject(getParams, (error, data) => {
    if (error) {
      console.log("Doesn't exist");
      return res.status(204).end();
    } else {
      console.log(data.Body, "SPRITES PNG");
      // res.header("Content-Encoding", "gzip");
      res.send(data.Body);
    }
  })
})


// fonts url
http://localhost:5000/tileserver/basemap/fonts/{fontstack}/{range}.pbf

app.get("/tileserver/basemap/fonts/:fontstack/:range", (req, res) => {
  const fontstack = req.params.fontstack;
  const range = req.params.range.replace(".pbf", "");
  console.log("FONT REQUEST MADE", fontstack,range)
  const getParams = {
    Bucket: bucketName,
        Key: `basemap/fonts/${fontstack}/${range}.pbf`,
  };
  s3.getObject(getParams, (error, data) => {
    if (error) {
      console.log("Doesn't exist");
      return res.status(204).end();
    } else {
      console.log(data.Body, "GLYPHS");
      // res.header("Content-Encoding", "gzip");
      res.send(data.Body);
    }
  })
})
// Tiles url
app.get("/tileserver/:tileName/tiles/:z/:x/:y", (req, res) => {
  console.log("Tile REQUEST MADE")
  const z = parseInt(req.params.z);
  const x = parseInt(req.params.x);
  const y = parseInt(req.params.y.replace(".pbf", ""));
  const tileName = req.params.tileName;

  // console.log(req.params)
  console.log(x, y, z, "Tile Coordinates to look up in index");
  /*open the connection to S3 and get 
  the data from the bucket*/
  const getParams = {
    Bucket: bucketName,
        Key: `${tileName}/tiles/${z}/${x}/${y}.pbf`,

  };
  s3.getObject(getParams, (error, data) => {
    if (error) {
      console.log("Doesn't exist");
      return res.status(204).end();
    } else {
      console.log(data.Body);
      res.header("Content-Encoding", "gzip");
      res.send(data.Body);
    }
  })
})
