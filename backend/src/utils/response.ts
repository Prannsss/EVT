export const successResponse = (data: any, message = 'Success') => {
  return {
    success: true,
    message,
    data,
  };
};

export const errorResponse = (message: string, statusCode = 500) => {
  return {
    success: false,
    message,
    statusCode,
  };
};
