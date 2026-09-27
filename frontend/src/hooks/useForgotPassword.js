// Coordena estado, submissão e mensagens do fluxo de recuperação de senha.
import { useState } from "react";
import { apiFetch } from "../services/api";

export function useForgotPassword() {
	const [email, setEmail] = useState("");
	const [mensagem, setMensagem] = useState(null);

	async function handleSubmit(event) {
		event.preventDefault();

		try {
			await apiFetch("/auth/forgot-password", {
				method: "POST",
				body: JSON.stringify({ email }),
			});
			setMensagem(
				"Se o e-mail informado estiver cadastrado em nosso sistema, você receberá as instruções de recuperação em instantes.",
			);
		} catch {
			setMensagem(
				"Não foi possível solicitar a recuperação agora. Tente novamente.",
			);
		}
	}

	return { email, mensagem, setEmail, handleSubmit };
}
