import { Collection, Db, MongoClient } from "mongodb";
import { BlogViewModel } from "../core/types/blog-view-model-type";
import { PostViewModel } from "../core/types/post-view-model-type";
import { DBCollectionNames, DBName } from "./db-collection-names";

export let client: MongoClient;
export let blogsCollection: Collection<BlogViewModel>;
export let postsCollection: Collection<PostViewModel>;

// Подключения к бд
export async function runDB(url: string): Promise<void> {
  client = new MongoClient(url);
  const db: Db = client.db(DBName);

  //Инициализация коллекций
  blogsCollection = db.collection<BlogViewModel>(DBCollectionNames.BLOGS);
  postsCollection = db.collection<PostViewModel>(DBCollectionNames.POSTS);

  try {
    await client.connect();
    await db.command({ ping: 1 });
    console.log(`✅ Connected to the database ${db.databaseName}`);
  } catch (e) {
    await client.close();
    throw new Error(`❌ Database not connected: ${e}`);
  }
}
