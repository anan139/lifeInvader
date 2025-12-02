import mongoose from "mongoose"

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI
    if (!uri) throw new Error('MONGODB_URI is not defined in environment')

    mongoose.connection.on('connected', () => console.log('Database connected'))
    mongoose.connection.on('error', (err) => console.error('Mongoose connection error:', err))

    await mongoose.connect(uri)
  } catch (error) {
    console.error('Database connection error:', error.message)
    process.exit(1)
  }
}

export default connectDB