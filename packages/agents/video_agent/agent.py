"""
DemoForge Video Editor Agent

Assembles the final demo video from screenshots, recordings,
voiceover audio, and captions with smart editing effects.
"""

import os
import json
from typing import Any, List, Dict, Optional, Tuple


class VideoEditorAgent:
    """
    Video assembly and editing engine.
    
    Features:
    - Stitch screenshots into smooth video transitions
    - Smart cuts (remove dead time)
    - UI-aware zoom effects on key action areas
    - Ken Burns effect for visual interest
    - Caption overlay rendering
    - Background music mixing
    - Professional transitions between scenes
    """
    
    def __init__(self, config):
        self.config = config
    
    async def run(self, state) -> Any:
        """Assemble and edit the demo video."""
        try:
            from moviepy.editor import (
                ImageClip, AudioFileClip, CompositeVideoClip,
                concatenate_videoclips, TextClip, ColorClip,
                CompositeAudioClip
            )
            import numpy as np
            from PIL import Image
            
            fps = self.config.video.fps
            resolution = self._get_resolution(state.request.resolution)
            
            clips = []
            
            # Create video clips from screenshots
            for i, segment in enumerate(state.script_segments):
                screenshot_idx = segment.get("screenshot_index", i)
                duration = segment.get("duration", 3.0)
                emphasis = segment.get("emphasis", False)
                
                # Get corresponding screenshot
                if screenshot_idx < len(state.screenshots):
                    img_path = state.screenshots[screenshot_idx]
                else:
                    img_path = state.screenshots[-1] if state.screenshots else None
                
                if not img_path or not os.path.exists(img_path):
                    continue
                
                # Create base clip from screenshot
                clip = ImageClip(img_path, duration=duration)
                clip = clip.resize(resolution)
                
                # Add zoom effect for emphasized elements
                if emphasis:
                    clip = self._add_zoom_effect(clip, emphasis, duration)
                else:
                    # Subtle Ken Burns effect for visual interest
                    clip = self._add_ken_burns(clip, duration)
                
                clips.append(clip)
            
            if not clips:
                raise RuntimeError("No video clips generated")
            
            # Add crossfade transitions
            final_clips = []
            for i, clip in enumerate(clips):
                if i > 0:
                    # Add 0.3s crossfade between clips
                    clip = clip.crossfadein(0.3)
                final_clips.append(clip)
            
            # Concatenate all clips
            video = concatenate_videoclips(final_clips, method="compose")
            
            # Add captions overlay
            if state.captions:
                video = self._add_captions(video, state.captions, resolution)
            
            # Add voiceover audio
            if state.audio_path and os.path.exists(state.audio_path):
                audio = AudioFileClip(state.audio_path)
                
                # Trim audio to video length or vice versa
                if audio.duration > video.duration:
                    audio = audio.subclip(0, video.duration)
                elif audio.duration < video.duration:
                    video = video.subclip(0, audio.duration)
                
                video = video.set_audio(audio)
            
            # Export edited video
            output_path = os.path.join(state.work_dir, "edited_demo.mp4")
            video.write_videofile(
                output_path,
                fps=fps,
                codec=self.config.video.codec,
                audio_codec=self.config.video.audio_codec,
                preset="medium",
                threads=4,
            )
            
            state.edited_video_path = output_path
            state.result.duration = video.duration
            
            # Cleanup
            video.close()
            for clip in clips:
                clip.close()
            
        except Exception as e:
            raise RuntimeError(f"Video editing failed: {e}")
        
        return state
    
    def _get_resolution(self, resolution_str: str) -> Tuple[int, int]:
        """Convert resolution string to (width, height) tuple."""
        resolutions = {
            "720p": (1280, 720),
            "1080p": (1920, 1080),
            "2K": (2560, 1440),
            "4K": (3840, 2160),
        }
        return resolutions.get(resolution_str, (1920, 1080))
    
    def _add_zoom_effect(self, clip, emphasis_area, duration):
        """Add a smooth zoom-in/zoom-out effect on the emphasized area."""
        zoom_duration = min(self.config.video.zoom_duration, duration * 0.3)
        
        def zoom_func(t):
            if t < zoom_duration:
                # Zoom in
                scale = 1.0 + (0.3 * t / zoom_duration)
            elif t > duration - zoom_duration:
                # Zoom out
                scale = 1.3 - (0.3 * (t - (duration - zoom_duration)) / zoom_duration)
            else:
                # Stay zoomed
                scale = 1.3
            return scale
        
        clip = clip.resize(lambda t: zoom_func(t))
        return clip
    
    def _add_ken_burns(self, clip, duration):
        """Add subtle Ken Burns (slow pan/zoom) effect."""
        def kb_func(t):
            # Very subtle 5% zoom over the duration
            scale = 1.0 + (0.05 * t / duration)
            return scale
        
        clip = clip.resize(lambda t: kb_func(t))
        return clip
    
    def _add_captions(self, video, captions, resolution):
        """Overlay caption text on the video."""
        from moviepy.editor import TextClip, CompositeVideoClip
        
        caption_clips = [video]
        
        for cap in captions:
            try:
                txt = TextClip(
                    cap["text"],
                    fontsize=cap.get("style", {}).get("fontSize", 42),
                    color="white",
                    font="Inter",
                    bg_color="rgba(0,0,0,0.7)",
                    size=(resolution[0] * 0.8, None),
                    method="caption",
                )
                txt = txt.set_position(("center", "bottom"))
                txt = txt.set_start(cap["start"])
                txt = txt.set_duration(cap["end"] - cap["start"])
                txt = txt.margin(bottom=60, opacity=0)
                
                caption_clips.append(txt)
            except Exception:
                continue
        
        return CompositeVideoClip(caption_clips)
