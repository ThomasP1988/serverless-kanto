import AWS from "aws-sdk";

export const setAWSConfig = () => {
    const awsConfig = new AWS.Config();
    awsConfig.update({region: 'eu-west-1'});
}

export const apiBaseURL = "https://qko0zisuj2.execute-api.eu-west-1.amazonaws.com/dev";
