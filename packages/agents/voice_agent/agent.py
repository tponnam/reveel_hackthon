"""
DemoForge Voice Agent

Generates professional voiceover audio using Google Cloud Text-to-Speech.
Supports 10 languages with studio-quality voices.
"""

import os
import json
from typing import Any, List, Dict, Optional

from google.cloud import texttospeech_v1 as texttospeech


class VoiceAgent:
    """
    Text-to-Speech agent using Google Cloud TTS.
    
    Generates studio-quality voiceover from the narration script,
    with support for:
    - 10 languages
    - Multiple voice options per language
    - SSML for natural pacing
    - Per-segment audio generation
    """
    
    # Voice mappings for each supported language
    VOICE_MAP = {
        "en-US": {"name": "en-US-Studio-O", "gender": "FEMALE"},
        "en-GB": {"name": "en-GB-Studio-B", "gender": "MALE"},
        "es-ES": {"name": "es-ES-Studio-C", "gender": "FEMALE"},
        "fr-FR": {"name": "fr-FR-Studio-A", "gender": "FEMALE"},
        "de-DE": {"name": "de-DE-Studio-B", "gender": "MALE"},
        "ja-JP": {"name": "ja-JP-Studio-B", "gender": "FEMALE"},
        "ko-KR": {"name": "ko-KR-Studio-A", "gender": "FEMALE"},
        "pt-BR": {"name": "pt-BR-Studio-B", "gender": "FEMALE"},
        "it-IT": {"name": "it-IT-Studio-A", "gender": "FEMALE"},
        "zh-CN": {"name": "cmn-CN-Studio-A", "gender": "FEMALE"},
        "hi-IN": {"name": "hi-IN-Studio-A", "gender": "FEMALE"},
    }
    
    def __init__(self, config):
        self.config = config
        self.client = texttospeech.TextToSpeechAsyncClient()
    
    async def run(self, state) -> Any:
        """Generate voiceover audio for all script segments."""
        if not state.request.include_voiceover:
            return state
        
        try:
            audio_dir = os.path.join(state.work_dir, "audio")
            os.makedirs(audio_dir, exist_ok=True)
            
            segments = state.script_segments
            audio_segments = []
            
            language = state.request.language
            voice_config = self.VOICE_MAP.get(language, self.VOICE_MAP["en-US"])
            
            for segment in segments:
                narration = segment.get("narration", "")
                if not narration.strip():
                    continue
                
                # Generate SSML for natural pacing
                ssml = self._create_ssml(narration, segment)
                
                # Call TTS API
                audio_content = await self._synthesize_speech(
                    ssml=ssml,
                    language_code=language,
                    voice_name=voice_config["name"],
                )
                
                # Save audio segment
                segment_index = segment.get("segment_index", 0)
                audio_path = os.path.join(audio_dir, f"segment_{segment_index:03d}.wav")
                
                with open(audio_path, "wb") as f:
                    f.write(audio_content)
                
                audio_segments.append({
                    "segment_index": segment_index,
                    "audio_path": audio_path,
                    "timestamp": segment.get("timestamp", 0),
                    "duration": segment.get("duration", 3.0),
                    "narration": narration,
                })
            
            state.audio_segments = audio_segments
            
            # Concatenate all audio segments into a single file
            if audio_segments:
                state.audio_path = await self._concatenate_audio(
                    audio_segments, audio_dir
                )
            
        except Exception as e:
            raise RuntimeError(f"Voice generation failed: {e}")
        
        return state
    
    def _create_ssml(self, text: str, segment: Dict) -> str:
        """Create SSML markup for natural-sounding speech."""
        emphasis = segment.get("emphasis", "")
        action = segment.get("action", "")
        
        ssml = '<speak>'
        
        # Add a brief pause at the start of each segment
        ssml += '<break time="300ms"/>'
        
        # Split text into sentences for better pacing
        sentences = text.replace(". ", ".|").split("|")
        
        for i, sentence in enumerate(sentences):
            sentence = sentence.strip()
            if not sentence:
                continue
            
            # Add emphasis on key terms if this is a highlighted segment
            if emphasis and isinstance(emphasis, str) and emphasis in sentence:
                sentence = sentence.replace(
                    emphasis,
                    f'<emphasis level="moderate">{emphasis}</emphasis>'
                )
            
            ssml += f'{sentence}'
            
            # Add natural pauses between sentences
            if i < len(sentences) - 1:
                ssml += '<break time="400ms"/>'
        
        ssml += '</speak>'
        
        return ssml
    
    async def _synthesize_speech(
        self, ssml: str, language_code: str, voice_name: str
    ) -> bytes:
        """Call Google Cloud TTS API."""
        synthesis_input = texttospeech.SynthesisInput(ssml=ssml)
        
        voice = texttospeech.VoiceSelectionParams(
            language_code=language_code,
            name=voice_name,
        )
        
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.LINEAR16,
            speaking_rate=self.config.tts.speaking_rate,
            pitch=self.config.tts.pitch,
            effects_profile_id=["headphone-class-device"],
        )
        
        response = await self.client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config,
        )
        
        return response.audio_content
    
    async def _concatenate_audio(
        self, segments: List[Dict], output_dir: str
    ) -> str:
        """Concatenate audio segments with proper timing."""
        from pydub import AudioSegment
        
        combined = AudioSegment.empty()
        
        for i, seg in enumerate(segments):
            audio_path = seg["audio_path"]
            if os.path.exists(audio_path):
                audio = AudioSegment.from_wav(audio_path)
                
                # Add silence between segments based on timing
                if i > 0:
                    gap = (seg["timestamp"] - segments[i-1]["timestamp"] - 
                           segments[i-1]["duration"])
                    if gap > 0:
                        silence = AudioSegment.silent(duration=int(gap * 1000))
                        combined += silence
                
                combined += audio
        
        output_path = os.path.join(output_dir, "voiceover_full.wav")
        combined.export(output_path, format="wav")
        
        return output_path
