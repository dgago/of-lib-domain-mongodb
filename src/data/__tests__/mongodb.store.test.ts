import { MongoDbStore } from "../mongodb-store";
import { MongoDbContext } from "../mongodb-context";
import { Entity } from "of-lib-domain";

class Test extends Entity<string> {
  constructor(id, public name: string) {
    super(id);
  }
}

class TestStore extends MongoDbStore<Test, string> {
  deleteAll() {
    return this.collection.deleteMany({});
  }
}

const url = "mongodb://192.168.1.101:27017/test";
const context: MongoDbContext = new MongoDbContext(url);

beforeAll(async () => {
  const db = await context.getDb();
  return await db.dropDatabase();
});

afterAll(async () => {
  return await context.close(true);
});

test("connection", async () => {
  const client = await context.getClient();
  expect(client).toBeTruthy();
});

test("cleanUp", async () => {
  const db = await context.getDb();

  const collName = "test-clean";
  const coll = db.collection(collName);
  const store = new TestStore(coll);

  const r = await store.deleteAll();
  expect(r).toBeTruthy();
});

test("insert", async () => {
  const db = await context.getDb();

  const collName = "test-insert";
  const coll = db.collection(collName);
  const store = new TestStore(coll);

  const id = Math.round(Math.random() * 10000).toString();
  const r = await store.create(new Test(id, "Diego"));

  expect(r).toBe(id);
});

test("delete", async () => {
  const db = await context.getDb();

  const collName = "test-delete";
  const coll = db.collection(collName);
  const store = new TestStore(coll);

  const id = Math.round(Math.random() * 10000).toString();
  await store.create(new Test(id, "Diego"));

  const r = await store.delete(id);

  expect(r).toBe(true);
});

test("replace", async () => {
  const db = await context.getDb();

  const collName = "test-replace";
  const coll = db.collection(collName);
  const store = new TestStore(coll);

  const id = Math.round(Math.random() * 10000).toString();
  const t = new Test(id, "Diego");
  await store.create(t);

  t.name = "Paco";
  const r = await store.replace(id, t);

  expect(r).toBe(true);
});

test("exists", async () => {
  const db = await context.getDb();

  const collName = "test-exists";
  const coll = db.collection(collName);
  const store = new TestStore(coll);

  const id = Math.round(Math.random() * 10000).toString();
  await store.create(new Test(id, "Diego"));

  const r = await store.exists({ name: "Diego" });

  expect(r).toBe(true);
});

test("findOne", async () => {
  const db = await context.getDb();

  const collName = "test-find-one";
  const coll = db.collection(collName);
  const store = new TestStore(coll);

  const id = Math.round(Math.random() * 10000).toString();
  await store.create(new Test(id, "Diego"));

  const r = (await store.findOne(id)) as any;

  expect(r._id).toBe(id); // TODO: me preocupa no poder obtener el valor de _id como propiedad id
  expect(r.name).toBe("Diego");
});

test("find", async () => {
  const db = await context.getDb();

  const collName = "test-find";
  const coll = db.collection(collName);
  const store = new TestStore(coll);

  let id = Math.round(Math.random() * 10000).toString();
  await store.create(new Test(id, "Diego"));

  id = Math.round(Math.random() * 10000).toString();
  await store.create(new Test(id, "Juan"));

  id = Math.round(Math.random() * 10000).toString();
  await store.create(new Test(id, "Pablo"));

  id = Math.round(Math.random() * 10000).toString();
  await store.create(new Test(id, "María"));

  id = Math.round(Math.random() * 10000).toString();
  await store.create(new Test(id, "Juana"));

  let r = await store.find({});

  expect(r.count).toBe(5);
  expect(r.items.length).toBe(5);

  r = await store.find({ name: "Diego" }, 1, 3);

  expect(r.count).toBe(1);
  expect(r.items.length).toBe(1);

  r = await store.find({}, 2, 3);

  expect(r.count).toBe(5);
  expect(r.items.length).toBe(2);
});
