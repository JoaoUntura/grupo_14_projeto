const express = require("express");
const router = express.Router();

const recuperarSenha = require("../services/recuperarSenha");

router.get("/", (req, res) => {
    res.render("recuperarSenha", { etapa: 1, erro: null, msg: null, email: null });
});

router.post("/", async (req, res) => {
    const { email } = req.body;

    const usuario = await recuperarSenha.verificarEmail(email);

    if (!usuario) {
        return res.render("recuperarSenha", {
            etapa: 1,
            erro: "Email não encontrado!",
            msg: null,
            email: null
        });
    }

    const codigo = recuperarSenha.gerarCodigo();

    await recuperarSenha.salvarCodigo(email, codigo);
    await recuperarSenha.enviarCodigo(email, codigo);

    return res.render("recuperarSenha", {
        etapa: 2,
        erro: null,
        msg: "Código enviado para o e-mail!",
        email
    });
});

router.post("/novaSenha", async (req, res) => {
    const { email, codigo, novaSenha } = req.body;

    const valido = await recuperarSenha.validarCodigo(email, codigo);

    if (!valido) {
        return res.render("recuperarSenha", {
            etapa: 2,
            erro: "Código incorreto ou expirado!",
            msg: null,
            email
        });
    }

    await recuperarSenha.atualizarSenha(email, novaSenha);

    res.render("login", { msg: "Senha alterada com sucesso!" });
});

module.exports = router;
