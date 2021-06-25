const db = require("../common/Dynamo");
const {
  DeleteItemCommand,
  GetItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { isImageDeleted } = require("../image/imageUpload");
const { getMsg, getResponse } = require("../common/API_Responses");

exports.handler = async (event) => {
  const response = getResponse();

  try {
    const params = {
      TableName: process.env.INGREDIENT_TABLE,
      Key: marshall({ id: event.pathParameters.id }),
    };
    const { Item } = await db.send(new GetItemCommand(params));
    const result = Item ? unmarshall(Item) : {};
    const img = result.img;

    if (img) {
      const res = await isImageDeleted(img);
      if (!res) throw new Error("Img not delete");
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
