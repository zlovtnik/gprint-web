// Contract domain types

import type { Customer } from './customer';
import type { Service } from './service';

export type ContractType = 'SERVICE' | 'RECURRING' | 'PROJECT';
export type ContractStatus = 'DRAFT' | 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'COMPLETED';
export type BillingCycle = 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ONCE';
export type ContractItemStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface ContractItem {
  readonly id: number;
  readonly contractId: number;
  readonly serviceId: number;
  readonly service?: Service;
  readonly quantity: string;
  readonly unitPrice: string;
  readonly discountPct: string;
  readonly lineTotal: string;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly description?: string;
  readonly status: ContractItemStatus;
}

export interface Contract {
  readonly id: number;
  readonly contractNumber: string;
  readonly contractType: ContractType;
  readonly customerId: number;
  readonly customer?: Customer;
  readonly startDate: string;
  readonly endDate?: string;
  readonly durationMonths?: number;
  readonly autoRenew: boolean;
  readonly totalValue: string;
  readonly paymentTerms?: string;
  readonly billingCycle: BillingCycle;
  readonly status: ContractStatus;
  readonly signedAt?: string;
  readonly signedBy?: string;
  readonly items?: ContractItem[];
  readonly notes?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateContractRequest {
  readonly contractNumber: string;
  readonly customerId: number;
  readonly contractType: ContractType;
  readonly startDate: string;
  readonly endDate?: string;
  readonly durationMonths?: number;
  readonly autoRenew?: boolean;
  readonly paymentTerms?: string;
  readonly billingCycle: BillingCycle;
  readonly notes?: string;
}

export interface UpdateContractRequest extends Partial<CreateContractRequest> {}

export interface AddContractItemRequest {
  readonly serviceId: number;
  readonly quantity: string;
  readonly unitPrice: string;
  readonly discountPct?: string;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly description?: string;
}

export interface ContractHistory {
  readonly id: number;
  readonly contractId: number;
  readonly action: string;
  readonly description: string;
  readonly performedBy?: string;
  readonly createdAt: string;
}
