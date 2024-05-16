const mongoose = require ("mongoose")

const connectionMongoDB = async () => {
  try {
      await mongoose.connect(
        "mongodb://127.0.0.1:27017/websocket"
      )
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}