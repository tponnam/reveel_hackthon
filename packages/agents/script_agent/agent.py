"""
DemoForge Script Writer Agent

Uses Gemini to generate professional narration scripts
based on captured screenshots and the user's prompt.
"""

import os
import json
import base64
from typing import Any, List, Dict

import google.generativeai as genai


class ScriptWriterAgent:
    """
    AI-powered script writer that generates narration for demo videos.
    
    Analyzes screenshots of the captured UI flow and produces:
    - Professional narration text
    - Timed segments mapped to each screenshot/step
    - Tone-appropriate language
    """
    
    def __init__(self, config):
        self.config = config
        genai.configure(api_key=config.gemini.api_key)
        self.model = genai.GenerativeModel(config.gemini.model_name)
    
    async def run(self, state) -> Any:
        """Generate narration script from captured screenshots."""
        try:
            # Build multimodal prompt with screenshots
            segments = await self._generate_script(state)
            
            state.script_segments = segments
            state.script_text = "\n\n".join(
                [f"[{s['timestamp']}s] {s['narration']}" for s in segments]
            )
            
        except Exception as e:
            raise RuntimeError(f"Script generation failed: {e}")
        
        return state
    
    async def _generate_script(self, state) -> List[Dict]:
        """Generate timed narration segments."""
        analysis = state.analysis
        persona = state.request.persona
        language = state.request.language
        
        # Prepare screenshot images for multimodal input
        image_parts = []
        for screenshot_path in state.screenshots[:15]:  # Limit to 15 screenshots
            if os.path.exists(screenshot_path) and not screenshot_path.endswith("_emphasis.png"):
                with open(screenshot_path, "rb") as f:
                    image_data = f.read()
                image_parts.append({
                    "mime_type": "image/png",
                    "data": base64.b64encode(image_data).decode()
                })
        
        tone_map = {
            "sales": "persuasive and benefit-focused, highlighting value propositions",
            "onboarding": "friendly and instructional, guiding new users step by step",
            "tutorial": "technical and detailed, explaining features thoroughly",
            "general": "professional and engaging, balanced between informative and exciting",
        }
        tone = tone_map.get(persona, tone_map["general"])
        
        prompt = f"""You are a professional demo video script writer. Generate a narration script for a product demo video.

Product: {analysis.get('product_name', 'Product')}
Type: {analysis.get('product_type', 'web application')}
Title: {analysis.get('demo_title', 'Product Demo')}
Description: {analysis.get('demo_description', '')}
User Prompt: {state.request.prompt}

Tone: {tone}
Language: {language}

I've provided {len(image_parts)} screenshots from the product in order. Write a narration script that:

1. Opens with a compelling hook (1-2 sentences)
2. Walks through each screenshot explaining what's being shown
3. Highlights key features and benefits
4. Closes with a call to action

Format as JSON array:
[
    {{
        "segment_index": 0,
        "timestamp": 0,
        "duration": 3.5,
        "narration": "Welcome to [product]. Let me show you how...",
        "screenshot_index": 0,
        "emphasis": "key feature to highlight",
        "action": "what's happening on screen"
    }}
]

Rules:
- Each segment should be 2-5 seconds when spoken
- Use natural, conversational language
- Don't say "as you can see" or "here we can see" repeatedly
- Reference specific UI elements visible in the screenshots
- Keep total script under {state.analysis.get('estimated_duration_seconds', 60)} seconds
- Make it sound like a polished product walkthrough
"""
        
        # Build content parts
        content_parts = [prompt]
        for img in image_parts:
            content_parts.append({
                "inline_data": img
            })
        
        response = await self.model.generate_content_async(content_parts)
        
        # Parse response
        text = response.text
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1].split("```")[0]
        
        try:
            segments = json.loads(text.strip())
        except json.JSONDecodeError:
            # Fallback: create basic segments
            segments = self._create_fallback_segments(state)
        
        return segments
    
    def _create_fallback_segments(self, state) -> List[Dict]:
        """Create basic narration segments as fallback."""
        analysis = state.analysis
        product_name = analysis.get("product_name", "this product")
        steps = analysis.get("navigation_steps", [])
        
        segments = [
            {
                "segment_index": 0,
                "timestamp": 0,
                "duration": 3.0,
                "narration": f"Welcome to {product_name}. Let me walk you through what makes it special.",
                "screenshot_index": 0,
                "emphasis": "intro",
                "action": "Opening view"
            }
        ]
        
        timestamp = 3.0
        for i, step in enumerate(steps):
            desc = step.get("description", f"Step {i + 1}")
            segment = {
                "segment_index": i + 1,
                "timestamp": timestamp,
                "duration": 3.5,
                "narration": desc,
                "screenshot_index": min(i + 1, len(state.screenshots) - 1),
                "emphasis": step.get("emphasis", False),
                "action": step.get("action", "navigate")
            }
            segments.append(segment)
            timestamp += 3.5
        
        # Closing
        segments.append({
            "segment_index": len(segments),
            "timestamp": timestamp,
            "duration": 3.0,
            "narration": f"That's {product_name} in action. Get started today.",
            "screenshot_index": len(state.screenshots) - 1,
            "emphasis": "outro",
            "action": "Closing"
        })
        
        return segments
