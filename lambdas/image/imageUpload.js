const fileType = require("file-type");
const uuid = require("uuid");
const AWS = require("aws-sdk");

const s3 = new AWS.S3();
const allowedMimes = ["image/jpeg", "image/png", "image/jpg"];

const getUploadImageUrl = async (event) => {
  try {
    let body = event.split(";", 2)[1];
    let imageData = body;
    console.log(".body");
    console.log(body);

    if (body.substr(0, 7) === "base64,") {
      imageData = body.substr(7, body.length);
    }

    const buffer = Buffer.from(imageData, "base64");
    const fileInfo = await fileType.fromBuffer(buffer);
    const detectedExt = fileInfo.ext;
    const detectedMime = fileInfo.mime;
    console.log(".fileInfo");
    console.log(fileInfo);

    if (!allowedMimes.includes(detectedMime)) {
      return "";
    }

    const name = uuid.v4();
    const key = `${name}.${detectedExt}`;
    console.log(".key");
    console.log(key);

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
    console.log(".url");
    console.log(url);
    return url;
  } catch (error) {
    return "";
  }
};

const isImageDeleted = async (event) => {
  try {
    const split = event.split("amazonaws.com/", 2);
    const key = split[1];
    return await s3
      .deleteObject(
        {
          Bucket: process.env.IMG_BUCKET,
          Key: key,
        },
        function (err, data) {
          if (err) return false;
          else return true;
        }
      )
      .promise();
  } catch (error) {
    return false;
  }
};

module.exports = {
  getUploadImageUrl,
  isImageDeleted,
};
