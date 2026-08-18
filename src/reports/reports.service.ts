import { Injectable } from '@nestjs/common';
import { ReportsRepository } from './reports.repository';
import { ExpenseStatus } from '../common/enums/expense-status.enum'; 
import { PaymentStatus } from '../common/enums/payment-status.enum'; 
import { DashboardReportDto } from './dto/dashboard-report.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly repository: ReportsRepository) {}

  pending() {
    return this.expensesByStatus('PENDING');
  }
  
  approved() {
    return this.expensesByStatus('APPROVED');
  }

  rejected() {
    return this.expensesByStatus('REJECTED');
  }

  top(limit = 10) {
    return this.repository.query(
      `SELECT e.* FROM ${this.repository.keyspace('expenses')} e ORDER BY e.amount DESC LIMIT $limit`,
      { limit },
    );
  }

  departmentWise() {
    return this.repository.query(
      `SELECT e.departmentId, COUNT(e.expenseId) AS count, SUM(e.amount) AS total
       FROM ${this.repository.keyspace('expenses')} e
       GROUP BY e.departmentId`,
    );
  }

  categoryWise() {
    return this.repository.query(
      `SELECT e.categoryId, COUNT(e.expenseId) AS count, SUM(e.amount) AS total
       FROM ${this.repository.keyspace('expenses')} e
       GROUP BY e.categoryId`,
    );
  }

  budget() {
    return this.repository.query(
      `SELECT b.* FROM ${this.repository.keyspace('budgets')} b ORDER BY b.financialYear DESC`,
    );
  }


  async FullReport(): Promise<DashboardReportDto> {
    const expenseSql = `
      SELECT
        COUNT(e.expenseId) AS totalExpenses,
        SUM(CASE WHEN e.status = $pending THEN 1 ELSE 0 END) AS pendingExpenses,
        SUM(CASE WHEN e.status = $approved THEN 1 ELSE 0 END) AS approvedExpenses,
        SUM(CASE WHEN e.status = $rejected THEN 1 ELSE 0 END) AS rejectedExpenses,
        SUM(e.amount) AS totalExpenseAmount,
        SUM(CASE WHEN e.status = $approved THEN e.amount ELSE 0 END) AS approvedAmount,
        SUM(CASE WHEN e.status = $pending THEN e.amount ELSE 0 END) AS pendingAmount,
        SUM(CASE WHEN e.status = $rejected THEN e.amount ELSE 0 END) AS rejectedAmount,
        SUM(CASE WHEN e.paymentStatus = $paid THEN e.amount ELSE 0 END) AS paidAmount,
        SUM(CASE WHEN e.status = $approved AND e.paymentStatus = $unpaid THEN e.amount ELSE 0 END) AS unpaidAmount
      FROM ${this.repository.keyspace('expenses')} e
    `;

    const budgetSql = `
      SELECT
        SUM(b.allocatedAmount) AS totalBudget,
        SUM(b.usedAmount) AS usedBudget,
        SUM(b.remainingAmount) AS remainingBudget
      FROM ${this.repository.keyspace('budgets')} b
      WHERE b.isActive = $active
    `;

    const [expenseRows, budgetRows] = await Promise.all([
      this.repository.query(expenseSql, {
        pending: ExpenseStatus.PENDING,
        approved: ExpenseStatus.APPROVED,
        rejected: ExpenseStatus.REJECTED,
        paid: PaymentStatus.PAID,
        unpaid: PaymentStatus.UNPAID,
      }),
      this.repository.query(budgetSql, { active: true }),
    ]);

    const e = expenseRows[0] ?? {};
    const b = budgetRows[0] ?? {};

    return {
      totalExpenses: e.totalExpenses ?? 0,
      pendingExpenses: e.pendingExpenses ?? 0,
      approvedExpenses: e.approvedExpenses ?? 0,
      rejectedExpenses: e.rejectedExpenses ?? 0,
      totalExpenseAmount: e.totalExpenseAmount ?? 0,
      approvedAmount: e.approvedAmount ?? 0,
      pendingAmount: e.pendingAmount ?? 0,
      rejectedAmount: e.rejectedAmount ?? 0,
      paidAmount: e.paidAmount ?? 0,
      unpaidAmount: e.unpaidAmount ?? 0,
      totalBudget: b.totalBudget ?? 0,
      usedBudget: b.usedBudget ?? 0,
      remainingBudget: b.remainingBudget ?? 0,
    };
  }

  private expensesByStatus(status: string) {
    return this.repository.query(
      `SELECT e.* FROM ${this.repository.keyspace('expenses')} e WHERE e.status=$status ORDER BY e.createdAt DESC`,
      { status },
    );
  }
}
