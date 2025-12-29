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
    
    // Find the endpoint that accepts image_path
    let fnIndex = 0; // Default to first endpoint
    if (apiInfo && apiInfo.named_endpoints) {
      // Try to find endpoint by name
      const endpointName = Object.keys(apiInfo.named_endpoints).find(
        name => name.includes('vision') || name.includes('analyzer')
      );
      if (endpointName) {
        fnIndex = apiInfo.named_endpoints[endpointName];
      }
    }
    
    // Convert buffer to base64 data URL for Gradio
    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:${imageMimeType};base64,${base64Image}`;
    
    // Call Gradio API
    // Gradio expects the image as a data URL or file path
    const result = await client.predict(fnIndex, [dataUrl]);

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

