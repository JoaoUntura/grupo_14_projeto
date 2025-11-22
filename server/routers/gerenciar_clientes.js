const express = require('express')
const router = express.Router()
const clienteServices = require('../services/Cliente.js')


router.get('/', async(req,res) =>{
    const response = await clienteServices.findAll()
    const clientes = response?.values
  
    res.render('gerenciar_clientes', {clientes:clientes, user: req.session.usuario})
})

router.get("/:id", async (req, res) => {
    const {values} = await clienteServices.findById(req.params.id);
    res.json(values);
  });
  

router.delete('/:id', async(req,res) =>{
    const id = req.params.id

    const response = await clienteServices.delete(id)
    console.log(response)
    res.status(204).send("Deletado")
})

router.put('/:id', async(req,res) =>{
    const id = req.params.id
    const {nome, contato, email,cpf} = req.body
    const response = await clienteServices.update(id,nome,contato,email,cpf)
    console.log(response)
    res.status(200).send("Atualizado")
})



module.exports = router