import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { decodeToken, validateToken } from '../utils/jwt'
import { validateUserById } from '../utils/users'

export const validate = (req: Request, resp: Response, next: Function) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = errors.array().map((item) => item.msg)
    return resp.status(400).send({ error })
  }
  next()
}

export const validateTokenHeader = async (req: Request, res: Response, next: Function) => {
  const authorization = req.headers['authorization']
  const token = authorization ? authorization.replace('Bearer', '') : ''
  if (!token) return res.status(400).send({ error: "Token required" })
  const tokenTrim = token.trim()
  const validate = validateToken(tokenTrim)
  if(typeof validate === 'string') return res.status(400).send({ error: validate })
  const resp = decodeToken(tokenTrim)
  if(!resp) return res.status(400).send({ error: "Error" })
  const user = await validateUserById(resp.uuid)
  if(!user) return res.status(400).send({ error: 'The user is not register' })
  const { emailValidate } = user
  if(!emailValidate) return res.status(400).send({ error: 'Email not validate yet' })
  req.user = resp.uuid
  next()
}