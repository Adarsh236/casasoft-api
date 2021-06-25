const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const {
  PutItemCommand,
  GetItemCommand,
  DeleteItemCommand,
  UpdateItemCommand,
  ScanCommand,
} = require("@aws-sdk/client-dynamodb");

const { isImageDeleted } = require("../image/imageUpload");

const db = new DynamoDBClient({});

const Dynamo = {
  create: async (data, tableName) => {
    const params = {
      TableName: tableName,
      Item: marshall(data || {}),
    };
    return await db.send(new PutItemCommand(params)).promise();
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

    return await db.send(new DeleteItemCommand(params)).promise();
  },

  find: async (data, tableName) => {
    const { Items } = await db
      .send(new ScanCommand({ TableName: tableName }))
      .promise();

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

    return await db.send(new UpdateItemCommand(params)).promise();
  },
};

module.exports = Dynamo;
