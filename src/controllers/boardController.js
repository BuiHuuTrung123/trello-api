import { StatusCodes } from 'http-status-codes'
import { boardService } from '~/services/boardService'
const createNew = async (req, res, next) => {
    try {
        //Điều hướng dữ liệu sang tầng service
        const userId = req.jwtDecoded._id
        const createBoard = await boardService.createNew(userId, req.body)
        // Có kết quả trả về Client
        res.status(StatusCodes.CREATED).json(createBoard)

    } catch (error) {
        next(error)
    }
}
const getDetails = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded._id
        const boardId = req.params.id
        const board = await boardService.getDetails(userId, boardId)
        // Có kết quả trả về Client
        res.status(StatusCodes.OK).json(board)

    } catch (error) {
        next(error)
    }
}
const update = async (req, res, next) => {
    try {
        const boardId = req.params.id

        const updatedBoard = await boardService.update(boardId, req.body)
        // Có kết quả trả về Client
        res.status(StatusCodes.OK).json(updatedBoard)

    } catch (error) {
        next(error)
    }
}
const moveCardToDifferentColumn = async (req, res, next) => {
    try {
        const result = await boardService.moveCardToDifferentColumn(req.body)
        // Có kết quả trả về Client
        res.status(StatusCodes.OK).json(result)

    } catch (error) {
        next(error)
    }
}
const getBoards = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded._id

        // page và itemsPerPage được truyền vào trong query url từ phía FE nên sẽ lấy thông qua req.query
        const { page, itemsPerPage } = req.query
        const results = await boardService.getBoards(userId, page, itemsPerPage)
        res.status(StatusCodes.OK).json(results)
    } catch (error) {
        next(error)
    }
}

const getBoardsId = async (req, res, next) => {
    try {
       
        // Log riêng email nếu cần
        console.log('req.query.email:', req.query.email)
        const results = await boardService.getBoardsId(req.query.email)
        // 👉 chỉ có nếu client gửi POST

        res.status(StatusCodes.OK).json(results)
    } catch (error) {
        next(error)
    }

}
export const boardController = {
    createNew,
    getDetails,
    update,
    moveCardToDifferentColumn,
    getBoards,
    getBoardsId
}