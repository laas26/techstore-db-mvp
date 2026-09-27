// Declara as rotas públicas, privadas e administrativas da aplicação.
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import Client from "../pages/Client";
import Dashboard from "../pages/Dashboard";
import ForgotPassword from "../pages/ForgotPassword";
import Home from "../pages/Home";
import Login from "../pages/Login";
import NotFound from "../pages/NotFound";
import Orders from "../pages/Orders";
import Pix from "../pages/Pix";
import Products from "../pages/Products";
import Profile from "../pages/Profile";
import Register from "../pages/Register";
import ResetPassword from "../pages/ResetPassword";
import Users from "../pages/Users";
import { AdminRoute } from "./AdminRoute";
import { ClientRoute } from "./ClientRoute";

// Protege rotas privadas e registra os caminhos disponiveis no frontend.
function RequireAuth({ children }) {
	const { usuarioLogado } = useAuth();
	const location = useLocation();

	return usuarioLogado ? (
		children
	) : (
		<Navigate to="/login" replace state={{ from: location.pathname }} />
	);
}

export function AppRoutes() {
	return (
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/login" element={<Login />} />
			<Route path="/forgot-password" element={<ForgotPassword />} />
			<Route path="/reset-password" element={<ResetPassword />} />
			<Route path="/register" element={<Register />} />
			<Route
				path="/cart"
				element={
					<RequireAuth>
						<Cart />
					</RequireAuth>
				}
			/>
			<Route
				path="/checkout"
				element={
					<RequireAuth>
						<Checkout />
					</RequireAuth>
				}
			/>
			<Route
				path="/profile"
				element={
					<RequireAuth>
						<Profile />
					</RequireAuth>
				}
			/>
			<Route element={<ClientRoute />}>
				<Route path="/client" element={<Client />} />
			</Route>
			<Route element={<AdminRoute />}>
				<Route path="/dashboard" element={<Dashboard />} />
				<Route path="/products" element={<Products />} />
				<Route path="/orders" element={<Orders />} />
				<Route path="/users" element={<Users />} />
				<Route path="/pix" element={<Pix />} />
			</Route>
			<Route path="*" element={<NotFound />} />
		</Routes>
	);
}
