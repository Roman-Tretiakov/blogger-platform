import { Collection, Db, MongoClient } from "mongodb";
import { DBCollectionNames, DBName } from "./db-collection-names";
import { BlogMongoModel } from "../blogs/BLL/dto/blog-mongo-model";
import { PostMongoModel } from "../posts/BLL/dto/post-mongo-model";
import { UserMongoModel } from "../users/repositories/type/user-mongo-model";

export let client: MongoClient;
export let blogsCollection: Collection<BlogMongoModel>;
export let postsCollection: Collection<PostMongoModel>;
export let usersCollection: Collection<UserMongoModel>;

// Подключения к бд
export async function runDB(url: string): Promise<void> {
  client = new MongoClient(url);
  const db: Db = client.db(DBName);

  //Инициализация коллекций
  blogsCollection = db.collection<BlogMongoModel>(DBCollectionNames.BLOGS);
  postsCollection = db.collection<PostMongoModel>(DBCollectionNames.POSTS);
  usersCollection = db.collection<UserMongoModel>(DBCollectionNames.USERS);

  try {
    await client.connect();
    await db.command({ ping: 1 });
    console.log(`✅ Connected to the database ${db.databaseName}`);
  } catch (e) {
    await client.close();
    throw new Error(`❌ Database not connected: ${e}`);
  }
}

export async function closeDBConnection(client: MongoClient): Promise<void> {
  await client.close();
}
