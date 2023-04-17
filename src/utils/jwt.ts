import jwt from 'jsonwebtoken'
import { DecodedToken, PayloadToken } from '../interfaces/interfaces'

const secret = process.env.SECRET_KEY

export const generateToken = (payload: PayloadToken, expiresIn: string): string | undefined => {
  try {
    return jwt.sign(payload, secret, { expiresIn })
  } catch (error) {
    console.log(error)
  }
}

export const validateToken = (token: string): DecodedToken | string => {
  let response : DecodedToken | string = ''
  jwt.verify(token, secret, (err, decoded) => {
    if(err) {
      response = err.message
      return 
    }
    response = decoded as DecodedToken
  })
  return response
}

export const decodeToken = (token: string) : PayloadToken | undefined => {
  try {
    return jwt.decode(token) as PayloadToken | undefined
  } catch (error) {
    console.log(error)
  }
}