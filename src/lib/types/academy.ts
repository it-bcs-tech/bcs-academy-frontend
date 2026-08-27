/**
 * BCS Academy — Data Types & Models
 * ══════════════════════════════════════════════════════════════════════
 */

export interface EmployeeUser {
	id: number;
	payrollId: string;
	name: string;
	division: string;
	divisionCode: string;
	title: string;
	levelSequence: number;
	phone?: string;
}

export type CourseLevel = 'Mandatory' | 'Beginner' | 'Intermediate' | 'Advanced';
export type ModuleType = 'VIDEO' | 'DOCUMENT' | 'INTERACTIVE' | 'QUIZ';

export interface CourseModule {
	id: string;
	sequence: number;
	title: string;
	type: ModuleType;
	durationText: string;
	contentUrl?: string;
	contentBody?: string;
	completed?: boolean;
	watchSeconds?: number;
}

export interface QuizQuestion {
	id: number;
	moduleId: string;
	questionText: string;
	options: { key: string; text: string }[];
	correctKey: string;
	explanation?: string;
}

export interface Course {
	id: string;
	title: string;
	category: string;
	level: CourseLevel;
	durationHours: number;
	modulesCount: number;
	enrolledCount: number;
	completionRate?: number;
	rating: number;
	instructor: string;
	description: string;
	tags: string[];
	thumbnailUrl?: string;
	modules: CourseModule[];
}

export interface Enrollment {
	courseId: string;
	course: Course;
	status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
	progressPercent: number;
	completedModulesCount: number;
	totalModulesCount: number;
	enrolledAt: string;
	completedAt?: string;
	deadline?: string;
	score?: number;
	hasCertificate?: boolean;
	certificateNumber?: string;
}

export interface Certificate {
	certificateNumber: string;
	payrollId: string;
	employeeName: string;
	courseId: string;
	courseTitle: string;
	category: string;
	score: number;
	issuedAt: string;
	validUntil?: string;
	qrVerifyUrl: string;
}
