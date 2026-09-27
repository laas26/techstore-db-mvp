// Expõe a API do contexto do carrinho para os componentes consumidores.
import { useCartContext } from "../context/CartContext";

export function useCart() {
	return useCartContext();
}
