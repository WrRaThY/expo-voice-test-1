import * as FileSystem from 'expo-file-system';
import React, { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import Voice from "@react-native-voice/voice";
import { Audio, InterruptionModeAndroid } from 'expo-av';
import { InterruptionModeIOS } from "expo-av/src/Audio.types";

export default function App() {
    const [results, setResults] = useState([]);
    const [isListening, setIsListening] = useState(false);

    const [isRecording, setIsRecording] = useState(false);
    const [recording, setRecording] = useState(undefined);


    const [isPlayingRecordedSound, setIsPlayingRecordedSound] = useState(false);
    const [recordedSound, setRecordedSound] = useState(undefined);

    const [isPlaying, setIsPlaying] = useState(false);
    const [playingSound, setPlayingSound] = useState(undefined);

    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;
    Voice.addListener = () => {
        console.log('addListener');
    }
    Voice.removeListeners = () => {
        console.log('removeListeners');
    }

    Voice.getSpeechRecognitionServices().then(res => {
        console.log('services', res);
    })

    function onSpeechResults(e) {
        console.log('results', e);
        setResults(e.value ?? []);
    }

    function onSpeechError(e) {
        console.error(e);
    }


    useEffect(() => {
        return function cleanup() {
            Voice.destroy().then(Voice.removeAllListeners);
        };
    }, []);

    async function toggleListening() {
        try {
            if (isListening) {
                await Voice.stop();
                setIsListening(false);
            } else {
                setResults([]);
                await Voice.start("en-US");
                setIsListening(true);
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function toggleRecording() {
        try {
            if (isRecording) {
                await recording.stopAndUnloadAsync();
                const uri = recording.getURI();

                const fileInfo = await FileSystem.getInfoAsync(uri);

                console.log('Recording stopped and stored at', uri);

                console.log('fileInfo', fileInfo);

                setIsRecording(false);
            } else {
                const { recording } = await Audio.Recording.createAsync(
                    Audio.RecordingOptionsPresets.HIGH_QUALITY,
                    status => {
                        console.log(`recording status update: `, status);
                    }
                );
                setRecording(recording);
                setIsRecording(true);
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function togglePlayingRecordedSound() {
        try {
            if (isPlayingRecordedSound){
                console.log('stopping Sound');
                setIsPlayingRecordedSound(false);
                await recordedSound.stopAsync();
                await recordedSound.unloadAsync();
            } else {
                const { sound, status } = await recording.createNewLoadedSoundAsync(
                    {
                        isLooping: true,
                        volume: 1
                    },
                );
                console.log('sound status', status);
                console.log('Playing Sound');
                setRecordedSound(sound);
                await sound.playAsync();
                setIsPlayingRecordedSound(true);
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function togglePlaying() {
        try {
            if (isPlaying) {
                await playingSound.unloadAsync();
                setIsPlaying(false);
            } else {
                const { sound } = await Audio.Sound.createAsync(
                    // require('./assets/test-sound.m4a')
                    // require('./assets/weird.mp3')
                    require('./assets/applause.wav')
                );
                setPlayingSound(sound);
                await sound.playAsync();
                setIsPlaying(true);
            }
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <View style={styles.container}>
            <Button
                title="rquest permissions"
                onPress={async () => {
                    await Audio.requestPermissionsAsync();
                    await Audio.setAudioModeAsync({
                        allowsRecordingIOS: true,
                        playsInSilentModeIOS: true,
                        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
                        staysActiveInBackground: true,
                        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
                        shouldDuckAndroid: true,
                        playThroughEarpieceAndroid: true,
                    });
                }}
            />
            <Text>Press the button and start speaking.</Text>
            <Button
                title={isListening ? "Stop Recognizing" : "Start Recognizing"}
                onPress={toggleListening}
            />
            <Text>Results:</Text>
            {results.map((result, index) => {
                return <Text key={`result-${index}`}>{result}</Text>;
            })}

            <Button
                title={isRecording ? "Stop recording" : "Record"}
                onPress={toggleRecording}
            />
            <Button
                title={isPlayingRecordedSound ? "Stop playing" : "Start Playing"}
                onPress={togglePlayingRecordedSound}
            />
            <Text>File location: {recording?.getURI()}</Text>

            <Button
                title={isPlaying ? "Stop playing" : "Play test sound"}
                onPress={togglePlaying}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F5FCFF",
    },
});