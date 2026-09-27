// Botao reutilizavel com suporte a variantes visuais e estados de interacao.
export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  disabled = false,
  onClick,
  style,
}) {
  const className = variant === 'secondary' ? 'btn-secondary' : 'btn-primary';

  return (
    <button
      type={type}
      className={className}
      disabled={disabled}
      onClick={onClick}
      style={style}
    >
      {children}
    </button>
  );
}
