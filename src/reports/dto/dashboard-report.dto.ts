
export interface DashboardReportDto {
  totalExpenses: number;
  pendingExpenses: number;
  approvedExpenses: number;
  rejectedExpenses: number;
  totalExpenseAmount: number;
  approvedAmount: number;
  pendingAmount: number;
  rejectedAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  totalBudget: number;
  usedBudget: number;
  remainingBudget: number;
}
