const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: false },
  transactions: [{type: mongoose.Types.ObjectId, required: true, ref: 'Transaction'}] // this is an array because relation user:transaction is 1:n
})

userSchema.plugin(uniqueValidator)

module.exports = mongoose.model('User', userSchema)