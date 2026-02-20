import { Collection, Db, MongoClient } from "mongodb";
import { DBCollectionNames, DBName, TokensDBName } from "./db-collection-names";
import { BlogMongoModel } from "../blogs/BLL/dto/blog-mongo-model";
import { PostMongoModel } from "../posts/BLL/dto/post-mongo-model";
import { UserMongoModel } from "../users/repositories/type/user-mongo-model";
import { CommentMongoModel } from "../comments/repositories/types/comment-mongo-model";
import { RefreshTokenMongoModel } from "../auth/types/refresh-token-mongo-model";

export let client: MongoClient;
export let tokensDbClient: MongoClient;
export let blogsCollection: Collection<BlogMongoModel>;
export let postsCollection: Collection<PostMongoModel>;
export let usersCollection: Collection<UserMongoModel>;
export let commentsCollection: Collection<CommentMongoModel>;
export let blackListTokensCollection: Collection<RefreshTokenMongoModel>;
export let whiteListTokensCollection: Collection<RefreshTokenMongoModel>;

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

  try {
    await client.connect();
    await db.command({ ping: 1 });
    console.log(`✅ Connected to the database ${db.databaseName}`);
  } catch (e) {
    await client.close();
    throw new Error(`❌ Database not connected: ${e}`);
  }
}

export async function runTokensDB(url: string): Promise<void> {
  tokensDbClient = new MongoClient(url);
  const rtDb: Db = tokensDbClient.db(TokensDBName);

  //Инициализация коллекций
  blackListTokensCollection = rtDb.collection<RefreshTokenMongoModel>(
    DBCollectionNames.RT_TOKENS,
  );
  whiteListTokensCollection = rtDb.collection<RefreshTokenMongoModel>(
    DBCollectionNames.RT_TOKENS,
  );

  try {
    await tokensDbClient.connect();
    await rtDb.command({ ping: 1 });
    console.log(`✅ Connected to the database ${TokensDBName} for tokens`);
  } catch (e) {
    await tokensDbClient.close();
    throw new Error(`❌ Database not connected for tokens: ${e}`);
  }
}

export async function closeDBConnection(client: MongoClient): Promise<void> {
  await client.close();
}
