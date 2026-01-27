// Customers store
import { customersApi, type ListCustomersParams } from '$lib/api/customers';
import type { Customer, CreateCustomerRequest, UpdateCustomerRequest } from '$lib/types/customer';

interface CustomerState {
  items: Customer[];
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  search: string;
}

const createCustomerStore = () => {
  let state = $state<CustomerState>({
    items: [],
    loading: false,
    error: null,
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0,
    search: ''
  });

  const load = async (params: ListCustomersParams = {}) => {
    state.loading = true;
    state.error = null;

    try {
      const result = await customersApi.list({
        page: params.page ?? state.page,
        pageSize: params.pageSize ?? state.pageSize,
        search: params.search ?? state.search
      });

      if (result.ok) {
        const data = result.value;
        state.items = data.data;
        state.page = data.page;
        state.pageSize = data.pageSize;
        state.totalCount = data.totalCount;
        state.totalPages = data.totalPages;
      } else {
        state.error = result.error.message;
      }
    } catch (e) {
      state.error = e instanceof Error ? e.message : 'An unexpected error occurred';
    } finally {
      state.loading = false;
    }
  };

  const setPage = (page: number) => {
    state.page = page;
    load({ page });
  };

  const setPageSize = (pageSize: number) => {
    state.pageSize = pageSize;
    state.page = 1;
    load({ pageSize, page: 1 });
  };

  const setSearch = (search: string) => {
    state.search = search;
    state.page = 1;
    load({ search, page: 1 });
  };

  const create = async (data: CreateCustomerRequest) => {
    try {
      const result = await customersApi.create(data);
      if (result.ok) {
        await load();
      }
      return result;
    } catch (e) {
      state.error = e instanceof Error ? e.message : 'An unexpected error occurred';
      return {
        ok: false as const,
        error: { code: 'UNKNOWN_ERROR', message: state.error }
      };
    }
  };

  const update = async (id: number, data: UpdateCustomerRequest) => {
    const result = await customersApi.update(id, data);
    if (result.ok) {
      state.items = state.items.map((c) => (c.id === id ? result.value : c));
    }
    return result;
  };

  const remove = async (id: number) => {
    const result = await customersApi.delete(id);
    if (result.ok) {
      state.items = state.items.filter((c) => c.id !== id);
      state.totalCount--;
      state.totalPages = Math.ceil(state.totalCount / state.pageSize);
      if (state.page > state.totalPages && state.totalPages > 0) {
        setPage(state.totalPages);
      }
    }
    return result;
  };

  const getById = async (id: number) => {
    return customersApi.get(id);
  };

  return {
    get items() {
      return state.items;
    },
    get loading() {
      return state.loading;
    },
    get error() {
      return state.error;
    },
    get page() {
      return state.page;
    },
    get pageSize() {
      return state.pageSize;
    },
    get totalCount() {
      return state.totalCount;
    },
    get totalPages() {
      return state.totalPages;
    },
    get search() {
      return state.search;
    },
    load,
    setPage,
    setPageSize,
    setSearch,
    create,
    update,
    remove,
    getById
  };
};

export const customerStore = createCustomerStore();
