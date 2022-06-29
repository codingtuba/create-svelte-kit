import { Sequelize } from "sequelize";
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './db.sqlite'
})
await sequelize.sync()
await sequelize.authenticate()
export default sequelize