// Consolida indicadores operacionais para a área administrativa.
import { useMemo, useState } from "react";
import { KpiCards } from "../components/dashboard/KpiCards";
import { OrdersTable } from "../components/dashboard/OrdersTable";
import { StockAlerts } from "../components/dashboard/StockAlerts";
import { Sidebar } from "../components/layout/Sidebar";
import "../styles/theme.css";

export function Dashboard({
	kpis = [],
	orders = [],
	stockAlerts = [],
	onFilterChange,
	onDownloadReport,
}) {
	const [period, setPeriod] = useState("30");
	const metrics = useMemo(() => kpis, [kpis]);

	function handlePeriodChange(event) {
		const value = event.target.value;
		setPeriod(value);
		onFilterChange?.(value);
	}

	return (
		<div className="dash-container">
			<Sidebar />
			<main className="dash-main">
				<header className="dash-header">
					<div>
						<h1>Dashboard</h1>
						<p>Visão geral e métricas do sistema.</p>
					</div>
					<div className="dash-header-actions">
						<select
							className="dash-select"
							onChange={handlePeriodChange}
							value={period}
						>
							<option value="30">Últimos 30 dias</option>
							<option value="7">Últimos 7 dias</option>
							<option value="today">Hoje</option>
						</select>
						<button
							className="dash-btn-primary"
							onClick={onDownloadReport}
							type="button"
						>
							Baixar Relatório
						</button>
					</div>
				</header>
				<section className="dash-kpi-grid">
					<KpiCards kpis={metrics} />
				</section>
				<section className="dash-content-grid">
					<OrdersTable orders={orders} />
					<StockAlerts stockAlerts={stockAlerts} />
				</section>
			</main>
		</div>
	);
}

export default Dashboard;
