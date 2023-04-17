import FileSchema from '../models/Files'

export const validateFileExists = async (id: any, user: string) => {
  const query = { _id: id, user}
  const file = await FileSchema.findOne(query)
  return file
}