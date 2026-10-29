import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Dimensions, Platform } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import audioPlayer from '../services/audioPlayer'; // 👈 IMPORT AUDIO AJOUTÉ

const { width, height } = Dimensions.get('window');
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 40 : StatusBar.currentHeight;

export default function HomeScreen({ navigation }) {
    const video = useRef(null);
    const [alertCount, setAlertCount] = useState(0);
    const [culturesActivesCount, setCulturesActivesCount] = useState(0);

    useEffect(() => {
        // 1. Jouer le son de bienvenue
        const playWelcome = async () => {
            try {
                // On attend un petit peu que l'app soit chargée (500ms)
                setTimeout(() => {
                    audioPlayer.play('welcome');
                }, 500);
            } catch (error) {
                console.log("Erreur audio:", error);
            }
        };
        playWelcome();

        // 2. Charger les compteurs
        loadCounts();
        const interval = setInterval(loadCounts, 30000); 
        return () => clearInterval(interval);
    }, []);

    const loadCounts = async () => {
        try {
            const alertRes = await api.get('/alerts/count');
            setAlertCount(alertRes.data.count);
            const activesRes = await api.get('/cultures-actives');
            const pretes = activesRes.data.filter(c => c.pret).length;
            setCulturesActivesCount(pretes);
        } catch (error) { console.log(error); }
    };

    const menuItems = [
        { title: "Toetr'andro", subtitle: "Météo sy vinavina", icon: "partly-sunny", color: "#4FACFE", screen: "Meteo", badge: 0 },
        { title: "Tati-boly", subtitle: "Boky fitadidiana", icon: "book", color: "#667EEA", screen: "Journal", badge: 0 },
        { title: "Voly", subtitle: "Karazam-boly", icon: "leaf", color: "#43E97B", screen: "Cultures", badge: culturesActivesCount },
        { title: "Toro-hevitra", subtitle: "Torohevitra fambolena", icon: "bulb", color: "#F5AF19", screen: "Conseils", badge: 0 },
        { title: "Kalandrie", subtitle: "Fotoam-pambolena", icon: "calendar", color: "#F093FB", screen: "Calendrier", badge: 0 },
        { title: "Fampitandremana", subtitle: "Vaovao sy alerte", icon: "notifications", color: "#FA709A", screen: "Alertes", badge: alertCount },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Vidéo de fond */}
            <Video
                ref={video}
                style={styles.backgroundVideo}
                source={require('../assets/video/background.mp4')}
                resizeMode={ResizeMode.COVER}
                shouldPlay
                isLooping
                isMuted={true}
            />
            <View style={styles.overlay} />

            {/* BOUTON AIDE (?) EN HAUT À DROITE */}
            <TouchableOpacity 
                style={styles.helpButton}
                onPress={() => navigation.navigate('Guide')}
                activeOpacity={0.7}
            >
                <Ionicons name="help-circle" size={32} color="#fff" />
            </TouchableOpacity>

            {/* CONTENU PRINCIPAL */}
            <ScrollView contentContainerStyle={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Ionicons name="leaf" size={60} color="#fff" />
                    <Text style={styles.headerTitle}>TANTSAHA CONNECT</Text>
                    <Text style={styles.headerSubtitle}>Ny namana eny an-tsaha</Text>
                </View>

                {/* Bouton Voly eo am-panjariana (si actif) */}
                {culturesActivesCount > 0 && (
                    <TouchableOpacity 
                        style={styles.activesButton}
                        onPress={() => navigation.navigate('CulturesActives')}
                    >
                        <Ionicons name="time" size={24} color="#fff" />
                        <Text style={styles.activesText}>
                            {culturesActivesCount} voly vonona hijinjana!
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Grille Menu */}
                <View style={styles.grid}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.card, { borderTopColor: item.color }]}
                            onPress={() => navigation.navigate(item.screen)}
                            activeOpacity={0.8}
                        >
                            {item.badge > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{item.badge}</Text>
                                </View>
                            )}
                            <View style={[styles.iconCircle, { backgroundColor: item.color + '30' }]}>
                                <Ionicons name={item.icon} size={32} color={item.color} />
                            </View>
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    backgroundVideo: { position: 'absolute', top: 0, left: 0, width: width, height: height },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    
    // Style du bouton AIDE
    helpButton: { 
        position: 'absolute', 
        top: STATUSBAR_HEIGHT + 10, 
        right: 20, 
        zIndex: 50, 
        backgroundColor: 'rgba(255,255,255,0.2)', 
        borderRadius: 25, 
        width: 44, 
        height: 44, 
        justifyContent: 'center', 
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)'
    },

    content: { paddingTop: 100, paddingHorizontal: 15, paddingBottom: 30 },
    header: { alignItems: 'center', marginBottom: 30 },
    headerTitle: { fontSize: 32, fontWeight: '900', color: '#fff', marginTop: 15, textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 10 },
    headerSubtitle: { fontSize: 18, color: '#C8E6C9', fontStyle: 'italic', marginTop: 5 },
    activesButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF9800', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 25, marginBottom: 20 },
    activesText: { color: '#fff', fontWeight: 'bold', marginLeft: 10, fontSize: 16 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    card: { width: '48%', backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 16, padding: 20, marginBottom: 15, alignItems: 'center', borderTopWidth: 4, elevation: 5, position: 'relative' },
    badge: { position: 'absolute', top: -8, right: -8, backgroundColor: '#F44336', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
    badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    iconCircle: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', textAlign: 'center' },
    cardSubtitle: { fontSize: 11, color: '#666', textAlign: 'center', marginTop: 4 }
});