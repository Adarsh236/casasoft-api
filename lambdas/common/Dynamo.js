const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const {
  PutItemCommand,
  GetItemCommand,
  DeleteItemCommand,
  UpdateItemCommand,
  ScanCommand,
} = require("@aws-sdk/client-dynamodb");

const { isImageDeleted, getUploadImageUrl } = require("../image/imageUpload");

const db = new DynamoDBClient({});

const Dynamo = {
  create: async (data, tableName) => {
    const params = {
      TableName: tableName,
      Item: marshall(data || {}),
    };
    return await db.send(new PutItemCommand(params));
  },

  delete: async (id, tableName) => {
    const params = {
      TableName: tableName,
      Key: marshall({ id: id }),
    };
    const { Item } = await db.send(new GetItemCommand(params));
    const result = Item ? unmarshall(Item) : {};
    const img = result.img;

    if (img) {
      const res = await isImageDeleted(img);
      if (!res) throw new Error("Img not delete");
    }

    return await db.send(new DeleteItemCommand(params));
  },

  find: async (data, tableName) => {
    const { Items } = await db.send(new ScanCommand({ TableName: tableName }));
    return Items.map((item) => unmarshall(item));
  },

  get: async (id, tableName) => {
    const params = {
      TableName: tableName,
      Key: marshall({ id: id }),
    };
    const { Item } = await db.send(new GetItemCommand(params));

    const findResult = Item ? unmarshall(Item) : {};
    return findResult;
  },

  update: async (id, data, tableName) => {
    data = await updateImg(id, data, tableName);
    console.log(".img");
    console.log(data);

    const objKeys = Object.keys(data);
    const params = {
      TableName: tableName,
      Key: marshall({ id: id }),
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
            [`:value${index}`]: data[key],
          }),
          {}
        )
      ),
    };

    return await db.send(new UpdateItemCommand(params));
  },
};

const updateImg = async (id, data, tableName) => {
  const params = {
    TableName: tableName,
    Key: marshall({ id: id }),
  };

  const { Item } = await db.send(new GetItemCommand(params));
  const result = Item ? unmarshall(Item) : {};

  const newImg = data.img;
  const prevImg = result.img;

  //Img Update
  if (!prevImg.includes(newImg)) {
    console.log("Img Update1");
    if (prevImg.includes("amazonaws.com/")) {
      const res = await isImageDeleted(img);
      if (!res) throw new Error("Prev Img not delete");
      console.log("Img Update2");
    }
    if (newImg) {
      console.log("Img Update3");
      data.img = await getUploadImageUrl(img);
    }
  }

  return data;
};

module.exports = Dynamo;
