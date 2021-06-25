const db = require("../common/Dynamo");
const { DeleteItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");
const { isImageDeleted } = require("../image/imageUpload");
const { getMsg, getResponse } = require("../common/API_Responses");

exports.handler = async (event) => {
  const response = getResponse();

  try {
    const params = {
      TableName: process.env.INGREDIENT_TABLE,
      Key: marshall({ id: event.pathParameters.id }),
    };

    const img = JSON.parse(event.body).img;
    if (img) {
      if (!isImageDeleted(img)) {
        response.statusCode = 500;
        response.body = getMsg(e, "delete", false);
      }
    }
    const deleteResult = await db.send(new DeleteItemCommand(params));

    response.body = getMsg(deleteResult, "deleted", true);
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = getMsg(e, "delete", false);
  }

  return response;
};
