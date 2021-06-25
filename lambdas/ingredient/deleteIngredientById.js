const Dynamo = require("../common/Dynamo");
const { getMsg, getResponse } = require("../common/API_Responses");

exports.handler = async (event) => {
  const response = getResponse();

  try {
    const id = event.pathParameters.id;
    const tableName = process.env.INGREDIENT_TABLE;
    if (img) body.img = await getUploadImageUrl(img);

    const deleteResult = await Dynamo.delete(id, tableName);

    response.body = getMsg(deleteResult, "deleted", true);
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = getMsg(e, "delete", false);
  }

  return response;
};
