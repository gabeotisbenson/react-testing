import { exists } from '../utils/exists';
import {
	list,
	type Page,
	type Person,
	type PersonListRequest
} from '../lib/person-api-client';
import useSWRInfinite, {
	type SWRInfiniteConfiguration,
	type SWRInfiniteFetcher,
	type SWRInfiniteKeyLoader
} from 'swr/infinite';

type PersonListOptions = Omit<PersonListRequest, 'page'>;

type PersonListKey = ['persons', PersonListRequest] | null;

type PersonListData = Page<Person, 'persons'>;

type PersonListKeyLoader = SWRInfiniteKeyLoader<PersonListData, PersonListKey>;

type PersonListFetcher = SWRInfiniteFetcher<
	PersonListData,
	PersonListKeyLoader
>;

class PersonListError extends Error {
	readonly request: PersonListRequest;

	constructor(
		request: PersonListRequest,
		options: ErrorOptions & Required<Pick<ErrorOptions, 'cause'>>
	) {
		const requestStr = JSON.stringify(request, null, 2);

		super(`Failed to fetch Person list with request: ${requestStr}`, options);

		this.request = request;
	}
}

type PersonListConfiguration = SWRInfiniteConfiguration<
	PersonListData,
	PersonListError
>;

const createKeyLoader =
	(options?: PersonListOptions | null, parallel = false): PersonListKeyLoader =>
	(index, previous) => {
		if (!exists(options)) return null;
		if (!parallel && exists(previous) && !previous.pagination.hasNext)
			return null;

		const page = index + 1;

		const request: PersonListRequest = { ...options, page };

		return ['persons', request];
	};

const fetcher: PersonListFetcher = async ([, request]) => {
	try {
		const page = await list(request);

		return page;
	} catch (cause: unknown) {
		throw new PersonListError(request, { cause });
	}
};

/**
 * Fetches a paginated list of persons with support for infinite scroll or cursor-based loading.
 *
 * Use this hook when you need to fetch a paginated list of people, either for server-side
 * pagination with manual page loading or for infinite scroll. Pass null for options to suspend
 * all fetches. The hook provides multiple pages of data that you can combine via `.data`.
 *
 * @param options - Filter and pagination options (name, age, pageSize). Pass null to suspend fetching.
 * @param config - Optional SWR configuration. Set `parallel: true` to fetch all pages concurrently
 *                 instead of waiting for each to complete.
 * @returns SWR Infinite hook result with paginated data, error, and utilities for manual page loading
 *
 * @example
 * // Fetch persons with filters, one page at a time
 * const { data, setSize } = usePersonList({ name: 'Gabriel', pageSize: 10 });
 *
 * @example
 * // Implement infinite scroll by incrementing page count
 * const { data, size, setSize } = usePersonList({ pageSize: 20 });
 * return (
 *   <>
 *     {data?.map(page => page.persons.map(person => ...))}
 *     <button onClick={() => setSize(size + 1)}>Load More</button>
 *   </>
 * );
 */
export const usePersonList = (
	options?: PersonListOptions | null,
	config?: PersonListConfiguration
) => {
	const getKey = createKeyLoader(options, config?.parallel);

	return useSWRInfinite(getKey, fetcher, config);
};
