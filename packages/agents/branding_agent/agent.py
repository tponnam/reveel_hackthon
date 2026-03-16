"""
DemoForge Branding Agent

Applies brand kit (logo, colors, fonts, intro/outro)
to the edited demo video.
"""

import os
from typing import Any, Dict, Optional


class BrandingAgent:
    """
    Apply brand identity to demo videos.
    
    Features:
    - Logo watermark overlay (configurable position/opacity)
    - Custom color theme for captions and overlays
    - Animated intro/outro sequences
    - Consistent typography throughout
    """
    
    DEFAULT_BRAND = {
        "logo_path": None,
        "primary_color": "#7C3AED",
        "secondary_color": "#1D1D1F",
        "accent_color": "#FFFFFF",
        "font_family": "Inter",
        "logo_position": "top-right",
        "logo_opacity": 0.8,
        "show_intro": True,
        "show_outro": True,
        "intro_text": "",
        "outro_text": "Generated with DemoForge AI",
        "outro_cta": "Try it at demoforge.ai",
    }
    
    def __init__(self, config):
        self.config = config
    
    async def run(self, state) -> Any:
        """Apply branding to the edited video."""
        try:
            from moviepy.editor import (
                VideoFileClip, ImageClip, TextClip,
                CompositeVideoClip, ColorClip, concatenate_videoclips
            )
            
            if not state.edited_video_path or not os.path.exists(state.edited_video_path):
                state.branded_video_path = state.edited_video_path
                return state
            
            # Load the edited video
            video = VideoFileClip(state.edited_video_path)
            
            # Get brand kit settings
            brand = {**self.DEFAULT_BRAND}
            if state.request.brand_kit:
                brand.update(state.request.brand_kit)
            
            analysis = state.analysis
            product_name = analysis.get("product_name", "Product Demo")
            demo_title = analysis.get("demo_title", product_name)
            
            brand["intro_text"] = brand.get("intro_text") or demo_title
            
            clips_to_concat = []
            
            # 1. Create intro sequence
            if brand["show_intro"]:
                intro = self._create_intro(
                    brand, video.size, duration=3.0
                )
                clips_to_concat.append(intro)
            
            # 2. Main video with logo watermark
            branded_video = video
            if brand.get("logo_path") and os.path.exists(brand["logo_path"]):
                branded_video = self._add_logo_watermark(
                    video, brand
                )
            
            clips_to_concat.append(branded_video)
            
            # 3. Create outro sequence
            if brand["show_outro"]:
                outro = self._create_outro(
                    brand, video.size, duration=3.0
                )
                clips_to_concat.append(outro)
            
            # Concatenate intro + video + outro
            final = concatenate_videoclips(clips_to_concat, method="compose")
            
            # Export branded video
            output_path = os.path.join(state.work_dir, "branded_demo.mp4")
            final.write_videofile(
                output_path,
                fps=self.config.video.fps,
                codec=self.config.video.codec,
                audio_codec=self.config.video.audio_codec,
                preset="medium",
                threads=4,
            )
            
            state.branded_video_path = output_path
            state.result.duration = final.duration
            
            # Cleanup
            final.close()
            video.close()
            
        except Exception as e:
            # If branding fails, use the unbranded video
            state.branded_video_path = state.edited_video_path
            print(f"Warning: Branding failed, using unbranded video: {e}")
        
        return state
    
    def _create_intro(self, brand: Dict, size: tuple, duration: float = 3.0):
        """Create an animated intro clip."""
        from moviepy.editor import TextClip, CompositeVideoClip, ColorClip
        
        w, h = size
        
        # Background
        bg = ColorClip(size=size, color=self._hex_to_rgb(brand["secondary_color"]))
        bg = bg.set_duration(duration)
        
        # Title text
        title = TextClip(
            brand["intro_text"],
            fontsize=72,
            color=brand["accent_color"],
            font=brand["font_family"],
            method="caption",
            size=(w * 0.7, None),
        )
        title = title.set_position("center")
        title = title.set_duration(duration)
        title = title.crossfadein(0.5)
        
        # Subtitle / tagline
        subtitle = TextClip(
            "Product Walkthrough",
            fontsize=32,
            color=brand["primary_color"],
            font=brand["font_family"],
        )
        subtitle = subtitle.set_position(("center", h * 0.6))
        subtitle = subtitle.set_duration(duration)
        subtitle = subtitle.crossfadein(0.8)
        
        return CompositeVideoClip([bg, title, subtitle]).set_duration(duration)
    
    def _create_outro(self, brand: Dict, size: tuple, duration: float = 3.0):
        """Create an animated outro clip."""
        from moviepy.editor import TextClip, CompositeVideoClip, ColorClip
        
        w, h = size
        
        # Background
        bg = ColorClip(size=size, color=self._hex_to_rgb(brand["secondary_color"]))
        bg = bg.set_duration(duration)
        
        # Thank you / CTA text
        main_text = TextClip(
            brand["outro_text"],
            fontsize=56,
            color=brand["accent_color"],
            font=brand["font_family"],
        )
        main_text = main_text.set_position(("center", h * 0.35))
        main_text = main_text.set_duration(duration)
        
        # CTA
        cta = TextClip(
            brand["outro_cta"],
            fontsize=36,
            color=brand["primary_color"],
            font=brand["font_family"],
        )
        cta = cta.set_position(("center", h * 0.55))
        cta = cta.set_duration(duration)
        cta = cta.crossfadein(0.5)
        
        return CompositeVideoClip([bg, main_text, cta]).set_duration(duration)
    
    def _add_logo_watermark(self, video, brand: Dict):
        """Add logo watermark to the video."""
        from moviepy.editor import ImageClip, CompositeVideoClip
        
        logo = ImageClip(brand["logo_path"])
        
        # Resize logo to reasonable size (max 150px height)
        if logo.size[1] > 150:
            scale = 150 / logo.size[1]
            logo = logo.resize(scale)
        
        # Position mapping
        positions = {
            "top-right": (video.size[0] - logo.size[0] - 30, 30),
            "top-left": (30, 30),
            "bottom-right": (video.size[0] - logo.size[0] - 30, video.size[1] - logo.size[1] - 30),
            "bottom-left": (30, video.size[1] - logo.size[1] - 30),
        }
        
        pos = positions.get(brand["logo_position"], positions["top-right"])
        
        logo = logo.set_position(pos)
        logo = logo.set_duration(video.duration)
        logo = logo.set_opacity(brand["logo_opacity"])
        
        return CompositeVideoClip([video, logo])
    
    def _hex_to_rgb(self, hex_color: str) -> tuple:
        """Convert hex color to RGB tuple."""
        hex_color = hex_color.lstrip("#")
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
