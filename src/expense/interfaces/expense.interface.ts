import { ExpenseStatus } from '../../common/enums/expense-status.enum';
import { PaymentStatus } from '../../common/enums/payment-status.enum';

export interface Expense {
  expenseId: string;
  employeeId: string;
  departmentId: string;
  categoryId: string;
  amount: number;
  expenseDate: string;
  description: string;
  status: ExpenseStatus;
  paymentStatus: PaymentStatus;
  managerRemarks?: string;
  financialYear: string;
  createdAt: string;
  updatedAt: string;
}
