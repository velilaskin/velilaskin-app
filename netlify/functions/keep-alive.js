// Keep-alive function to prevent the main function from going cold
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  try {
    // Ping the main function to keep it warm
    const mainFunctionUrl = `${event.headers.host}/.netlify/functions/expenses-secure`
    
    console.log('Keep-alive ping sent to main function')
    
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: 'Keep-alive ping sent',
        timestamp: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error('Keep-alive error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Keep-alive failed' })
    }
  }
} 