// Campo de formulário reutilizável com rótulo e identificação acessível.
import { useId } from "react";

// Campo de entrada reutilizavel para formularios da aplicacao.
export default function Input({
	id,
	label,
	type = "text",
	value,
	onChange,
	error,
	placeholder,
	required = false,
	icon,
	rightContent,
	inputStyle,
}) {
	const generatedId = useId();
	const inputId = id || generatedId;

	return (
		<div style={{ marginBottom: "var(--space-2)" }}>
			{label && (
				<label
					htmlFor={inputId}
					style={{
						display: "block",
						marginBottom: "4px",
						fontSize: "var(--font-size-caption)",
						color: "var(--color-text-muted)",
					}}
				>
					{label}
				</label>
			)}
			<div style={{ position: "relative" }}>
				{icon}
				<input
					id={inputId}
					type={type}
					name={id}
					className={`input-field${error ? " error" : ""}`}
					value={value}
					onChange={onChange}
					placeholder={placeholder}
					required={required}
					style={inputStyle}
				/>
				{rightContent}
			</div>
			{error && <p className="input-error-message">{error}</p>}
		</div>
	);
}
