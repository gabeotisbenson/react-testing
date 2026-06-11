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

	constructor(
		request: PersonUpdateRequest,
		options: ErrorOptions & Required<Pick<ErrorOptions, 'cause'>>
	) {
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

/**
 * Mutates a person's data with manual trigger control.
 *
 * Use this hook when you need to update a person's information. Unlike query hooks,
 * this doesn't fetch automatically — you call the `trigger` function to execute the mutation.
 * If the ID is null or undefined, the mutation key is not created.
 *
 * @param id - The person ID to update. Pass null or undefined to disable mutations.
 * @param config - Optional SWR mutation configuration (onSuccess, onError callbacks, etc.)
 * @returns SWR mutation hook with `trigger()` function to execute the update and state
 *
 * @example
 * // Update a person's age and name
 * const { trigger, data: updated, error } = useUpdatePerson(personId);
 * const handleUpdate = async () => {
 *   const result = await trigger({ name: 'New Name', age: 30 });
 * };
 *
 * @example
 * // Optimistic UI update with rollback
 * const { trigger } = useUpdatePerson(personId, {
 *   optimisticData: (current) => ({ ...current, name: 'Temp Name' }),
 *   rollbackOnError: true,
 * });
 */
export const useUpdatePerson = (
	id?: Person['id'] | null,
	config?: UpdatePersonConfiguration
) => useSWRMutation(createKey(id), fetcher, config);
