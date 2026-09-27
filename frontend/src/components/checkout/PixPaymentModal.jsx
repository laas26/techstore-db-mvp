// Modal de PIX simulado que cria o pedido e exibe o comprovante resultante.
import { useState } from "react";
import {
	simularPagamento as confirmarPagamento,
	criarPedido,
} from "../../services/orderService";

// Chave usada pelo checkout para o pagamento via PIX.
const chavePix =
	"00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR5913TechStore Inc6008Sao Paulo62070503***63041A2B";

function formatarPreco(valor) {
	return valor.toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
	});
}

function createIdempotencyKey() {
	if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
	return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function PixPaymentModal({
	total,
	onClose,
	entrega,
	onPagamentoConfirmado,
}) {
	const [processando, setProcessando] = useState(false);
	const [pedido, setPedido] = useState(null);
	const [erro, setErro] = useState("");
	const [idempotencyKey] = useState(createIdempotencyKey);

	async function simularPagamento() {
		setProcessando(true);
		setErro("");
		try {
			const pedidoCriado = await criarPedido({ entrega }, idempotencyKey);
			const pedidoPago = await confirmarPagamento(pedidoCriado.id);
			setPedido(pedidoPago);
			await onPagamentoConfirmado(pedidoPago);
		} catch (error) {
			setErro(
				error.erro || error.message || "Não foi possível finalizar o pedido.",
			);
		} finally {
			setProcessando(false);
		}
	}

	if (pedido) {
		return (
			<div style={styles.modalOverlay}>
				<dialog className="pix-modal" style={styles.modal} open>
					<div style={styles.modalHeader}>
						<div style={styles.modalIcon}>✓</div>
						<h2 style={styles.modalTitle}>Pagamento simulado aprovado</h2>
						<p style={styles.modalText}>
							Pedido {pedido.id} criado com sucesso.
						</p>
					</div>
					<div style={styles.receipt}>
						<strong>Comprovante PIX</strong>
						<span>Status: {pedido.status}</span>
						<span>Total: {formatarPreco(pedido.total)}</span>
					</div>
					<button style={styles.confirmButton} type="button" onClick={onClose}>
						Fechar
					</button>
				</dialog>
			</div>
		);
	}
	// Exibe o QR Code, o total e a chave copiavel do pagamento.
	return (
		<div style={styles.modalOverlay}>
			<dialog className="pix-modal" style={styles.modal} open>
				<button
					style={styles.closeButton}
					type="button"
					aria-label="Fechar modal"
					onClick={onClose}
				>
					×
				</button>

				<div style={styles.modalHeader}>
					<div style={styles.modalIcon}>▦</div>
					<h2 style={styles.modalTitle}>Aguardando Pagamento</h2>
					<p style={styles.modalText}>
						Escaneie o código QR abaixo ou copie a chave para concluir sua
						transação via PIX.
					</p>
				</div>

				<div style={styles.qrBox}>
					<div style={styles.qrCode}>
						<div style={styles.qrPattern} />
					</div>
				</div>

				<label style={styles.field}>
					<span style={styles.label}>Valor Total</span>
					<output style={styles.totalOutput}>{formatarPreco(total)}</output>
				</label>

				<label style={styles.field}>
					<span style={styles.label}>Chave PIX Copia e Cola</span>
					<div className="pix-copy" style={styles.pixCopy}>
						<input
							style={styles.pixInput}
							type="text"
							value={chavePix}
							readOnly
						/>
						<button
							style={styles.copyButton}
							type="button"
							onClick={() => navigator.clipboard?.writeText(chavePix)}
						>
							Copiar
						</button>
					</div>
				</label>

				<div style={styles.waiting}>
					<strong>Aguardando pagamento...</strong>
					<span>
						Esta janela fechará automaticamente assim que o pagamento for
						confirmado.
					</span>
					{erro && <span style={styles.error}>{erro}</span>}
					<button
						type="button"
						style={styles.confirmButton}
						onClick={simularPagamento}
						disabled={processando}
					>
						{processando ? "Processando..." : "Simular Pagamento"}
					</button>
				</div>
			</dialog>
		</div>
	);
}

const styles = {
	modalOverlay: {
		position: "fixed",
		inset: 0,
		zIndex: 50,
		display: "grid",
		placeItems: "center",
		padding: "20px",
		background: "rgba(15, 23, 42, 0.55)",
		backdropFilter: "blur(8px)",
	},
	modal: {
		position: "relative",
		width: "min(100%, 440px)",
		maxHeight: "calc(100vh - 40px)",
		overflowY: "auto",
		background: "#ffffff",
		borderRadius: "12px",
		border: "1px solid #e2e8f0",
		padding: "28px",
		boxShadow: "0 24px 70px rgba(15, 23, 42, 0.24)",
	},
	closeButton: {
		position: "absolute",
		top: "12px",
		right: "14px",
		border: 0,
		background: "transparent",
		color: "#64748b",
		fontSize: "28px",
		cursor: "pointer",
	},
	modalHeader: { textAlign: "center", marginBottom: "20px" },
	modalIcon: {
		width: "56px",
		height: "56px",
		display: "grid",
		placeItems: "center",
		margin: "0 auto 14px",
		borderRadius: "999px",
		background: "#eff6ff",
		color: "#2563eb",
		fontSize: "30px",
	},
	modalTitle: { margin: 0, fontSize: "24px" },
	modalText: { marginTop: "8px", color: "#64748b", lineHeight: 1.5 },
	qrBox: {
		display: "grid",
		placeItems: "center",
		marginBottom: "20px",
		padding: "20px",
		border: "1px solid #e2e8f0",
		borderRadius: "8px",
		background: "#f8fafc",
	},
	qrCode: {
		width: "190px",
		height: "190px",
		display: "grid",
		placeItems: "center",
		border: "1px solid #e2e8f0",
		borderRadius: "6px",
		background: "#ffffff",
	},
	qrPattern: {
		width: "150px",
		height: "150px",
		background:
			"repeating-linear-gradient(90deg, #0f172a 0 8px, #fff 8px 16px), repeating-linear-gradient(0deg, rgba(15, 23, 42, 0.75) 0 8px, transparent 8px 16px)",
		backgroundBlendMode: "multiply",
	},
	field: { display: "grid", gap: "8px" },
	label: { color: "#334155", fontSize: "14px", fontWeight: 600 },
	totalOutput: {
		display: "block",
		padding: "10px",
		border: "1px solid #e2e8f0",
		borderRadius: "6px",
		background: "#f8fafc",
		textAlign: "center",
		fontSize: "22px",
		fontWeight: 800,
	},
	pixCopy: { display: "flex" },
	pixInput: {
		minWidth: 0,
		flex: 1,
		border: "1px solid #cbd5e1",
		borderRight: 0,
		borderRadius: "6px 0 0 6px",
		padding: "10px 12px",
		color: "#334155",
		background: "#f8fafc",
		fontFamily: "monospace",
	},
	copyButton: {
		border: "1px solid #cbd5e1",
		borderRadius: "0 6px 6px 0",
		padding: "0 14px",
		background: "#ffffff",
		color: "#2563eb",
		fontWeight: 700,
		cursor: "pointer",
	},
	waiting: {
		display: "grid",
		gap: "6px",
		marginTop: "22px",
		paddingTop: "18px",
		borderTop: "1px solid #e2e8f0",
		color: "#2563eb",
		textAlign: "center",
		fontSize: "14px",
	},
	error: { color: "#dc2626", fontWeight: 600 },
	receipt: {
		display: "grid",
		gap: "8px",
		marginBottom: "20px",
		padding: "16px",
		border: "1px solid #bbf7d0",
		borderRadius: "8px",
		background: "#f0fdf4",
		color: "#166534",
	},
	confirmButton: {
		border: 0,
		borderRadius: "6px",
		padding: "10px 14px",
		background: "#2563eb",
		color: "#ffffff",
		fontWeight: 700,
		cursor: "pointer",
	},
};
