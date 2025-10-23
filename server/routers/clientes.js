const express = require('express')
const router = express.Router()
const clienteServices = require('../services/Cliente.js')


router.get('/', async(req,res) =>{
    const response = await clienteServices.findAll()
    const clientes = response?.values
    console.log(clientes)
    res.render('clientes', {clientes:clientes})
})

router.post('/', async(req,res) =>{
  const {nome, telefone} = req.body
  const response = await clienteServices.create(nome, telefone)
  console.log(response)

})

module.exports = router