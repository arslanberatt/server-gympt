// Gradio Chat API endpoint
const GRADIO_API_URL = process.env.GRADIO_API_URL;
const Conversation = require('../models/Conversation');

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
    const { message, conversationId } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        message: 'Message is required' 
      });
    }

    const userId = req.user._id;
    let conversation;

    // If conversationId provided, find existing conversation
    if (conversationId) {
      conversation = await Conversation.findOne({
        _id: conversationId,
        user: userId
      });

      if (!conversation) {
        return res.status(404).json({ 
          message: 'Conversation not found' 
        });
      }
    } else {
      // Create new conversation
      conversation = await Conversation.create({
        user: userId,
        messages: [],
        title: message.substring(0, 50) // First 50 chars as title
      });
    }

    // Add user message to conversation
    conversation.messages.push({
      role: 'user',
      content: message
    });

    // Connect to Gradio client
    const client = await Client.connect(GRADIO_API_URL);
    
    // Call chat endpoint
    const result = await client.predict("/chat", {
      message: message
    });

    // Get the response data
    const chatResponse = result.data && result.data[0] ? result.data[0] : result.data;
    const aiResponse = typeof chatResponse === 'string' ? chatResponse : JSON.stringify(chatResponse);

    // Add AI response to conversation
    conversation.messages.push({
      role: 'assistant',
      content: aiResponse
    });

    // Save conversation
    await conversation.save();

    // Return the chat response with conversation ID
    res.status(200).json({
      success: true,
      conversationId: conversation._id,
      message: aiResponse,
      userMessage: message
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      message: 'Failed to process chat message',
      error: error.message 
    });
  }
};

// Get conversation history
module.exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.query;

    if (conversationId) {
      // Get specific conversation
      const conversation = await Conversation.findOne({
        _id: conversationId,
        user: userId
      });

      if (!conversation) {
        return res.status(404).json({ 
          message: 'Conversation not found' 
        });
      }

      return res.status(200).json({
        success: true,
        conversation: {
          id: conversation._id,
          title: conversation.title,
          messages: conversation.messages,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt
        }
      });
    } else {
      // Get all conversations for user
      const conversations = await Conversation.find({ user: userId })
        .select('title messages createdAt updatedAt')
        .sort({ updatedAt: -1 })
        .limit(50);

      return res.status(200).json({
        success: true,
        conversations: conversations.map(conv => ({
          id: conv._id,
          title: conv.title,
          messageCount: conv.messages.length,
          lastMessage: conv.messages.length > 0 ? conv.messages[conv.messages.length - 1].content.substring(0, 100) : '',
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt
        }))
      });
    }
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ 
      message: 'Failed to get conversations',
      error: error.message 
    });
  }
};

// Delete conversation
module.exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findOneAndDelete({
      _id: conversationId,
      user: userId
    });

    if (!conversation) {
      return res.status(404).json({ 
        message: 'Conversation not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ 
      message: 'Failed to delete conversation',
      error: error.message 
    });
  }
};

