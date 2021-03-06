const expect = require('expect')
const request = require ('supertest')
const {ObjectID} = require('mongodb')
const {app} = require('./../server')
const {Todo} = require('./../models/todo')

const todos = [{
    _id: new ObjectID(),
    text: 'first test todo'
}, {
    _id: new ObjectID(),
    text: 'second test todo'
}]

beforeEach((done) => {
    Todo.remove({}).then(()=>{
        return Todo.insertMany(todos)
    }).then(() => done())
})

describe('Post /todos', () => {
    it('should create a new todo' , (done) => {
        const text = 'Test todo text'

        request(app)
            .post('/todos')
            .send({text})
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text)
            })
            .end((err,res)=>{
                if(err) {return done(err)
                }
                Todo.find({text}).then((todos) => {
                    expect(todos.length).toBe(1)
                    expect(todos[0].text).toBe(text)
                    done()
                }).catch((e) => done(e))

            })
        })
        it('should not create a todo with invalid text', (done) =>{
            request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err,res) =>{
                 if(err) return done(err)
                 Todo.find({}).then((todos) => {
                     expect(todos.length).toBe(2)
                     done()
                 }).catch((e) => done(e))
            })
        })
})

describe('GET /todos' , ()=>{
    it('should get all todos',(done)=>{
        request(app)
        .get('/todos')
        .expect(200)
        .expect((res)=>{
            expect(res.body.todos.length).toBe(2)
        })
        .end(done)
    })
})

describe('GET /todos/:id',()=>{
    it('should return todo doc',(done)=>{
        request(app)
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).toBe(todos[0].text)
        })
        .end(done)
    })
    it('should return a 404 if todo is not found',(done)=>{
        request(app)
        .get(`/todos/${new ObjectID().toHexString()}`)
        .expect(404)
        .end(done)
    })
    it('should return a 400 for invalid ids', (done) => {
        request(app)
        .get('/todos/${123}')
        .expect(400)
        .end(done)
    })
})

describe('DELETE /todos/:id', ()=>{
    it('should delete a todo and return it',(done)=>{
        const id = todos[1]._id.toHexString()
        request(app)
        .delete(`/todos/${id}`)
        .expect(200)
        .expect((res)=>{
            expect(res.body.todo._id).toBe(id)
        })
        .end((err,res)=>{
            if(err){
                 return done(err)
            }
            Todo.findById(id).then((todo)=>{
                expect(todo).toNotExist()
                done()
        }).catch((e)=>done(e))
    })
})
    it('should return 404 if todo not found',(done)=>{
        const id = new ObjectID().toHexString()
        request(app)
        .delete(`/todos/${id}`)
        .expect(404)
        .end(done)
     })
    it('should return 404 if object id not valid', (done)=>{
        const id = 123
        request(app)
        .delete(`/todos/${id}`)
        .expect(404)
        .end(done)
    })
})