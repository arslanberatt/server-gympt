// Gradio API endpoint
const GRADIO_API_URL = process.env.GRADIO_API_URL;

// Analyze food image
module.exports.analyzeFood = async (req, res) => {
  try {
    // Check GRADIO_API_URL
    if (!GRADIO_API_URL) {
      return res.status(500).json({ 
        message: 'GRADIO_API_URL environment variable is not set' 
      });
    }

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
    
    // Find endpoint name (string format required)
    let endpointName = "/full_ai_nutrition_analyzer"; // Default endpoint name
    if (apiInfo && apiInfo.named_endpoints) {
      // Check if "/full_ai_nutrition_analyzer" exists
      if (apiInfo.named_endpoints["/full_ai_nutrition_analyzer"] !== undefined) {
        endpointName = "/full_ai_nutrition_analyzer";
      } else {
        // Use first available endpoint name
        const endpointNames = Object.keys(apiInfo.named_endpoints);
        if (endpointNames.length > 0) {
          endpointName = endpointNames[0];
        }
      }
    }
    
    console.log('Using endpoint name:', endpointName);
    
    // Convert buffer to base64 data URL
    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:${imageMimeType};base64,${base64Image}`;
    
    // According to API info, image_path expects an object with url or path
    // Format: { path: string, url: string, meta: {...}, orig_name: string }
    const imageData = {
      url: dataUrl,
      meta: {
        _type: "gradio.FileData"
      },
      orig_name: req.file?.originalname || "image.jpg"
    };
    
    // Call Gradio API with endpoint name as string
    const result = await client.predict(endpointName, {
      image_path: imageData
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

