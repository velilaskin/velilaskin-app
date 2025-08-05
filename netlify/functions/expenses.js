const { MongoClient } = require('mongodb')
const { ObjectId } = require('mongodb')

// MongoDB connection (using MongoDB Atlas free tier)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://your-connection-string'

let cachedDb = null

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb
  }
  
  const client = await MongoClient.connect(MONGODB_URI)
  const db = client.db('velilaskin')
  cachedDb = db
  return db
}

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  }

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  try {
    const db = await connectToDatabase()
    const collection = db.collection('expenses')

    switch (event.httpMethod) {
      case 'GET':
        // Get all expenses
        const expenses = await collection.find({}).toArray()
        return {
          statusCode: 200,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(expenses)
        }

      case 'POST':
        // Add new expense
        const newExpense = JSON.parse(event.body)
        newExpense.createdAt = new Date()
        const result = await collection.insertOne(newExpense)
        return {
          statusCode: 201,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: result.insertedId, ...newExpense })
        }

      case 'DELETE':
        // Delete expense or clear all
        const { id, clearAll } = JSON.parse(event.body)
        
        if (clearAll) {
          await collection.deleteMany({})
          return {
            statusCode: 200,
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'All expenses cleared' })
          }
        } else {
          await collection.deleteOne({ _id: new ObjectId(id) })
          return {
            statusCode: 200,
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Expense deleted' })
          }
        }

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        }
    }
  } catch (error) {
    console.error('Database error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
} 