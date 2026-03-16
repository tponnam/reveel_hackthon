const textToSpeech = require("@google-cloud/text-to-speech");
const path = require("path");
const doTest = async () => {
    try {
        console.log("Initializing TTS client...");
        const client = new textToSpeech.TextToSpeechClient();
        console.log("Sending synthesize request...");
        const [response] = await client.synthesizeSpeech({
            input: { text: "Hello, this is a test of the text to speech API." },
            voice: { languageCode: "en-US", name: "en-US-Studio-O" },
            audioConfig: { audioEncoding: "MP3" },
        });
        console.log("Success! Audio length:", response.audioContent.length);
    } catch (err) {
        console.error("TTS Test Failed:", err.message);
    }
};
doTest();
