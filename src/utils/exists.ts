export const exists = <T extends NonNullable<unknown>>(
	value?: T | null
): value is T => {
	if (value === null) return false;
	if (typeof value === 'undefined') return false;

	return true;
};
