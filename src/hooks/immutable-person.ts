import { exists } from '../utils/exists';
import useSWRImmutable from 'swr/immutable';
import type {
	Fetcher,
	SWRConfiguration
} from 'swr';
import {
	type Person,
	retrieve
} from '../lib/person-api-client';

export type ImmutablePersonKey = ['persons', Person['id']] | null;

export type ImmutablePersonFetcher = Fetcher<Person, ImmutablePersonKey>;

export class ImmutablePersonError extends Error {
	readonly personId: Person['id'];

	constructor (
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

export const useImmutablePerson = (
	id?: Person['id'] | null,
	config?: ImmutablePersonConfiguration
) => useSWRImmutable(createKey(id), fetcher, config);
