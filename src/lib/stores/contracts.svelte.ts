// Contracts store
import { contractsApi, type ListContractsParams } from '$lib/api/contracts';
import type {
  Contract,
  CreateContractRequest,
  UpdateContractRequest,
  ContractStatus,
  AddContractItemRequest
} from '$lib/types/contract';

interface ContractState {
  items: Contract[];
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  search: string;
  statusFilter: ContractStatus | null;
}

const createContractStore = () => {
  let state = $state<ContractState>({
    items: [],
    loading: false,
    error: null,
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0,
    search: '',
    statusFilter: null
  });

  const load = async (params: ListContractsParams = {}) => {
    state.loading = true;
    state.error = null;

    try {
      const result = await contractsApi.list({
        page: params.page ?? state.page,
        pageSize: params.pageSize ?? state.pageSize,
        search: params.search ?? state.search,
        status: params.status ?? state.statusFilter ?? undefined,
        ...params
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

  const setStatusFilter = (status: ContractStatus | null) => {
    state.statusFilter = status;
    state.page = 1;
    load({ status: status ?? undefined, page: 1 });
  };

  const create = async (data: CreateContractRequest) => {
    const result = await contractsApi.create(data);
    if (result.ok) {
      await load();
    }
    return result;
  };

  const update = async (id: number, data: UpdateContractRequest) => {
    const result = await contractsApi.update(id, data);
    if (result.ok) {
      state.items = state.items.map((c) => (c.id === id ? result.value : c));
    }
    return result;
  };

  const updateStatus = async (id: number, status: ContractStatus) => {
    const result = await contractsApi.updateStatus(id, status);
    if (result.ok) {
      state.items = state.items.map((c) => (c.id === id ? result.value : c));
    }
    return result;
  };

  const sign = async (id: number, signedBy: string) => {
    const result = await contractsApi.sign(id, signedBy);
    if (result.ok) {
      state.items = state.items.map((c) => (c.id === id ? result.value : c));
    }
    return result;
  };

  const remove = async (id: number) => {
    const result = await contractsApi.delete(id);
    if (result.ok) {
      state.items = state.items.filter((c) => c.id !== id);
      state.totalCount = Math.max(0, state.totalCount - 1);
      state.totalPages = Math.ceil(state.totalCount / state.pageSize);
    }
    return result;
  };

  const getById = async (id: number) => {
    return contractsApi.get(id);
  };

  const getHistory = async (id: number) => {
    return contractsApi.getHistory(id);
  };

  const addItem = async (contractId: number, item: AddContractItemRequest) => {
    return contractsApi.addItem(contractId, item);
  };

  const deleteItem = async (contractId: number, itemId: number) => {
    return contractsApi.deleteItem(contractId, itemId);
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
    get statusFilter() {
      return state.statusFilter;
    },
    load,
    setPage,
    setPageSize,
    setSearch,
    setStatusFilter,
    create,
    update,
    updateStatus,
    sign,
    remove,
    getById,
    getHistory,
    addItem,
    deleteItem
  };
};

export const contractStore = createContractStore();
