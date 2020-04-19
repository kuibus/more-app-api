class HttpError extends Error {
  constructor(message, errorCode) {
    super(message) // Call the super() method in the constructor method, to call the parent's constructor method and gets access to the parent's properties and methods
    this.code = errorCode
  }
}

module.exports = HttpError