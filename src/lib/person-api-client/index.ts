export type Pagination = {
	pageNumber: number;
	pageSize: number;
	pageCount: number;
	totalCount: number;
	hasNext: boolean;
	hasPrevious: boolean;
};

export type Page <T, K extends string> = Record<K, T[]> & {
	pagination: Pagination;
};

export type PageRequest = {
	page: number;
	pageSize: number;
};

export type Person = {
	id: string;
	name: string;
	age: number;
};

export type PersonCreateRequest = Omit<Person, 'id'>;

export type PersonCreateResponse = Person;

export type PersonRetrieveRequest = {
	id: Person['id'];
};

export type PersonRetrieveResponse = Person | null;

export type PersonUpdateRequest = Pick<Person, 'id'> & Partial<Omit<Person, 'id'>>;

export type PersonUpdateResponse = Person;

export type PersonListRequest = PageRequest & Partial<Omit<Person, 'id'>>;

export type PersonListResponse = Page<Person, 'persons'>

const store: Person[] = [
	{
		id: crypto.randomUUID(),
		name: 'Gabriel Benson',
		age: 36
	}
];

export const create = async (request: PersonCreateRequest): Promise<PersonCreateResponse> => {
	try {
		const id = crypto.randomUUID();

		store.push({ id, ...request });

		const created = store.find(person => person.id === id);

		if (!created) throw new Error('Person lost after creation');

		return created;
	} catch (cause: unknown) {
		const requestStr = JSON.stringify(request, null, 2);

		throw new Error(`Failed to create Person with request: ${requestStr}`, { cause });
	}
};

export const retrieve = async ({ id }: PersonRetrieveRequest): Promise<PersonRetrieveResponse> => {
	try {
		const match = store
			.find(person => person.id === id) ?? null;

		if (match) return structuredClone(match);

		return null;
	} catch (cause: unknown) {
		throw new Error(`Failed to retrieve Person with id "${id}"`, { cause });
	}
};

export const update = async ({ id, ...updates }: PersonUpdateRequest): Promise<PersonUpdateResponse> => {
	try {
		const matchIndex = store
			.findIndex(person => person.id === id);

		const match = store.at(matchIndex);

		if (!match) throw new Error(`Person with id "${id}" not found`);

		const updated = { ...match, ...updates };

		store.splice(matchIndex, 1, updated);

		const updatedMatch = store.find(person => person.id === id);

		if (!updatedMatch) throw new Error('Person lost after update');

		return updatedMatch;
	} catch (cause: unknown) {
		const updatesStr = JSON.stringify(updates, null, 2);

		throw new Error(`Failed to update Person with id "${id}" and updates: ${updatesStr}`, { cause });
	}
};

export const list = async (request: PersonListRequest): Promise<PersonListResponse> => {
	try {
		const allPages = store
			.filter(person => {
				if (request.name && !person.name.includes(request.name)) return false;
				if (typeof request.age === 'number' && person.age !== request.age) return false;

				return true;
			})
			.reduce<Person[][]>((pages, person) => {
				const page = pages.at(-1);

				if (!page || pages.length === request.pageSize) pages.push([person]);
				else page.push(person);

				return pages;
			}, [[]])

		const { [request.page]: persons } = allPages;

		const pagination = {
			pageNumber: request.page,
			pageSize: request.pageSize,
			pageCount: allPages.length,
			totalCount: store.length,
			hasNext: request.page < allPages.length,
			hasPrevious: request.page > 1
		};

		return { persons, pagination };
	} catch (cause: unknown) {
		const requestStr = JSON.stringify(request, null, 2);
		throw new Error(`Failed to list Persons with request: ${requestStr}`, { cause });
	}
};
