const AWS = require('aws-sdk');

module.exports.handler = (event, context, callback) => {
    const docClient = new AWS.DynamoDB.DocumentClient();
    const paramsQuery = event.queryStringParameters;
    const formatedData = {};
    const params = {
        TableName : "kanto-dev"
    };

    if (paramsQuery && paramsQuery.region) {
        console.log("ici");
        params.ExpressionAttributeValues = {
            ":r": paramsQuery.region
        };
        params.ExpressionAttributeNames = {
            "#region": "wardName"
        },
        params.FilterExpression = "#region = :r";
    }
    
    docClient.scan(params, (err, data) => {
        if (err) {
            console.error("Unable to scan. Error:", JSON.stringify(err, null, 2));
        } else {
            console.log("scan succeeded.", data);
            
            data.Items.forEach((item) => {
                const key = item.houseIdentifier + item.addressLine1 + item.addressLine2 + item.addressLine3;
                const newVoter = {
                    surname : item.lastName,
                    firstname : item.firstName,
                    voterId : item.id,
                    roll_number : item.rollNumber
                };

                if (formatedData[key]) {
                    if (formatedData[key].voters.indexOf(newVoter) === -1) {
                        formatedData[key].voters.push(newVoter);
                    }
                } else {
                    formatedData[key] = {
                        region: item.wardName,
                        house_id: item.houseIdentifier,
                        address_fields: [
                            item.addressLine2,
                            item.addressLine3,
                        ],
                        group_by_address: item.addressLine1,
                        created: item.created,
                        updated: item.updated,
                        voters : [newVoter]
                    }
                }
            });
        }

        callback(err, {
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ residences: Object.values(formatedData) }),
          })
    });

    
  }