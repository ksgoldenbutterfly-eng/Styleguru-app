import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { outfitAnalysisSchema, outfitAnalysisResponseSchema } from '../schemas';
import { createUserClient, supabaseAdmin } from '../config/supabase';
import { genAI, modelName, SYSTEM_INSTRUCTION } from '../config/gemini';
import { upload, handleMulterError } from '../middleware/upload';
import { v4 as uuidv4 } from 'uuid';

export const analysisRouter = Router();

// POST /api/v1/analysis/outfit
analysisRouter.post(
  '/outfit',
  authenticate,
  upload.single('image'),
  handleMulterError,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No image file provided' });
        return;
      }

      const parsed = outfitAnalysisSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
        return;
      }

      // Upload image to Supabase storage
      const ext = req.file.originalname.split('.').pop();
      const path = `outfit-analysis/${req.userId}/${uuidv4()}.${ext}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from('wardrobe-images')
        .upload(path, req.file.buffer, { contentType: req.file.mimetype });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('wardrobe-images')
        .getPublicUrl(path);

      // Convert image to base64 for Gemini
      const base64Image = req.file.buffer.toString('base64');

      const prompt = `${SYSTEM_INSTRUCTION}

Analyze this outfit image and provide detailed fashion feedback.
${parsed.data.notes ? `User notes: ${parsed.data.notes}` : ''}

Respond ONLY with valid JSON matching this exact schema:
{
  "overall_feedback": "string description of the outfit",
  "color_combination": "string analysis of colors",
  "style": "string identifying the style",
  "occasion": "string suggesting suitable occasion",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "rating": 8
}

The rating should be between 1 and 10.`;

      const result = await genAI.models.generateContent({
        model: modelName,
        contents: [{
          role: 'user',
          parts: [
            { text: prompt },
            { inlineData: { mimeType: req.file.mimetype, data: base64Image } }
          ]
        }],
        config: { responseMimeType: 'application/json' },
      });

      const responseText = result.text || '';
      let aiResponse;
      try {
        aiResponse = JSON.parse(responseText);
      } catch {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiResponse = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Invalid AI response format');
        }
      }

      const validated = outfitAnalysisResponseSchema.safeParse(aiResponse);
      if (!validated.success) {
        res.status(500).json({ error: 'AI returned invalid response. Please try again.' });
        return;
      }

      // Save analysis to database
      const client = createUserClient(req.accessToken!);
      const { data: analysis, error: saveError } = await client
        .from('outfit_analyses')
        .insert({
          user_id: req.userId!,
          image_url: publicUrl,
          analysis_result: validated.data,
          notes: parsed.data.notes,
        })
        .select()
        .single();

      if (saveError) console.error('Failed to save analysis:', saveError);

      res.json({ analysis: validated.data, analysis_id: analysis?.id, image_url: publicUrl });
    } catch (err) {
      console.error('Outfit analysis error:', err);
      res.status(500).json({ error: 'Failed to analyze outfit. Please try again.' });
    }
  }
);

// GET /api/v1/analysis/history
analysisRouter.get('/history', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const client = createUserClient(req.accessToken!);
    const { data, error } = await client
      .from('outfit_analyses')
      .select('*')
      .eq('user_id', req.userId!)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ analyses: data });
  } catch (err) {
    console.error('Get analysis history error:', err);
    res.status(500).json({ error: 'Failed to fetch analysis history' });
  }
});

