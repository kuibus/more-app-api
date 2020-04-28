const express = require('express')
// const { check } = require('express-validator')
const settingsController = require('../controllers/settings')
const checkAuth = require('../middleware/check-auth')

const router = express.Router()

router.use(checkAuth)

router.get('/user/:uid', settingsController.getSettingsByUserId)

// router.post('/',
//   savingsController.setSavings
// )

module.exports = router