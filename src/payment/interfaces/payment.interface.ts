export interface Payment {
  paymentId: string;
  expenseId: string;
  amount: number;
  paidBy: string;
  paidAt: string;
}
