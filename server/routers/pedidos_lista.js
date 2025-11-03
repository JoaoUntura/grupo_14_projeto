const express = require("express");
const router = express.Router();

const pedidosServices = require("../services/Pedido");
const gatewayServices = require("../services/AbacatePay");
const pagamentoServices = require("../services/Pagamentos");

router.get("/", async (req, res) => {
  const pedido = await pedidosServices.findAll();
  let pedidos = pedido?.values || [];

  pedidos = await Promise.all(
    pedidos.map(async (pedido) => {
      if (
        pedido?.idPix &&
        (pedido.status == "PENDING" ||
          pedido.status == "Pendente" ||
          !pedido.status)
      ) {
        const response = await gatewayServices.buscarPagamento(pedido.idPix);

        const status = response?.data?.status;

        if (status) {
          let statusBr;

          switch (status) {
            case "PENDING":
              statusBr = "Pendente";
              break;
            case "EXPIRED":
              statusBr = "Expirado";
              break;
            case "CANCELLED":
              statusBr = "Cancelado";
              break;
            case "PAID":
              statusBr = "Pago";
              break;
            case "REFUNDED":
              statusBr = "Reembolsado";
              break;
            default:
              statusBr = "Desconhecido";
          }

          await pagamentoServices.update(
            pedido.pagamento_external_id,
            null,
            null,
            null,
            status,
            status === "PAID" ? "Pix" : null
          );
          return {
            ...pedido,
            produtos: [...pedido.produtos],
            status: response?.data?.status,
          };
        } else {
          return pedido;
        }
      } else {
        return pedido;
      }
    })
  );

  res.render("pedidos_lista", {
    pedidos: pedidos,
  });
});

router.post("/", async (req, res) => {
  const body = req.body;
  const pedido = JSON.parse(body.pedido);
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

    if (!response.codigo || !response.qrCode || !response.id)
      throw new Error("Invalid");

    const responseUptade = await pagamentoServices.update(
      pagamentoExternalId,
      response.codigo,
      response.qrCode,
      response.id
    );
    console.log(responseUptade);
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
  }
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  await gatewayServices.simularPagamento(id);

  res.redirect("/pedidos_lista");
});

module.exports = router;
