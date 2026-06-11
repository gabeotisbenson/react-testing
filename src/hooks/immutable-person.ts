import { exists } from '../utils/exists';
import useSWRImmutable from 'swr/immutable';
import type { Fetcher, SWRConfiguration } from 'swr';
import { type Person, retrieve } from '../lib/person-api-client';

export type ImmutablePersonKey = ['persons', Person['id']] | null;

export type ImmutablePersonFetcher = Fetcher<Person, ImmutablePersonKey>;

export class ImmutablePersonError extends Error {
	readonly personId: Person['id'];

	constructor(
		personId: Person['id'],
		options: ErrorOptions & Required<Pick<ErrorOptions, 'cause'>>
	) {
		super(`Failed to fetch person with id "${personId}"`, options);

		this.personId = personId;
	}
}

export type ImmutablePersonConfiguration = SWRConfiguration<
	Person,
	ImmutablePersonError,
	ImmutablePersonFetcher
>;

export const createKey = (id?: Person['id'] | null): ImmutablePersonKey => {
	if (exists(id)) return ['persons', id];

	return null;
};

const fetcher: ImmutablePersonFetcher = async ([, id]) => {
	try {
		const person = await retrieve({ id });

		if (!person) throw new Error('Person could not be found');

		return person;
	} catch (cause: unknown) {
		throw new ImmutablePersonError(id, { cause });
	}
};

/**
 * Fetches a single person by ID without automatic revalidation.
 *
 * Use this hook when the person ID is stable and won't change, or when you're fetching
 * immutable data that doesn't need to be revalidated. This is more efficient than `usePerson`
 * as it disables background revalidation. If the ID is null or undefined, the fetch is suspended.
 *
 * @param id - The person ID to fetch. Pass null or undefined to suspend the fetch.
 * @param config - Optional SWR configuration for customizing behavior
 * @returns SWR hook result with data and error (no automatic refetching)
 *
 * @example
 * // Fetch a person that won't change during the component's lifetime
 * const { data: person } = useImmutablePerson(constantPersonId);
 *
 * @example
 * // Prevent unnecessary revalidation in performance-critical scenarios
 * const { data: person } = useImmutablePerson(userId, { revalidateOnFocus: false });
 */
export const useImmutablePerson = (
	id?: Person['id'] | null,
	config?: ImmutablePersonConfiguration
) => useSWRImmutable(createKey(id), fetcher, config);
