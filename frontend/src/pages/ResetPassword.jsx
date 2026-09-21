// Página pública para definir uma nova senha usando token temporário.
import ResetPasswordForm from "../components/auth/ResetPasswordForm";
import PageLayout from "../components/layout/PageLayout";

export default function ResetPassword() {
	return (
		<PageLayout>
			<ResetPasswordForm />
		</PageLayout>
	);
}
