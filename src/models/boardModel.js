import joi from 'joi'
import { ObjectId } from 'mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'
import { BOARD_TYPES } from '~/utils/constants'
import { columnModel } from '~/models/columnModel'
import { cardModel } from './cardModel'
import { pagingSkipValue } from '~/utils/algorithms'
const BOARD_COLLECTION_NAME = 'boards'
const BOADRD_COLLECTION_SCHEMA = joi.object({
    title: joi.string().required().min(3).max(50).trim().strict(),
    slug: joi.string().required().min(3).trim().strict(),
    description: joi.string().required().min(3).max(256).trim().strict(),
    type: joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required(),
    // Lưu ý các item trong mảng columnOrderIds là ObjectId nên cần thêm pattern cho chuẩn nhé, (lúc quay video số 57 mình quên nhưng sang đầu video số 58 sẽ có nhắc lại về cái này.)
    columnOrderIds: joi.array().items(
        joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    ).default([]),
    //Những admin của board
    ownerIds: joi.array().items(
        joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    ).default([]),
    //Những thành viên của board
    memberIds: joi.array().items(
        joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    ).default([]),
    createdAt: joi.date().timestamp('javascript').default(Date.now),
    updatedAt: joi.date().timestamp('javascript').default(null),
    _destroy: joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

const validateBeforeCreate = async (data) => {
    return await BOADRD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (userId, data) => {
    try {
        const validData = await validateBeforeCreate(data)
        const newBoardToAdd = {
            ...validData,
            ownerIds: [new ObjectId(userId)]
        }

        const createBoard = await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(newBoardToAdd)

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
const getDetails = async (userId, boardId) => {
    try {
        const queryConditions = [
            { _id: new ObjectId(boardId), },
            { _destroy: false },
            {
                $or: [
                    { ownerIds: { $in: [new ObjectId(userId)] } },
                    { memberIds: { $in: [new ObjectId(userId)] } }
                ]
            }
        ]
        const result = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate([
            {
                $match: { $and: queryConditions }
            },
            {
                $lookup: {
                    from: columnModel.COLUMN_COLLECTION_NAME,
                    localField: '_id',
                    foreignField: 'boardId',
                    as: 'columns'
                }
            },
            {
                $lookup: {
                    from: cardModel.CARD_COLLECTION_NAME,
                    localField: '_id',
                    foreignField: 'boardId',
                    as: 'cards'
                }
            }
        ]).toArray()
        return result[0] || null
    } catch (error) {

    }
}
const pushColumnOrderIds = async (column) => {
    try {
        const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
            { _id: new ObjectId(column.boardId) },
            { $push: { columnOrderIds: new ObjectId(column._id) } },
            { returnDocument: 'after' }
        )

        return result.value || null

    } catch (error) {

    }
}
const update = async (boardId, updateData) => {
    try {
        // Loại bỏ các trường không được phép update
        Object.keys(updateData).forEach(fielName => {
            if (INVALID_UPDATE_FIELDS.includes(fielName)) {
                delete updateData[fielName]
            }
        })
        if (updateData.columnOrderIds) {
            updateData.columnOrderIds = updateData.columnOrderIds.map(id => (new ObjectId(id)))
        }
        const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
            { _id: new ObjectId(boardId) },
            { $set: updateData },
            { returnDocument: 'after' }
        )

        return result || null

    } catch (error) {

    }
}
const getBoards = async (userId, page, itemsPerPage) => {
    try {
        const queryConditions = [
            //Board chưa bị xóa
            { _destroy: false },
            // userId đang thực hiện request này nó phải thuộc vào 1 trong 2 cái mảng ownerIds hoặc memberIds, sử dụng toán tử $all của mongodb 
            {
                $or: [
                    { ownerIds: { $in: [new ObjectId(userId)] } },
                    { memberIds: { $in: [new ObjectId(userId)] } }
                ]
            }
        ]
        const query = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate(
            [
                { $match: { $and: queryConditions } },
                // sx từ a-z
                { $sort: { title: 1 } },
                //facet để xử lý nhiều luồng cho 1 query
                {
                    $facet: {
                        //luồng 1: query boards
                        'queryBoards': [
                            { $skip: pagingSkipValue(page, itemsPerPage) }, // bỏ qua số lượng bản ghi của những page trước đó
                            { $limit: itemsPerPage } // giới hạn tối đa số lượng bản ghi trả về trên 1 page
                        ],

                        //luồng 2: query đếm tổng số lượng bản ghi boards trong db
                        'queryTotalBoards': [{ $count: 'countedAllBoards' }]

                    }
                }

            ],
            //khai báo collation locale 'en' fix chứ B hoa đứng trước a thường
            { collation: { locale: 'en' } }
        ).toArray()



        const res = query[0]
        return {
            boards: res.queryBoards || [],
            totalBoards: res.queryTotalBoards[0]?.countedAllBoards || 0
        }
    } catch (error) {

    }
}
const getBoardsId = async (ownerId) => {
    try {
       const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOne({ ownerIds: { $in: [new ObjectId(ownerId)] } })
    return result
    
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
    update,
    getBoards,
    getBoardsId
}