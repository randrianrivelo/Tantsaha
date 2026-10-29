import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const guideItems = [
    {
        icon: 'partly-sunny',
        title: 'Toetr\'andro',
        color: '#4FACFE',
        steps: [
            'Tsindrio ny "Toetr\'andro" ao amin\'ny pejy voalohany',
            'Safidio ny faritra tianao (Antananarivo, Toamasina, sns)',
            'Jereo ny hafanana, ny rivotra, ary ny vinavina 5 andro',
            'Ho an\'ny morontsiraka: jereo ny halavan\'ny onja sy ny rano'
        ]
    },
    {
        icon: 'leaf',
        title: 'Voly',
        color: '#43E97B',
        steps: [
            'Tsindrio ny "Voly" hijery ny lisitry ny voly',
            'Tsindrio ny voly iray hijery ny antsipiriany',
            'Tsindrio "Hamafy" raha te hanomboka hambolena',
            'Tsindrio "Mampiakatra vokatra" rehefa masaka ny volinao',
            'Tsindrio ny "+" raha te hanampy voly vaovao'
        ]
    },
    {
        icon: 'book',
        title: 'Tati-boly',
        color: '#667EEA',
        steps: [
            'Tsindrio ny "Tati-boly" hijery ny tantaram-pambolenao',
            'Tsindrio ny "+" hanampy fanamarihana vaovao',
            'Safidio ny karazana (orana, famafazana, fijinjana, sns)',
            'Soraty ny antsipiriany sy ny habetsaky ny vokatra'
        ]
    },
    {
        icon: 'notifications',
        title: 'Fampitandremana',
        color: '#FA709A',
        steps: [
            'Jereo ny isa mena eo amin\'ny kisary - ireo no vaovao',
            'Tsindrio ny "Fampitandremana" hijery ny lisitra',
            'Hahazo fampitandremana ianao rehefa tonga ny fotoana fijinjana'
        ]
    },
    {
        icon: 'calendar',
        title: 'Kalandrie',
        color: '#F093FB',
        steps: [
            'Jereo ny fizarana 4 ny taona (lohataona, fahavaratra, sns)',
            'Tsindrio ny kisarin\'ny kalandrie hijery ny daty',
            'Azonao atao ny manampy fanamarihana isaky ny andro'
        ]
    }
];

export default function GuideScreen() {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="help-circle" size={60} color="#4CAF50" />
                <Text style={styles.headerTitle}>Torolalana fampiasana</Text>
                <Text style={styles.headerSubtitle}>Ahoana ny fampiasana ny Tantsaha Connect</Text>
            </View>

            {guideItems.map((item, index) => (
                <View key={index} style={styles.card}>
                    <View style={[styles.cardHeader, { backgroundColor: item.color }]}>
                        <Ionicons name={item.icon} size={30} color="#fff" />
                        <Text style={styles.cardTitle}>{item.title}</Text>
                    </View>
                    <View style={styles.cardContent}>
                        {item.steps.map((step, stepIndex) => (
                            <View key={stepIndex} style={styles.step}>
                                <Text style={styles.stepNumber}>{stepIndex + 1}</Text>
                                <Text style={styles.stepText}>{step}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            ))}

            <View style={styles.footer}>
                <Text style={styles.footerText}>📞 Raha misy olana: tantsaha.connect@gmail.com</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { alignItems: 'center', padding: 30, backgroundColor: '#fff' },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 15 },
    headerSubtitle: { fontSize: 14, color: '#666', marginTop: 5 },
    card: { margin: 15, backgroundColor: '#fff', borderRadius: 15, overflow: 'hidden', elevation: 3 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 15 },
    cardTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 15 },
    cardContent: { padding: 15 },
    step: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
    stepNumber: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#4CAF50', color: '#fff', textAlign: 'center', lineHeight: 24, fontWeight: 'bold', marginRight: 12 },
    stepText: { flex: 1, fontSize: 14, color: '#555', lineHeight: 20 },
    footer: { padding: 30, alignItems: 'center' },
    footerText: { color: '#999', fontSize: 12 }
});