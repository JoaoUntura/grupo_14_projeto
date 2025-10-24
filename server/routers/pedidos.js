const express = require('express')
const router = express.Router()
const produtosServices = require("../services/Produtos")
const clientesServices = require("../services/Cliente")
const pedidosServices = require("../services/Pedido")
const pedidoProdutoServices = require("../services/PedidoProduto")

router.get('/', async(req,res) =>{
    const responseProdutos = await produtosServices.findAll()
    const produtos = responseProdutos?.values || []

    const responsePedidos = await pedidosServices.findAll()
    const pedidos = responsePedidos?.values || []
    console.log(pedidos)
    const responseClientes = await clientesServices.findAll()
    const clientes = responseClientes?.values || []



    res.render('pedidos', {produtos:produtos, clientes:clientes, pedidos:pedidos})
})

router.post("/", async (req, res) => {
  try {
    const {
      clienteId,
      dataPedido,
      produtos,
      total,
      entregue,
      ...quantidadesRaw
    } = req.body;


    const cliente_id = parseInt(clienteId);
    const totalPedido = parseFloat(total);
    const entregueBool = entregue === "true";
    const data = dataPedido;
    const forma_pagamento = "Não informado"; // pode ser ajustado depois

    const pedidoResult = await pedidosServices.create(
      data,
      cliente_id,
      totalPedido,
      forma_pagamento,
      entregueBool
    );

    if (!pedidoResult.validated) {
      return res.status(500).json({ error: pedidoResult.error });
    }

    const pedidoId = pedidoResult.values // ID retornado pelo insert

   
    if (produtos && Array.isArray(produtos)) {
      for (const produtoId of produtos) {
        const key = `quantidades[${produtoId}]`;
        const qtd = parseInt(quantidadesRaw[key]) || 1;

        const pedidoProduto = await pedidoProdutoServices.create(
          pedidoId,
          parseInt(produtoId),
          qtd
        );

        if (!pedidoProduto.validated) {
          console.error("Erro ao cadastrar produto:", pedidoProduto.error);
        }
      }
    }

   

  } catch (error) {
    console.error("Erro ao cadastrar pedido:", error);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

module.exports = router