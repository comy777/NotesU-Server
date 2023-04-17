import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import path from 'path'
import cookieParser from 'cookie-parser'
import { AppRoutes } from '../interfaces/interfaces'
import { authRoutes, categories, routes, users } from '../router/routes'
import dbConnection from './database'

class Server {
  app: express.Application
  port: string | number
  path: AppRoutes

  constructor() {
    this.port = process.env.PORT
    this.app = express()
    this.path = {
      home: '/home',
      auth: '/auth',
      users: '/users',
      categories: '/categories'
    }
    this.handleBars()
    this.middlewares()
    this.db()
    this.routes()
  }

  private publicFolder() {
    const publicPath = path.resolve(__dirname, "../public");
    this.app.use(express.static(publicPath));
  }

  private middlewares() {
    this.app.use(cookieParser())
    this.app.use(cors());
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: false }))
    this.app.use(morgan('dev'))
    this.publicFolder()
  }

  public startServer() {
    this.app.listen(this.port, () => {
      console.log(`Server on port: ${this.port}`)
    })
  }

  private routes() {
    this.app.use(this.path.auth, authRoutes)
    this.app.use(this.path.home, routes)
    this.app.use(this.path.users, users)
    this.app.use(this.path.categories, categories)
  }

  private async db() {
    await dbConnection()
  }

  private handleBars(){
    const pathViews = path.join(__dirname, '../views')
    this.app.set('views', pathViews)
    this.app.set('view engine', 'pug')
  }
}

export default Server