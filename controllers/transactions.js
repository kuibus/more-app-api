const HttpError = require('../models/http-error')
const { validationResult } = require('express-validator')
const mongoose = require('mongoose')
const Transaction = require('../models/transaction')
const User = require('../models/user')

// MIDDLEWARE FUNCTIONS HERE

// GET
const getTransactionById = async (req, res, next) => { // http://localhost:5000/api/transactions/tid
  const transactionId = req.params.tid // { tid : 't1' }
  
  let transaction

  try {
    transaction = await Transaction.findById(transactionId)
  } catch (err) {
    // this is thrown if the request is missing something
    const error = new HttpError('Something went wrong, could not find the transaction', 500)
    return next(error)
  }

  if (!transaction) {
    // next() // we can throw an error or run next
    // request is fine but we can't find any transactions with that id
    throw new HttpError('Could not find a transaction with the provided id', 404)
  }
  
  res.json({ transaction: transaction.toObject({ getters: true }) })
}

const getTransactionsByUserId = async (req, res, next) => { // http://localhost:5000/api/transactions/uid
  const userId = req.params.uid

  let userWithTransactions

  try {
    // transactions = await Transaction.find({ creator: userId }) 
    userWithTransactions = await User.findById(userId).populate('transactions')
  } catch (err) {
    console.log(err)

    const error = new HttpError('Fetching transactions failed, please try again later', 500)
    return next(error)
  }

  // if (!transactions || !transactions.length)
  if (!userWithTransactions || !userWithTransactions.transactions.length) {
    // next() // we can throw an error or run next
    return next(new HttpError('Could not find a transaction for the provided user id', 404))
  }

  res.json({ 
    transactions: userWithTransactions.transactions.map(transaction => transaction.toObject({ getters: true }) ) 
  })
}

// POST
const createTransaction = async (req, res, next) => {

  const errors = validationResult(req) // first check if there are some validation errors based on middleware defined in route
  if (!errors.isEmpty()) {
    throw new HttpError('Invalid input passed, please check your data', 422)
    // use next() if you're working with async functions, throw doesn't work well in that case
    // and use try catch (error) to handle errors
  }

  const {
    amount,
    type,
    method,
    category,
    description
  } = req.body

  const creator = req.userData.userId

  const createdTransaction = new Transaction({
    type: type,
    amount: amount,
    category: category,
    description: description,
    method: method,
    paidBy: creator, // this should be current user
    competence: creator, // this should be current user
    creator: creator,
    date: new Date()
  })

  let user

  try {
    user = await User.findById(creator)
  } catch (err) {
    const error = new HttpError('Creating transaction failed, please try again', 500)
    return next(error)
  }

  // if the user exists we have to add the transactionID to the corrispondent user

  if (!user) {
    const error = new HttpError('Could not find a user for the provided id', 404)
    return next(error)
  }

  try {
    // execute multiple operations, if one of these fails, we want to thow the error
    const sess = await mongoose.startSession()
    sess.startTransaction()
    await createdTransaction.save({ session: sess})
    user.transactions.push(createdTransaction) // method used by mongoose to create connection between transaction and user
    await user.save({ session: sess })
    await sess.commitTransaction()
  } catch (err) {
    const error = new HttpError('Creating new transaction failed. Please try again', 500)
    return next(error)
  }
  
  res.status(201).json({transaction: createdTransaction}) // 201 for successful created object
}

// PACTH
const updateTransaction = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(new HttpError('Required fiels are empty', 422))
  }
  
  const {
    type,
    amount,
    category,
    description,
    method,
    creator
  } = req.body

  const transactionId = req.params.tid

  let transaction

  try {
    transaction = await Transaction.findById(transactionId)
  } catch (err) {
    // this is thrown if the request is missing something
    const error = new HttpError('Something went wrong, could not find the transaction', 500)
    return next(error)
  }

  if (!transaction) {
    throw new HttpError('Could not find a transaction with the provided id', 404)
  }

  if (transaction.creator.toString() !== req.userData.userId) {
    const error = new HttpError(
      'You are not allowed to edit this transaction',
      401 // authorization error
    )
    return next(error)
  }
  
  transaction.type = type
  transaction.amount = amount
  transaction.category = category
  transaction.description = description
  transaction.method = method
  transaction.creator = creator

  try {
    await transaction.save()
  } catch (err) {
    const error = new HttpError('Something went wrong, could not update place', 500)
    return next(error)
  }
  res.status(200).json({transaction: transaction.toObject({ getters: true })})
}

// DELETE
const deleteTransaction = async (req, res, next) => {
  const transactionId = req.params.tid
  
  let transaction
  try {
    transaction = await Transaction.findById(transactionId).populate('creator') // populate allows to refer to a doc stored in another collection and to work with data in that exisitng doc of that other collection, this is possibile thanks to schema
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete the place.',
      500
    )
    return next(error)
  }

  if (!transaction) {
    const error = new HttpError('Could not find a transaction with that id', 404)
    return next(error)
  }

  if (transaction.creator.id !== req.userData.userId ) {
    const error = new HttpError('You are not allowed to delete this transaction', 401)
    return next(error)
  }

  try {
    const sess = await mongoose.startSession()
    sess.startTransaction()
    await transaction.remove({ session: sess})
    transaction.creator.transactions.pull(transaction)
    await transaction.creator.save({ session: sess})
    await sess.commitTransaction()
  }catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete the place.',
      500
    )
    return next(error)
  }

  res.status(200).json({message: 'deleted transaction'})
}

exports.getTransactionById = getTransactionById
exports.getTransactionsByUserId = getTransactionsByUserId
exports.createTransaction = createTransaction
exports.updateTransaction = updateTransaction
exports.deleteTransaction = deleteTransaction