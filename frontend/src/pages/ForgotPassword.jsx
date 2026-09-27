// Página pública que inicia o fluxo de recuperação de senha.
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm";
import PageLayout from "../components/layout/PageLayout";

export default function ForgotPassword() {
	return (
		<PageLayout>
			<ForgotPasswordForm />
		</PageLayout>
	);
}
