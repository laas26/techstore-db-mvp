// Renderiza indicadores resumidos usados no painel administrativo.
export function KpiCards({ kpis = [] }) {
	if (kpis.length === 0) {
		return (
			<div className="dash-card dash-span-full">
				<p className="dash-card-detail">
					Nenhum indicador disponível no momento.
				</p>
			</div>
		);
	}

	return kpis.map((kpi, index) => (
		<div className="dash-card" key={kpi.label || index}>
			<div className="dash-card-header">
				<span className="dash-card-label">{kpi.label}</span>
				{kpi.badge && <span className="dash-badge-blue">{kpi.badge}</span>}
				{kpi.change && <span className="dash-badge-green">{kpi.change}</span>}
			</div>
			<div className="dash-card-value">{kpi.value ?? "—"}</div>
			{kpi.detail && <span className="dash-card-detail">{kpi.detail}</span>}
		</div>
	));
}
