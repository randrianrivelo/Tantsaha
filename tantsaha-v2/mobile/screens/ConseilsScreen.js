import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import AudioButton from '../components/AudioButton';

export default function ConseilsScreen() {
    const [conseils, setConseils] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadConseils();
    }, []);

    const loadConseils = async () => {
        try {
            const response = await api.get('/conseils');
            // On trie pour mettre la "Formation" (id:1) en premier
            setConseils(response.data.sort((a, b) => a.id - b.id));
        } catch (error) {
            console.log('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 50 }} />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.audioContainer}>
                <AudioButton label="🔊 Henoy ny torohevitra" audioKey="conseils_guide" />
            </View>

            <FlatList
                data={conseils}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => {
                    const isFormation = item.categorie === 'formation';
                    return (
                        <View style={[styles.card, isFormation && styles.formationCard]}>
                            <View style={styles.headerRow}>
                                <Ionicons 
                                    name={isFormation ? "school" : "bulb"} 
                                    size={24} 
                                    color={isFormation ? "#fff" : "#4CAF50"} 
                                />
                                <Text style={[styles.titre, isFormation && styles.formationText]}>
                                    {item.titre}
                                </Text>
                            </View>
                            <Text style={[styles.contenu, isFormation && styles.formationText]}>
                                {item.contenu}
                            </Text>
                        </View>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    audioContainer: { alignItems: 'center', marginVertical: 10 },
    list: { padding: 15 },
    card: { backgroundColor: '#fff', borderRadius: 15, padding: 20, marginBottom: 15, elevation: 3 },
    
    // Style spécial pour la formation
    formationCard: { backgroundColor: '#2E7D32', borderWidth: 2, borderColor: '#1B5E20' },
    formationText: { color: '#fff' },

    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    titre: { fontSize: 18, fontWeight: 'bold', color: '#333', marginLeft: 10, flex: 1 },
    contenu: { fontSize: 15, color: '#555', lineHeight: 24 },
});