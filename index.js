//HTTP Handling
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
    Key: "Lower_Layer_Super_Output_Areas_(December_2011)_Boundaries_Super_Generalised_Clipped_(BSC)_EW_V3.geojson"
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
    const tile = tileIndex.getTile(z, x, y);
    if (!tile) {
        return res.status(204).end();
    }
    // encode the data as protobuf
    const buffer = Buffer.from(vtpbf.fromGeojsonVt({ geojsonLayer: tile }));
    res.send(buffer);
});    

/*open the connection to S3 and get 
the data from the bucket*/
s3.getObject(getParams, (error, data) => {
    if (error) console.log(error, error.stack);
    else {
        let jsonData = data.Body.toString('utf-8');
        jsonData = JSON.parse(jsonData);
        // we tile the full geojson file
        tileIndex = geojsonvt(jsonData);
        app.listen(PORT, () => {
            console.log('App is listening on port 5000!');
        });
    }
});