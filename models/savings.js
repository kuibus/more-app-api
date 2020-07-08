// Create our schema - this is the blueprint for out transaction
const mongoose = require('mongoose')

const savingsSchema = new mongoose.Schema({
  expected: { type: Number, required: true },
  actual: { type: Number, required: true },
  month: Date,
  creator: {type: mongoose.Types.ObjectId, required: true, ref: 'User'},
})

module.exports = mongoose.model('Savings', savingsSchema)
