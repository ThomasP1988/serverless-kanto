const AWS = require('aws-sdk');
const CSV = require('csv-string');
const sha256 = require('js-sha256').sha256;

module.exports.postprocess = (event) => {
    const bucketName = event.Records[0].s3.bucket.name;
    const objectKey = decodeURI(event.Records[0].s3.object.key);
    const awsRegion = event.Records[0].awsRegion;

    AWS.config.update({ region: awsRegion });
    const s3 = new AWS.S3();
    const dynamodb = new AWS.DynamoDB();
    const dynamoDBparams = {
        RequestItems: {
            "kanto-dev": []
        },
        ReturnConsumedCapacity: "TOTAL",
        ReturnItemCollectionMetrics: "SIZE"
    }

    console.log("awsRegion", event.Records[0].awsRegion);
    console.log("bucketName", bucketName);
    console.log("objectKey", objectKey);

    const attributesCSVtoDB = ['wardName',
        'rollNumber',
        'firstName',
        'lastName',
        'houseIdentifier',
        'addressLine1',
        'addressLine2',
        'addressLine3'];

    s3.getObject({
        Bucket: bucketName,
        Key: objectKey
    }, (err, data) => {
        if (err) {
            console.log("error getting S3 Object", err, err.stack);
        } else {
            const dataFromFile = CSV.parse(data.Body.toString('ascii'));
            dataFromFile.filter((e) => e[0].length > 0).forEach((row, rowIndex) => {
                if (row && rowIndex > 0) {
                    const item = {
                        id: { S: sha256(row.join(',')) },
                        [attributesCSVtoDB[0]]: { S: row[0] },
                    }
                    for (let i = 1; i < row.length; i++) {
                        item[attributesCSVtoDB[i]] = { S: row[i] }
                    }
                    item.created = item.updated = { S: Math.round(+new Date() / 1000).toString() };
                    addItem(item);
                    if (rowIndex % 20 === 0) {
                        persist(dynamoDBparams);
                    }
                }
            });
            persist(dynamoDBparams);
        }
    });

    const addItem = (Item) => {
        dynamoDBparams.RequestItems["kanto-dev"].push(
            {
                PutRequest: {
                    Item
                }
            }
        );
    }


    const persist = (params) => {
        dynamodb.batchWriteItem(params, (err, data) => {
            if (err) console.log("error adding to DynamoDB", err, err.stack); // an error occurred
            else console.log("succesfully added");           // successful response
        });
        params.RequestItems["kanto-dev"] = [];
    }
};