const HttpError = require('../models/http-error')
const { validationResult } = require('express-validator')
const mongoose = require('mongoose')
const Savings = require('../models/savings')
const User = require('../models/user')

const setSavings = async (req, res, next) => { // http://localhost:5000/api/savings

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new HttpError('Invalid input passed, please check your data', 422)
    return next(error)
  }

  const {
    expected,
    total
  } = req.body

  const creator = req.userData.userId
  const month = new Date().getMonth()

  const createdSavings = new Savings({
    expected: expected,
    total: total,
    creator: creator,
    month: month
  })

  let user

  try {
    user = await User.findById(creator)
  } catch (err) {
    const error = new HttpError('Creating savings failed, please try again', 500)
    return next(error)
  }

  if (!user) {
    const error = new HttpError('Could not find a user for the provided id', 404)
    return next(error)
  }

  try {
    // execute multiple operations, if one of these fails, we want to thow the error
    const sess = await mongoose.startSession()
    sess.startTransaction()
    await createdSavings.save({ session: sess})
    user.savings.push(createdSavings) // method used by mongoose to create connection between transaction and user
    await user.save({ session: sess })
    await sess.commitTransaction()
  } catch (err) {
    const error = new HttpError('Creating savings failed. Please try again', 500)
    return next(error)
  }
  
  res.status(201).json({savings: createdSavings}) // 201 for successful created object
}

const getSavingsByUserId = async (req, res, next) => { // http://localhost:5000/api/savings/uid
  const userId = req.params.uid

  let userWithSavings

  try {
    // transactions = await Transaction.find({ creator: userId }) 
    userWithSavings = await User.findById(userId).populate('savings')
  } catch (err) {
    console.log(err)

    const error = new HttpError('Fetching savings failed, please try again later', 500)
    return next(error)
  }

  // if (!transactions || !transactions.length)
  if (!userWithSavings || !userWithTransactions.savings.length) {
    // next() // we can throw an error or run next
    return next(new HttpError('Could not find savings for the provided user id', 404))
  }

  res.json({ 
    savings: userWithSavings.savings.map(saving => saving.toObject({ getters: true }) )
  })
}

exports.setSavings = setSavings
exports.getSavingsByUserId = getSavingsByUserId