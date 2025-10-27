const dotenv = require("dotenv");
dotenv.config();

class AbacatePayServices {
  async createPayment(
    nome,
    celular,
    cpf,
    email,
    pagamentoExternalId,
    pedidoExternalId,
    valor
  ) {
    const url = "https://api.abacatepay.com/v1/pixQrCode/create";

    const body = {
      amount: valor,

      description: "Novo pedido Sabor do Campo",
      customer: {
        name: nome,
        cellphone: celular,
        email: email,
        taxId: cpf,
      },
      metadata: {
        externalId: pagamentoExternalId,
      },
    };

    const options = {
      method: "POST",
      headers: {
        Authorization: "Bearer abc_dev_rdErJsPLYdzxNhxPyfJss2jk",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      return { codigo: data.data.brCode, qrCode: data.data.brCodeBase64 };
    } catch (error) {
      console.log(error);
    }
  }

  async getStoreInfo() {
    const response = await fetch("https://api.abacatepay.com/v1/store/get", {
      method: "GET",
      headers: {
        Authorization: "Bearer abc_dev_rdErJsPLYdzxNhxPyfJss2jk",
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return data.data
  }

  async novoSaque(valor) {
    const url = "https://api.abacatepay.com/v1/withdraw/create";

    const options = {
      method: "POST",
      headers: {
        Authorization: "Bearer abc_dev_rdErJsPLYdzxNhxPyfJss2jk",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description: "Saque para conta principal",
        externalId: "withdraw-1234",
        method: "PIX",
        amount: valor,
        pix: { type: "CPF", key: "52677748800" },
      }),
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
    }
  }

  async listarSaques() {
    const url = "https://api.abacatepay.com/v1/withdraw/list";
    const options = {
      method: "GET",
      headers: { Authorization: "Bearer abc_dev_rdErJsPLYdzxNhxPyfJss2jk" },
      body: undefined,
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      return data.data;
    } catch (error) {
      
    }
  }
}

module.exports = new AbacatePayServices();
