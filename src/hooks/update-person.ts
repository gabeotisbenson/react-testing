import { exists } from '../utils/exists';
import {
	type Person,
	type PersonUpdateRequest,
	update
} from '../lib/person-api-client';
import useSWRMutation, {
	type SWRMutationConfiguration,
	type MutationFetcher
} from 'swr/mutation';

export type UpdatePersonKey = ['persons', Person['id'], 'update'] | null;

export type UpdatePersonData = Person;

export type UpdatePersonExtraArg = Omit<PersonUpdateRequest, 'id'>;

type UpdatePersonFetcher = MutationFetcher<
	UpdatePersonData,
	UpdatePersonKey,
	UpdatePersonExtraArg
>;

export class UpdatePersonError extends Error {
	readonly request: PersonUpdateRequest;

	constructor(request: PersonUpdateRequest, options: ErrorOptions) {
		const requestStr = JSON.stringify(request, null, 2);
		super(`Failed to update person with request: ${requestStr}`, options);

		this.request = request;
	}
}

export type UpdatePersonConfiguration = SWRMutationConfiguration<
	UpdatePersonData,
	UpdatePersonError,
	UpdatePersonKey,
	UpdatePersonExtraArg,
	UpdatePersonData
>;

const createKey = (id?: Person['id'] | null): UpdatePersonKey => {
	if (exists(id)) return ['persons', id, 'update'];

	return null;
};

const fetcher: UpdatePersonFetcher = async ([, id], { arg: updates }) => {
	const request: PersonUpdateRequest = { id, ...updates };

	try {
		const person = await update(request);

		return person;
	} catch (cause: unknown) {
		throw new UpdatePersonError(request, { cause });
	}
};

export const useUpdatePerson = (
	id?: Person['id'] | null,
	config?: UpdatePersonConfiguration
) => useSWRMutation(createKey(id), fetcher, config);
