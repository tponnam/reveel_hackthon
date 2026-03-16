"""
DemoForge Localization Agent

Generates multi-language variants of demos by translating
scripts, regenerating TTS, and creating localized caption tracks.
"""

import json
from typing import Any, List, Dict

import google.generativeai as genai


class LocalizationAgent:
    """
    Multi-language variant generator.
    
    Takes an existing demo and produces variants in other languages:
    - Translates narration script
    - Generates localized TTS voiceover
    - Creates localized caption tracks
    - Preserves timing and visual flow
    """
    
    LANGUAGE_NAMES = {
        "en-US": "English",
        "es-ES": "Spanish",
        "fr-FR": "French",
        "de-DE": "German",
        "ja-JP": "Japanese",
        "ko-KR": "Korean",
        "pt-BR": "Portuguese (Brazilian)",
        "it-IT": "Italian",
        "zh-CN": "Chinese (Simplified)",
        "hi-IN": "Hindi",
    }
    
    def __init__(self, config):
        self.config = config
        genai.configure(api_key=config.gemini.api_key)
        self.model = genai.GenerativeModel(config.gemini.model_name)
    
    async def translate_demo(self, state, target_languages: List[str]) -> Dict[str, Any]:
        """
        Generate localized variants for multiple languages.
        
        Returns a dict of language code -> localized state data.
        """
        results = {}
        
        for lang in target_languages:
            if lang == state.request.language:
                continue  # Skip source language
            
            try:
                localized = await self._translate_to_language(state, lang)
                results[lang] = localized
            except Exception as e:
                print(f"Localization to {lang} failed: {e}")
                results[lang] = {"error": str(e)}
        
        return results
    
    async def _translate_to_language(self, state, target_lang: str) -> Dict:
        """Translate script and generate localized assets for one language."""
        lang_name = self.LANGUAGE_NAMES.get(target_lang, target_lang)
        
        # Translate all script segments
        segments = state.script_segments
        translated_segments = await self._translate_segments(segments, target_lang, lang_name)
        
        # Generate localized TTS
        from voice_agent.agent import VoiceAgent
        voice_agent = VoiceAgent(self.config)
        
        # Create a modified state for TTS
        import copy
        localized_state = copy.deepcopy(state)
        localized_state.script_segments = translated_segments
        localized_state.request.language = target_lang
        
        localized_state = await voice_agent.run(localized_state)
        
        # Generate localized captions
        from caption_agent.agent import CaptionAgent
        caption_agent = CaptionAgent(self.config)
        localized_state = await caption_agent.run(localized_state)
        
        return {
            "language": target_lang,
            "language_name": lang_name,
            "script_segments": translated_segments,
            "audio_path": localized_state.audio_path,
            "captions": localized_state.captions,
        }
    
    async def _translate_segments(
        self, segments: List[Dict], target_lang: str, lang_name: str
    ) -> List[Dict]:
        """Translate narration segments while preserving timing."""
        narrations = [s.get("narration", "") for s in segments]
        
        prompt = f"""Translate the following narration segments from English to {lang_name} ({target_lang}).

Maintain:
- Professional tone and style
- Similar length (for timing)
- Natural flow in the target language
- Product names and technical terms unchanged

Narration segments:
{json.dumps(narrations, indent=2)}

Return as a JSON array of translated strings, maintaining the same order:
["translated segment 1", "translated segment 2", ...]"""
        
        response = await self.model.generate_content_async(prompt)
        
        text = response.text
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1].split("```")[0]
        
        try:
            translations = json.loads(text.strip())
        except json.JSONDecodeError:
            translations = narrations  # Fallback to original
        
        # Merge translations back into segments
        translated_segments = []
        for i, segment in enumerate(segments):
            translated = segment.copy()
            if i < len(translations):
                translated["narration"] = translations[i]
            translated_segments.append(translated)
        
        return translated_segments
