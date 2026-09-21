// Exibe a marca TechStore em diferentes tamanhos.
export default function Logo({ size = 26 }) {
  return (
    <img
      src="/logo.svg"
      alt="TechStore"
      height={size}
      style={{
        height: size,
        width: 'auto',
        display: 'block',
        filter:
          'invert(39%) sepia(88%) saturate(2288%) hue-rotate(211deg) brightness(99%) contrast(93%)',
      }}
    />
  );
}
