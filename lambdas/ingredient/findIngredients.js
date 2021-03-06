const Dynamo = require("../common/Dynamo");
const { getMsg, getResponse } = require("../common/API_Responses");

exports.handler = async () => {
  const response = getResponse();

  try {
    const tableName = process.env.INGREDIENT_TABLE;
    const list = await Dynamo.find(null, tableName);

    response.body = JSON.stringify({
      message: "Successfully retrieved all ingredient.",
      items: list,
      total: list.length,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = getMsg(e, "retrieve", false);
  }

  return response;
};
