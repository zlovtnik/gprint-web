// Service domain types

export type ServiceType = 'PRINT' | 'SCAN' | 'COPY' | 'FAX' | 'OTHER';
export type UnitType = 'UNIT' | 'PAGE' | 'HOUR' | 'PROJECT' | 'MONTHLY';

export interface Service {
  readonly id: number;
  /** Unique code identifying the service */
  readonly serviceCode: string;
  readonly name: string;
  readonly description?: string;
  /** Type of service (PRINT, SCAN, COPY, FAX, OTHER) */
  readonly serviceType: ServiceType;
  /** Unit of measurement for pricing (UNIT, PAGE, HOUR, PROJECT, MONTHLY) */
  readonly unitType: UnitType;
  /** Price per unit as a decimal string (e.g., "12.34") to avoid float precision issues */
  readonly unitPrice: string;
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
  readonly serviceType: ServiceType;
  readonly unitType: UnitType;
  readonly unitPrice: string;
}

export interface UpdateServiceRequest extends Partial<Omit<CreateServiceRequest, 'serviceCode'>> {
  readonly active?: boolean;
}
