const getResponse = () => ({
  statusCode: 200,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Methods": "*",
  },
});

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

module.exports = {
  getResponse,
  getMsg,
};
