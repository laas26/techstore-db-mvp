// Destaca produtos cujo estoque exige atenção administrativa.
export function StockAlerts({ stockAlerts = [] }) {
	return (
		<div className="dash-card">
			<h3>Atenção ao Estoque</h3>
			<p className="dash-card-detail">Itens com baixo volume de estoque.</p>
			{stockAlerts.length === 0 ? (
				<div className="dash-empty-state">
					<p>Todos os itens estão com estoque normal.</p>
				</div>
			) : (
				<div className="dash-stock-list">
					{stockAlerts.map((item, index) => (
						<div
							className={`dash-stock-item ${item.urgent ? "urgent" : ""}`}
							key={item.id || item.sku || index}
						>
							<div>
								<strong>{item.name}</strong>
								{item.sku && <span className="dash-sku">SKU: {item.sku}</span>}
							</div>
							<div className="dash-text-right">
								<span className="dash-badge-grey">{item.quantity} un</span>
								<span className="dash-stock-status">
									{item.status || "Estoque Normal"}
								</span>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
