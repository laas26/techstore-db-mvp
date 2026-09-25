// Alterna os destaques informativos apresentados na página inicial.
import { useEffect, useState } from "react";

const slides = [
	{
		titulo: "Satisfação Garantida",
		descricao:
			"Sua tranquilidade é nossa prioridade. Experimente a excelência TechStore com devolução simplificada em até 7 dias.",
	},
	{
		titulo: "Proteção de Elite TechCare",
		descricao:
			"Segurança absoluta para seus investimentos. Garantia premium de 2 anos.",
	},
	{
		titulo: "Pagamento Seguro",
		descricao:
			"Seus dados protegidos com criptografia de ponta a ponta e certificação SSL.",
	},
	{
		titulo: "Frete Express",
		descricao:
			"Envio rápido e com rastreamento detalhado para você acompanhar cada passo até a sua casa.",
	},
];

export default function HeroSlider() {
	const [slideAtual, setSlideAtual] = useState(0);

	useEffect(() => {
		const intervalId = setInterval(() => {
			setSlideAtual((slide) => (slide + 1) % slides.length);
		}, 5000);

		return () => clearInterval(intervalId);
	}, []);

	function irParaSlideAnterior() {
		setSlideAtual((slide) => (slide === 0 ? slides.length - 1 : slide - 1));
	}

	function irParaProximoSlide() {
		setSlideAtual((slide) => (slide + 1) % slides.length);
	}

	return (
		<section
			className="hero-slider"
			style={{
				minHeight: "340px",
				marginBottom: "48px",
				border: "1px solid #E5E7EB",
				borderRadius: "16px",
				background: "linear-gradient(90deg, #FFFFFF 0%, #EFF6FF 100%)",
				boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
				position: "relative",
				overflow: "hidden",
				display: "flex",
				alignItems: "center",
				padding: "48px 64px",
			}}
		>
			<div className="hero-slider-content" style={{ maxWidth: "680px" }}>
				<h1
					className="hero-slider-title"
					style={{
						margin: "0 0 16px",
						color: "#2563EB",
						fontSize: "clamp(32px, 5vw, 48px)",
						lineHeight: 1.1,
						fontWeight: 700,
					}}
				>
					{slides[slideAtual].titulo}
				</h1>
				<p
					className="hero-slider-description"
					style={{
						color: "#4B5563",
						fontSize: "20px",
						lineHeight: 1.55,
						maxWidth: "640px",
					}}
				>
					{slides[slideAtual].descricao}
				</p>
			</div>

			<button
				className="hero-slider-control hero-slider-control-prev"
				type="button"
				aria-label="Slide anterior"
				onClick={irParaSlideAnterior}
				style={{
					position: "absolute",
					left: "16px",
					top: "50%",
					transform: "translateY(-50%)",
					width: "42px",
					height: "42px",
					borderRadius: "50%",
					border: "1px solid #D1D5DB",
					background: "rgba(255, 255, 255, 0.8)",
					color: "#1F2937",
					cursor: "pointer",
					fontSize: "24px",
					lineHeight: 1,
				}}
			>
				‹
			</button>
			<button
				className="hero-slider-control hero-slider-control-next"
				type="button"
				aria-label="Próximo slide"
				onClick={irParaProximoSlide}
				style={{
					position: "absolute",
					right: "16px",
					top: "50%",
					transform: "translateY(-50%)",
					width: "42px",
					height: "42px",
					borderRadius: "50%",
					border: "1px solid #D1D5DB",
					background: "rgba(255, 255, 255, 0.8)",
					color: "#1F2937",
					cursor: "pointer",
					fontSize: "24px",
					lineHeight: 1,
				}}
			>
				›
			</button>
		</section>
	);
}
