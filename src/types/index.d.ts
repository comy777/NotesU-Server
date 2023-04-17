export { }

declare global {
  namespace Express {
    interface Request {
      user: string
    }
  }

  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string
      PORT: string | number
      MONGO_URI: string
      SECRET_KEY: string
      CLOUDINARY_URL: string
      UPLOAD_PRESET: string
      PASSWORD_EMAIL: string
      API_FATICON: string
      ID_PACK: number
      URL_FATICON: string
      REFRESH_TOKEN_GOOGLE: string
      ACCESS_TOKEN_GOOGLE: string
      CLIENT_SECRET_GOOGLE: string
      CLIENT_ID_GOOGLE: string
    }
  }

}