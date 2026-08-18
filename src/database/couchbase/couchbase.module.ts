import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as couchbase from 'couchbase';

export const COUCHBASE = 'COUCHBASE';

@Global()
@Module({
  providers: [
    {
      provide: COUCHBASE,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const connectionString = config.get<string>('COUCHBASE_CONNECTION_STRING');
        const username = config.get<string>('COUCHBASE_USERNAME');
        const password = config.get<string>('COUCHBASE_PASSWORD');
        const bucketName = config.get<string>('COUCHBASE_BUCKET');
        const scopeName = config.get<string>('COUCHBASE_SCOPE', '_default');

        console.log('Connecting to Couchbase...');
        const cluster = await couchbase.connect(connectionString!, {
          username: username!,
          password: password!,
        });
        console.log('Couchbase connected!');

        const bucket = cluster.bucket(bucketName!);
        const scope = bucket.scope(scopeName);

        return {
          collection: (name: string) => scope.collection(name),
          query: (sql: string, options?: any) => cluster.query(sql, options),
          keyspace: (name: string) => `\`${bucketName}\`.\`${scopeName}\`.\`${name}\``,
        };
      },
    },
  ],
  exports: [COUCHBASE],
})
export class CouchbaseModule {}
