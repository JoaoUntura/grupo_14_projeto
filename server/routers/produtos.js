const express = require('express')
const router = express.Router()
const produtosServices = require("../services/Produtos")


router.get('/', async(req,res) =>{
    const response = await produtosServices.findAll()
    const produtos = response?.values
  
    res.render('produtos', {produtos:produtos, user: req.session.usuario})
})

router.post('/', async(req,res) =>{
    const {nomeProduto, valorProduto} = req.body
    await produtosServices.create(nomeProduto, valorProduto)
    res.redirect("/produtos")

})

module.exports = router