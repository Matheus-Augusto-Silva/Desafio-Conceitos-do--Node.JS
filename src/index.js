const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const res = require('express/lib/response');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

//middleware
function checksExistsUserAccount(request, response, next) {
  let {username} = request.headers

  const user = users.find(user => user.username===username);

  if(!user){
    return response.status(404).json({error:"Usuario inexistente"})
  }

request.user = user
return next();
}

//criando um novo usuario
app.post('/users', (request, response) => {

  const {name,username} = request.body

  const userAlreadyExists = users.find(user=>user.username===username)

  if (userAlreadyExists){
    response.status(400).json({error: "Usuário já existe"})
  }
  const user = { 
    id: uuidv4(),
    name, 
    username, 
    todos: []
  }
  users.push(user)
  return response.status(201).json(user)
});

//buscando as todos por usuario
app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request

  return response.json(user.todos)

});

//criando uma nova tarefa
app.post('/todos', checksExistsUserAccount, (request, response) => {
   const {user} = request 
   const {title,deadline} = request.body

   const todo = {
     id: uuidv4(),
     title,
     done:false,
     deadline: new Date(deadline), 
     created_at: new Date()
   }

   user.todos.push(todo)
   return response.status(201).json(todo)
});

//atualizando dados da tarefa
app.put('/todos/:id',checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {title,deadline} = request.body
  const {id} = request.params

  const todo = user.todos.find(todo => todo.id === id)

  if(!todo){
    return response.status(404).json({error: 'Todo Not Found'})
  }

  todo.title = title
  todo.deadline = new Date(deadline)

  return response.json(todo)

});

//atualizando status da tarefa
app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {id} = request.params

  const todo = user.todos.find((todo) =>todo.id===id)

  if(!todo){
    return response.status(404).json({error: 'Todo Not Found'})
  }

  todo.done = true    
  return response.json(todo)

});

//deletando tarefa
app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {id} = request.params

  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  if(todoIndex===-1){
    return response.status(404).json({error:"Todo not found"})
  }

  user.todos.splice(todoIndex, 1)

  return response.status(204).json()

});

module.exports = app;