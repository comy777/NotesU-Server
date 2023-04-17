import Note from "../models/Note";

export const validateNote = async (id: any, user: string) => {
  const query = { _id: id, user, state: true }
  return await Note.findOne(query)
}