import { MongoClient, MongoError } from "mongodb";
import { DbContext } from "of-lib-domain";

/**
 * Contexto de base de datos para MongoDb.
 */
export class MongoDbContext extends DbContext {
  constructor(connectionString: string) {
    super(connectionString);
  }

  /**
   * Obtiene el cliente conectado a la base de datos.
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

  public getPool() {
    return this.getClient();
  }

  /**
   * Obtiene una referencia a la base de datos por defecto.
   */
  public async getDb() {
    const client = await this.getClient();
    return client.db();
  }

  /**
   * Libera una conexión a la base de datos.
   */
  public release(client) {}

  /**
   * Cierra la conexión establecida por el cliente.
   */
  public close(force?: boolean) {
    return this._client.close(force);
  }
}
