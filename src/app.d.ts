declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: {
				id: number;
				payrollId: string;
				name: string;
				division: string;
				divisionCode: string;
				title: string;
				levelSequence: number;
			} | null;
		}
		interface PageData {
			user?: {
				id: number;
				payrollId: string;
				name: string;
				division: string;
				divisionCode: string;
				title: string;
				levelSequence: number;
			} | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
