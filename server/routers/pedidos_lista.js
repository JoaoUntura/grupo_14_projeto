const express = require("express");
const router = express.Router();

const pedidosServices = require("../services/Pedido");
const gatewayServices = require("../services/AbacatePay");


router.get("/", async (req, res) => {
  const pedido = await pedidosServices.findAll();
  const pedidos = pedido?.values || [];

  res.render("pedidos_lista", {
    pedidos: pedidos,
  });
});

router.post("/", async (req, res) => {
  const body = req.body
  const pedido = JSON.parse(body.pedido)
  try {
    const nome = pedido.cliente_nome;
    const celular = pedido.cliente_contato;
    const cpf = pedido.cliente_cpf;
    const email = pedido.cliente_email;
    const pagamentoExternalId = pedido.pagamento_external_id;
    const pedidoExternalId = pedido.pedido_external_id;
    const valor = pedido.total;

    const response = await gatewayServices.createPayment(
      nome,
      celular,
      cpf,
      email,
      pagamentoExternalId,
      pedidoExternalId,
      valor
    );

    res.status(200).json(response)
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
