const { BlobServiceClient } = require("@azure/storage-blob");
const { v1: uuidv1 } = require("uuid");
const style_light = require("./style_light.json");
//HTTP handling
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

// create a new express app instance
const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;
app.use(express.static(path.join(__dirname, "../../build")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(PORT, () => {
  console.log("App is listening on port 5000");
});

// AZURE CONNECTION

const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;

if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw Error("Azure Storage Connection string not found");
}
// Create the BlobServiceClient object which will be used to create a container client
const blobServiceClient = BlobServiceClient.fromConnectionString(
  AZURE_STORAGE_CONNECTION_STRING
);
// Create a unique name for the container
const containerName = "vector-tiles";
// Get a reference to a container
const containerClient = blobServiceClient.getContainerClient(containerName);

async function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data));
    });
    readableStream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on("error", reject);
  });
}

// Style url
app.get("/tileserver/style.json", (req, res) => {
  console.log("Style has been requested by map");
  res.send(style_light);
});
// get Sprites

app.get("/tileserver/basemap/sprites/sprites.json", (req, res) => {
  console.log("Sprites.json have been requested by map")
 // AZURE CALL GOES HERE
 const blobName = `basemap/sprites/sprites.json`;
 console.log({ blobName });

 const blockBlobClient = containerClient.getBlockBlobClient(blobName);

 blockBlobClient
   .download(0)
   .then((downloadBlockBlobResponse) => {
     return streamToBuffer(downloadBlockBlobResponse.readableStreamBody);
   })
   .then((data) => {
     console.log({ data });
     res.send(data);
   })
   .catch((err) => {
     console.log("notfound");
   });
})

app.get("/tileserver/basemap/sprites/sprites.png", (req, res) => {
  console.log("Sprites.png have been requested by map")

 // AZURE CALL GOES HERE
 const blobName = `basemap/sprites/sprites.png`;
 console.log({ blobName });

 const blockBlobClient = containerClient.getBlockBlobClient(blobName);

 blockBlobClient
   .download(0)
   .then((downloadBlockBlobResponse) => {
     return streamToBuffer(downloadBlockBlobResponse.readableStreamBody);
   })
   .then((data) => {
     console.log({ data });
     res.send(data);
   })
   .catch((err) => {
     console.log("notfound");
   });
})
// fonts url
app.get("/tileserver/basemap/fonts/:fontstack/:range", (req, res) => {
  console.log("FONT REQUEST MADE");

  const fontstack = req.params.fontstack;
  const range = req.params.range.replace(".pbf", "");
  console.log("FONT REQUEST MADE", fontstack, range);

  // AZURE CALL GOES HERE
  const blobName = `basemap/fonts/${fontstack}/${range}.pbf`;
  console.log({ blobName });

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  blockBlobClient
    .download(0)
    .then((downloadBlockBlobResponse) => {
      return streamToBuffer(downloadBlockBlobResponse.readableStreamBody);
    })
    .then((data) => {
      console.log({ data });
      res.send(data);
    })
    .catch((err) => {
      console.log("notfound");
    });
});
// Tiles url
app.get("/tileserver/:tileName/tiles/:z/:x/:y", (req, res) => {
  const z = parseInt(req.params.z);
  const x = parseInt(req.params.x);
  const y = parseInt(req.params.y.replace(".pbf", ""));
  const tileName = req.params.tileName;

  console.log(z, x, y, tileName, "Tile Coordinates to look up in index");

  // AZURE CALL GOES HERE
  const blobName = `${tileName}/tiles/${z}/${x}/${y}.pbf`;
  console.log({ blobName });

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  blockBlobClient
    .download(0)
    .then((downloadBlockBlobResponse) => {
      return streamToBuffer(downloadBlockBlobResponse.readableStreamBody);
    })
    .then((data) => {
      console.log({ data });
      res.header("Content-Encoding", "gzip");
      res.send(data);
    })
    .catch((err) => {
      console.log("notfound");
    });
});


