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
console.log("\t", containerName);

// Get a reference to a container
const containerClient = blobServiceClient.getContainerClient(containerName);

// Get unique name for the blob
// const blobName = "basemap/TAME" + ".txt";
const blobName = "basemap/tiles/4/7/4" + ".pbf";

// Get a block blob client
const blockBlobClient = containerClient.getBlockBlobClient(blobName);

// Style url
app.get("/tileserver/style.json", (req, res) => {
  console.log("Style has been requested by map");
  res.send(style_light);
});
// Tiles url
app.get("/tileserver/:tileName/tiles/:z/:x/:y", (req, res) => {
  console.log("Tile REQUEST MADE");
  const z = parseInt(req.params.z);
  const x = parseInt(req.params.x);
  const y = parseInt(req.params.y.replace(".pbf", ""));
  const tileName = req.params.tileName;

  // console.log(req.params)
  console.log(x, y, z, "Tile Coordinates to look up in index");

  // AZURE CALL GOES HERE
  main()
    .then((data) => {
      res.header("Content-Encoding", "gzip");
      console.log(data);
      res.send(data);
    })
    .catch((ex) => console.log(ex.message));
});

async function main() {
  const downloadBlockBlobResponse = await blockBlobClient.download(0);
  // console.log("\nDownloaded blob content...");
  // console.log(downloadBlockBlobResponse.readableStreamBody);
  const downloaded = (
    await streamToBuffer(downloadBlockBlobResponse.readableStreamBody)
  )
  // console.log("Downloaded blob content:", downloaded);

  // console.log(
  //   "\t",
  //   await streamToText(downloadBlockBlobResponse.readableStreamBody)
  // );
}


//https://medium.com/bb-tutorials-and-thoughts/azure-how-to-interact-with-blob-storage-with-sdk-in-nodejs-apps-7680c5f937d4
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


// // Convert stream to text
// async function streamToText(readable) {
//   // readable.setEncoding("gzip");
//   let data = "";
//   for await (const chunk of readable) {
//     data += chunk;
//   }
//   return data;
// }
