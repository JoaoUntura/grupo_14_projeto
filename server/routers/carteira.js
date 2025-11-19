const express = require("express");
const router = express.Router();


const gatewayServices = require("../services/AbacatePay");


router.get("/", async (req, res) => {
  const lojaInfo = await gatewayServices.getStoreInfo()
const saques = await gatewayServices.listarSaques()

 

  res.render("carteira", {
    lojaInfo: lojaInfo,
    saques:saques,
    user: req.session.usuario
  });
});

router.post("/", async (req, res) => {
    const {amount} = req.body
   
    const response = await gatewayServices.novoSaque(amount)
 
   
  });



module.exports = router;
