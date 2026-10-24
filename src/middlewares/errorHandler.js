export const errorHandler = (err, req, res, next) => {
  // Mongoose: malformed ObjectId or other cast failure
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid value for ${err.path}` });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }
  // MongoDB duplicate key (unique index)
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue ?? {}).join(', ');
    return res.status(409).json({ message: `${fields || 'Value'} already exists` });
  }

  const { status = 500 } = err;
  if (status >= 500) {
    console.error(err);
  }
  // never leak internal error details to the client
  const message = status >= 500 ? 'Server error' : err.message;
  res.status(status).json({ message });
};
