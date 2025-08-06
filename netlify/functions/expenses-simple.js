// Simple in-memory storage (will reset on function restart, but good for testing)
let expenses = []

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
    console.log('Simple function called:', event.httpMethod)

    switch (event.httpMethod) {
      case 'GET':
        // Get all expenses
        console.log('GET: Retrieved', expenses.length, 'expenses')
        return {
          statusCode: 200,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(expenses)
        }

      case 'POST':
        // Add new expense
        const newExpense = JSON.parse(event.body)
        newExpense.id = Date.now() // Simple ID generation
        newExpense.createdAt = new Date().toISOString()
        
        expenses.push(newExpense)
        console.log('POST: Added expense, total now:', expenses.length)
        
        return {
          statusCode: 201,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(newExpense)
        }

      case 'DELETE':
        // Delete expense or clear all
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
          // Delete specific expense
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
    console.error('Simple function error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    }
  }
} 