// Services store
import { servicesApi, type ListServicesParams } from '$lib/api/services';
import type { Service, CreateServiceRequest, UpdateServiceRequest } from '$lib/types/service';

interface ServiceState {
  items: Service[];
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  search: string;
}

const createServiceStore = () => {
  let state = $state<ServiceState>({
    items: [],
    loading: false,
    error: null,
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0,
    search: ''
  });

  // Request ID for race condition handling ("latest wins")
  let currentRequestId = 0;

  const load = async (params: ListServicesParams = {}) => {
    state.loading = true;
    state.error = null;
    
    const requestId = ++currentRequestId;

    try {
      const result = await servicesApi.list({
        page: params.page ?? state.page,
        pageSize: params.pageSize ?? state.pageSize,
        search: params.search ?? state.search
      });

      // Ignore stale responses
      if (requestId !== currentRequestId) return;

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
      if (requestId !== currentRequestId) return;
      state.error = e instanceof Error ? e.message : 'An unexpected error occurred';
    } finally {
      if (requestId === currentRequestId) {
        state.loading = false;
      }
    }
  };

  const setPage = (page: number) => {
    state.page = page;
    return load({ page });
  };

  const setPageSize = (pageSize: number) => {
    state.pageSize = pageSize;
    state.page = 1;
    return load({ pageSize, page: 1 });
  };

  const setSearch = (search: string) => {
    state.search = search;
    state.page = 1;
    return load({ search, page: 1 });
  };

  const create = async (data: CreateServiceRequest) => {
    const result = await servicesApi.create(data);
    if (result.ok) {
      await load();
    }
    return result;
  };

  const update = async (id: number, data: UpdateServiceRequest) => {
    const result = await servicesApi.update(id, data);
    if (result.ok) {
      state.items = state.items.map((s) => (s.id === id ? result.value : s));
    }
    return result;
  };

  const remove = async (id: number) => {
    const result = await servicesApi.delete(id);
    if (result.ok) {
      state.items = state.items.filter((s) => s.id !== id);
      state.totalCount = Math.max(0, state.totalCount - 1);
      state.totalPages = Math.max(1, Math.ceil(state.totalCount / state.pageSize));
      
      // If current page is now beyond total pages, navigate to last page
      if (state.page > state.totalPages) {
        state.page = Math.max(1, state.totalPages);
        await load();
      } else if (state.items.length === 0 && state.page > 1) {
        // If current page is empty but not first page, go back one page
        state.page = state.page - 1;
        await load();
      }
    }
    return result;
  };

  const getById = async (id: number) => {
    return servicesApi.get(id);
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

export const serviceStore = createServiceStore();
