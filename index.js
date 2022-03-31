const { BlobServiceClient } = require("@azure/storage-blob");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 4000;
app.use(express.static(path.join(__dirname, "../../build")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World');
});


app.listen(PORT, "0.0.0.0",() => {
  console.log(`App is listening on port ${PORT}`);
});

const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;
console.log(AZURE_STORAGE_CONNECTION_STRING)
  if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw Error("Azure Storage Connection string not found");

}
const blobServiceClient = BlobServiceClient.fromConnectionString(
  AZURE_STORAGE_CONNECTION_STRING
);
const containerName = "vector-tiles";
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


app.get("/tileserver/:styleName", (req, res) => {
  const style = req.params.styleName
  console.log(style)
  const blobName = `basemap/tiles/${style}.json`; 
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  blockBlobClient
    .download(0)
    .then((downloadBlockBlobResponse) => {
      return streamToBuffer(downloadBlockBlobResponse.readableStreamBody);
    })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log("notfound", "style");
    });
 })

app.get("/tileserver/basemap/sprites/sprites", (req, res) => {
  console.log("Sprites.json have been requested by map")
 const blobName = `basemap/sprites/sprites.json`;
 console.log({ blobName });

 const blockBlobClient = containerClient.getBlockBlobClient(blobName);

 blockBlobClient
   .download(0)
   .then((downloadBlockBlobResponse) => {
     return streamToBuffer(downloadBlockBlobResponse.readableStreamBody);
   })
   .then((data) => {
     res.send(data);
   })
   .catch((err) => {
     console.log("notfound", "sprites");
   });
})

app.get("/tileserver/basemap/sprites/sprites.png", (req, res) => {
 const blobName = `basemap/sprites/sprites.png`;
 const blockBlobClient = containerClient.getBlockBlobClient(blobName);
 blockBlobClient
   .download(0)
   .then((downloadBlockBlobResponse) => {
     return streamToBuffer(downloadBlockBlobResponse.readableStreamBody);
   })
   .then((data) => {
     res.send(data);
   })
   .catch((err) => {
     console.log("tile not found");
   });
})
app.get("/tileserver/basemap/fonts/:fontstack/:range", (req, res) => {
  const fontstack = req.params.fontstack;
  const range = req.params.range.replace(".pbf", "");
  const blobName = `basemap/fonts/${fontstack}/${range}.pbf`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  blockBlobClient
    .download(0)
    .then((downloadBlockBlobResponse) => {
      return streamToBuffer(downloadBlockBlobResponse.readableStreamBody);
    })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log("notfound", "fontstack");
    });
});
app.get("/tileserver/:tileName/tiles/:z/:x/:y", (req, res) => {
  const z = parseInt(req.params.z);
  const x = parseInt(req.params.x);
  const y = parseInt(req.params.y.replace(".pbf", ""));
  const tileName = req.params.tileName;
  const blobName = `${tileName}/tiles/${z}/${x}/${y}.pbf`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  blockBlobClient
    .download(0)
    .then((downloadBlockBlobResponse) => {
      return streamToBuffer(downloadBlockBlobResponse.readableStreamBody);
    })
    .then((data) => {
      res.header("Content-Encoding", "gzip");
      res.send(data);
    })
    .catch((err) => {
      console.log("notfound", "tiles", tileName, blobName);
    });
});

