"""
DemoForge Caption Agent

Generates dynamic caption/subtitle tracks synchronized
with the voiceover narration and on-screen actions.
"""

import json
from typing import Any, List, Dict


class CaptionAgent:
    """
    Creates timed caption tracks for the demo video.
    
    Features:
    - Word-level timing from TTS audio
    - SRT/VTT format output
    - Multi-language caption generation
    - Customizable styling (position, font, color)
    """
    
    def __init__(self, config):
        self.config = config
    
    async def run(self, state) -> Any:
        """Generate captions from script segments."""
        if not state.request.include_captions:
            return state
        
        try:
            captions = []
            
            for segment in state.script_segments:
                narration = segment.get("narration", "")
                timestamp = segment.get("timestamp", 0)
                duration = segment.get("duration", 3.0)
                
                if not narration.strip():
                    continue
                
                # Split narration into subtitle chunks (max 2 lines, ~42 chars each)
                chunks = self._split_into_chunks(narration)
                chunk_duration = duration / max(len(chunks), 1)
                
                for i, chunk in enumerate(chunks):
                    start_time = timestamp + (i * chunk_duration)
                    end_time = start_time + chunk_duration
                    
                    captions.append({
                        "index": len(captions) + 1,
                        "start": start_time,
                        "end": end_time,
                        "text": chunk,
                        "segment_index": segment.get("segment_index", 0),
                        "style": {
                            "position": "bottom",
                            "fontSize": self.config.video.caption_font_size,
                            "fontFamily": self.config.video.caption_font,
                            "color": "#FFFFFF",
                            "backgroundColor": "rgba(0, 0, 0, 0.7)",
                            "padding": "8px 16px",
                            "borderRadius": "8px",
                        }
                    })
            
            state.captions = captions
            
            # Save SRT file
            srt_path = self._save_srt(captions, state.work_dir)
            state.metadata = state.result.metadata
            state.result.metadata["srt_path"] = srt_path
            
        except Exception as e:
            raise RuntimeError(f"Caption generation failed: {e}")
        
        return state
    
    def _split_into_chunks(self, text: str, max_chars: int = 84) -> List[str]:
        """Split narration into subtitle-friendly chunks."""
        words = text.split()
        chunks = []
        current_chunk = []
        current_length = 0
        
        for word in words:
            if current_length + len(word) + 1 > max_chars and current_chunk:
                chunks.append(" ".join(current_chunk))
                current_chunk = [word]
                current_length = len(word)
            else:
                current_chunk.append(word)
                current_length += len(word) + 1
        
        if current_chunk:
            chunks.append(" ".join(current_chunk))
        
        return chunks
    
    def _save_srt(self, captions: List[Dict], work_dir: str) -> str:
        """Save captions in SRT format."""
        import os
        
        srt_content = ""
        for cap in captions:
            start = self._format_srt_time(cap["start"])
            end = self._format_srt_time(cap["end"])
            srt_content += f"{cap['index']}\n{start} --> {end}\n{cap['text']}\n\n"
        
        srt_path = os.path.join(work_dir, "captions.srt")
        with open(srt_path, "w") as f:
            f.write(srt_content)
        
        return srt_path
    
    def _format_srt_time(self, seconds: float) -> str:
        """Format seconds to SRT timestamp (HH:MM:SS,mmm)."""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millis = int((seconds % 1) * 1000)
        return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"
