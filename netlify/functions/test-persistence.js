const { getStore } = require('@netlify/blobs')

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  try {
    const store = getStore('velilaskin-global-expenses')
    const key = 'shared-expenses-data'

    if (event.httpMethod === 'GET') {
      const data = await store.get(key)
      const expenses = data ? JSON.parse(data) : []
      
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Persistence test',
          expenseCount: expenses.length,
          expenses: expenses,
          timestamp: new Date().toISOString()
        })
      }
    }

    if (event.httpMethod === 'POST') {
      const testData = {
        id: Date.now(),
        description: 'Test expense',
        amount: 10,
        paidBy: 'P',
        createdAt: new Date().toISOString()
      }

      const existingData = await store.get(key)
      const existingExpenses = existingData ? JSON.parse(existingData) : []
      const updatedExpenses = [...existingExpenses, testData]
      
      await store.set(key, JSON.stringify(updatedExpenses))
      
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Test expense added',
          totalExpenses: updatedExpenses.length,
          testExpense: testData
        })
      }
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Test function error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Test function error', details: error.message })
    }
  }
} 