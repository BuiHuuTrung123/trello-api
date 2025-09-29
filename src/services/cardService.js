import {cardModel} from '~/models/cardModel'
import {columnModel} from '~/models/columnModel'
const createNew = async (reqBody)=> {
try {
    // Xử lý logic dữ liệu
    const newCard = {
        ...reqBody
    }
    //Gọi tới tầng model để xử lý lưu bản ghi newBoard
    const createdCard = await cardModel.createNew(newCard)
    const getNewCard = await cardModel.findOneById(createdCard.insertedId)

    if(getNewCard){
        await columnModel.pushCardOrderIds(getNewCard) 
    }
    //Bắn email, notification về cho admin khi 1 board mới được tạo
    
    return getNewCard
    
} catch (error) {
     throw error
}
}


export const cardService = {
    createNew,

}