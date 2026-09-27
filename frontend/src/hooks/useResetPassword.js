// Controla o token recebido na URL e o envio da nova senha.
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiFetch } from "../services/api";

export function useResetPassword() {
	const [searchParams] = useSearchParams();
	const [codigo, setCodigo] = useState("");
	const [senha, setSenha] = useState("");
	const [confirmarSenha, setConfirmarSenha] = useState("");
	const [erro, setErro] = useState(null);
	const [mensagem, setMensagem] = useState(null);
	const [mostrarSenha, setMostrarSenha] = useState(false);

	useEffect(() => {
		setCodigo(searchParams.get("token") || "");
	}, [searchParams]);

	async function handleSubmit(event) {
		event.preventDefault();
		setErro(null);
		setMensagem(null);

		if (senha !== confirmarSenha) {
			setErro("As senhas não coincidem.");
			return;
		}

		try {
			await apiFetch("/auth/reset-password", {
				method: "POST",
				body: JSON.stringify({ token: codigo, novaSenha: senha }),
			});
			setMensagem("Senha alterada com sucesso.");
		} catch (error) {
			setErro(error.erro || "Não foi possível redefinir a senha.");
		}
	}

	return {
		codigo,
		senha,
		confirmarSenha,
		erro,
		mensagem,
		mostrarSenha,
		setCodigo,
		setSenha,
		setConfirmarSenha,
		handleSubmit,
		toggleMostrarSenha: () => setMostrarSenha((visivel) => !visivel),
	};
}
