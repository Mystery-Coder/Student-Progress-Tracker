import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import App from "./routes/App";
import Login from "./routes/Login";
import Tabs from "./routes/Tabs";

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
	<BrowserRouter>
		<Routes>
			<Route path="/" element={<App />} />
			<Route path="/login" element={<Login />}></Route>
			<Route path="/tabs" element={<Tabs />}></Route>
		</Routes>
	</BrowserRouter>
);
