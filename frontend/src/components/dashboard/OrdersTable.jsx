// Apresenta os pedidos recentes em formato adequado para leitura rápida.
export function OrdersTable({ orders = [] }) {
	return (
		<div className="dash-card dash-span-2">
			<h3>Últimos Pedidos</h3>
			{orders.length === 0 ? (
				<div className="dash-empty-state">
					<p>Nenhum pedido registrado até o momento.</p>
				</div>
			) : (
				<div className="dash-table-wrapper">
					<table className="dash-table">
						<thead>
							<tr>
								{["ID", "Cliente", "Produto", "Valor", "Status"].map(
									(heading) => (
										<th key={heading}>{heading}</th>
									),
								)}
							</tr>
						</thead>
						<tbody>
							{orders.map((order, index) => (
								<tr key={order.id || index}>
									<td className="dash-td-bold">{order.id || "—"}</td>
									<td>{order.customer || order.cliente || "—"}</td>
									<td>{order.product || order.produto || "—"}</td>
									<td className="dash-td-bold">
										{order.value || order.valor || "—"}
									</td>
									<td>
										<span
											className={`dash-status-pill ${order.statusClass || ""}`}
										>
											{order.status || "Pendente"}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
