const express = require("express");
const router = express.Router();
const produtosServices = require("../services/Produtos");
const clientesServices = require("../services/Cliente");
const pedidosServices = require("../services/Pedido");
const pedidoProdutoServices = require("../services/PedidoProduto");
const pagamentoSevices = require("../services/Pagamentos");
const crypto = require("crypto");

router.get("/", async (req, res) => {
  const pedido = await pedidosServices.findAll()

  const pedidos =  pedido.values
  console.log(pedidos)
  const responseProdutos = await produtosServices.findAll();
  const produtos = responseProdutos?.values || [];


  const responseClientes = await clientesServices.findAll();
  const clientes = responseClientes?.values || [];


  res.render("pedidos", {
    produtos: produtos,
    clientes: clientes,

  });
});

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

    const totalPedido = parseFloat(total) * 100;

    const forma_pagamento = "Nao Informado";

    const externalIdPagamento = crypto.randomUUID();
    const pagamentoId = await pagamentoSevices.createAndReturnId(
      externalIdPagamento,
      forma_pagamento,
      "Pendente",
      totalPedido
    );

    const entregueBool = entregue === "true";
    const data = dataPedido;
    const cliente_id = parseInt(clienteId);
    const pedidoResult = await pedidosServices.create(
      data,
      crypto.randomUUID(),
      cliente_id,
      pagamentoId.values,
      entregueBool
    );

    if (!pedidoResult.validated) {
      return res.status(500).json({ error: pedidoResult.error });
    }

    const pedidoId = pedidoResult.values; // ID retornado pelo insert

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

module.exports = router;
