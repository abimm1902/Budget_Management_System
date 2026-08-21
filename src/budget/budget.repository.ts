import { Inject, Injectable } from '@nestjs/common';
import { COUCHBASE } from '../database/couchbase/couchbase.module';

@Injectable()
export class BudgetRepository {
  constructor(@Inject(COUCHBASE) private readonly db: any) {}

  async create(id: string, data: any) {
    await this.db.collection('budgets').insert(id, data);
    return data;
  }

  async findAll() {
    const result = await this.db.query(
      `SELECT x.* FROM ${this.db.keyspace('budgets')} x ORDER BY x.financialYear DESC`,
    );
    return result.rows;
  }

  async findById(id: string) {
    try {
     const  result= (await this.db.collection('budgets').get(id));
      return result.content }
    catch { return null; }
  }

  async findActive(departmentId: string, financialYear: string) {
    const result = await this.db.query(
      `SELECT x.* FROM ${this.db.keyspace('budgets')} x
       WHERE x.departmentId=$departmentId AND x.financialYear=$financialYear AND x.isActive=true LIMIT 1`,
      { parameters: { departmentId, financialYear } },
    );
    return result.rows[0] || null;
  }

  async update(id: string, data: any) {
    await this.db.collection('budgets').replace(id, data);
    return data;
  }

  async delete(id: string) {
  await this.db.collection('budgets').remove(id);
 }


 /** The raw collection object, needed by ctx.get/insert/replace in a transaction. */
  getCollection() {
    return this.db.collection('budgets');
  }

  /** Reads the budget inside an in-flight transaction. Returns null if not found. */
  async findByIdInTx(ctx: any, id: string) {
    try {
      return await ctx.get(this.getCollection(), id);
    } catch {
      return null;
    }
  }

  /** Writes the budget inside an in-flight transaction. `doc` is the result of findByIdInTx. */
  async updateInTx(ctx: any, doc: any, data: any) {
    await ctx.replace(doc, data);
    return data;
  }
}
