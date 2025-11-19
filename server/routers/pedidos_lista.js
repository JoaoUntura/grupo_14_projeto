const express = require("express");
const router = express.Router();

const pedidosServices = require("../services/Pedido");
const gatewayServices = require("../services/AbacatePay");
const pagamentoServices = require("../services/Pagamentos");
const clientesServices = require("../services/Cliente");


router.get("/:cliente", async (req, res) => {
  const cliente = Number(req.params.cliente)


  const pedido = (cliente === 0 || isNaN(cliente)) ? await pedidosServices.findAll() 
  : await pedidosServices.findByClientId(cliente)

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
            statusBr,
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

  const clientesResponse = await clientesServices.findAll()

  res.render("pedidos_lista", {
    pedidos: pedidos,
    clientes: clientesResponse.values || [],
    user: req.session.usuario
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

     await pagamentoServices.update(
      pagamentoExternalId,
      response.codigo,
      response.qrCode,
      response.id
    );
   
    res.status(200).json(response)
  } catch (err) {
    console.log(err);
  }
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  await gatewayServices.simularPagamento(id);

  res.status(200).send()
});

router.put("/entregar/:id", async (req, res) => {
  const id = req.params.id;
  const update = await pedidosServices.update(parseInt(id), null, null,null,null,true)
  console.log(update)
  res.status(201).send()
});

module.exports = router;
