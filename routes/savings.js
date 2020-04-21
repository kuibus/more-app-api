const express = require('express')
// const { check } = require('express-validator')
const savingsController = require('../controllers/savings')
const checkAuth = require('../middleware/check-auth')

const router = express.Router()

router.use(checkAuth)

router.get('/user/:uid', savingsController.getSavingsByUserId)

router.post('/',
  savingsController.setSavings
)

// router.patch('/',
//   [
//     check('expected')
//       .not()
//       .isEmpty(),
//     check('total')
//       .not()
//       .isEmpty()
//   ],
//   savingsController.updateSavings
// )

module.exports = router