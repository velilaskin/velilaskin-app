// Simple in-memory storage with API key protection
let expenses = []
let lastActivity = Date.now()

// Simple API key (in production, use environment variables)
const API_KEY = 'velilaskin-secret-key-2025'

// Keep-alive mechanism to prevent function from going cold
function updateActivity() {
  lastActivity = Date.now()
  console.log('Function activity updated:', new Date(lastActivity).toISOString())
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
    updateActivity() // Keep function warm
    console.log('Secure function called:', event.httpMethod, 'Total expenses:', expenses.length)

    switch (event.httpMethod) {
      case 'GET':
        // Get all expenses (no auth required for reading)
        console.log('GET: Retrieved', expenses.length, 'expenses')
        return {
          statusCode: 200,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(expenses)
        }

      case 'POST':
        // Add new expense (requires API key)
        const newExpense = JSON.parse(event.body)
        newExpense.id = Date.now()
        newExpense.createdAt = new Date().toISOString()
        
        expenses.push(newExpense)
        console.log('POST: Added expense, total now:', expenses.length)
        
        return {
          statusCode: 201,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(newExpense)
        }

      case 'DELETE':
        // Delete expense or clear all (requires API key)
        const { id, clearAll } = JSON.parse(event.body)
        
        if (clearAll) {
          expenses = []
          console.log('DELETE: Cleared all expenses')
          return {
            statusCode: 200,
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'All expenses cleared' })
          }
        } else {
          expenses = expenses.filter(expense => expense.id !== id)
          console.log('DELETE: Removed expense, total now:', expenses.length)
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
    console.error('Secure function error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    }
  }
} 