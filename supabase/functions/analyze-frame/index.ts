import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { frameData, cameraId, cameraName } = await req.json();

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an AI safety monitor analyzing video frames for weapons, threats, and dangerous situations. Analyze the image carefully and respond ONLY with a JSON object containing: status ('safe', 'warning', or 'danger'), confidence (0-100), and description (brief explanation). Be VERY sensitive to detecting: knives, guns, weapons, threatening gestures, physical violence, or any dangerous objects. Even if partially visible, flag as 'danger' or 'warning'. Only return the JSON object, nothing else."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this video frame for ANY signs of: WEAPONS (knives, guns, blades, sharp objects), threats, aggressive behavior, or dangerous situations. Look VERY CAREFULLY for: knives (kitchen knives, pocket knives, any blades), guns, weapons of any kind, threatening hand gestures, physical aggression, distressed individuals, or intimidating behavior. If you see ANY weapon or potentially dangerous object, mark as 'danger' with high confidence."
              },
              {
                type: "image_url",
                image_url: {
                  url: frameData
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Rate limit exceeded",
          status: "safe",
          confidence: 0,
          description: "Rate limited"
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "Payment required",
          status: "safe",
          confidence: 0,
          description: "Payment required"
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log("AI Response:", aiResponse);

    // Parse the AI response
    let analysisResult;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback parsing
        analysisResult = {
          status: "safe",
          confidence: 0,
          description: aiResponse.substring(0, 200)
        };
      }
    } catch (parseError) {
      console.error("Parse error:", parseError);
      analysisResult = {
        status: "safe",
        confidence: 0,
        description: "Failed to parse AI response"
      };
    }

    return new Response(JSON.stringify({
      ...analysisResult,
      cameraId,
      cameraName,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-frame function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      status: "safe",
      confidence: 0,
      description: "Analysis error"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
