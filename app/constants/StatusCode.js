const Success = 200;
const Created = 201;
const Accepted = 202;
const NoContent = 204;

const BadRequest = 400;
// EMAILORPASSWORDINVAID
const UnAuthorized = 401;
// Similar 401: The client does not have access rights to the content
const Forbidden = 403;
const NotFound = 404;
// DELETE request not allow
const MethodNotAllowed = 405;
// Doesn't find any content that conforms to the criteria given by the user agent.
const NotAcceptable = 406;
//It means that the server would like to shut down this unused connection.
const RequestTimeout = 408;
// This response is sent when a request conflicts with the current state of the server.
const Conflict = 409;
// Server rejected the request because the Content-Length header field is not defined and the server requires it.
const LengthRequired = 411;
// The user has sent too many requests in a given amount of time.
const TooManyRequest = 429;

// Internal Server Error
const ServerError = 500;
// The request method is not supported by the server and cannot be handled. The only methods that servers are required to support (and therefore that must not return this code) are GET and HEAD.
const NotImplemented = 501;
// This error response means that the server, while working as a gateway to get a response needed to handle the request, got an invalid response.
const BadGateway = 502;
// This error response is given when the server is acting as a gateway and cannot get a response in time.
const GatewayTimeout = 504;

module.exports = {
  Success,
  Created,
  BadRequest,
  UnAuthorized,
  NotFound,
  Conflict,
  ServerError,
};
