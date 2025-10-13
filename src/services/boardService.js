import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'
import  ApiError  from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import { DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants'
const createNew = async (reqBody) => {
    try {
        // Xử lý logic dữ liệu
        const newBoard = {
            ...reqBody,
            slug: slugify(reqBody.title)

        }
        //Gọi tới tầng model để xử lý lưu bản ghi newBoard
        const createdBoard = await boardModel.createNew(newBoard)
        const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)
        //Bắn email, notification về cho admin khi 1 board mới được tạo
        if (getNewBoard) {
            getNewBoard.columns = []
          
        }
        return getNewBoard

    } catch (error) {
        throw error
    }
}
const getDetails = async (boardId) => {
    try {
        const board = await boardModel.getDetails(boardId)
        //Bắn email, notification về cho admin khi 1 board mới được tạo
        if (!board) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
        const resBoard = cloneDeep(board)
        resBoard.columns.forEach(column => {
            column.cards = resBoard.cards.filter(card => card.columnId.toString() === column._id.toString())
        })
        delete resBoard.cards
        return resBoard

    } catch (error) {
        throw error
    }
}

const update = async (boardId, reqBody) => {
    try {
        const updateData = {
            ...reqBody,
            updatedAt: Date.now()
        }
        const updateBoard = await boardModel.update(boardId, updateData)
        //Bắn email, notification về cho admin khi 1 board mới được tạo
        return updateBoard

    } catch (error) {
        throw error
    }
}

const moveCardToDifferentColumn = async (reqBody) => {
    try {

        await columnModel.update(reqBody.prevColumnId, {
            cardOrderIds: reqBody.prevCardOrderIds,
            updatedAt: Date.now()
        })

          await columnModel.update(reqBody.nextColumnId, {
            cardOrderIds: reqBody.nextCardOrderIds,
            updatedAt: Date.now()
        })

        await cardModel.update(reqBody.currentCardId,{
            columnId: reqBody.nextColumnId
        })
        return { updateResult: 'okok' }

    } catch (error) {
        throw error
    }
}

const getBoards = async (userId, page, itemsPerPage) => {
  try {
    // Nếu không tồn tại page hoặc itemsPerPage từ phía FE thì BE sẽ cần phải luôn gán giá trị mặc định
    if (!page) page = DEFAULT_PAGE
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE
console.log('userId',userId)
console.log('page',itemsPerPage)
    const results = await boardModel.getBoards(
      userId,
      parseInt(page, 10),
      parseInt(itemsPerPage, 10)
    )
console.log('results',results)
    return results
  } catch (error) {
    throw error
  }
}

export const boardService = {
    createNew,
    getDetails,
    update,
    moveCardToDifferentColumn,
    getBoards
}