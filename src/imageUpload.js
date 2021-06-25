//import Responses from "../common/API_Responses";
//import * as fileType from "file-type";
//import { v4 as uuid } from "uuid";
//import * as AWS from "aws-sdk";

const fileType = require("file-type");
const uuid = require("uuid");
const AWS = require("aws-sdk");

const s3 = new AWS.S3();

const allowedMimes = ["image/jpeg", "image/png", "image/jpg"];

const imageUpload = async (event) => {
  try {
    //const body = JSON.parse(event);
    const body = event;

    /* if (!body || !body.image || !body.mime) {
            return Responses._400({ message: 'incorrect body on request' });
        }

        if (!allowedMimes.includes(body.mime)) {
            return Responses._400({ message: 'mime is not allowed ' });
        } */

    let imageData = body;
    if (body.substr(0, 7) === "base64,") {
      imageData = body.substr(7, body.length);
    }

    const buffer = Buffer.from(imageData, "base64");
    const fileInfo = await fileType.fromBuffer(buffer);
    const detectedExt = fileInfo.ext;
    const detectedMime = fileInfo.mime;

    /*  if (detectedMime !== body.mime) {
            return Responses._400({ message: 'mime types dont match' });
        } */

    const name = uuid.v4();
    const key = `${name}.${detectedExt}`;

    console.log(`writing image to bucket called ${key}`);

    await s3
      .putObject({
        Body: buffer,
        Key: key,
        ContentType: detectedMime,
        Bucket: process.env.IMG_BUCKET,
        ACL: "public-read",
      })
      .promise();

    const url = `https://${process.env.IMG_BUCKET}.s3-${process.env.region}.amazonaws.com/${key}`;
    return url;

    /* return Responses._200({
            imageURL: url,
        }); */
  } catch (error) {
    console.log("error", error);
    return "";

    return Responses._400({
      message: error.message || "failed to upload image",
    });
  }
};

module.exports = {
  imageUpload,
};
