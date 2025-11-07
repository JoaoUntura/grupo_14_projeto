const express = require('express')
const router = express.Router()
const clienteServices = require('../services/Cliente.js')


router.get('/', async(req,res) =>{
    const response = await clienteServices.findAll()
    const clientes = response?.values
    
    res.render('clientes', {clientes:clientes})
})

router.post('/', async(req,res) =>{
  const {nome, telefone, email, cpf} = req.body
  const response = await clienteServices.create(nome, telefone, email, cpf)
  res.redirect('/clientes')

})

module.exports = router