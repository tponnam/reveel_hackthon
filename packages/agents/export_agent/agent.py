"""
DemoForge Export Agent

Handles final video rendering, quality optimization,
thumbnail generation, and upload to cloud storage.
"""

import os
import json
from typing import Any, Dict


class ExportAgent:
    """
    Final export and upload agent.
    
    Handles:
    - Multi-resolution encoding (720p, 1080p, 2K, 4K)
    - Thumbnail generation
    - Upload to Firebase Cloud Storage
    - Shareable link generation
    - Metadata packaging
    """
    
    RESOLUTION_MAP = {
        "720p": {"width": 1280, "height": 720, "bitrate": "2500k"},
        "1080p": {"width": 1920, "height": 1080, "bitrate": "5000k"},
        "2K": {"width": 2560, "height": 1440, "bitrate": "8000k"},
        "4K": {"width": 3840, "height": 2160, "bitrate": "15000k"},
    }
    
    def __init__(self, config):
        self.config = config
    
    async def run(self, state) -> Any:
        """Export final video and upload to storage."""
        try:
            source_video = state.branded_video_path or state.edited_video_path
            
            if not source_video or not os.path.exists(source_video):
                raise RuntimeError("No video to export")
            
            resolution = state.request.resolution
            
            # 1. Encode to target resolution
            final_path = await self._encode_video(
                source_video, resolution, state.work_dir
            )
            
            # 2. Generate thumbnail
            thumbnail_path = await self._generate_thumbnail(
                final_path, state.work_dir
            )
            
            # 3. Upload to Firebase Storage
            video_url = await self._upload_to_storage(
                final_path, state.request.id, state.request.user_id
            )
            
            thumbnail_url = await self._upload_to_storage(
                thumbnail_path, f"{state.request.id}_thumb", state.request.user_id
            )
            
            # 4. Update state
            state.final_video_path = video_url
            state.result.video_url = video_url
            state.result.thumbnail_url = thumbnail_url
            state.result.resolution = resolution
            
            # Save metadata
            metadata = {
                "demo_id": state.request.id,
                "url": state.request.url,
                "prompt": state.request.prompt,
                "language": state.request.language,
                "resolution": resolution,
                "duration": state.result.duration,
                "video_url": video_url,
                "thumbnail_url": thumbnail_url,
                "script": state.script_text,
                "captions_count": len(state.captions),
                "analysis": state.analysis,
            }
            
            metadata_path = os.path.join(state.work_dir, "metadata.json")
            with open(metadata_path, "w") as f:
                json.dump(metadata, f, indent=2)
            
            state.result.metadata = metadata
            
        except Exception as e:
            raise RuntimeError(f"Export failed: {e}")
        
        return state
    
    async def _encode_video(self, source: str, resolution: str, work_dir: str) -> str:
        """Encode video to target resolution and quality."""
        import subprocess
        
        res = self.RESOLUTION_MAP.get(resolution, self.RESOLUTION_MAP["1080p"])
        output_path = os.path.join(work_dir, f"demo_final_{resolution}.mp4")
        
        cmd = [
            "ffmpeg", "-y",
            "-i", source,
            "-vf", f"scale={res['width']}:{res['height']}:force_original_aspect_ratio=decrease,pad={res['width']}:{res['height']}:(ow-iw)/2:(oh-ih)/2",
            "-c:v", "libx264",
            "-preset", "slow",
            "-crf", "18",
            "-b:v", res["bitrate"],
            "-c:a", "aac",
            "-b:a", "192k",
            "-movflags", "+faststart",
            output_path,
        ]
        
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await process.communicate()
        
        if process.returncode != 0:
            # Fallback: just copy the source
            import shutil
            shutil.copy2(source, output_path)
        
        return output_path
    
    async def _generate_thumbnail(self, video_path: str, work_dir: str) -> str:
        """Generate a thumbnail from the video."""
        import subprocess
        
        thumbnail_path = os.path.join(work_dir, "thumbnail.jpg")
        
        cmd = [
            "ffmpeg", "-y",
            "-i", video_path,
            "-ss", "00:00:02",
            "-vframes", "1",
            "-q:v", "2",
            thumbnail_path,
        ]
        
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        await process.communicate()
        
        return thumbnail_path
    
    async def _upload_to_storage(self, file_path: str, file_id: str, user_id: str) -> str:
        """Upload file to Firebase Cloud Storage."""
        try:
            import firebase_admin
            from firebase_admin import storage
            
            if not firebase_admin._apps:
                firebase_admin.initialize_app(options={
                    "storageBucket": self.config.firebase.storage_bucket
                })
            
            bucket = storage.bucket()
            blob_path = f"demos/{user_id}/{file_id}/{os.path.basename(file_path)}"
            blob = bucket.blob(blob_path)
            
            blob.upload_from_filename(file_path)
            blob.make_public()
            
            return blob.public_url
            
        except Exception as e:
            # Return local path as fallback
            print(f"Storage upload failed: {e}")
            return file_path


import asyncio
