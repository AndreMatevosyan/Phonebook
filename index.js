const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()


morgan.token('body', request => {
  return JSON.stringify(request.body)
})

app.use(express.json())
app.use(express.static('dist'))
app.use(cors())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]


app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => id === person.id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.get('/info', (request, response) => {
    const info = `<p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date(Date.now())}</p>`
    response.send(info)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    console.log(persons) 
    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const newPerson = request.body
    
    if(!newPerson.name) {
      return response.status(400).json({
        error: "name missing"
      })
    } 

    if(!newPerson.number) {
      return response.status(400).json({
        error: "number missing"
      })
    }

    if (persons.some(person => person.name === newPerson.name)) {
      return response.status(400).json({
        error: "name must be unique"
      })
    }

    const person = {
      id: Math.round(Math.random() * 99999),
      name: newPerson.name,
      number: newPerson.number
    }
    
    persons = persons.concat(person)

    response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`The server is running on port ${PORT}.`)
})