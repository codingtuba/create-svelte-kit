import { Model, DataTypes } from "sequelize"
import sequelize from "../database"
class Export extends Model {}
Export.init({
  placeholder: DataTypes.TEXT
},{sequelize})
export default Export