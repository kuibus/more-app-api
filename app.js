require('dotenv').config()
const fs = require('fs')
const path = require('path')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const HttpError = require('./models/http-error')
const mongoose = require('mongoose')

const transactionsRoutes = require('./routes/transactions') // this is a middleware now
const usersRoutes = require('./routes/users')

const app = express()

// before the req reaches the transactionRoutes, first parse the body and then reach the routes
app.use(bodyParser.json()) // this will parse any incoming requests body

app.use(cors())

app.use('/uploads/images', express.static(path.join('uploads', 'images')))

app.use('/api/transactions', transactionsRoutes)
app.use('/api/users', usersRoutes)

/** HANDLING ERRORS FOR UNSUPPORTED ROUTES */
// This middleware is supposed to run only if you have some requests which didn't have a response before
app.use((req, res, next) => {
  const error = new HttpError('Could not found this route', 404)
  throw error
})

app.use( (error, req, res, next) => { // this is the middleware that we have to trigger
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err)
    })
  }
  
  if ( res.headerSent ) {
    return next(error)
  }

  res.status(error.code || 500)
  res.json({ message: error.message || 'An unknown error occurred'})
})

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@clustermore-6pnh3.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(process.env.PORT || 5000)
  })
  .catch(error => {
    console.log(error)
  })