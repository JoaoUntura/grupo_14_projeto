const express = require("express");
const router = express.Router();
const produtosServices = require("../services/Produtos");
const clientesServices = require("../services/Cliente");
const pedidosServices = require("../services/Pedido");
const pedidoProdutoServices = require("../services/PedidoProduto");
const pagamentoSevices = require("../services/Pagamentos");
const crypto = require("crypto");

router.get("/", async (req, res) => {

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

    if (!pedidoResult.validated) throw new Error(pedidoResult.error)

    const pedidoId = pedidoResult.values; 

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
          throw new Error(pedidoResult.error)
        }
      }
    }else{
        const key = `quantidades[${produtos}]`;
        const qtd = parseInt(quantidadesRaw[key]) || 1;
        const pedidoProduto = await pedidoProdutoServices.create(
          pedidoId,
          parseInt(produtos),
          qtd
        );
            if (!pedidoProduto.validated) {
          throw new Error(pedidoResult.error)
        }
        }
    res.redirect("/pedidos_lista/0")
  } catch (error) {
    console.log("Erro ao cadastrar pedido:", error);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

module.exports = router;
