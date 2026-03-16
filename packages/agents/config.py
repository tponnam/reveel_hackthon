"""Central configuration for the DemoForge agent pipeline."""

import os
from dataclasses import dataclass, field
from typing import Optional
from dotenv import load_dotenv

load_dotenv()


@dataclass
class GeminiConfig:
    """Gemini AI model configuration."""
    api_key: str = field(default_factory=lambda: os.getenv("GOOGLE_API_KEY", ""))
    model_name: str = "gemini-2.0-flash"
    temperature: float = 0.7
    max_output_tokens: int = 8192


@dataclass
class TTSConfig:
    """Google Cloud Text-to-Speech configuration."""
    project_id: str = field(default_factory=lambda: os.getenv("GCP_PROJECT_ID", ""))
    supported_languages: list = field(default_factory=lambda: [
        "en-US", "es-ES", "fr-FR", "de-DE", "ja-JP",
        "ko-KR", "pt-BR", "it-IT", "zh-CN", "hi-IN"
    ])
    default_voice: str = "en-US-Studio-O"
    audio_encoding: str = "LINEAR16"
    speaking_rate: float = 1.0
    pitch: float = 0.0


@dataclass
class BrowserConfig:
    """Playwright browser automation configuration."""
    headless: bool = True
    viewport_width: int = 1920
    viewport_height: int = 1080
    default_timeout: int = 30000
    screenshot_quality: int = 95
    video_fps: int = 30
    slow_mo: int = 100  # ms between actions for smooth recording


@dataclass
class VideoConfig:
    """Video processing configuration."""
    output_dir: str = field(default_factory=lambda: os.getenv("VIDEO_OUTPUT_DIR", "/tmp/demoforge/videos"))
    max_resolution: str = "4K"  # 720p, 1080p, 2K, 4K
    fps: int = 30
    codec: str = "libx264"
    audio_codec: str = "aac"
    format: str = "mp4"
    zoom_duration: float = 0.5  # seconds for zoom transitions
    caption_font_size: int = 42
    caption_font: str = "Inter"


@dataclass
class FirebaseConfig:
    """Firebase configuration."""
    project_id: str = field(default_factory=lambda: os.getenv("FIREBASE_PROJECT_ID", ""))
    storage_bucket: str = field(default_factory=lambda: os.getenv("FIREBASE_STORAGE_BUCKET", ""))
    credentials_path: str = field(default_factory=lambda: os.getenv("GOOGLE_APPLICATION_CREDENTIALS", ""))


@dataclass
class PipelineConfig:
    """Master pipeline configuration."""
    gemini: GeminiConfig = field(default_factory=GeminiConfig)
    tts: TTSConfig = field(default_factory=TTSConfig)
    browser: BrowserConfig = field(default_factory=BrowserConfig)
    video: VideoConfig = field(default_factory=VideoConfig)
    firebase: FirebaseConfig = field(default_factory=FirebaseConfig)
    max_demo_duration: int = 300  # 5 minutes max
    temp_dir: str = field(default_factory=lambda: os.getenv("TEMP_DIR", "/tmp/demoforge"))


def get_config() -> PipelineConfig:
    """Get the pipeline configuration."""
    return PipelineConfig()
