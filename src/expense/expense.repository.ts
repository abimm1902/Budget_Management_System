import { Inject, Injectable } from '@nestjs/common';
import { COUCHBASE } from '../database/couchbase/couchbase.module';

@Injectable()
export class ExpenseRepository {
  constructor(@Inject(COUCHBASE) private readonly db: any) {}

  async create(id: string, data: any) {
    await this.db.collection('expenses').insert(id, data);
    return data;
  }

  async findAll() {
    const result = await this.db.query(
      `SELECT x.* FROM ${this.db.keyspace('expenses')} x ORDER BY x.createdAt DESC`,
    );
    return result.rows;
  }

  async findById(id: string) {
    try { return (await this.db.collection('expenses').get(id)).content; }
    catch { return null; }
  }

  async findByEmployee(employeeId: string) {
    const result = await this.db.query(
      `SELECT x.* FROM ${this.db.keyspace('expenses')} x WHERE x.employeeId=$employeeId ORDER BY x.createdAt DESC`,
      { parameters: { employeeId } },
    );
    return result.rows;
  }

  async findByDepartment(departmentId: string) {
    const result = await this.db.query(
      `SELECT x.* FROM ${this.db.keyspace('expenses')} x WHERE x.departmentId=$departmentId ORDER BY x.createdAt DESC`,
      { parameters: { departmentId } },
    );
    return result.rows;
  }

  async findByStatus(status: string) {
    const result = await this.db.query(
      `SELECT x.* FROM ${this.db.keyspace('expenses')} x WHERE x.status=$status ORDER BY x.createdAt DESC`,
      { parameters: { status } },
    );
    return result.rows;
  }

  async findTop(limit: number) {
    const result = await this.db.query(
      `SELECT x.* FROM ${this.db.keyspace('expenses')} x ORDER BY x.amount DESC LIMIT $limit`,
      { parameters: { limit } },
    );
    return result.rows;
  }

  async update(id: string, data: any) {
    await this.db.collection('expenses').replace(id, data);
    return data;
  }
}
