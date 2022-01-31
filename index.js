//HTTP handling
const express = require('express');
const bodyParser = require('body-parser');
const path = require("path");
const cors = require('cors');
//Amazon AWS SDK
const AWS = require('aws-sdk');
//MapBox Vector Tiles handling
const geojsonvt = require('geojson-vt');
const vtpbf = require('vt-pbf');


// set the AWS region
const REGION = "eu-west-2"; // e.g., "us-east-1"
// set the bucket parameters
const bucketName = 'vector-tiles-tame';
// create S3 initial config for connection
const config = {
    apiVersion: '2006-03-01',
    accessKeyId: 'AKIA4VXTUMQKQKNOGVUA', 
    secretAccessKey: '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', 
    region: REGION
};
const s3 = new AWS.S3(config);
const getParams = {
    Bucket: bucketName, 
    Key: "Countries_(December_2020)_UK_BFE.geojson"
};

// create a new express app instance
const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;
// we will server the built bundles from the "build" folder
app.use(express.static(path.join(__dirname, '../../build')));
/* we use the body parser middleware in case we 
want to handle response in JSON formats later on */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

let tileIndex;
// route for the Vector Tiles request
app.get('/tileserver', (req, res) => {
    const z = parseInt(req.query.z);
    const x = parseInt(req.query.x);
    const y = parseInt(req.query.y.replace('.pbf', ''));
    console.log(req.query, " mapping library is sending this info everytime map moves to different tile")
    console.log(x,y,z, "Tile Coordinates to look up in index")
    const tile = tileIndex.getTile(z, x, y);
    // console.log(tile)
    if (!tile) {
        return res.status(204).end();
    }
    console.log(tile, "Specific Tile to send to mapping library, needs to be converted to pbf")

    // encode the data as protobuf
    const buffer = Buffer.from(vtpbf.fromGeojsonVt({ geojsonLayer: tile }));
    console.log(typeof(buffer), "This is the final buffer data sent back to mapping library to be rendered.")
    res.send(buffer);
});

/*open the connection to S3 and get 
the data from the bucket*/
s3.getObject(getParams, (error, data) => {
    if (error) console.log(error, error.stack);
    else {
        let jsonData = data.Body.toString('utf-8');
        jsonData = JSON.parse(jsonData);
        console.log(jsonData)
        // we tile the full geojson file
        tileIndex = geojsonvt(jsonData);
        console.log(tileIndex)
        // console.log(tileIndex)
        app.listen(PORT, () => {
            console.log('App is listening on port 5000!');
        });
    }
});