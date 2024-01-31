require('dotenv').config()
const Person = require('./models/person')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

morgan.token('body', request => {
  return JSON.stringify(request.body)
})

app.use(express.static('dist'))
app.use(express.json())
app.use(cors())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


app.get('/api/persons', (request, response) => {
  Person.find({}).then(result => {
    response.send(result)
    console.log('phonebook:')
    result.forEach(person => {
      console.log(person.name, person.number)
    })
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      response.json(person)
    })
    .catch(error => next(error))
})

app.get('/info', (request, response) => {
  Person.countDocuments({})
    .then(count => {
      const info = `<p>Phonebook has info for ${count} people</p>
      <p>${new Date(Date.now())}</p>`
      response.send(info)
    })
})

app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndDelete(request.params.id)
    .then(response.status(204).end())
})

app.post('/api/persons', (request, response, next) => {
  const newPerson = request.body

  if(!newPerson.name) {
    return response.status(400).json({
      error: 'name missing'
    })
  }

  if(!newPerson.number) {
    return response.status(400).json({
      error: 'number missing'
    })
  }

  const person = new Person({
    name: newPerson.name,
    number: newPerson.number,
  })

  person
    .save()
    .then(result => {
      console.log(`added ${result.name} number ${result.number} to phonebook`)
      response.json(person)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send(error.message)
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`The server is running on port ${PORT}.`)
})