const API_BASE = process.env.NODE_ENV === 'production' 
  ? '/.netlify/functions/expenses-simple'
  : 'http://localhost:8888/.netlify/functions/expenses-simple'

export const api = {
  async getExpenses() {
    try {
      const response = await fetch(API_BASE, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch expenses: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Fetched expenses from server:', data.length)
      return data
    } catch (error) {
      console.error('API Error:', error)
      throw new Error('Failed to load expenses from server. Please try again.')
    }
  },

  async addExpense(expense) {
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expense),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to add expense: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Added expense to server:', data)
      return data
    } catch (error) {
      console.error('API Error:', error)
      throw new Error('Failed to add expense to server. Please try again.')
    }
  },

  async deleteExpense(id) {
    try {
      const response = await fetch(API_BASE, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to delete expense: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Deleted expense from server:', data)
      return data
    } catch (error) {
      console.error('API Error:', error)
      throw new Error('Failed to delete expense from server. Please try again.')
    }
  },

  async clearAllExpenses() {
    try {
      const response = await fetch(API_BASE, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clearAll: true }),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to clear expenses: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Cleared all expenses from server:', data)
      return data
    } catch (error) {
      console.error('API Error:', error)
      throw new Error('Failed to clear expenses from server. Please try again.')
    }
  }
} 