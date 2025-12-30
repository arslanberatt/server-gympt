// Gradio Chat API endpoint
const GRADIO_API_URL = process.env.GRADIO_API_URL;

// Chat with AI
module.exports.chat = async (req, res) => {
  try {
    // Check GRADIO_API_URL
    if (!GRADIO_API_URL) {
      return res.status(500).json({ 
        message: 'GRADIO_API_URL environment variable is not set' 
      });
    }

    // Dynamic import for ES Module
    const { Client } = await import("@gradio/client");

    // Check if message is provided
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        message: 'Message is required' 
      });
    }

    // Connect to Gradio client
    const client = await Client.connect(GRADIO_API_URL);
    
    // Call chat endpoint
    const result = await client.predict("/chat", {
      message: message
    });

    // Get the response data
    const chatResponse = result.data && result.data[0] ? result.data[0] : result.data;

    // Return the chat response
    res.status(200).json({
      success: true,
      message: chatResponse
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      message: 'Failed to process chat message',
      error: error.message 
    });
  }
};

