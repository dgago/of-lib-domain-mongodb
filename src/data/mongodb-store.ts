import * as of from "of-lib-domain";
import * as mongodb from "mongodb";

export abstract class MongoDbStore<T extends of.Entity<K>, K>
  implements of.IStore<T, K> {
  constructor(protected collection: mongodb.Collection<T>) {}

  /**
   * Obtiene un item.
   */
  findOne(id: K): Promise<T> {
    const filter = { _id: id };
    return this.collection.findOne(filter);
  }

  /**
   * Obtiene todos los items que responden a la consulta.
   */
  findAll(q: of.IQuery): Promise<of.IResults<T>> {
    const p = new Promise<of.IResults<T>>((resolve, reject) => {
      const c = this.collection.find(q || {});
      c.toArray()
        .then((items) => {
          resolve({
            count: items.length,
            items,
            pageIndex: 1,
            pageSize: items.length
          });
        })
        .catch(reject);
    });
    return p;
  }

  /**
   * Obtiene una página de los items que responden a la consulta
   */
  find(
    q: of.IQuery,
    pageIndex: number = 0,
    pageSize: number = 0,
    sort: of.IQuery = {}
  ): Promise<of.IResults<T>> {
    const p = new Promise<of.IResults<T>>((resolve, reject) => {
      const c = this.collection.find(q || {});

      c.count()
        .then((count) => {
          if (sort) {
            c.sort(sort);
          }

          if (pageSize > 0 && pageIndex > 0) {
            c.skip(pageSize * (pageIndex - 1));
            c.limit(pageSize);
          }

          c.toArray()
            .then((items) => {
              resolve({
                count,
                items,
                pageIndex: 1,
                pageSize: items.length
              });
            })
            .catch(reject);
        })
        .catch(reject);
    });
    return p;
  }

  /**
   * Verifica la existencia de un item.
   */
  exists(q: of.IQuery): Promise<boolean> {
    const p = new Promise<boolean>((resolve, reject) => {
      const c = this.collection.find(q || {});
      c.count()
        .then((count) => {
          resolve(count > 0);
        })
        .catch(reject);
    });
    return p;
  }

  /**
   * Crea un item.
   */
  create(item: T): Promise<K> {
    const p = new Promise<K>((resolve, reject) => {
      this.collection
        .insertOne(item)
        .then((res) => {
          resolve(res.insertedId as any);
        })
        .catch(reject);
    });
    return p;
  }

  /**
   * Modifica un item.
   */
  replace(id: K, item: T): Promise<boolean> {
    const p = new Promise<boolean>((resolve, reject) => {
      this.collection
        .replaceOne({ _id: id }, item)
        .then((res) => {
          resolve(res.modifiedCount > 0);
        })
        .catch(reject);
    });
    return p;
  }

  /**
   * Elimina un item.
   */
  delete(id: K): Promise<boolean> {
    const p = new Promise<boolean>((resolve, reject) => {
      this.collection
        .deleteOne({ _id: id })
        .then((res) => {
          resolve(res.deletedCount > 0);
        })
        .catch(reject);
    });
    return p;
  }

  /**
   * Not implemented.
   */
  findOneSync(id: K): T {
    throw new Error("Method not implemented.");
  }
  findAllSync(q: of.IQuery): of.IResults<T> {
    throw new Error("Method not implemented.");
  }
  findSync(
    q: of.IQuery,
    pageIndex: number,
    pageSize: number,
    sort: of.IQuery
  ): of.IResults<T> {
    throw new Error("Method not implemented.");
  }
  existsSync(q: of.IQuery): boolean {
    throw new Error("Method not implemented.");
  }
  createSync(item: T): K {
    throw new Error("Method not implemented.");
  }
  replaceSync(id: K, item: T): void {
    throw new Error("Method not implemented.");
  }
  deleteSync(id: K): void {
    throw new Error("Method not implemented.");
  }
}
