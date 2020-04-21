// Create our schema - this is the blueprint for out transaction
const mongoose = require('mongoose')

const savingsSchema = new mongoose.Schema({
  expected: { type: Number, required: true },
  total: { type: Number, required: true },
  creator: {type: mongoose.Types.ObjectId, required: true, ref: 'User'},
  month: { type: Number, required: true }
})

module.exports = mongoose.model('Savings', savingsSchema)