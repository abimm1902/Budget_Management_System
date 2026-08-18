import { Inject, Injectable } from '@nestjs/common';
import { COUCHBASE } from '../database/couchbase/couchbase.module';

@Injectable()
export class PaymentRepository {
  constructor(@Inject(COUCHBASE) private readonly db: any) {}

  async create(id: string, data: any) {
    await this.db.collection('payments').insert(id, data);
    return data;
  }

  async findAll() {
    const result = await this.db.query(
      `SELECT x.* FROM ${this.db.keyspace('payments')} x ORDER BY x.paidAt DESC`,
    );
    return result.rows;
  }

  async findById(id: string) {
    try {
      const result = await this.db.collection('payments').get(id);
      return result.content;
    } catch {
      return null;
    }
  }
}
