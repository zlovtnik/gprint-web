// Customer domain types

export type CustomerType = 'INDIVIDUAL' | 'COMPANY';

export interface Address {
  readonly street?: string;
  readonly number?: string;
  readonly complement?: string;
  readonly district?: string;
  readonly city?: string;
  readonly state?: string;
  readonly zip?: string;
  readonly country?: string;
}

export interface Customer {
  readonly id: number;
  readonly customerCode: string;
  readonly customerType: CustomerType;
  readonly name: string;
  readonly tradeName?: string;
  readonly taxId?: string;
  readonly stateReg?: string;
  readonly municipalReg?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly mobile?: string;
  readonly address?: Address;
  readonly active: boolean;
  readonly notes?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateCustomerRequest {
  readonly customerCode: string;
  readonly customerType: CustomerType;
  readonly name: string;
  readonly tradeName?: string;
  readonly taxId?: string;
  readonly stateReg?: string;
  readonly municipalReg?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly mobile?: string;
  readonly address?: Address;
  readonly notes?: string;
}

export interface UpdateCustomerRequest
  extends Partial<Omit<CreateCustomerRequest, 'customerCode'>> {
  readonly active?: boolean;
}
