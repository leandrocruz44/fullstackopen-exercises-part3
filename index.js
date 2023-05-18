require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person.js')

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('build'))
 
morgan.token('content', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'))


app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})


app.get('/info', (request, response) => {
  Person.find({}).then(persons => {
    const personsSize = persons.length
    const requestTime = new Date()
    response.send(
      `<p>Phonebook has info for ${personsSize} people.</p>
       <p>${requestTime}</p>`
    )
  })
})


app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.send(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => {
      console.log(error)
      response.status(500).end()
    })
})


app.post('/api/persons' , (request, response, next) => {
    const entry = request.body
    const newPerson = new Person ({
      name: entry.name,
      number: entry.number
    })
    newPerson.save()
      .then(savedPerson => {
        response.json(savedPerson)
      })
      .catch(error => next(error))
})


app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => response.status(204).end())
    .catch(error => next(error))
})


app.put('/api/persons/:id', (request, response, next) => {
  const entry = request.body
  const person = {
    name: entry.name,
    number: entry.number
  }
  Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true})
    .then(updatedPerson => response.json(updatedPerson))
    .catch(error => next(error))
})


const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'This ID is not within the pattern accepted' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json(`${error.message}`)
  }
  next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})