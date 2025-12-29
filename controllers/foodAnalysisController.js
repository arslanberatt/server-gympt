// Gradio API endpoint
const GRADIO_API_URL = process.env.GRADIO_API_URL;

// Analyze food image
module.exports.analyzeFood = async (req, res) => {
  try {
    // Dynamic import for ES Module
    const { Client } = await import("@gradio/client");

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
    
    // Get API info to find the correct endpoint
    const apiInfo = await client.view_api();
    console.log('Gradio API info:', JSON.stringify(apiInfo, null, 2));
    
    // Find endpoint by name "/gradio_vision_analyzer" or use fn_index
    let endpointIdentifier;
    if (apiInfo && apiInfo.named_endpoints && apiInfo.named_endpoints["/gradio_vision_analyzer"] !== undefined) {
      endpointIdentifier = apiInfo.named_endpoints["/gradio_vision_analyzer"];
    } else if (apiInfo && apiInfo.named_endpoints) {
      // Try to find any endpoint that might work
      const firstEndpoint = Object.values(apiInfo.named_endpoints)[0];
      endpointIdentifier = firstEndpoint !== undefined ? firstEndpoint : 0;
    } else {
      endpointIdentifier = 0; // Default to first endpoint
    }
    
    // Create a File-like object from buffer for Gradio
    // Gradio client accepts Buffer, File, or Blob
    // Convert buffer to a format Gradio can understand
    const imageBlob = new Blob([imageBuffer], { type: imageMimeType });
    
    // Call Gradio API with the endpoint identifier
    // According to the example, it should be called with image_path parameter
    const result = await client.predict(endpointIdentifier, {
      image_path: imageBlob
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

