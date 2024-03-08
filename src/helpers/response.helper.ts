import { HttpStatusCodes, ResponseMessages } from '../constant/response.constants';

export function handleErrorResponse(response, error, defaultMessage = ResponseMessages.INTERNAL_SERVER_ERROR) {
  const status = error.status || HttpStatusCodes.INTERNAL_SERVER_ERROR;
  const message = error.message || defaultMessage;

  return response.status(status).json({
    statusCode: status,
    message,
    error: error.name || 'Internal Server Error',
  });
}
