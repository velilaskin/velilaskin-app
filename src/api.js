const API_BASE = process.env.NODE_ENV === 'production' 
  ? '/.netlify/functions/expenses-global'
  : 'http://localhost:8888/.netlify/functions/expenses-global'

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
        throw new Error('Failed to fetch expenses')
      }
      
      return await response.json()
    } catch (error) {
      console.error('API Error:', error)
      // Fallback to localStorage if server is unavailable
      const savedExpenses = localStorage.getItem('velilaskin-expenses')
      return savedExpenses ? JSON.parse(savedExpenses) : []
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
        throw new Error('Failed to add expense')
      }
      
      return await response.json()
    } catch (error) {
      console.error('API Error:', error)
      // Fallback to localStorage
      const savedExpenses = localStorage.getItem('velilaskin-expenses')
      const expenses = savedExpenses ? JSON.parse(savedExpenses) : []
      const newExpense = { ...expense, id: Date.now() }
      expenses.push(newExpense)
      localStorage.setItem('velilaskin-expenses', JSON.stringify(expenses))
      return newExpense
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
        throw new Error('Failed to delete expense')
      }
      
      return await response.json()
    } catch (error) {
      console.error('API Error:', error)
      // Fallback to localStorage
      const savedExpenses = localStorage.getItem('velilaskin-expenses')
      const expenses = savedExpenses ? JSON.parse(savedExpenses) : []
      const filteredExpenses = expenses.filter(expense => expense.id !== id)
      localStorage.setItem('velilaskin-expenses', JSON.stringify(filteredExpenses))
      return { message: 'Expense deleted' }
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
        throw new Error('Failed to clear expenses')
      }
      
      return await response.json()
    } catch (error) {
      console.error('API Error:', error)
      // Fallback to localStorage
      localStorage.removeItem('velilaskin-expenses')
      return { message: 'All expenses cleared' }
    }
  }
} 