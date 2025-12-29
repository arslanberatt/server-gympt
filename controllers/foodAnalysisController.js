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
    
    // Create Blob from buffer (Node.js 18+ has global Blob)
    // If Blob is not available, use Buffer directly
    let imageData;
    if (typeof Blob !== 'undefined') {
      imageData = new Blob([imageBuffer], { type: imageMimeType });
    } else {
      // Fallback: use buffer directly (Gradio might accept this)
      imageData = imageBuffer;
    }
    
    // Try to call the endpoint by name first (as shown in the example)
    let result;
    try {
      // Try with endpoint name as string (from the example)
      result = await client.predict("/gradio_vision_analyzer", {
        image_path: imageData
      });
    } catch (error) {
      // If that fails, try to get API info and use fn_index
      try {
        const apiInfo = await client.view_api();
        console.log('Gradio API info:', JSON.stringify(apiInfo, null, 2));
        
        // Find endpoint by name or use first available
        let fnIndex = 0;
        if (apiInfo && apiInfo.named_endpoints) {
          if (apiInfo.named_endpoints["/gradio_vision_analyzer"] !== undefined) {
            fnIndex = apiInfo.named_endpoints["/gradio_vision_analyzer"];
          } else {
            // Use first available endpoint
            const firstEndpoint = Object.values(apiInfo.named_endpoints)[0];
            fnIndex = firstEndpoint !== undefined ? firstEndpoint : 0;
          }
        }
        
        // Try with fn_index
        result = await client.predict(fnIndex, [imageData]);
      } catch (error2) {
        throw new Error(`Gradio API error: ${error2.message}. Original error: ${error.message}`);
      }
    }

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

