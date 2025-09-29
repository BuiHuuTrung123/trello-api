import { StatusCodes } from 'http-status-codes'
import { cardService } from '~/services/cardService'
const createNew = async (req, res, next) => {
    try {
        //Điều hướng dữ liệu sang tầng service
        const createCard = await cardService.createNew(req.body)
        // Có kết quả trả về Client
        res.status(StatusCodes.CREATED).json(createCard)

    } catch (error) {
        next(error)

    }
}
export const cardController = {
    createNew,
}