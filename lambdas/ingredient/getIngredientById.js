const Dynamo = require("../common/Dynamo");
const { getMsg, getResponse } = require("../common/API_Responses");

exports.handler = async (event) => {
  const response = getResponse();

  try {
    const id = event.pathParameters.id;
    const tableName = process.env.INGREDIENT_TABLE;
    const item = await Dynamo.get(id, tableName);

    item.message = "Successfully retrieved ingredient.";
    response.body = JSON.stringify(item);
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = getMsg(e, "get", false);
  }

  return response;
};
