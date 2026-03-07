import { Collection, Db, MongoClient } from "mongodb";
import { DBCollectionNames, DBName } from "./db-collection-names";
import { BlogMongoModel } from "../blogs/BLL/dto/blog-mongo-model";
import { PostMongoModel } from "../posts/BLL/dto/post-mongo-model";
import { UserMongoModel } from "../users/repositories/type/user-mongo-model";
import { CommentMongoModel } from "../comments/repositories/types/comment-mongo-model";
import { RateLimiterDocument } from "../core/coreClasses/rateLimiter";
import { AuthDevicesSessions } from "../securityDevices/BLL/types/auth-devices-sessions.interface";

export let client: MongoClient;
export let blogsCollection: Collection<BlogMongoModel>;
export let postsCollection: Collection<PostMongoModel>;
export let usersCollection: Collection<UserMongoModel>;
export let commentsCollection: Collection<CommentMongoModel>;
export let rateLimitsCollection: Collection<RateLimiterDocument>;
export let authDevicesCollection: Collection<AuthDevicesSessions>;

// Подключения к бд
export async function runDB(url: string): Promise<void> {
  client = new MongoClient(url);
  const db: Db = client.db(DBName);

  //Инициализация коллекций
  blogsCollection = db.collection<BlogMongoModel>(DBCollectionNames.BLOGS);
  postsCollection = db.collection<PostMongoModel>(DBCollectionNames.POSTS);
  usersCollection = db.collection<UserMongoModel>(DBCollectionNames.USERS);
  commentsCollection = db.collection<CommentMongoModel>(
    DBCollectionNames.COMMENTS,
  );
  rateLimitsCollection = db.collection(DBCollectionNames.RATE_LIMITS);
  authDevicesCollection = db.collection(DBCollectionNames.AUTH_DEVICES);

  try {
    await client.connect();
    await db.command({ ping: 1 });
    console.log(`✅ Connected to the database ${db.databaseName}`);

    const rateLimitsIndexes = await rateLimitsCollection.indexes();
    let hasTTLIndex = rateLimitsIndexes.some(
      (index) => index.name === "expireAt_1",
    );
    if (!hasTTLIndex) {
      await rateLimitsCollection.createIndex(
        { expireAt: 1 },
        { expireAfterSeconds: 0 },
      );
      console.log("✅ TTL index created on rateLimitsCollection");
    }

    const authDevicesIndexes = await authDevicesCollection.indexes();
    hasTTLIndex = authDevicesIndexes.some(
      (index) => index.name === "expireAt_1",
    );
    if (!hasTTLIndex) {
      await authDevicesCollection.createIndex(
        { expireAt: 1 },
        { expireAfterSeconds: 0 },
      );
      console.log("✅ TTL index created on authDevicesCollection");
    }
  } catch (e) {
    await client.close();
    throw new Error(`❌ Database not connected: ${e}`);
  }
}

// export async function runTokensDB(url: string): Promise<void> {
//   tokensDbClient = new MongoClient(url);
//   const rtDb: Db = tokensDbClient.db(TokensDBName);
//
//   try {
//     await tokensDbClient.connect();
//     await rtDb.command({ ping: 1 });
//     console.log(`✅ Connected to the database ${TokensDBName} for tokens`);
//   } catch (e) {
//     await tokensDbClient.close();
//     throw new Error(`❌ Database not connected for tokens: ${e}`);
//   }
// }

export async function closeDBConnection(client: MongoClient): Promise<void> {
  await client.close();
}
