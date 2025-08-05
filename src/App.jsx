import React, { useState, useEffect } from 'react'
import './App.css'
import { api } from './api'

const App = () => {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    paidBy: 'P'
  })
  const [balances, setBalances] = useState({
    P: 0,
    S: 0,
    K: 0,
    J: 0
  })
  const [showTests, setShowTests] = useState(false)

  const participants = ['P', 'S', 'K', 'J']

  // Load expenses from server on app start
  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const data = await api.getExpenses()
        setExpenses(data)
      } catch (error) {
        console.error('Failed to load expenses:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadExpenses()
  }, [])

  // Calculate balances whenever expenses change
  useEffect(() => {
    const newBalances = { P: 0, S: 0, K: 0, J: 0 }
    
    expenses.forEach(expense => {
      const amount = parseFloat(expense.amount)
      const paidBy = expense.paidBy
      const splitAmount = amount / participants.length
      
      // Add the full amount to who paid
      newBalances[paidBy] += amount
      
      // Subtract the split amount from everyone
      participants.forEach(participant => {
        newBalances[participant] -= splitAmount
      })
    })
    
    setBalances(newBalances)
  }, [expenses])

  const handleAddExpense = async (e) => {
    e.preventDefault()
    if (!newExpense.description || !newExpense.amount) return
    
    try {
      const expenseData = {
        ...newExpense,
        amount: parseFloat(newExpense.amount)
      }
      
      const newExpenseData = await api.addExpense(expenseData)
      setExpenses([...expenses, newExpenseData])
      
      setNewExpense({
        description: '',
        amount: '',
        paidBy: 'P'
      })
    } catch (error) {
      console.error('Failed to add expense:', error)
      alert('Virhe kulun lisäämisessä. Yritä uudelleen.')
    }
  }

  const handleDeleteExpense = async (id) => {
    try {
      await api.deleteExpense(id)
      setExpenses(expenses.filter(expense => expense.id !== id))
    } catch (error) {
      console.error('Failed to delete expense:', error)
      alert('Virhe kulun poistamisessa. Yritä uudelleen.')
    }
  }

  const handleClearAll = async () => {
    if (window.confirm('Haluatko poistaa kaikki kulut? Tätä ei voi perua.')) {
      try {
        await api.clearAllExpenses()
        setExpenses([])
      } catch (error) {
        console.error('Failed to clear expenses:', error)
        alert('Virhe kulujen tyhjentämisessä. Yritä uudelleen.')
      }
    }
  }

  // Test scenarios
  const runTestScenario = (scenario) => {
    setExpenses(scenario.expenses)
  }

  const testScenarios = [
    {
      name: "Testi 1: Yksinkertainen jako",
      description: "P maksaa €100 kaikille",
      expenses: [
        { id: 1, description: "Ruoka", amount: 100, paidBy: "P" }
      ],
      expectedBalances: { P: 75, S: -25, K: -25, J: -25 },
      expectedSettlements: [
        { from: "S", to: "P", amount: "25.00" },
        { from: "K", to: "P", amount: "25.00" },
        { from: "J", to: "P", amount: "25.00" }
      ]
    },
    {
      name: "Testi 2: Useita kuluja",
      description: "P maksaa €100, S maksaa €50, K maksaa €25",
      expenses: [
        { id: 1, description: "Ruoka", amount: 100, paidBy: "P" },
        { id: 2, description: "Polttoaine", amount: 50, paidBy: "S" },
        { id: 3, description: "Olut", amount: 25, paidBy: "K" }
      ],
      expectedBalances: { P: 56.25, S: 6.25, K: -18.75, J: -43.75 },
      expectedSettlements: [
        { from: "J", to: "P", amount: "43.75" },
        { from: "K", to: "P", amount: "12.50" },
        { from: "K", to: "S", amount: "6.25" }
      ]
    },
    {
      name: "Testi 3: Monimutkainen tapaus",
      description: "Sekalaisia maksuja desimaaleilla",
      expenses: [
        { id: 1, description: "Ruoka", amount: 87.50, paidBy: "P" },
        { id: 2, description: "Taksi", amount: 32.40, paidBy: "S" },
        { id: 3, description: "Kahvi", amount: 12.60, paidBy: "K" },
        { id: 4, description: "Naposteltavat", amount: 8.50, paidBy: "J" }
      ],
      expectedBalances: { P: 52.25, S: -2.85, K: -22.65, J: -26.75 },
      expectedSettlements: [
        { from: "J", to: "P", amount: "26.75" },
        { from: "K", to: "P", amount: "22.65" },
        { from: "S", to: "P", amount: "2.85" }
      ]
    },
    {
      name: "Testi 4: Nollasaldo",
      description: "Kaikki maksavat yhtä paljon",
      expenses: [
        { id: 1, description: "Tasainen jako", amount: 100, paidBy: "P" },
        { id: 2, description: "Tasainen jako", amount: 100, paidBy: "S" },
        { id: 3, description: "Tasainen jako", amount: 100, paidBy: "K" },
        { id: 4, description: "Tasainen jako", amount: 100, paidBy: "J" }
      ],
      expectedBalances: { P: 0, S: 0, K: 0, J: 0 },
      expectedSettlements: []
    }
  ]

  const getSettlementSuggestions = () => {
    const suggestions = []
    const balancesCopy = { ...balances }
    
    // Find who owes money and who is owed money
    let debtors = Object.entries(balancesCopy)
      .filter(([_, balance]) => balance < 0)
      .sort((a, b) => a[1] - b[1])
    
    let creditors = Object.entries(balancesCopy)
      .filter(([_, balance]) => balance > 0)
      .sort((a, b) => b[1] - a[1])
    
    while (debtors.length > 0 && creditors.length > 0) {
      const [debtor, debtAmount] = debtors[0]
      const [creditor, creditAmount] = creditors[0]
      
      const amount = Math.min(Math.abs(debtAmount), creditAmount)
      
      if (amount > 0.01) { // Only show if amount is significant
        suggestions.push({
          from: debtor,
          to: creditor,
          amount: amount.toFixed(2)
        })
        
        // Update the balances after this settlement
        balancesCopy[debtor] += amount
        balancesCopy[creditor] -= amount
        
        // Re-sort the arrays based on updated balances
        debtors = Object.entries(balancesCopy)
          .filter(([_, balance]) => balance < 0)
          .sort((a, b) => a[1] - b[1])
        
        creditors = Object.entries(balancesCopy)
          .filter(([_, balance]) => balance > 0)
          .sort((a, b) => b[1] - a[1])
      } else {
        // Remove the smallest debt/credit if no significant amount
        if (Math.abs(debtAmount) <= creditAmount) {
          debtors.shift()
        } else {
          creditors.shift()
        }
      }
    }
    
    return suggestions
  }

  const verifyTestScenario = (scenario) => {
    const currentSettlements = getSettlementSuggestions()
    const balanceCorrect = Object.keys(scenario.expectedBalances).every(
      person => Math.abs(balances[person] - scenario.expectedBalances[person]) < 0.01
    )
    
    const settlementsCorrect = currentSettlements.length === scenario.expectedSettlements.length &&
      currentSettlements.every((settlement, index) => {
        const expected = scenario.expectedSettlements[index]
        return settlement.from === expected.from &&
               settlement.to === expected.to &&
               settlement.amount === expected.amount
      })
    
    return { balanceCorrect, settlementsCorrect }
  }

  return (
    <div className="app">
      <div className="header">
        <div className="header-content">
          <div className="hero-section">
            <div className="hero-text">
              <h1>⛵ Velilaskin</h1>
              <p>Jaa kulut merimiesten kesken</p>
            </div>
            <div className="hero-image">
              <div className="sailing-placeholder">
                <div className="boat">
                  <div className="hull"></div>
                  <div className="mast"></div>
                  <div className="sail"></div>
                </div>
                <div className="waves">
                  <div className="wave wave-1"></div>
                  <div className="wave wave-2"></div>
                  <div className="wave wave-3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="wave-decoration"></div>
      </div>

      <div className="container">
        <div className="main-content">
          {/* Add Expense Form */}
          <div className="expense-form">
            <h2>Lisää uusi kulu</h2>
            <p className="form-subtitle">Kirjaa kulu ja kuka maksoi</p>
            <form onSubmit={handleAddExpense}>
              <div className="form-group">
                <label htmlFor="description">Kuvaus</label>
                <input
                  type="text"
                  id="description"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  placeholder="esim. Ruoka, Polttoaine, jne."
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="amount">Summa (€)</label>
                <input
                  type="number"
                  id="amount"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Kuka maksoi?</label>
                <div className="participant-selector">
                  {participants.map(participant => (
                    <button
                      key={participant}
                      type="button"
                      className={`participant-button ${newExpense.paidBy === participant ? 'selected' : ''}`}
                      onClick={() => setNewExpense({...newExpense, paidBy: participant})}
                    >
                      {participant}
                    </button>
                  ))}
                </div>
              </div>
              
              <button type="submit" className="add-button">
                Kirjaa kulu
              </button>
            </form>
          </div>

          {/* Expenses List */}
          <div className="expenses-section">
            <div className="expenses-header">
              <h2>Kululista</h2>
              {expenses.length > 0 && (
                <button 
                  onClick={handleClearAll}
                  className="clear-all-button"
                  title="Poista kaikki kulut"
                >
                  Tyhjennä kaikki
                </button>
              )}
            </div>
            {loading ? (
              <div className="loading-state">
                <p>Ladataan kuluja...</p>
              </div>
            ) : expenses.length === 0 ? (
              <div className="empty-state">
                <p>Ei vielä kuluja. Kirjaa ensimmäinen kulu yllä!</p>
              </div>
            ) : (
              <>
                <div className="expenses-total">
                  <span className="total-label">Yhteensä:</span>
                  <span className="total-amount">€{expenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}</span>
                </div>
                <div className="expenses-list">
                  {expenses.map(expense => (
                    <div key={expense.id} className="expense-item">
                      <div className="expense-info">
                        <h3>{expense.description}</h3>
                        <p className="expense-amount">€{expense.amount.toFixed(2)}</p>
                        <p className="expense-payer">Maksoi {expense.paidBy}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="delete-button"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Balances */}
          <div className="balances-section">
            <h2>Merisaldot</h2>
            <div className="balances-grid">
              {participants.map(participant => (
                <div key={participant} className={`balance-card ${balances[participant] > 0 ? 'positive' : balances[participant] < 0 ? 'negative' : 'neutral'}`}>
                  <h3>{participant}</h3>
                  <p className="balance-amount">
                    €{balances[participant].toFixed(2)}
                  </p>
                  <p className="balance-status">
                    {balances[participant] > 0 ? 'Plussalla' : balances[participant] < 0 ? 'Pakkasella' : 'Tasattu'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Settlement Suggestions */}
          {getSettlementSuggestions().length > 0 && (
            <div className="settlement-section">
              <h2>Maksuehdotukset</h2>
              <p className="settlement-subtitle">Tasaa velat merimiesmeiningeissä</p>
              <div className="settlement-list">
                {getSettlementSuggestions().map((suggestion, index) => (
                  <div key={index} className="settlement-item">
                    <span className="settlement-from">{suggestion.from}</span>
                    <span className="settlement-arrow">→</span>
                    <span className="settlement-to">{suggestion.to}</span>
                    <span className="settlement-amount">€{suggestion.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test Scenarios */}
          <div className="test-section">
            <h2>Testitapaukset</h2>
            <button 
              onClick={() => setShowTests(!showTests)}
              className="test-toggle-button"
            >
              {showTests ? 'Piilota' : 'Näytä'} testitapaukset
            </button>
            
            {showTests && (
              <div className="test-scenarios">
                {testScenarios.map((scenario, index) => {
                  const verification = verifyTestScenario(scenario)
                  return (
                    <div key={index} className="test-scenario">
                      <h3>{scenario.name}</h3>
                      <p>{scenario.description}</p>
                      <div className="test-buttons">
                        <button 
                          onClick={() => runTestScenario(scenario)}
                          className="run-test-button"
                        >
                          Suorita testi
                        </button>
                        <div className="test-results">
                          <span className={`test-result ${verification.balanceCorrect ? 'pass' : 'fail'}`}>
                            Saldot: {verification.balanceCorrect ? '✅' : '❌'}
                          </span>
                          <span className={`test-result ${verification.settlementsCorrect ? 'pass' : 'fail'}`}>
                            Maksut: {verification.settlementsCorrect ? '✅' : '❌'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App 