const express = require('express')
// const { check } = require('express-validator')
const collectionsController = require('../controllers/collections')
const checkAuth = require('../middleware/check-auth')

const router = express.Router()

router.use(checkAuth)

router.get('/user/:uid', collectionsController.getDashboard)

// router.post('/',
//   savingsController.setSavings
// )

module.exports = router