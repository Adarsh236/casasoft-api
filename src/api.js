const db = require("./db");
const {
  GetItemCommand,
  PutItemCommand,
  DeleteItemCommand,
  ScanCommand,
  UpdateItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const uuid = require("uuid");

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

const getMsg = (msg, method, isSucceed) => {
  if (isSucceed) {
    return JSON.stringify({
      message: `Successfully ${method} ingredient.`,
      msg,
    });
  } else {
    return JSON.stringify({
      message: `Failed to ${method} ingredient.`,
      errorMsg: msg.message,
      errorStack: msg.stack,
    });
  }
};

const getIngredientById = async (event) => {
  const response = { statusCode: 200 };

  try {
    const params = {
      TableName: process.env.INGREDIENT_TABLE,
      Key: marshall({ id: event.pathParameters.id }),
    };
    const { Obj } = await db.send(new GetItemCommand(params));

    const result = Obj ? unmarshall(Obj) : {};
    result.message = "Successfully retrieved ingredient.";
    response.body = JSON.stringify(result);
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = getMsg(e, "get", false);
  }

  return response;
};

const createIngredient = async (event) => {
  const response = { statusCode: 200 };

  try {
    const body = ingredientInfo(JSON.parse(event.body));
    const params = {
      TableName: process.env.INGREDIENT_TABLE,
      Obj: marshall(body || {}),
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

const updateIngredientById = async (event) => {
  const response = { statusCode: 200 };

  try {
    const body = JSON.parse(event.body);
    const objKeys = Object.keys(body);
    const params = {
      TableName: process.env.INGREDIENT_TABLE,
      Key: marshall({ id: event.pathParameters.id }),
      UpdateExpression: `SET ${objKeys
        .map((_, index) => `#key${index} = :value${index}`)
        .join(", ")}`,
      ExpressionAttributeNames: objKeys.reduce(
        (acc, key, index) => ({
          ...acc,
          [`#key${index}`]: key,
        }),
        {}
      ),
      ExpressionAttributeValues: marshall(
        objKeys.reduce(
          (acc, key, index) => ({
            ...acc,
            [`:value${index}`]: body[key],
          }),
          {}
        )
      ),
    };
    const updateResult = await db.send(new UpdateItemCommand(params));

    response.body = getMsg(updateResult, "updated", true);
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = getMsg(e, "update", false);
  }

  return response;
};

const deleteIngredientById = async (event) => {
  const response = { statusCode: 200 };

  try {
    const params = {
      TableName: process.env.INGREDIENT_TABLE,
      Key: marshall({ id: event.pathParameters.id }),
    };
    const deleteResult = await db.send(new DeleteItemCommand(params));

    response.body = getMsg(deleteResult, "deleted", true);
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = getMsg(e, "delete", false);
  }

  return response;
};

const findIngredients = async () => {
  const response = { statusCode: 200 };

  try {
    const { List } = await db.send(
      new ScanCommand({ TableName: process.env.INGREDIENT_TABLE })
    );

    response.body = JSON.stringify({
      message: "Successfully retrieved all ingredient.",
      items: List.map((Obj) => unmarshall(Obj)),
      total: List.length,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = getMsg(e, "retrieve", false);
  }

  return response;
};

module.exports = {
  getIngredientById,
  createIngredient,
  updateIngredientById,
  deleteIngredientById,
  findIngredients,
};
