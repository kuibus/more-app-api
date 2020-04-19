// Create our schema - this is the blueprint for out transaction
const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
  type: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String, required: false },
  method: { type: String, required: true },
  paidBy: {type: mongoose.Types.ObjectId, required: true, ref: 'User'},
  competence: {type: mongoose.Types.ObjectId, required: true, ref: 'User'},
  creator: {type: mongoose.Types.ObjectId, required: true, ref: 'User'}, // the ref create the connection between 2 schema
  date: Date
})

module.exports = mongoose.model('Transaction', transactionSchema) // Transaction is the name of the Collection