import * as googleTTS from "google-tts-api";
import * as fs from "fs";

async function run() {
    const text = "Hello world, this is a test of the Google TTS API to make sure the audio is not corrupted. It needs to work perfectly.";
    console.log("Generating TTS...");
    const results = await googleTTS.getAllAudioBase64(text, {
        lang: "en",
        slow: false,
        host: "https://translate.google.com",
    });

    const buffers = results.map((r: any) => Buffer.from(r.base64, "base64"));
    const finalBuffer = Buffer.concat(buffers);

    fs.writeFileSync("/tmp/test_tts_audio.mp3", finalBuffer);
    console.log("Saved to /tmp/test_tts_audio.mp3. File size:", finalBuffer.length);
}

run().catch(console.error);
