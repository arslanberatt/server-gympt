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
    
    // Get endpoint info to understand parameter structure
    const endpointInfo = apiInfo.named_endpoints[endpointName];
    console.log('Endpoint info:', JSON.stringify(endpointInfo, null, 2));
    
    // Check parameter name from API info
    const parameters = endpointInfo?.parameters || [];
    console.log('Parameters:', JSON.stringify(parameters, null, 2));
    
    // Find the image parameter name
    const imageParam = parameters.find(p => 
      p.component === "Image" || 
      p.parameter_name === "image_path" || 
      p.parameter_name === "image"
    );
    
    const paramName = imageParam?.parameter_name || "image_path";
    console.log('Using parameter name:', paramName);
    
    // Gradio client expects Buffer, Blob, or File directly for image parameters
    // Try sending the Buffer directly first
    let result;
    try {
      // Try with Buffer directly (array format - positional parameters)
      result = await client.predict(endpointName, [imageBuffer]);
    } catch (error1) {
      console.log('Buffer format failed, trying data URL format...');
      try {
        // Try with data URL string
        const base64Image = imageBuffer.toString('base64');
        const dataUrl = `data:${imageMimeType};base64,${base64Image}`;
        result = await client.predict(endpointName, [dataUrl]);
      } catch (error2) {
        console.log('Data URL format failed, trying object format...');
        // Try with object format as per API documentation
        const base64Image = imageBuffer.toString('base64');
        const dataUrl = `data:${imageMimeType};base64,${base64Image}`;
        const imageData = {
          url: dataUrl,
          meta: {
            _type: "gradio.FileData"
          },
          orig_name: req.file?.originalname || "image.jpg"
        };
        // Try object format with named parameter
        result = await client.predict(endpointName, {
          [paramName]: imageData
        });
      }
    }

    // Gradio returns data in result.data array, get the first element (JSON output)
    let analysisResult = result.data && result.data[0] ? result.data[0] : result.data;
    
    // If result is a string, parse it
    if (typeof analysisResult === 'string') {
      try {
        analysisResult = JSON.parse(analysisResult);
      } catch (e) {
        // If parsing fails, return as is
      }
    }
    
    // Format the response nicely
    const formattedResponse = {
      success: true,
      analysis: {
        foods: analysisResult.plate_analysis || [],
        totals: analysisResult.total_macros || {}
      },
      summary: {
        totalFoods: (analysisResult.plate_analysis || []).length,
        totalCalories: analysisResult.total_macros?.calories || 0,
        totalProtein: analysisResult.total_macros?.protein || 0,
        totalCarbs: analysisResult.total_macros?.carb || 0,
        totalFat: analysisResult.total_macros?.fat || 0
      }
    };

    // Return the formatted response
    res.status(200).json(formattedResponse);

  } catch (error) {
    console.error('Food analysis error:', error);
    res.status(500).json({ 
      message: 'Failed to analyze food image',
      error: error.message 
    });
  }
};

