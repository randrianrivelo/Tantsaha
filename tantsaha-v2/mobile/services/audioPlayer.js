import { Audio } from 'expo-av';

// Chargement statique des fichiers (Obligatoire pour Expo)
const SOUND_FILES = {
    welcome: require('../assets/audio/welcome.mp3'),
    meteo_rain: require('../assets/audio/meteo_rain.mp3'),
    meteo_sun: require('../assets/audio/meteo_sun.mp3'),
    journal_success: require('../assets/audio/journal_success.mp3'),
    journal_guide: require('../assets/audio/journal_guide.mp3'),
    cultures_guide: require('../assets/audio/cultures_guide.mp3'),
    conseils_guide: require('../assets/audio/conseils_guide.mp3'),

};

class AudioPlayer {
    constructor() {
        this.sound = null;
    }

    async play(key) {
        try {
            // 1. Vérifier si le son existe
            if (!SOUND_FILES[key]) {
                console.warn(`⚠️ Audio introuvable pour la clé : "${key}"`);
                return;
            }

            // 2. Arrêter le son précédent s'il y en a un
            if (this.sound) {
                await this.sound.unloadAsync();
                this.sound = null;
            }

            // 3. Configurer l'audio pour qu'il soit fort
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false, // Jouer sur le haut-parleur principal
            });

            // 4. Charger et Jouer
            const { sound } = await Audio.Sound.createAsync(
                SOUND_FILES[key],
                { shouldPlay: true, volume: 1.0 }
            );
            
            this.sound = sound;

            // 5. Nettoyer après lecture
            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) {
                    sound.unloadAsync();
                    this.sound = null;
                }
            });

        } catch (error) {
            console.error("❌ ERREUR AUDIO:", error);
        }
    }

    async stop() {
        if (this.sound) {
            await this.sound.stopAsync();
            await this.sound.unloadAsync();
            this.sound = null;
        }
    }
}

export default new AudioPlayer();