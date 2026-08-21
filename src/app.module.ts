import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { CouchbaseModule } from './database/couchbase/couchbase.module';
import { EmployeeModule } from './employee/employee.module';
import { DepartmentModule } from './department/department.module';
import { CategoryModule } from './category/category.module';
import { BudgetModule } from './budget/budget.module';
import { ExpenseModule } from './expense/expense.module';
import { PaymentModule } from './payment/payment.module';
import { ReportsModule } from './reports/reports.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CouchbaseModule,
    EmployeeModule,
    DepartmentModule,
    CategoryModule,
    BudgetModule,
    ExpenseModule,
    PaymentModule,
    ReportsModule,
   
  ],
  providers: [{ provide: APP_FILTER, useClass: HttpExceptionFilter }, ],
})
export class AppModule {}
