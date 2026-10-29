import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

export default function CultureDetailScreen({ route, navigation }) {
    const { culture } = route.params;
    const [loading, setLoading] = useState(false);

    const handleHamafy = async () => {
        Alert.alert(
            '🌱 Hamafy',
            `Tena hanomboka hambolena ${culture.nomMalagasy} ve ianao? Haharitra ${culture.duree} andro ny fambolena.`,
            [
                { text: 'Tsia', style: 'cancel' },
                {
                    text: 'Eny, Hamafy!',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await api.post('/cultures-actives/hamafy', {
                                cultureId: culture.id,
                                cultureName: culture.nomMalagasy,
                                duree: culture.duree
                            });
                            Alert.alert(
                                '✅ Vita!',
                                `Efa nanomboka ny fambolena ${culture.nomMalagasy}. Ho masaka afaka ${culture.duree} andro.`,
                                [{ text: 'OK', onPress: () => navigation.navigate('CulturesActives') }]
                            );
                        } catch (error) {
                            Alert.alert('Diso', 'Tsy afaka nanoratra');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.icon}>{culture.image}</Text>
                <Text style={styles.name}>{culture.nomMalagasy}</Text>
                {culture.nom !== culture.nomMalagasy && (
                    <Text style={styles.nameFr}>({culture.nom})</Text>
                )}
                <Text style={styles.description}>{culture.description}</Text>
            </View>

            {/* Boutons d'action */}
            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.hamafyButton]}
                    onPress={handleHamafy}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="leaf" size={24} color="#fff" />
                            <Text style={styles.actionButtonText}>🌱 Hamafy</Text>
                            <Text style={styles.actionButtonSubtext}>Hanomboka hambolena</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Informations */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📅 Fotoana famafazana</Text>
                <View style={styles.tagContainer}>
                    {culture.saisonSemis?.map((mois, index) => (
                        <View key={index} style={[styles.tag, { backgroundColor: '#E8F5E9' }]}>
                            <Text style={[styles.tagText, { color: '#2E7D32' }]}>{mois}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🌾 Fotoana fijinjana</Text>
                <View style={styles.tagContainer}>
                    {culture.saisonRecolte?.map((mois, index) => (
                        <View key={index} style={[styles.tag, { backgroundColor: '#FFF3E0' }]}>
                            <Text style={[styles.tagText, { color: '#E65100' }]}>{mois}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>⏱️ Faharetany</Text>
                <View style={styles.durationBox}>
                    <Ionicons name="time" size={30} color="#4CAF50" />
                    <Text style={styles.durationText}>{culture.duree} andro</Text>
                </View>
            </View>

            {culture.fahasalamana && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>💪 Fahasalamana</Text>
                    <Text style={styles.infoText}>{culture.fahasalamana}</Text>
                </View>
            )}

            {culture.tpikarakara && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🛠️ Fikarakarana</Text>
                    <Text style={styles.infoText}>{culture.tpikarakara}</Text>
                </View>
            )}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>💡 Toro-hevitra</Text>
                {culture.conseils?.map((conseil, index) => (
                    <View key={index} style={styles.conseilItem}>
                        <Text style={styles.conseilNumber}>{index + 1}</Text>
                        <Text style={styles.conseilText}>{conseil}</Text>
                    </View>
                ))}
            </View>

            <View style={{ height: 30 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { backgroundColor: '#4CAF50', padding: 30, alignItems: 'center' },
    icon: { fontSize: 80 },
    name: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginTop: 10 },
    nameFr: { fontSize: 16, color: '#C8E6C9' },
    description: { fontSize: 14, color: '#C8E6C9', textAlign: 'center', marginTop: 10, paddingHorizontal: 20 },
    actionButtons: { padding: 15, backgroundColor: '#fff', marginBottom: 10 },
    actionButton: { padding: 20, borderRadius: 15, alignItems: 'center', elevation: 3 },
    hamafyButton: { backgroundColor: '#4CAF50' },
    actionButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 5 },
    actionButtonSubtext: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 3 },
    section: { backgroundColor: '#fff', margin: 10, marginTop: 0, padding: 20, borderRadius: 15, elevation: 2 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
    tagContainer: { flexDirection: 'row', flexWrap: 'wrap' },
    tag: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 10, marginBottom: 10 },
    tagText: { fontWeight: '600' },
    durationBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', padding: 15, borderRadius: 12 },
    durationText: { fontSize: 24, fontWeight: 'bold', color: '#2E7D32', marginLeft: 15 },
    infoText: { fontSize: 14, color: '#555', lineHeight: 22 },
    conseilItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
    conseilNumber: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#4CAF50', color: '#fff', textAlign: 'center', lineHeight: 26, fontWeight: 'bold', marginRight: 12 },
    conseilText: { flex: 1, fontSize: 14, color: '#555', lineHeight: 20 }
});