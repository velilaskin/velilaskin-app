const { getStore } = require('@netlify/blobs')

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
    // Use a global store with a specific site ID to ensure persistence across all users
    const store = getStore('velilaskin-global-expenses')
    const key = 'shared-expenses-data'

    switch (event.httpMethod) {
      case 'GET':
        // Get all expenses
        const data = await store.get(key)
        const expenses = data ? JSON.parse(data) : []
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
        
        // Get existing expenses and add new one
        const existingData = await store.get(key)
        const existingExpenses = existingData ? JSON.parse(existingData) : []
        const updatedExpenses = [...existingExpenses, newExpense]
        
        await store.set(key, JSON.stringify(updatedExpenses))
        console.log('POST: Added expense, total now:', updatedExpenses.length)
        
        return {
          statusCode: 201,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(newExpense)
        }

      case 'DELETE':
        // Delete expense or clear all
        const { id, clearAll } = JSON.parse(event.body)
        
        if (clearAll) {
          await store.set(key, JSON.stringify([]))
          console.log('DELETE: Cleared all expenses')
          return {
            statusCode: 200,
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'All expenses cleared' })
          }
        } else {
          // Delete specific expense
          const existingData = await store.get(key)
          const existingExpenses = existingData ? JSON.parse(existingData) : []
          const filteredExpenses = existingExpenses.filter(expense => expense.id !== id)
          
          await store.set(key, JSON.stringify(filteredExpenses))
          console.log('DELETE: Removed expense, total now:', filteredExpenses.length)
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
    console.error('Function error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    }
  }
} 