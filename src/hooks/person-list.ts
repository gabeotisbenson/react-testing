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

	constructor (
		request: PersonListRequest,
		options: ErrorOptions & Required<Pick<ErrorOptions, 'cause'>>
	) {
		const requestStr = JSON.stringify(request, null, 2);

		super(
			`Failed to fetch Person list with request: ${requestStr}`,
			options
		);

		this.request = request;
	}
}

type PersonListConfiguration = SWRInfiniteConfiguration<
	PersonListData,
	PersonListError
>;

const createKeyLoader = (
	options?: PersonListOptions | null,
	parallel = false
): PersonListKeyLoader => (index, previous) => {
	if (!exists(options)) return null;
	if (!parallel && exists(previous) && !previous.pagination.hasNext) return null;

	const page = index + 1;

	const request: PersonListRequest = {
		...options,
		page
	};

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

export const usePersonList = (
	options?: PersonListOptions | null,
	config?: PersonListConfiguration
) => {
	const getKey = createKeyLoader(options, config?.parallel);

	return useSWRInfinite(getKey, fetcher, config);
};
