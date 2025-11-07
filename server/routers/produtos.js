const express = require('express')
const router = express.Router()
const produtosServices = require("../services/Produtos")


router.get('/', async(req,res) =>{
    const response = await produtosServices.findAll()
    const produtos = response?.values
  
    res.render('produtos', {produtos:produtos})
})

router.post('/', async(req,res) =>{
    const {nomeProduto, valorProduto} = req.body
    const response = await produtosServices.create(nomeProduto, valorProduto)

})

module.exports = router