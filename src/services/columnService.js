import {columnModel} from '~/models/columnModel'
import {boardModel} from '~/models/boardModel'
const createNew = async (reqBody)=> {
try {
    // Xử lý logic dữ liệu
    const newColumn = {
        ...reqBody
    }
    //Gọi tới tầng model để xử lý lưu bản ghi newBoard
    const createdColumn = await columnModel.createNew(newColumn)
    const getNewColumn = await columnModel.findOneById(createdColumn.insertedId)
    if(getNewColumn) {
        
        getNewColumn.cards = []
    
        await boardModel.pushColumnOrderIds(getNewColumn)
    }
    //Bắn email, notification về cho admin khi 1 board mới được tạo
    
    return getNewColumn
    
} catch (error) {
     throw error
}
}

const update = async (columnId, reqBody) => {
    try {
        const updateData = {
            ...reqBody,
            updatedAt: Date.now()
        }
        const updateColumn = await columnModel.update(columnId, updateData)
  
        return updateColumn

    } catch (error) {
        throw error
    }
}
export const columnService = {
    createNew,
    update
}