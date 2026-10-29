import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import audioPlayer from '../services/audioPlayer';

export default function AudioButton({ label, audioKey }) {
    return (
        <TouchableOpacity 
            style={styles.btn} 
            onPress={() => audioPlayer.play(audioKey)}
        >
            <Text style={styles.icon}>🔊</Text>
            <Text style={styles.text}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    btn: {
        flexDirection: 'row',
        backgroundColor: '#E8F5E9',
        padding: 10,
        borderRadius: 20,
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginTop: 5,
        borderWidth: 1,
        borderColor: '#4CAF50'
    },
    icon: { fontSize: 18, marginRight: 5 },
    text: { color: '#2E7D32', fontWeight: 'bold' }
});