const { Client } = require("@gradio/client");

// Gradio API endpoint
const GRADIO_API_URL = "https://363bcf6885b67a2d84.gradio.live/";

// Analyze food image
module.exports.analyzeFood = async (req, res) => {
  try {
    // Check if image is provided
    if (!req.file && !req.body.image_url) {
      return res.status(400).json({ 
        message: 'Image file or image_url is required' 
      });
    }

    let imageBuffer;
    let imageMimeType = 'image/jpeg';

    // If image file is uploaded
    if (req.file) {
      imageBuffer = req.file.buffer;
      imageMimeType = req.file.mimetype;
    } 
    // If image URL is provided
    else if (req.body.image_url) {
      try {
        const imageResponse = await fetch(req.body.image_url);
        if (!imageResponse.ok) {
          return res.status(400).json({ 
            message: 'Failed to fetch image from URL' 
          });
        }
        const arrayBuffer = await imageResponse.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
        imageMimeType = imageResponse.headers.get('content-type') || 'image/jpeg';
      } catch (error) {
        return res.status(400).json({ 
          message: 'Invalid image URL' 
        });
      }
    }

    // Connect to Gradio client
    const client = await Client.connect(GRADIO_API_URL);
    
    // Create File-like object from buffer for Gradio client
    // Gradio client accepts Buffer, File, or Blob
    const imageFile = {
      name: req.file?.originalname || 'image.jpg',
      data: imageBuffer,
      type: imageMimeType
    };
    
    // Call Gradio API
    const result = await client.predict("/gradio_vision_analyzer", {
      image_path: imageBuffer // Buffer olarak gönder
    });

    // Return the analysis result
    res.status(200).json({
      message: 'Food analysis completed successfully',
      data: result.data
    });

  } catch (error) {
    console.error('Food analysis error:', error);
    res.status(500).json({ 
      message: 'Failed to analyze food image',
      error: error.message 
    });
  }
};

