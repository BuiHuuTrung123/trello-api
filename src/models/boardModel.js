import joi from 'joi'
import { ObjectId } from 'mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'
import { BOARD_TYPES } from '~/utils/constants'
import {columnModel} from '~/models/columnModel'
import { cardModel } from './cardModel'
const BOARD_COLLECTION_NAME = 'boards'
const BOADRD_COLLECTION_SCHEMA = joi.object({
    title: joi.string().required().min(3).max(50).trim().strict(),
    slug: joi.string().required().min(3).trim().strict(),
    description: joi.string().required().min(3).max(256).trim().strict(),
      type: joi.string().valid(BOARD_TYPES.PUBLIC,BOARD_TYPES.PRIVATE).required(),
    // Lưu ý các item trong mảng columnOrderIds là ObjectId nên cần thêm pattern cho chuẩn nhé, (lúc quay video số 57 mình quên nhưng sang đầu video số 58 sẽ có nhắc lại về cái này.)
    columnOrderIds: joi.array().items(
        joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    ).default([]),
    createdAt: joi.date().timestamp('javascript').default(Date.now),
    updatedAt: joi.date().timestamp('javascript').default(null),
    _destroy: joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id','createdAt']

const validateBeforeCreate = async (data) => {
    return await BOADRD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
    try {
        const validData = await validateBeforeCreate(data)

        const createBoard = await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(validData)

        return createBoard
    } catch (error) {
        throw new Error(error)
    }
}
const findOneById = async (id) => {
    try {

        const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({
            _id: new ObjectId(id)
        })
        return result
    } catch (error) {

    }
}
const getDetails = async (id) => {
    try {
        const result = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate([
            { $match:{
                _id: new ObjectId(id),
                _destroy: false
            }},
            {$lookup:{
                from: columnModel.COLUMN_COLLECTION_NAME,
                localField: '_id',
                foreignField: 'boardId',
                as: 'columns'
            }},
            {$lookup:{
                from: cardModel.CARD_COLLECTION_NAME,
                localField: '_id',
                foreignField: 'boardId',
                as: 'cards'
            }}
        ]).toArray()
        return result[0] || null
    } catch (error) {

    }
}
const pushColumnOrderIds = async (column) => {
try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
        {_id: new ObjectId(column.boardId)},
        {$push:{ columnOrderIds: new ObjectId(column._id)}},
        {returnDocument: 'after'}
    )
  
    return result.value || null

} catch (error) {
    
}
}
const update = async (boardId,updateData) => {
try {
    // Loại bỏ các trường không được phép update
    Object.keys(updateData).forEach(fielName => {
        if(INVALID_UPDATE_FIELDS.includes(fielName)){
            delete updateData[fielName]
        }
    })
     if(updateData.columnOrderIds){
      updateData.columnOrderIds = updateData.columnOrderIds.map(id => (new ObjectId(id)))
    }
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
        {_id: new ObjectId(boardId)},
        {$set:updateData},
        {returnDocument: 'after'}
    )
  
    return result|| null

} catch (error) {
    
}
}
export const boardModel = {
    BOARD_COLLECTION_NAME,
    BOADRD_COLLECTION_SCHEMA,
    createNew,
    findOneById,
    getDetails,
    pushColumnOrderIds,
    update
}