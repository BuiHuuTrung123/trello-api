import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
const createNew = async (reqBody) => {
    try {
        // Xử lý logic dữ liệu
        const newCard = {
            ...reqBody
        }
        //Gọi tới tầng model để xử lý lưu bản ghi newBoard
        const createdCard = await cardModel.createNew(newCard)
        const getNewCard = await cardModel.findOneById(createdCard.insertedId)

        if (getNewCard) {
            await columnModel.pushCardOrderIds(getNewCard)
        }
        //Bắn email, notification về cho admin khi 1 board mới được tạo

        return getNewCard

    } catch (error) {
        throw error
    }
}

const update = async (cardId, reqBody, cardCoverFile) => {
    try {
        const updateData = {
            ...reqBody,
            updatedAt: Date.now()
        }
        let updatedCard = {}
        if (cardCoverFile) {
            const uploadResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer, 'card-covers')

            updatedCard = await cardModel.update(cardId, {
                cover: uploadResult.secure_url
            })
        } else {
            // các trường hợp update chung
            updatedCard = await cardModel.update(cardId, updateData)
        }

        return updatedCard
    } catch (error) {
        throw error
    }
}
export const cardService = {
    createNew,
    update

}