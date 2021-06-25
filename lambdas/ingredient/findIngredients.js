const { ScanCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

const db = require("../common/Dynamo");
const { getMsg, getResponse } = require("../common/API_Responses");

exports.handler = async () => {
  const response = getResponse();

  try {
    const { Items } = await db.send(
      new ScanCommand({ TableName: process.env.INGREDIENT_TABLE })
    );

    response.body = JSON.stringify({
      message: "Successfully retrieved all ingredient.",
      items: Items.map((item) => unmarshall(item)),
      total: Items.length,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = getMsg(e, "retrieve", false);
  }

  return response;
};
