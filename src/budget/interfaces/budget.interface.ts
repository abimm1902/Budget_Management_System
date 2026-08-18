export interface Budget {
  budgetId: string;
  departmentId: string;
  allocatedAmount: number;
  usedAmount: number;
  remainingAmount: number;
  financialYear: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
