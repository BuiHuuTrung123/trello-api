import express from 'express'
import { mapOrder } from '~/utils/sorts.js'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import { env } from '~/config/environment'
import { APIs_v1 } from '~/routes/v1'
import {errorHandlingMiddleware} from '~/middlewares/errorHandlingMiddleware'
// import exitHook from 'async-exit-hook'
import a from 'async-exit-hook'
const exitHook = a
const START_SERVER = () => {

  const app = express()
  //Enable req.body json data
  app.use(express.json())
  //Use APIs v1
  app.use('/v1', APIs_v1)
  //Middlewares xu ly loi tap trung
  app.use(errorHandlingMiddleware)

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    console.log(`Hello Trung Quan Dev, I am running at http://${env.APP_HOST}:${env.APP_PORT}/`)
  })
  exitHook(() => {
    CLOSE_DB()
  })
}

CONNECT_DB()
  .then(() => console.log('Kết nối thành công'))
  .then(() => START_SERVER())
  .catch(error => {
    console.error(error)
    process.exit(0)
  })