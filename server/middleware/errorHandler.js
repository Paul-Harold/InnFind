const errorHandler = (err, req, res, next) => {
  // Malformed ObjectId in a URL param.
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid id format" });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }
  const statusCode = err.statusCode || 500;
  console.error(err);
  res.status(statusCode).json({
    message: err.message || "Internal server error",
  });
};

export default errorHandler;
