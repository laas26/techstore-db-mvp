// Página pública que contém o formulário de criação de conta.
import RegisterForm from "../components/auth/RegisterForm";
import PageLayout from "../components/layout/PageLayout";

export default function Register() {
	return (
		<PageLayout>
			<RegisterForm />
		</PageLayout>
	);
}
