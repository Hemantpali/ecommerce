const sendResponse = (res, statusCode, { success = true, message, data = null, meta = null }) => {
  const payload = { success };

  if (message) payload.message = message;
  if (data !== null) payload.data = data;
  if (meta !== null) payload.meta = meta;

  return res.status(statusCode).json(payload);
};

const sendSuccess = (res, data, message, statusCode = 200) =>
  sendResponse(res, statusCode, { data, message });

const sendCreated = (res, data, message = 'Resource created successfully') =>
  sendResponse(res, 201, { data, message });

const sendError = (res, message, statusCode = 400) =>
  sendResponse(res, statusCode, { success: false, message });

module.exports = {
  sendResponse,
  sendSuccess,
  sendCreated,
  sendError,
};
