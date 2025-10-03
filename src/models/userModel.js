import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
import {EMAIL_RULE, EMAIL_RULE_MESSAGE} from '~/utils/validators'
import Joi from 'joi'
// tuỳ bạn đặt

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const createdUser = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .insertOne(validData)
    return createdUser
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (userId) => {
  try {
    const result = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(userId) })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const findOneByEmail = async (emailValue) => {
  try {
    const result = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOne({ email: emailValue })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (userId, updateData) => {
  try {
    // Lọc những field mà chúng ta không cho phép cập nhật
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    const result = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: updateData },
        { returnDocument: 'after' } // trả về kết quả mới sau khi cập nhật
      )

    return result
  } catch (error) {
    throw new Error(error)
  }
}


export const userService = {
  createNew,
  USER_COLLECTION_NAME,
  USER_COLLECTION_SCHEMA,
  USER_ROLES,
  findOneById,
  findOneByEmail,
  update
}
