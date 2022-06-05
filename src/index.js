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

  request.user = user

  if(!user){
    return response.status(400).json({error:"Usuario inexistente"})
  }
  return next();
}

//buscando usuarios
app.get('/users',(request, response)=>{
  response.send(users)
})

//criando um novo usuario
app.post('/users', (request, response) => {

  const {username,name} = request.body
  let user = { 
    id: uuidv4(),
    name, 
    username, 
    todos: []
  }

  let userAlreadyExists = users.findIndex(user=>user.username===username)

  if (userAlreadyExists>-1){
    response.status(401).send("Usuário já existe")
  }else{
    users.push(user)
  }
  response.status(201).send(user)


});

//buscando as todos por usuario
app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request

  response.send(user.todos)

});

//criando uma nova tarefa
app.post('/todos', checksExistsUserAccount, (request, response) => {
   const {user} = request 
   const {title,deadline} = request.body

   const task = {
     id: uuidv4(),
     title,
     done:false,
     deadline: new Date(deadline), 
     createdAt: new Date()
   }

   user.todos.push(task)
   response.send(task)
});

//atualizando dados da tarefa
app.put('/todos/:id',checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {id} = request.params

  const {title,deadline} = request.body

  user.todos.map((task) =>{
    if (task.id!==id){
      response.json({error: "Id inexistente"})
    }
    task.title = title,
    task.deadline =deadline
    response.send(user)
  })
});

//atualizando status da tarefa
app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {id} = request.params

  user.todos.map((task) =>{
    if(task.id===id){
    task.done = true
  }
  response.send(user.todos.task)

})
});

//deletando tarefa
app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {id} = request.params

  user.todos.map((task) =>{
    if (task.id===id){
      user.todos.splice(task,1)
      response.send("Tarefa deletada")
    }
  })
  response.send("id nao encontrado")

});

module.exports = app;