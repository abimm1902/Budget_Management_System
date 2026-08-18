import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as couchbase from 'couchbase';

// Token used to inject the database connection anywhere in the app.
export const COUCHBASE = 'COUCHBASE';

/**
 * This module connects to Couchbase ONE time when the app starts, using
 * a "custom provider" with useFactory. Every module then injects the
 * same connection with @Inject(COUCHBASE) instead of connecting again.
 *
 * The object we return has simple helpers so repositories don't need to
 * know the Couchbase SDK details:
 *   - collection(name)  -> get a collection to do get/insert/replace
 *   - query(sql, params) -> run a N1QL query when a list is needed
 *   - keyspace(name)    -> the `bucket`.`scope`.`collection` string for queries
 */
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
