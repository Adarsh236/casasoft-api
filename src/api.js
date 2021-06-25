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

const getMsg = (msg, method, isSucceed, data) => {
  if (isSucceed) {
    return JSON.stringify({
      message: `Successfully ${method} all posts.`,
      data: Items.map((item) => unmarshall(item)),
      Items,
    });
  } else {
    return JSON.stringify({
      message: `Failed to ${method} ingredient.`,
      errorMsg: msg.message,
      errorStack: msg.stack,
      errorStack1: data,
      errorStack2: ingredientInfo(data),
    });
  }
};
/* const validation = (value, type) => {
    const STRING = 'string';
    const NUMBER = 'number';
    if (type === STRING) {
        if (typeof value !== STRING) {
            return false;
        }
    } else if (type === NUMBER) {
        if (typeof value !== NUMBER) {
            return false;
        }
    } else {
        return false;
    }

    return true;
};

const validation = (value, type) => {
    const STRING = 'string';
    const NUMBER = 'number';
    if (type === STRING) {
        if (typeof value !== STRING) {
            return false;
        }
    } else if (type === NUMBER) {
        if (typeof value !== NUMBER) {
            return false;
        }
    } else {
        return false;
    }

    return true;
}; */

const getIngredientById = async (event) => {
  const response = { statusCode: 200 };

  try {
    const params = {
      TableName: process.env.INGREDIENT_TABLE,
      Key: marshall({ id: event.pathParameters.id }),
    };
    const { Item } = await db.send(new GetItemCommand(params));

    console.log({ Item });
    response.body = JSON.stringify({
      message: "Successfully retrieved ingredient.",
      data: Item ? unmarshall(Item) : {},
      rawData: Item,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = getMsg(e, "get", false);
  }

  return response;
};

const createIngredient = async (event) => {
  const response = { statusCode: 200 };
  const body = ingredientInfo(JSON.parse(event.body));
  const params = {
    TableName: process.env.INGREDIENT_TABLE,
    Item: marshall(body || {}),
  };
  let dd = [];
  dd.push(event.body);
  dd.push(JSON.parse(event.body));
  dd.push(ingredientInfo(event.body));
  dd.push(body);
  try {
    const createResult = await db.send(new PutItemCommand(params));

    response.body = JSON.stringify({
      message: "Successfully created ingredient.",
      createResult,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = getMsg(e, "create", false, dd);
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

    response.body = JSON.stringify({
      message: "Successfully updated ingredient.",
      updateResult,
    });
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

    response.body = JSON.stringify({
      message: "Successfully deleted ingredient.",
      deleteResult,
    });
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
    const { Items } = await db.send(
      new ScanCommand({ TableName: process.env.INGREDIENT_TABLE })
    );

    response.body = JSON.stringify({
      message: "Successfully retrieved all posts.",
      data: Items.map((item) => unmarshall(item)),
      Items,
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
