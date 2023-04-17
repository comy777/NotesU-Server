import bcrypt from 'bcryptjs'
import User from "../models/User"
import { UpdateUser } from '../interfaces/interfaces'

export const validateUserDb = async (email: string, uuid?: string) => {
  const query = uuid ? { _id: uuid } : { email }
  return await User.findOne(query)
}

export const validatePassword = async (email: string, password: string): Promise<string | any> => {
  try {
    const user = await validateUserDb(email)
    if (!user) return 'User is not register'
    const validatePassword = await bcrypt.compare(password, user.password)
    if (!validatePassword) return 'The password is wrong'
    return user
  } catch (error) {
    console.log(error)
    return ''
  }
}

export const validateUserById = async (id: string) => {
  return await User.findById(id)
}

export const validateDataUpdateUser = (data: Object): UpdateUser | undefined => {
  const validateData = ['name']
  let dataResp: Array<string[]> = []
  if(Object.entries(data).length === 0) return
  Object.entries(data).forEach(([key, value]) => {
    if(validateData.includes(key) && typeof value === 'string') dataResp.push([key, value])
  })
  const resp = Object.fromEntries(dataResp)
  return Object.entries(resp).length > 0 ? resp : undefined
}

export const validateProfileImage = async (id: string): Promise<string | undefined> => {
  const user = await validateUserById(id)
  if(!user) return
  if(!user.profile_image) return
  return user.refFile
}