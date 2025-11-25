import { fetchSheet, postSheet } from "$lib/api";
import { navigate } from "$lib/router";
import { type UserRow as User } from "$lib/types/sheets";
import { getContext, setContext } from "svelte";

class AuthState {
	loggedin = $state(false);
	loading = $state(true);
	user = $state<User>();

	async login({ username, password }: { username: string; password: string }) {
		const { data: users } = await fetchSheet({ sheet: "USER" });
		this.user = (users as User[]).find(
			(u) => u.username === username && u.password === password,
		);
		if (this.user) {
			await postSheet({
				action: "update",
				rows: [
					{
						...this.user,
						lastLogin: new Date().toISOString(),
					},
				],
			});
			localStorage.setItem("auth", this.user.username);
			this.loggedin = true;
			return true;
		}
		return false;
	}

	logout() {
		localStorage.removeItem("auth");
		this.loggedin = false;
		this.user = undefined;
		navigate("/auth/login");
	}

	constructor() {
		const loggedUser = localStorage.getItem("auth");
		if (loggedUser) {
			fetchSheet({ sheet: "USER" })
				.then(({ data: res }) => {
					this.user = (res as User[]).find((u) => u.username === loggedUser);
					if (this.user) {
						this.loggedin = true;
					}
				})
				.finally(() => {
					this.loading = false;
				});
		} else {
			this.loading = false;
		}
	}
}

const AUTH_KEY = "auth-state";

export const setAuth = () => setContext(Symbol.for(AUTH_KEY), new AuthState());

export function useAuth(): AuthState {
	return getContext(Symbol.for(AUTH_KEY));
}
