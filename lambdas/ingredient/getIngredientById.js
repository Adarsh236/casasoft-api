const { GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const db = require("../common/Dynamo");
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
    result.message = "Successfully retrieved ingredient.";
    response.body = JSON.stringify(result);
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = getMsg(e, "get", false);
  }

  return response;
};
