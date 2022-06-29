import { Sequelize } from "sequelize";
import * as keys from "./.keys"
const sequelize = new Sequelize(keys.DATABASE, keys.USERNAME, keys.PASSCODE, {
  host: keys.HOST,
  dialect: 'mysql'
})
await sequelize.authenticate()
export default sequelize