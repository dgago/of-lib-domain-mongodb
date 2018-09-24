import { MongoClient, MongoError } from "mongodb";

export class MongoDbContext {
  constructor(private connectionString: string) {}

  /**
   * client
   */
  private _client: MongoClient;
  public getClient(): Promise<MongoClient> {
    const p = new Promise<MongoClient>((resolve, reject) => {
      if (this._client) {
        resolve(this._client);
        return;
      }

      const mclient = new MongoClient(this.connectionString, {
        useNewUrlParser: true
      });
      mclient.connect((err: MongoError, client: MongoClient) => {
        if (err) {
          reject(err);
          return;
        }

        this._client = client;
        resolve(client);
      });
    });
    return p;
  }

  public async getDb() {
    const client = await this.getClient();
    return client.db();
  }

  public close(force?: boolean) {
    return this._client.close(force);
  }
}
