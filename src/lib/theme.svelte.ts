import { browser } from '$app/environment';

class ThemeState {
	current = $state<'dark' | 'light'>('dark');

	constructor() {
		if (browser) {
			const saved = localStorage.getItem('theme') as 'dark' | 'light' | null;
			if (saved === 'light' || saved === 'dark') {
				this.current = saved;
			} else {
				this.current = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
			}
			this.apply();
		}
	}

	get isDark() {
		return this.current === 'dark';
	}

	get isLight() {
		return this.current === 'light';
	}

	toggle() {
		this.current = this.current === 'dark' ? 'light' : 'dark';
		if (browser) {
			localStorage.setItem('theme', this.current);
			this.apply();
		}
	}

	set(theme: 'dark' | 'light') {
		this.current = theme;
		if (browser) {
			localStorage.setItem('theme', this.current);
			this.apply();
		}
	}

	private apply() {
		if (!browser) return;
		if (this.current === 'dark') {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}
}

export const theme = new ThemeState();
