import { Inject, Injectable } from '@nestjs/common';
import { COUCHBASE } from '../database/couchbase/couchbase.module';

@Injectable()
export class ReportsRepository {
  constructor(@Inject(COUCHBASE) private readonly db: any) {}

  async query(sql: string, parameters: any = {}) {
    const result = await this.db.query(sql, { parameters });
    return result.rows;
  }

  keyspace(name: string) {
    return this.db.keyspace(name);
  }
}
