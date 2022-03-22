var azure = require('azure-storage');
var fs = require('fs');

const AZURE_STORAGE_ACCOUNT =
blobSvc.getBlobToStream('mycontainer', 'myblob', fs.createWriteStream('output.txt'), function(error, result, response){
  if(!error){
    // blob retrieved
  }
});