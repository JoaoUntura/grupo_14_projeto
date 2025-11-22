const express = require('express')
const router = express.Router()
const produtosServices = require("../services/Produtos")


router.get('/', async(req,res) =>{
    const response = await produtosServices.findAll()
    const produtos = response?.values
  
    res.render('gerenciar_produtos', {produtos:produtos, user: req.session.usuario})
})

router.get("/:id", async (req, res) => {
    const {values} = await produtosServices.findById(req.params.id);
    res.json(values);
  });
  

router.delete('/:id', async(req,res) =>{
    const id = req.params.id

    await produtosServices.delete(id)
  
    res.status(204).send("Deletado")
})

router.put('/:id', async(req,res) =>{
    const id = req.params.id
    const {nome, preco} = req.body
    await produtosServices.update(id,nome,preco)
  
    res.status(200).send("Atualizado")
})



module.exports = router