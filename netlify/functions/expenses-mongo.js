const { MongoClient } = require('mongodb')

// MongoDB connection string (you'll need to set this in Netlify environment variables)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/velilaskin'
const DB_NAME = 'velilaskin'
const COLLECTION_NAME = 'expenses'

// API key for secure operations
const API_KEY = 'velilaskin-secret-key-2025'

let client = null

async function getClient() {
  if (!client) {
    client = new MongoClient(MONGODB_URI)
    await client.connect()
  }
  return client
}

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
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

  // Check API key for all requests except GET
  if (event.httpMethod !== 'GET') {
    const apiKey = event.headers['x-api-key'] || event.headers['X-API-Key']
    
    if (!apiKey || apiKey !== API_KEY) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized - Invalid API key' })
      }
    }
  }

  try {
    const mongoClient = await getClient()
    const db = mongoClient.db(DB_NAME)
    const collection = db.collection(COLLECTION_NAME)

    console.log('MongoDB function called:', event.httpMethod)

    switch (event.httpMethod) {
      case 'GET':
        // Get all expenses
        const expenses = await collection.find({}).sort({ createdAt: 1 }).toArray()
        console.log('GET: Retrieved', expenses.length, 'expenses from MongoDB')
        return {
          statusCode: 200,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(expenses)
        }

      case 'POST':
        // Add new expense
        const newExpense = JSON.parse(event.body)
        newExpense.id = Date.now()
        newExpense.createdAt = new Date().toISOString()
        
        await collection.insertOne(newExpense)
        console.log('POST: Added expense to MongoDB')
        
        return {
          statusCode: 201,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(newExpense)
        }

      case 'DELETE':
        // Delete expense or clear all
        const { id, clearAll } = JSON.parse(event.body)
        
        if (clearAll) {
          await collection.deleteMany({})
          console.log('DELETE: Cleared all expenses from MongoDB')
          return {
            statusCode: 200,
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'All expenses cleared' })
          }
        } else {
          await collection.deleteOne({ id })
          console.log('DELETE: Removed expense from MongoDB')
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
    console.error('MongoDB function error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    }
  }
} 