import { Request, Response } from "express";
import bcrypt from 'bcryptjs'
import { serialize } from 'cookie'
import { RegisterForm } from "../interfaces/interfaces";
import User from "../models/User";
import { validatePassword, validateUserDb } from "../utils/users";
import { decodeToken, generateToken, validateToken } from "../utils/jwt";
import { sendEmail } from "../nodemailer/email";

export const loginUser = async (req: Request, res: Response) => {
  const data: RegisterForm = req.body
  const { email, password } = data
  const user = await validatePassword(email, password)
  if (typeof user === 'string') return res.status(400).send({ error: user })
  try {
    if(!user.emailValidate) return res.status(400).send({ error: 'Verify your email account' })
    const id: string = user.id
    const token = generateToken({ uuid: id }, '7d')
    return res.status(200).send({ token })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ error: 'Server error' })
  }
}

export const createUser = async (req: Request, res: Response) => {
  const data: RegisterForm = req.body
  const { name, email, password } = data
  const salt = await bcrypt.genSaltSync()
  const hash = await bcrypt.hashSync(password, salt)
  const user = await validateUserDb(email)
  if (user) return res.status(400).send({ error: "User already register" })
  try {
    const newUser = new User({ name, email, password: hash })
    const { id } = await newUser.save()
    const token = generateToken({ uuid: id }, '25m')
    if(!token) return res.status(500).send({ error: 'Error server' })
    await sendEmail(email, token)
    return res.status(200).send({ msg: 'Account created, please verify your email, to veirfy' })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ error: 'Server error' })
  }
}

export const verifyEmail = async (req: Request, res: Response, resetPassword?: boolean) => {
  const { email } = req.body
  const user = await validateUserDb(email)
  if(!user) return res.status(500).send({ error: 'Error server' })
  if(user.emailValidate && !resetPassword) return res.status(200).send({ msg: 'Account verify already' })
  const id = user.id
  const token = generateToken({uuid: id}, '1m')
  if(!token) return res.status(500).send({ error: 'Error server' })
  await sendEmail(email, token, resetPassword)
  return res.status(200).send({ msg: 'Check your email account' })
}

export const veryfyAccount = (req: Request, res: Response, password?: boolean) => {
  const { token } = req.query
  if(!token) return res.status(400).send({ error: 'Token required' })
  const validateJwt = validateToken(token.toString())
  const name = password ? 'password' : 'token'
  const value = password ? 'true' : token.toString()
  const clearValue = password ? 'token' : 'password'
  res.clearCookie(clearValue)
  const serialized = serialize(name, value, {
    sameSite: 'lax',
    httpOnly: password ? false : true,
    maxAge: 1000 * 60
  })
  res.setHeader('Set-Cookie', serialized)
  if(!validateJwt) return res.status(200).render('send-email')
  const template = password ? 'reset-password' : 'verify-email'
  return res.render(template)
}

export const activateAccout = async (req: Request, res: Response, password?: boolean) => {
  const { token } = req.cookies
  if(!token) return res.status(500).send({ error: 'Error server' })
  const validateJwt = validateToken(token.toString())
  if(typeof validateJwt === 'string') return res.status(400).send({ error: validateJwt })
  const { uuid } = validateJwt
  try {
    const user = await validateUserDb('', uuid)
    if(!user) return res.status(400).send({ error: 'User does not exist' })
    let dataUpdate = password ? { password: ''} : { emailValidate: true }
    let msg = password ? 'Restore password success' : 'Validate user success'
    if(password){
      const salt = bcrypt.genSaltSync()
      const hash = bcrypt.hashSync(req.body.password, salt)
      dataUpdate = { password: hash }
    }
    await User.findByIdAndUpdate(uuid, dataUpdate, { new: true })
    return res.status(200).send({ msg })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ error: 'Error server' })
  }
}

export const refreshToken = async (req: Request, res: Response) => {
  const { token } = req.params
  const validate = validateToken(token)
  let bandera = false
  if(typeof validate === 'string' && validate !== 'jwt expired') return res.status(400).send({ error: validate })
  else bandera = true
  const decoded = decodeToken(token)
  if(!decoded) return res.status(400).send({ error: 'Token not valid' })
  const { uuid } = decoded
  const newToken = bandera ? generateToken({ uuid }, '7d') : token
  if(!newToken) return res.status(500).send({ error: 'Error server' })
  return res.status(200).send({ token: newToken })
}