// const mongoose = require('mongoose')
const mongoose = require('mongoose')
const HttpError = require('../models/http-error')
const User = require('../models/user')

const getSettingsByUserId = async (req, res, next) => { // http://localhost:5000/api/settings/uid
  const userId = req.params.uid

  let userWithSettings
  
  try {
    userWithSettings = await User.findById(userId)
  } catch (err) {
    const error = new HttpError('Fetching settings failed, please try again later', 500)
    return next(error)
  }

  if (!userWithSettings) {
    throw new HttpError('Could not find settings for the provided user id', 404)
  }

  res.json({ settings: userWithSettings.settings.toObject({ getters: true }) })
}

exports.getSettingsByUserId = getSettingsByUserId