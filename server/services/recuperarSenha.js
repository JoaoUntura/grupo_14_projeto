const db = require("../db");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

class RecuperarSenha {

    // 1 — Buscar usuário pelo e-mail
    async verificarEmail(email) {
        return await db("User").where({ email }).first();
    }

    // 2 — Gerar código (SÓ gera)
    gerarCodigo() {
        return Math.floor(100000 + Math.random() * 900000).toString(); // 6 dígitos
    }

    // 3 — Salvar código + expiração no banco
    async salvarCodigo(email, codigo) {

        const expira = new Date();
        expira.setMinutes(expira.getMinutes() + 10); // expira em 10 min

        await db("User")
            .where({ email })
            .update({
                codigo_recuperacao: codigo,
                codigo_expira: expira
            });
    }

    // 4 — Enviar e-mail com o código
    async enviarCodigo(email, codigo) {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "SEU_EMAIL@gmail.com",
                pass: "SUA_SENHA_DE_APP"
            }
        });

        await transporter.sendMail({
            from: "Sistema <SEU_EMAIL@gmail.com>",
            to: email,
            subject: "Código de Recuperação de Senha",
            text: `Seu código de recuperação é: ${codigo}. Ele expira em 10 minutos.`
        });
    }

    // 5 — Validar código + expiração
    async validarCodigo(email, codigoDigitado) {
        const usuario = await db("User")
            .where({ email })
            .first();

        if (!usuario) return false;
        if (!usuario.codigo_recuperacao) return false;

        const agora = new Date();
        const expira = new Date(usuario.codigo_expira);

        if (agora > expira) return false; // expirado
        if (usuario.codigo_recuperacao !== codigoDigitado) return false; // errado

        return true;
    }

    // 6 — Atualizar senha e limpar código
    async atualizarSenha(email, novaSenha) {
        const hashed = await bcrypt.hash(novaSenha, 10);

        return await db("User")
            .where({ email })
            .update({
                password_hashed: hashed,
                codigo_recuperacao: null,
                codigo_expira: null
            });
    }
}

module.exports = new RecuperarSenha();
