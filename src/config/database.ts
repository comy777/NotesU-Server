import mongoose from 'mongoose'

const dbConnection = async () => {
  try {
    const uri = process.env.MONGO_URI || ''
    const resp = await mongoose.connect(uri)
    await resp.set('strictQuery', true)
    console.log('Database connected')
  } catch (error) {
    console.log(error)
  }
}

export default dbConnection