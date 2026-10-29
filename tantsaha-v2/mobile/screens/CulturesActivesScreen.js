import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

export default function CulturesActivesScreen({ navigation }) {
    const [cultures, setCultures] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCultures();
    }, []);

    const loadCultures = async () => {
        try {
            const response = await api.get('/cultures-actives');
            setCultures(response.data);
        } catch (error) {
            console.log('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMampiakatra = (culture) => {
        Alert.alert(
            '🌾 Mampiakatra vokatra',
            `Efa vonona hijinjana ny ${culture.cultureName} ve?`,
            [
                { text: 'Tsia', style: 'cancel' },
                {
                    text: 'Eny, Hijinja!',
                    onPress: async () => {
                        try {
                            await api.post(`/cultures-actives/mampiakatra/${culture.id}`);
                            Alert.alert('✅ Arahabaina!', `Tonga soa ny vokatra ${culture.cultureName}!`);
                            loadCultures();
                        } catch (error) {
                            Alert.alert('Diso', 'Tsy afaka nanoratra');
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 50 }} />;
    }

    if (cultures.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="leaf-outline" size={80} color="#ccc" />
                <Text style={styles.emptyText}>Tsy mbola misy voly eo am-panjariana</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('Cultures')}
                >
                    <Text style={styles.addButtonText}>Hamafy voly vaovao</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <FlatList
            data={cultures}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
                <View style={[styles.card, item.pret && styles.cardReady]}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cultureName}>🌱 {item.cultureName}</Text>
                        {item.pret && (
                            <View style={styles.readyBadge}>
                                <Text style={styles.readyBadgeText}>Vonona!</Text>
                            </View>
                        )}
                    </View>

                    {/* Barre de progression */}
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${item.progression}%` }, item.pret && styles.progressReady]} />
                        </View>
                        <Text style={styles.progressText}>{item.progression}%</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <Ionicons name="calendar-outline" size={16} color="#666" />
                            <Text style={styles.infoText}>
                                Voafafy: {new Date(item.dateDebut).toLocaleDateString('fr-FR')}
                            </Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="time-outline" size={16} color="#666" />
                            <Text style={styles.infoText}>
                                {item.pret ? 'Vonona hijinjana!' : `${item.joursRestants} andro sisa`}
                            </Text>
                        </View>
                    </View>

                    {/* Bouton Mampiakatra */}
                    <TouchableOpacity
                        style={[styles.harvestButton, !item.pret && styles.harvestButtonDisabled]}
                        onPress={() => handleMampiakatra(item)}
                    >
                        <Ionicons name="checkmark-circle" size={24} color="#fff" />
                        <Text style={styles.harvestButtonText}>🌾 Mampiakatra vokatra</Text>
                    </TouchableOpacity>
                </View>
            )}
        />
    );
}

const styles = StyleSheet.create({
    list: { padding: 15 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
    emptyText: { color: '#999', fontSize: 16, marginTop: 20, textAlign: 'center' },
    addButton: { marginTop: 20, backgroundColor: '#4CAF50', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
    addButtonText: { color: '#fff', fontWeight: 'bold' },
    card: { backgroundColor: '#fff', borderRadius: 15, padding: 20, marginBottom: 15, elevation: 3 },
    cardReady: { borderWidth: 2, borderColor: '#FF9800' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    cultureName: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    readyBadge: { backgroundColor: '#FF9800', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    readyBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    progressContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    progressBar: { flex: 1, height: 12, backgroundColor: '#e0e0e0', borderRadius: 6, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 6 },
    progressReady: { backgroundColor: '#FF9800' },
    progressText: { marginLeft: 10, fontWeight: 'bold', color: '#333' },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    infoItem: { flexDirection: 'row', alignItems: 'center' },
    infoText: { marginLeft: 5, color: '#666', fontSize: 13 },
    harvestButton: { backgroundColor: '#FF9800', padding: 15, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    harvestButtonDisabled: { backgroundColor: '#ccc' },
    harvestButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 10 }
});