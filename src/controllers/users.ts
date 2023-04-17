import { Request, Response } from "express";
import User from "../models/User";
import { validateDataUpdateUser } from "../utils/users";

export const getUser = async (req: Request, res: Response, update?: boolean) => {
  try {
    const user = req.user
    const resp = await User.findById(user)
    if(!resp) return res.status(400).send({ error: 'User not exist' })
    if(!update) return res.status(200).send({ user: resp })
    const data = validateDataUpdateUser(req.body)
    if(!data) return res.status(400).send({ error: 'Not exist data to update' })
    const newUser = await User.findByIdAndUpdate(user, data, { new: true })
    return res.status(200).send({ user: newUser })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ error: 'Error server' })
  }
}

export const uploadProfileImageUser = async (id: string, url: string, refFile: string) => {
  try {
    return await User.findByIdAndUpdate(id, { profile_image: url, refFile }, { new: true })
  } catch (error) {
    console.log(error)
  }
}