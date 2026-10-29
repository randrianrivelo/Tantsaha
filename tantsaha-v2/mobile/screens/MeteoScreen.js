import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
// 👇 AJOUT DE L'IMPORT AUDIO
import AudioButton from '../components/AudioButton';

export default function MeteoScreen() {
    const [meteo, setMeteo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [province, setProvince] = useState('antananarivo');
    const [provinces, setProvinces] = useState([]);

    useEffect(() => {
        loadProvinces();
    }, []);

    useEffect(() => {
        loadMeteo();
    }, [province]);

    const loadProvinces = async () => {
        try {
            const response = await api.get('/meteo/provinces');
            setProvinces(response.data);
        } catch (error) {
            console.log('Erreur provinces:', error);
        }
    };

    const loadMeteo = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/meteo?province=${province}`);
            setMeteo(response.data);
        } catch (error) {
            console.log('Erreur météo:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadMeteo();
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>Mitady vaovao...</Text>
            </View>
        );
    }

    // Déterminer quel son jouer
    const audioKey = (meteo && meteo.pluie) ? 'meteo_rain' : 'meteo_sun';

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />}
        >
            {/* Sélecteur de province */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.provinceContainer}>
                {provinces.map((p) => (
                    <TouchableOpacity
                        key={p.id}
                        style={[styles.provinceChip, province === p.id && styles.provinceChipActive]}
                        onPress={() => setProvince(p.id)}
                    >
                        <Text style={[styles.provinceText, province === p.id && styles.provinceTextActive]}>
                            {p.type === 'cotier' ? '🌊 ' : '🏔️ '}{p.nom}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {meteo && (
                <>
                    {/* Carte principale */}
                    <View style={styles.mainCard}>
                        <Text style={styles.provinceName}>{meteo.province}</Text>
                        <Text style={styles.provinceDesc}>{meteo.description}</Text>
                        <Text style={styles.mainIcon}>{meteo.icon}</Text>
                        <Text style={styles.temperature}>{meteo.temperature}°C</Text>
                        <Text style={styles.description}>{meteo.descriptionMeteo}</Text>
                        
                        <View style={styles.minMax}>
                            <Text style={styles.minMaxText}>↓ {meteo.tempMin}°</Text>
                            <Text style={styles.minMaxText}>↑ {meteo.tempMax}°</Text>
                        </View>

                        {/* 👇 BOUTON AUDIO AJOUTÉ ICI */}
                        <View style={{ marginTop: 15 }}>
                            <AudioButton label="🔊 Henoina" audioKey={audioKey} />
                        </View>

                        {meteo.erreur && (
                            <View style={styles.errorBanner}>
                                <Ionicons name="warning" size={20} color="#FF9800" />
                                <Text style={styles.errorText}>{meteo.messageErreur}</Text>
                            </View>
                        )}
                    </View>

                    {/* Détails */}
                    <View style={styles.detailsCard}>
                        <View style={styles.detailRow}>
                            <Ionicons name="water" size={24} color="#4FACFE" />
                            <Text style={styles.detailLabel}>Hamandoana</Text>
                            <Text style={styles.detailValue}>{meteo.humidite}%</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Ionicons name="speedometer" size={24} color="#43E97B" />
                            <Text style={styles.detailLabel}>Rivotra</Text>
                            <Text style={styles.detailValue}>{meteo.vent} km/h</Text>
                        </View>
                        {meteo.directionVent && (
                            <View style={styles.detailRow}>
                                <Ionicons name="compass" size={24} color="#667EEA" />
                                <Text style={styles.detailLabel}>Fiavian'ny rivotra</Text>
                                <Text style={styles.detailValue}>{meteo.directionVent}</Text>
                            </View>
                        )}
                    </View>

                    {/* Données maritimes (zones côtières seulement) */}
                    {meteo.maritime && (
                        <View style={styles.maritimeCard}>
                            <Text style={styles.sectionTitle}>🌊 Ranomasina</Text>
                            <View style={styles.maritimeGrid}>
                                <View style={styles.maritimeItem}>
                                    <Text style={styles.maritimeValue}>{meteo.maritime.hauteurVagues}</Text>
                                    <Text style={styles.maritimeLabel}>Onja</Text>
                                </View>
                                <View style={styles.maritimeItem}>
                                    <Text style={styles.maritimeValue}>{meteo.maritime.maree}</Text>
                                    <Text style={styles.maritimeLabel}>Rano</Text>
                                </View>
                                <View style={styles.maritimeItem}>
                                    <Text style={styles.maritimeValue}>{meteo.maritime.temperatureEau}°C</Text>
                                    <Text style={styles.maritimeLabel}>Hafanan'ny rano</Text>
                                </View>
                            </View>
                            <Text style={styles.maritimeConseil}>{meteo.maritime.conseil}</Text>
                        </View>
                    )}

                    {/* Prévisions */}
                    {meteo.previsions && meteo.previsions.length > 0 && (
                        <View style={styles.forecastCard}>
                            <Text style={styles.sectionTitle}>📅 Vinavina 5 andro</Text>
                            {meteo.previsions.map((prev, index) => (
                                <View key={index} style={styles.forecastRow}>
                                    <Text style={styles.forecastDay}>{prev.jour}</Text>
                                    <Text style={styles.forecastIcon}>{prev.icon}</Text>
                                    <Text style={styles.forecastTemp}>{prev.temperature}°C</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Conseil agricole */}
                    {meteo.conseilAgricole && (
                        <View style={styles.adviceCard}>
                            <Text style={styles.sectionTitle}>🌾 Toro-hevitra ho an'ny tantsaha</Text>
                            <Text style={styles.adviceText}>{meteo.conseilAgricole}</Text>
                        </View>
                    )}
                </>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4f8' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, color: '#666' },
    provinceContainer: { paddingHorizontal: 10, paddingVertical: 15 },
    provinceChip: { backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, marginRight: 10, elevation: 2 },
    provinceChipActive: { backgroundColor: '#4CAF50' },
    provinceText: { color: '#333', fontWeight: '500', fontSize: 13 },
    provinceTextActive: { color: '#fff' },
    mainCard: { margin: 15, backgroundColor: '#4CAF50', borderRadius: 25, padding: 25, alignItems: 'center', elevation: 5 },
    provinceName: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    provinceDesc: { color: '#C8E6C9', fontSize: 12, marginBottom: 10 },
    mainIcon: { fontSize: 80, marginVertical: 10 },
    temperature: { fontSize: 60, fontWeight: '900', color: '#fff' },
    description: { fontSize: 18, color: '#C8E6C9', textTransform: 'capitalize' },
    minMax: { flexDirection: 'row', marginTop: 15 },
    minMaxText: { color: '#fff', fontSize: 16, marginHorizontal: 15 },
    errorBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 10, marginTop: 15 },
    errorText: { color: '#fff', marginLeft: 10, fontSize: 12 },
    detailsCard: { marginHorizontal: 15, backgroundColor: '#fff', borderRadius: 15, padding: 15, elevation: 3 },
    detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    detailLabel: { flex: 1, marginLeft: 15, fontSize: 15, color: '#555' },
    detailValue: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    maritimeCard: { margin: 15, backgroundColor: '#E3F2FD', borderRadius: 15, padding: 20, elevation: 3 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
    maritimeGrid: { flexDirection: 'row', justifyContent: 'space-around' },
    maritimeItem: { alignItems: 'center' },
    maritimeValue: { fontSize: 20, fontWeight: 'bold', color: '#1976D2' },
    maritimeLabel: { fontSize: 12, color: '#666', marginTop: 5 },
    maritimeConseil: { marginTop: 15, padding: 10, backgroundColor: '#fff', borderRadius: 10, color: '#333', textAlign: 'center' },
    forecastCard: { margin: 15, backgroundColor: '#fff', borderRadius: 15, padding: 15, elevation: 3 },
    forecastRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    forecastDay: { flex: 1, fontSize: 15 },
    forecastIcon: { fontSize: 24, marginHorizontal: 10 },
    forecastTemp: { fontSize: 16, fontWeight: 'bold' },
    adviceCard: { margin: 15, marginBottom: 30, backgroundColor: '#FFF8E1', borderRadius: 15, padding: 20, elevation: 3 },
    adviceText: { fontSize: 15, color: '#333', lineHeight: 22 },
});