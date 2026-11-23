const statusMessages = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  429: 'Too Many Requests',
};

export class HttpError extends Error {
  constructor(status, message = statusMessages[status]) {
    super(message);
    this.status = status;
  }
}
