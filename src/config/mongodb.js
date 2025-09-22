import { env } from '~/config/environment'
import { MongoClient, ServerApiVersion } from 'mongodb'
let trelloDatabaseInstance = null
const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
})
export const CONNECT_DB = async () => {
    await mongoClientInstance.connect()
    trelloDatabaseInstance = mongoClientInstance.db(env.DATABASE_NAME)

}
export const GET_DB = () => {
    if (!trelloDatabaseInstance) throw new Error('Hãy kết nối đến cơ sở dữ liệu')
    return trelloDatabaseInstance
}

export const CLOSE_DB = async () => {
    await mongoClientInstance.close()
}