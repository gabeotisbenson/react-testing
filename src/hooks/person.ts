import { exists } from '../utils/exists';
import {
	type Person,
	type PersonRetrieveRequest,
	retrieve
} from '../lib/person-api-client';
import useSWR, { type Fetcher, type SWRConfiguration } from 'swr';

export type PersonKey = ['persons', PersonRetrieveRequest] | null;

export type PersonFetcher = Fetcher<Person, PersonKey>;

export class PersonError extends Error {
	readonly request: PersonRetrieveRequest;

	constructor(
		request: PersonRetrieveRequest,
		options: ErrorOptions & Required<Pick<ErrorOptions, 'cause'>>
	) {
		const requestStr = JSON.stringify(request, null, 2);

		super(`Failed to fetch person with request: ${requestStr}`, options);

		this.request = request;
	}
}

export type PersonConfiguration = SWRConfiguration<
	Person,
	PersonError,
	PersonFetcher
>;

export const createKey = (id?: Person['id'] | null): PersonKey => {
	if (exists(id)) return ['persons', { id }];

	return null;
};

const fetcher: PersonFetcher = async ([, request]) => {
	try {
		const person = await retrieve(request);

		if (!person) throw new Error('Person could not be found');

		return person;
	} catch (cause: unknown) {
		throw new PersonError(request, { cause });
	}
};

/**
 * Fetches a single person by ID with automatic revalidation.
 *
 * Use this hook when you need to fetch a person whose ID may change or be conditionally loaded.
 * The hook will automatically refetch whenever the ID changes. If the ID is null or undefined,
 * the fetch is suspended.
 *
 * @param id - The person ID to fetch. Pass null or undefined to suspend the fetch.
 * @param config - Optional SWR configuration for customizing behavior (revalidation, caching, etc.)
 * @returns SWR hook result with data, error, and mutation utilities
 *
 * @example
 * // Fetch a specific person, refetch when ID changes
 * const { data: person, error, isLoading } = usePerson(userId);
 *
 * @example
 * // Conditionally fetch only when ID is available
 * const { data: person } = usePerson(selectedId || null);
 */
export const usePerson = (
	id?: Person['id'] | null,
	config?: PersonConfiguration
) => useSWR(createKey(id), fetcher, config);
