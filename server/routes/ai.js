/**
 * AI Routes
 * =========
 * Provides AI-powered features like auto-generating titles for resources.
 * Uses Google Gemini AI.
 */

const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { isAuthenticated } = require('../middleware/auth');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * POST /api/ai/generate-title
 * Generate a concise title for a resource based on its content.
 * 
 * Body: { type, content, url, fileName }
 * Returns: { success: true, title: "..." }
 */
router.post('/generate-title', isAuthenticated, async (req, res) => {
    try {
        const { type, content, url, fileName } = req.body;

        // Build the prompt based on resource type
        let prompt = '';

        switch (type) {
            case 'bookmark':
                if (!url) {
                    return res.status(400).json({
                        success: false,
                        message: 'URL is required to generate a title for bookmarks'
                    });
                }
                prompt = `Generate a short, concise title (max 8 words) for a bookmark with this URL: ${url}. Return ONLY the title text, nothing else.`;
                break;

            case 'prompt':
                if (!content) {
                    return res.status(400).json({
                        success: false,
                        message: 'Content is required to generate a title for prompts'
                    });
                }
                prompt = `Generate a short, concise title (max 8 words) for this AI prompt:\n\n"${content.substring(0, 500)}"\n\nReturn ONLY the title text, nothing else.`;
                break;

            case 'snippet':
                if (!content) {
                    return res.status(400).json({
                        success: false,
                        message: 'Content is required to generate a title for snippets'
                    });
                }
                prompt = `Generate a short, concise title (max 8 words) for this code snippet:\n\n"${content.substring(0, 500)}"\n\nReturn ONLY the title text, nothing else.`;
                break;

            case 'note':
                if (!content) {
                    return res.status(400).json({
                        success: false,
                        message: 'Content is required to generate a title for notes'
                    });
                }
                prompt = `Generate a short, concise title (max 8 words) for this note:\n\n"${content.substring(0, 500)}"\n\nReturn ONLY the title text, nothing else.`;
                break;

            case 'document':
                if (!fileName) {
                    return res.status(400).json({
                        success: false,
                        message: 'File name is required to generate a title for documents'
                    });
                }
                prompt = `Generate a short, concise title (max 8 words) for a document with the file name: "${fileName}". Make it human-readable and descriptive. Return ONLY the title text, nothing else.`;
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid resource type'
                });
        }

        // Call Gemini AI
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }, { apiVersion: 'v1beta' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let title = response.text().trim();

        // Clean up: remove quotes if Gemini wraps the title in them
        title = title.replace(/^["']|["']$/g, '');

        // Truncate if too long
        if (title.length > 200) {
            title = title.substring(0, 197) + '...';
        }

        res.json({
            success: true,
            data: { title }
        });

    } catch (error) {
        console.error('AI title generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate title. Please try again.'
        });
    }
});

module.exports = router;
