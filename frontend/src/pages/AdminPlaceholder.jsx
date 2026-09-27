// Representa temporariamente páginas administrativas ainda em evolução.
import { Sidebar } from "../components/layout/Sidebar";

export function AdminPlaceholder({ title, description }) {
	return (
		<div className="dash-container">
			<Sidebar />
			<main className="dash-main">
				<header className="dash-header">
					<div>
						<h1>{title}</h1>
						<p>{description}</p>
					</div>
				</header>
				<section className="dash-card">
					<div className="dash-empty-state">
						<p>Esta área está sendo preparada.</p>
					</div>
				</section>
			</main>
		</div>
	);
}
