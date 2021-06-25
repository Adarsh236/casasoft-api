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
    let body = event.split(";", 2)[1];
    let imageData = body;
    console.log(body);

    if (body.substr(0, 7) === "base64,") {
      imageData = body.substr(7, body.length);
      console.log("base64,");
    }

    const buffer = Buffer.from(imageData, "base64");
    console.log(buffer);
    const fileInfo = await fileType.fromBuffer(buffer);
    console.log(fileInfo);
    const detectedExt = fileInfo.ext;
    console.log(detectedExt);
    const detectedMime = fileInfo.mime;
    console.log(detectedMime);

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
    console.log(url);
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
