import React from "react";
import Login from "./Login.tsx";

export default function LoginPage({ setUser }) {
	return (
		<>
			<Login setUser={setUser} />
		</>
	);
}
