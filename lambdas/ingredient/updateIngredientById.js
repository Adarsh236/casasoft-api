const Dynamo = require("../common/Dynamo");
const { getMsg, getResponse } = require("../common/API_Responses");

exports.handler = async (event) => {
  const response = getResponse();

  try {
    const body = ingredientInfo(JSON.parse(event.body));
    const id = event.pathParameters.id;
    const tableName = process.env.INGREDIENT_TABLE;
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
