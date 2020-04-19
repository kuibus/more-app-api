const express = require('express')
const { check } = require('express-validator')
const transactionsController = require('../controllers/transactions')
const checkAuth = require('../middleware/check-auth')

const router = express.Router() // this method allows to register routes

router.use(checkAuth)

router.get('/:tid', transactionsController.getTransactionById)
router.get('/user/:uid', transactionsController.getTransactionsByUserId)

router.post('/new',
  transactionsController.createTransaction
)
router.patch('/:tid',
  [
    check('type')
      .not()
      .isEmpty(),
    check('amount')
      .not()
      .isEmpty(),
    check('category')
      .not()
      .isEmpty(),
    check('method')
      .not()
      .isEmpty()
  ],
  transactionsController.updateTransaction
)

router.delete('/:tid', transactionsController.deleteTransaction)

module.exports = router