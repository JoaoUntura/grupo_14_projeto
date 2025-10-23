const express = require('express')
const path = require('path')
const session = require('express-session')

const app = express()

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '../renderer/views'))
app.use(express.static(path.join(__dirname, '../renderer/public')))

app.use(express.urlencoded({extended:false}))

app.use(session({
    secret: 'segredo-super-seguro',
    resave: false,
    saveUninitialized: false,
}))

const loginRouter = require('./routers/auth')
const homeRouter = require('./routers/home')
const clientes = require('./routers/clientes')
const funcionarios = require('./routers/funcionarios')
const produtos = require('./routers/produtos')


app.use('/', loginRouter)
app.use('/home', homeRouter)
app.use('/clientes', clientes)
app.use('/produtos', produtos)
app.use('/funcionarios', funcionarios)


app.listen(4040, ()=>{
    console.log('Servidor inicializado em http://localhost:4040')
})