const { validationResult } = require('express-validator')
const HttpError = require('../models/http-error')
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// *** GET all users ***
const getUsers = async (req, res, next) => {
  let users
  try {
    users = await User.find({}, '-password')
  } catch(err) {
    const error = new HttpError('Fetching users failed, please try again later', 500)
    return next(error)
  }
  
  res.json({ users: users.map(user => user.toObject({ getters: true }))})
}

// *** GET USER ***
const getUserById = async (req, res, next) => { // http://localhost:5000/api/users/uid
  const userId = req.params.uid // { uid : 'u1' }
  
  let user
  
  try {
    user = await User.findById(userId)
  } catch (err) {
    const error = new HttpError('Something went wrong, could not find the user', 500)
    return next(error)
  }

  if (!user) {
    throw new HttpError('Could not find any users with the provided id', 404)
  }
  
  res.json({ user: user.toObject({ getters: true }) })
}

// *** POST: create a new user ***
const signup = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new HttpError('Invalide fields', 422)
    return next(error)  
  }
  
  const {
    email,
    password
  } = req.body // extract data from incoming request body

  let exisistingUser
  
  try {
    existingUser = await User.findOne({ email: email })
  } catch (err) {
    const error = new HttpError(
      `Signing up failed due to this error ${err}`,
      500
    )
    return next(error)
  }
  
  if (exisistingUser) {
    const error = new HttpError('User esists already, please login instead', 422)
    return next(error)
  }

  let hashedPassword

  try {
    hashedPassword = await bcrypt.hash(password, 12)
  } catch (err) {
    const error = new HttpError('Could not create user. Please try again', 500)
    return next(error)
  }

  const createdUser = new User({
    email,
    password: hashedPassword,
    username: email,
    image: 'uploads/images/plc_avatar.jpg',
    initialSavings: 0,
    transactions: [],
    savings: []
  })

  try {
    await createdUser.save()
  } catch (err) {
    const error = new HttpError(
      `Something went wrong while signing up. Please try again.`, 
      500
    )
    return next(error)
  }

  let token

  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    )
  } catch (err) {
    const error = new HttpError(
      `Signing up failed. Please try again`, 
      500
    )
    return next(error)
  }

  res.status(201).json({
    userId: createdUser.id,
    email: createdUser.email,
    username: createdUser.username,
    image: createdUser.image,
    token: token
  })
}

// *** POST: login an existing user ***
const login = async (req, res, next) => {
  const {
    email,
    password
  } = req.body

  let existingUser
  try {
    existingUser = await User.findOne({ email: email })
  } catch (err) {
    const error = new HttpError(
      `Logging in failed with this error: ${err}. Please try again later`,
      500
    )
    return next(error)
  }

  if (!existingUser) {
    const error = new HttpError('Your username does not match with any existing profile. Please try again.', 401)
    return next(error)
  }

  let isValidPassword = false

  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password)
  } catch (err) {
    const error = new HttpError('Could not log you in. Please check your credentials and then try again', 500)
    return next(error)
  }

  if ( !isValidPassword ) {
    const error = new HttpError('Your username and/or password do not match. Please try again.', 403)
    return next(error)
  }

  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    )
  } catch (err) {
    const error = new HttpError(
      `Logging in failed. Please try again`, 
      500
    )
    return next(error)
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    username: existingUser.username,
    image: existingUser.image,
    token: token
  })
}

// *** UPDATE PROFILE PICTURE ***
const updateProfilePicture = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new HttpError('Invalide field', 422)
    return next(error)  
  }

  if (!req.file) {
    const error = new HttpError('File not provided', 422)
    return next(error)
  }

  const userId = req.params.uid
  const image = req.file.path

  let user

  try {
    user = await User.findById(userId)
  } catch (err) {
    const error = new HttpError('Something went wrong, could not find the user')
    return next(error)
  }

  if (!user) {
    throw new HttpError('Could not find a user with the provided id', 404)
  }

  user.image = image

  try {
    await user.save()
  } catch (err) {
    const error = new HttpError('Something went wrong, could not update picture', 500)
    return next(error)
  }
  
  res.status(200).json({user: user.toObject({ getters: true })})
}

// *** UPDATE USERNAME ***
const updateUsername = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new HttpError('Invalide field', 422)
    return next(error)  
  }

  const userId = req.params.uid

  const {
    username
  } = req.body

  let user

  try {
    user = await User.findById(userId)
  } catch (err) {
    const error = new HttpError('Something went wrong, could not find the user')
    return next(error)
  }

  if (!user) {
    throw new HttpError('Could not find a user with the provided id', 404)
  }

  user.username = username

  try {
    await user.save()
  } catch (err) {
    const error = new HttpError('Something went wrong, could not update username', 500)
    return next(error)
  }
  
  res.status(200).json({user: user.toObject({ getters: true })})
}

exports.getUsers = getUsers
exports.getUserById = getUserById
exports.signup = signup
exports.login = login
exports.updateProfilePicture = updateProfilePicture
exports.updateUsername = updateUsername