/**
 * SortMail Mock Data
 * ==================
 * Shapes match backend contracts exactly (contracts/mocks.py).
 * When the backend is ready, replace these with fetch() calls.
 */

// Re-export from modular files
export * from './user';
export * from './threads';
export * from './tasks';
export * from './help';
export * from './settings';

// Helper: Extract sender display info 
export function getSenderInfo(email: string): { name: string; initials: string } {
    const name = email.split('@')[0]
        .split('.')
        .map(s => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ');
    const parts = name.split(' ');
    const initials = parts.length >= 2
        ? parts[0][0] + parts[1][0]
        : parts[0].slice(0, 2).toUpperCase();
    return { name, initials };
}
