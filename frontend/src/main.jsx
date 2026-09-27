// Ponto de entrada que monta a aplicação React no elemento raiz do documento.
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/theme.css";

// Inicializa o React no elemento raiz. O AuthProvider ja e gerenciado dentro do App.jsx.
ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
