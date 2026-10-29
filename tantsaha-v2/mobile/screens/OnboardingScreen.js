import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const slides = [
    {
        id: 1,
        icon: 'leaf',
        title: 'Tongasoa!',
        description: 'Tongasoa eto amin\'ny Tantsaha Connect. Ity application ity dia hanampy anao amin\'ny asa fambolena.',
        color: '#4CAF50'
    },
    {
        id: 2,
        icon: 'partly-sunny',
        title: 'Toetr\'andro',
        description: 'Jereo ny toetr\'andro amin\'ny faritra 6 eto Madagasikara. Fantaro raha hisy orana na tsia.',
        color: '#4FACFE'
    },
    {
        id: 3,
        icon: 'leaf',
        title: 'Voly',
        description: 'Jereo ny voly samihafa sy ny fotoana famafazana azy. Azonao atao koa ny manampy voly vaovao.',
        color: '#43E97B'
    },
    {
        id: 4,
        icon: 'notifications',
        title: 'Fampitandremana',
        description: 'Hahazo fampitandremana ianao rehefa tonga ny fotoana hijinjana ny volinao.',
        color: '#FA709A'
    },
    {
        id: 5,
        icon: 'book',
        title: 'Tati-boly',
        description: 'Soraty ny asa nataonao isan\'andro. Toy ny boky fitadidiana ho an\'ny tantsaha.',
        color: '#667EEA'
    }
];

export default function OnboardingScreen({ navigation }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = async () => {
        if (currentIndex < slides.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            await AsyncStorage.setItem('hasLaunched', 'true');
            navigation.replace('Home');
        }
    };

    const handleSkip = async () => {
        await AsyncStorage.setItem('hasLaunched', 'true');
        navigation.replace('Home');
    };

    const slide = slides[currentIndex];

    return (
        <View style={[styles.container, { backgroundColor: slide.color }]}>
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipText}>Handingana</Text>
            </TouchableOpacity>

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name={slide.icon} size={100} color="#fff" />
                </View>
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.description}>{slide.description}</Text>
            </View>

            <View style={styles.footer}>
                <View style={styles.pagination}>
                    {slides.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                index === currentIndex && styles.dotActive
                            ]}
                        />
                    ))}
                </View>

                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                    <Text style={styles.nextText}>
                        {currentIndex === slides.length - 1 ? 'Atombohy' : 'Manaraka'}
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    skipButton: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
    skipText: { color: 'rgba(255,255,255,0.8)', fontSize: 16 },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
    iconContainer: { width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
    title: { fontSize: 32, fontWeight: '900', color: '#fff', marginBottom: 20, textAlign: 'center' },
    description: { fontSize: 18, color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 26 },
    footer: { paddingHorizontal: 40, paddingBottom: 50 },
    pagination: { flexDirection: 'row', justifyContent: 'center', marginBottom: 30 },
    dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.4)', marginHorizontal: 5 },
    dotActive: { backgroundColor: '#fff', width: 30 },
    nextButton: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.3)', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
    nextText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginRight: 10 }
});