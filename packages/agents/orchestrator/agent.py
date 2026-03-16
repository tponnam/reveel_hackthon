"""
DemoForge Orchestrator Agent

The master coordinator that runs the full demo generation pipeline
using Google ADK's SequentialAgent and ParallelAgent patterns.
"""

import os
import json
import uuid
import asyncio
from datetime import datetime
from dataclasses import dataclass, field, asdict
from typing import Optional, Dict, Any, List

from config import get_config, PipelineConfig


@dataclass
class DemoRequest:
    """Input request for demo generation."""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    url: str = ""
    prompt: str = ""
    language: str = "en-US"
    resolution: str = "1080p"
    include_voiceover: bool = True
    include_captions: bool = True
    brand_kit: Optional[Dict[str, Any]] = None
    persona: str = "general"  # sales, onboarding, tutorial, general
    user_id: str = ""
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())


@dataclass
class DemoResult:
    """Output result from demo generation."""
    id: str = ""
    status: str = "pending"  # pending, analyzing, capturing, scripting, voiceover, editing, branding, exporting, done, error
    progress: int = 0
    video_url: str = ""
    thumbnail_url: str = ""
    script: str = ""
    captions: List[Dict] = field(default_factory=list)
    duration: float = 0.0
    language: str = "en-US"
    resolution: str = "1080p"
    error: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: str = ""
    completed_at: str = ""


@dataclass
class PipelineState:
    """Shared state passed between agents in the pipeline."""
    request: DemoRequest = field(default_factory=DemoRequest)
    result: DemoResult = field(default_factory=DemoResult)
    
    # Inter-agent data
    analysis: Dict[str, Any] = field(default_factory=dict)
    screenshots: List[str] = field(default_factory=list)  # file paths
    recording_path: str = ""
    script_text: str = ""
    script_segments: List[Dict] = field(default_factory=list)
    audio_path: str = ""
    audio_segments: List[Dict] = field(default_factory=list)
    captions: List[Dict] = field(default_factory=list)
    edited_video_path: str = ""
    branded_video_path: str = ""
    final_video_path: str = ""
    
    # Working directory
    work_dir: str = ""
    
    def to_dict(self) -> Dict:
        return asdict(self)
    
    def update_status(self, status: str, progress: int):
        self.result.status = status
        self.result.progress = progress


class OrchestratorAgent:
    """
    Main orchestrator that coordinates the demo generation pipeline.
    
    Pipeline steps:
    1. AnalyzerAgent - Understand the URL and prompt
    2. BrowserCaptureAgent - Navigate and record the UI
    3. ScriptWriterAgent - Generate narration script
    4. ParallelAgent:
       a. VoiceAgent - Generate TTS audio
       b. CaptionAgent - Generate subtitle tracks
    5. VideoEditorAgent - Assemble video with effects
    6. BrandingAgent - Apply brand kit
    7. ExportAgent - Final render and upload
    """
    
    def __init__(self, config: Optional[PipelineConfig] = None):
        self.config = config or get_config()
        self.agents = {}
        self._initialize_agents()
    
    def _initialize_agents(self):
        """Initialize all sub-agents."""
        from browser_agent.agent import BrowserCaptureAgent
        from script_agent.agent import ScriptWriterAgent
        from voice_agent.agent import VoiceAgent
        from caption_agent.agent import CaptionAgent
        from video_agent.agent import VideoEditorAgent
        from branding_agent.agent import BrandingAgent
        from export_agent.agent import ExportAgent
        
        self.agents = {
            "analyzer": None,  # Uses Gemini directly
            "browser": BrowserCaptureAgent(self.config),
            "script_writer": ScriptWriterAgent(self.config),
            "voice": VoiceAgent(self.config),
            "caption": CaptionAgent(self.config),
            "video_editor": VideoEditorAgent(self.config),
            "branding": BrandingAgent(self.config),
            "export": ExportAgent(self.config),
        }
    
    async def generate_demo(self, request: DemoRequest) -> DemoResult:
        """
        Run the full demo generation pipeline.
        
        Args:
            request: DemoRequest with URL, prompt, and settings
            
        Returns:
            DemoResult with video URL and metadata
        """
        state = PipelineState(
            request=request,
            result=DemoResult(id=request.id, created_at=request.created_at),
            work_dir=os.path.join(self.config.temp_dir, request.id),
        )
        
        os.makedirs(state.work_dir, exist_ok=True)
        
        try:
            # Step 1: Analyze URL and prompt
            state.update_status("analyzing", 5)
            state = await self._analyze(state)
            
            # Step 2: Browser capture
            state.update_status("capturing", 15)
            state = await self.agents["browser"].run(state)
            
            # Step 3: Generate script
            state.update_status("scripting", 40)
            state = await self.agents["script_writer"].run(state)
            
            # Step 4: Voice + Captions in parallel
            state.update_status("voiceover", 55)
            state = await self._run_parallel(state, ["voice", "caption"])
            
            # Step 5: Video editing
            state.update_status("editing", 70)
            state = await self.agents["video_editor"].run(state)
            
            # Step 6: Apply branding
            state.update_status("branding", 85)
            state = await self.agents["branding"].run(state)
            
            # Step 7: Export and upload
            state.update_status("exporting", 95)
            state = await self.agents["export"].run(state)
            
            # Done
            state.update_status("done", 100)
            state.result.completed_at = datetime.utcnow().isoformat()
            state.result.video_url = state.final_video_path
            state.result.script = state.script_text
            state.result.captions = state.captions
            
        except Exception as e:
            state.update_status("error", state.result.progress)
            state.result.error = str(e)
            raise
        
        return state.result
    
    async def _analyze(self, state: PipelineState) -> PipelineState:
        """
        Analyze the target URL and user prompt to plan the demo flow.
        Uses Gemini to understand what kind of product/app it is and 
        plan the navigation steps.
        """
        import google.generativeai as genai
        
        genai.configure(api_key=self.config.gemini.api_key)
        model = genai.GenerativeModel(self.config.gemini.model_name)
        
        analysis_prompt = f"""You are a demo video planning agent. Analyze the following and produce a structured plan.

URL: {state.request.url}
User Prompt: {state.request.prompt}
Persona: {state.request.persona}
Language: {state.request.language}

Produce a JSON response with:
{{
    "product_name": "Name of the product/app",
    "product_type": "Type (SaaS, e-commerce, portfolio, etc.)",
    "demo_title": "A compelling title for the demo",
    "demo_description": "A 1-2 sentence description",
    "navigation_steps": [
        {{
            "step_number": 1,
            "action": "navigate|click|type|scroll|wait",
            "target": "CSS selector or description",
            "description": "What this step demonstrates",
            "emphasis": true/false,
            "data": "optional data to type"
        }}
    ],
    "key_features": ["list of features to highlight"],
    "estimated_duration_seconds": 60,
    "tone": "professional|casual|technical|enthusiastic"
}}

Plan 5-15 navigation steps that showcase the product effectively.
Think about what a potential customer would want to see."""

        response = await model.generate_content_async(analysis_prompt)
        
        try:
            # Extract JSON from response
            text = response.text
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            elif "```" in text:
                text = text.split("```")[1].split("```")[0]
            
            state.analysis = json.loads(text.strip())
        except (json.JSONDecodeError, IndexError):
            state.analysis = {
                "product_name": "Product Demo",
                "product_type": "web application",
                "demo_title": f"Demo of {state.request.url}",
                "demo_description": state.request.prompt,
                "navigation_steps": [
                    {
                        "step_number": 1,
                        "action": "navigate",
                        "target": state.request.url,
                        "description": "Navigate to the homepage",
                        "emphasis": True
                    }
                ],
                "key_features": [],
                "estimated_duration_seconds": 60,
                "tone": "professional"
            }
        
        return state
    
    async def _run_parallel(self, state: PipelineState, agent_names: List[str]) -> PipelineState:
        """Run multiple agents in parallel on the same state."""
        tasks = [self.agents[name].run(state) for name in agent_names]
        results = await asyncio.gather(*tasks)
        
        # Merge results - later agents' state changes override earlier ones
        for result_state in results:
            if result_state.audio_path:
                state.audio_path = result_state.audio_path
            if result_state.audio_segments:
                state.audio_segments = result_state.audio_segments
            if result_state.captions:
                state.captions = result_state.captions
        
        return state


async def run_pipeline(url: str, prompt: str, **kwargs) -> DemoResult:
    """Convenience function to run the full pipeline."""
    request = DemoRequest(url=url, prompt=prompt, **kwargs)
    orchestrator = OrchestratorAgent()
    return await orchestrator.generate_demo(request)


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 3:
        print("Usage: python -m orchestrator.agent <url> <prompt>")
        sys.exit(1)
    
    url = sys.argv[1]
    prompt = " ".join(sys.argv[2:])
    
    result = asyncio.run(run_pipeline(url, prompt))
    print(json.dumps(asdict(result), indent=2))
