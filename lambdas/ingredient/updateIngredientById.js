const Dynamo = require("../common/Dynamo");
const { getUploadImageUrl, isImageDeleted } = require("../image/imageUpload");
const { getMsg, getResponse } = require("../common/API_Responses");

exports.handler = async (event) => {
  const response = getResponse();

  try {
    let body = ingredientInfo(JSON.parse(event.body));
    const img = body.img;
    const id = event.pathParameters.id;
    const tableName = process.env.INGREDIENT_TABLE;

    if (img) {
      if (!img.includes("amazonaws.com/")) {
        body.img = await getUploadImageUrl(img);
      } else if (img.includes("amazonaws.com/")) {
        /* const res = await isImageDeleted(img);
        if (!res) throw new Error("Img not delete"); */
      }
    }
    console.log(".img");
    console.log(body.img);

    const updatedResult = await Dynamo.update(id, body, tableName);

    console.log("updatedResult");
    console.log(updatedResult);
    response.body = getMsg(updatedResult, "updated", true);
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = getMsg(e, "update", false);
  }

  return response;
};

const ingredientInfo = (ingredient) => {
  return {
    title: ingredient.title,
    img: ingredient.img,
    fat: ingredient.fat,
    calories: ingredient.calories,
    carbohydrates: ingredient.carbohydrates,
  };
};
