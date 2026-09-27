// Gerencia os campos e a submissão do cadastro de novos usuários.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";

export function useRegister() {
	const [formData, setFormData] = useState({
		nome: "",
		email: "",
		senha: "",
		confirmarSenha: "",
	});
	const [erro, setErro] = useState(null);
	const [sucesso, setSucesso] = useState(false);
	const [carregando, setCarregando] = useState(false);
	const [mostrarSenha, setMostrarSenha] = useState(false);
	const navigate = useNavigate();

	function handleChange(event) {
		const { name, value } = event.target;
		setFormData((dadosAtuais) => ({ ...dadosAtuais, [name]: value }));
	}

	async function handleSubmit(event) {
		event.preventDefault();
		setErro(null);
		setSucesso(false);

		if (formData.senha !== formData.confirmarSenha) {
			setErro("As senhas não coincidem.");
			return;
		}

		setCarregando(true);

		try {
			await register(formData.nome, formData.email, formData.senha);
			setSucesso(true);
			setTimeout(() => navigate("/login"), 400);
		} catch (error) {
			setErro(
				error.erro || error.message || "Não foi possível realizar o cadastro.",
			);
		} finally {
			setCarregando(false);
		}
	}

	return {
		formData,
		erro,
		sucesso,
		carregando,
		mostrarSenha,
		handleChange,
		handleSubmit,
		onToggleMostrarSenha: () => setMostrarSenha((visivel) => !visivel),
	};
}
