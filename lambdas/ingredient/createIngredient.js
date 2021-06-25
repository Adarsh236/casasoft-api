const { PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");
const uuid = require("uuid");

const db = require("../common/Dynamo");
const { getUploadImageUrl } = require("../image/imageUpload");
const { getMsg, getResponse } = require("../common/API_Responses");

exports.handler = async (event) => {
  const response = getResponse();

  try {
    let body = ingredientInfo(JSON.parse(event.body));
    let img = String(body.img);
    if (img) body.img = await getUploadImageUrl(img);
    const params = {
      TableName: process.env.INGREDIENT_TABLE,
      Item: marshall(body || {}),
    };
    const createResult = await db.send(new PutItemCommand(params));

    response.body = getMsg(createResult, "created", true);
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = getMsg(e, "create", false);
  }

  return response;
};

const ingredientInfo = (ingredient) => {
  const timestamp = new Date().getTime();
  return {
    id: uuid.v1(),
    title: ingredient.title,
    img: ingredient.img,
    fat: ingredient.fat,
    calories: ingredient.calories,
    carbohydrates: ingredient.carbohydrates,
    submittedAt: timestamp,
    updatedAt: timestamp,
  };
};
