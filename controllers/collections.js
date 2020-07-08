// const mongoose = require('mongoose')
const mongoose = require('mongoose')
const HttpError = require('../models/http-error')
const User = require('../models/user')
const Savings = require('../models/savings')

const getDashboard = async (req, res, next) => { // http://localhost:5000/api/settings/uid
  const userId = req.params.uid

  let user
  
  try {
    user = await User.findById(userId)
  } catch (err) {
    const error = new HttpError('Fetching settings failed, please try again later', 500)
    return next(error)
  }

  if (!user) {
    throw new HttpError('Could not find settings for the provided user id', 404)
  }
  // Get saving of current month
  const { settings, savings } = user

  let currentUserSavings

  try {
    currentUserSavings = await Savings.find({ creator: userId })
  } catch (err) {
    const error = new HttpError('Something went wrong, could not find any savings for the provided user', 500)
    return next(error)
  }

  const { initialSavings, threshold } = settings
  
  const collection = {
    initialSavings,
    threshold
  }

  res.json({ collection })
}

exports.getDashboard = getDashboard