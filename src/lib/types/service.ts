// Service domain types

export type PriceUnit = 'UNIT' | 'PAGE' | 'HOUR' | 'PROJECT' | 'MONTHLY';

export interface Service {
  readonly id: number;
  /** Unique code identifying the service */
  readonly serviceCode: string;
  readonly name: string;
  readonly description?: string;
  /** Unit of measurement for pricing (UNIT, PAGE, HOUR, PROJECT, MONTHLY) */
  readonly priceUnit: PriceUnit;
  /** Price per unit as a number */
  readonly unitPrice: number;
  readonly active: boolean;
  /** ISO 8601 timestamp string */
  readonly createdAt: string;
  /** ISO 8601 timestamp string */
  readonly updatedAt: string;
}

export interface CreateServiceRequest {
  readonly serviceCode: string;
  readonly name: string;
  readonly description?: string;
  readonly priceUnit: PriceUnit;
  readonly unitPrice: number;
}

export interface UpdateServiceRequest extends Partial<Omit<CreateServiceRequest, 'serviceCode'>> {
  readonly active?: boolean;
}
