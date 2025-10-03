import joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
const createNew = async (req, res, next) => {
    const correctCondition = joi.object({
        boardId: joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
        columnId: joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
        title: joi.string().required().min(3).max(50).trim().strict(),
        description: joi.string().optional()
    })
    try {
        //set abortEarly = false để trường hợp có nhiều lỗi validation thì trả về tất cả
        await correctCondition.validateAsync(req.body, { abortEarly: false })
        next()

    } catch (error) {
        const errorMessage = new Error(error).message
        const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
        next(customError)

    }

}


export const cardValidation = {
    createNew
}