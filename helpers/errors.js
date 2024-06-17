const NOT_FOUND = new Error;
NOT_FOUND.message = 'not found';
NOT_FOUND.code = 404;

const CONFLICT = new Error;
CONFLICT.message = 'already exists';
CONFLICT.code = 409;

const BAD_REQUEST = new Error;
BAD_REQUEST.message = 'bad request';
BAD_REQUEST.code = 400;

const FORBIDDEN = new Error;
FORBIDDEN.message = 'forbidden';
FORBIDDEN.code = 403;

const SERVER_ERROR = new Error;
SERVER_ERROR.message = 'server error';
SERVER_ERROR.code = 500;

