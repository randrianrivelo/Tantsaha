import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

const JOURS = ['Ala', 'Ala', 'Tal', 'Ala', 'Ala', 'Zom', 'Sab'];
const VOLANA = ['Janoary', 'Febroary', 'Martsa', 'Aprily', 'Mey', 'Jona', 'Jolay', 'Aogositra', 'Septambra', 'Oktobra', 'Novambra', 'Desambra'];

export default function CalendrierScreen() {
    const [saisons, setSaisons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [notes, setNotes] = useState([]);
    
    // États pour les modales
    const [calendarVisible, setCalendarVisible] = useState(false);
    const [noteModalVisible, setNoteModalVisible] = useState(false);
    
    const [selectedDate, setSelectedDate] = useState(null);
    const [noteText, setNoteText] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (calendarVisible) loadNotes();
    }, [currentDate, calendarVisible]);

    const loadData = async () => {
        try {
            const response = await api.get('/calendrier');
            setSaisons(response.data);
        } catch (error) {
            console.log('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadNotes = async () => {
        try {
            const mois = currentDate.getMonth() + 1;
            const taona = currentDate.getFullYear();
            const response = await api.get(`/calendrier/notes?mois=${mois}&taona=${taona}`);
            setNotes(response.data);
        } catch (error) {
            console.log('Erreur notes:', error);
        }
    };

    const getDaysInMonth = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        for (let i = 0; i < firstDay; i++) { days.push(null); }
        for (let i = 1; i <= daysInMonth; i++) { days.push(i); }
        return days;
    };

    const handleDayPress = (day) => {
        if (!day) return;
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelectedDate(dateStr);
        setNoteModalVisible(true);
    };

    const handleSaveNote = async () => {
        if (!noteText.trim()) {
            Alert.alert('Diso', 'Mila manoratra fanamarihana');
            return;
        }
        try {
            await api.post('/calendrier/notes', { date: selectedDate, contenu: noteText });
            setNoteModalVisible(false);
            setNoteText('');
            loadNotes();
            Alert.alert('Vita', 'Voarakitra ny fanamarihana');
        } catch (error) {
            Alert.alert('Diso', 'Tsy afaka nanoratra');
        }
    };

    const changeMonth = (delta) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setCurrentDate(newDate);
    };

    const hasNote = (day) => {
        if (!day) return false;
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return notes.some(n => n.date === dateStr);
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 50 }} />;
    }

    return (
        <ScrollView style={styles.container}>
            {/* BOUTON VRAI CALENDRIER */}
            <TouchableOpacity
                style={styles.calendarButton}
                onPress={() => setCalendarVisible(true)}
            >
                <View style={styles.calendarIconContainer}>
                    <Ionicons name="calendar" size={30} color="#fff" />
                </View>
                <View>
                    <Text style={styles.calendarButtonTitle}>Hijery Kalandrie Feno</Text>
                    <Text style={styles.calendarButtonSubtitle}>Daty, Volana, Fanamarihana</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#4CAF50" style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>

            {/* LISTE DES SAISONS AGRICOLES */}
            <Text style={styles.sectionTitle}>🌿 Vanim-potoana fambolena</Text>

            {saisons.map((saison, index) => (
                <View key={index} style={[styles.saisonCard, { borderLeftColor: saison.color }]}>
                    <View style={styles.saisonHeader}>
                        <Text style={styles.saisonIcon}>{saison.icon}</Text>
                        <View>
                            <Text style={styles.saisonName}>{saison.saison}</Text>
                            <Text style={styles.saisonMois}>{saison.mois.join(' - ')}</Text>
                        </View>
                    </View>
                    <View style={styles.activitesContainer}>
                        <Text style={styles.activitesTitle}>Asa atao:</Text>
                        {saison.activites.map((act, actIndex) => (
                            <View key={actIndex} style={styles.activiteRow}>
                                <Ionicons name="checkmark-circle-outline" size={16} color="green" />
                                <Text style={styles.activite}>{act}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            ))}

            {/* MODAL: VRAI CALENDRIER */}
            <Modal visible={calendarVisible} animationType="slide" onRequestClose={() => setCalendarVisible(false)}>
                <View style={styles.fullCalendarContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setCalendarVisible(false)}>
                            <Ionicons name="close" size={30} color="#333" />
                        </TouchableOpacity>
                        <Text style={styles.modalHeaderTitle}>Kalandrie 2025</Text>
                        <View style={{ width: 30 }} />
                    </View>

                    <View style={styles.calendarCard}>
                        <View style={styles.calendarNav}>
                            <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navBtn}>
                                <Ionicons name="chevron-back" size={24} color="#fff" />
                            </TouchableOpacity>
                            <Text style={styles.calendarTitle}>
                                {VOLANA[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </Text>
                            <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navBtn}>
                                <Ionicons name="chevron-forward" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.weekRow}>
                            {JOURS.map((j, i) => (
                                <Text key={i} style={styles.weekDay}>{j}</Text>
                            ))}
                        </View>

                        <View style={styles.daysGrid}>
                            {getDaysInMonth().map((day, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.dayCell,
                                        day === new Date().getDate() &&
                                        currentDate.getMonth() === new Date().getMonth() &&
                                        currentDate.getFullYear() === new Date().getFullYear() && styles.todayCell
                                    ]}
                                    onPress={() => handleDayPress(day)}
                                >
                                    <Text style={[styles.dayText, !day && { color: 'transparent' }]}>
                                        {day || ''}
                                    </Text>
                                    {hasNote(day) && <View style={styles.noteDot} />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.hintBox}>
                        <Ionicons name="information-circle" size={24} color="#666" />
                        <Text style={styles.hintText}>Tsindrio ny daty hanampiana fanamarihana.</Text>
                    </View>
                </View>
            </Modal>

            {/* MODAL: AJOUT DE NOTE */}
            <Modal visible={noteModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.noteModalContent}>
                        <Text style={styles.noteModalTitle}>📝 Fanamarihana</Text>
                        <Text style={styles.modalDate}>{selectedDate}</Text>
                        <TextInput
                            style={styles.noteInput}
                            placeholder="Inona no tokony hatao amin'ity andro ity?"
                            value={noteText}
                            onChangeText={setNoteText}
                            multiline
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => { setNoteModalVisible(false); setNoteText(''); }}
                            >
                                <Text style={styles.cancelText}>Ajanona</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={handleSaveNote}>
                                <Text style={styles.saveText}>Tehirizo</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <View style={{ height: 30 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    
    // Bouton Calendrier Principal
    calendarButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        margin: 15,
        padding: 15,
        borderRadius: 15,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    calendarIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15
    },
    calendarButtonTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    calendarButtonSubtitle: { fontSize: 13, color: '#666' },

    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginHorizontal: 15, marginTop: 10, marginBottom: 10 },
    
    // Cartes Saisons
    saisonCard: { backgroundColor: '#fff', marginHorizontal: 15, marginBottom: 15, padding: 20, borderRadius: 15, borderLeftWidth: 5, elevation: 2 },
    saisonHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    saisonIcon: { fontSize: 40, marginRight: 15 },
    saisonName: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    saisonMois: { fontSize: 14, color: '#666' },
    activitesContainer: { backgroundColor: '#f9f9f9', padding: 10, borderRadius: 10 },
    activitesTitle: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 5 },
    activiteRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    activite: { fontSize: 14, color: '#666', marginLeft: 5 },

    // Modal Calendrier Plein Écran
    fullCalendarContainer: { flex: 1, backgroundColor: '#f0f4f8' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', elevation: 2 },
    modalHeaderTitle: { fontSize: 20, fontWeight: 'bold' },
    
    calendarCard: { backgroundColor: '#fff', margin: 20, borderRadius: 20, padding: 15, elevation: 5 },
    calendarNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, backgroundColor: '#4CAF50', padding: 10, borderRadius: 15 },
    navBtn: { padding: 5 },
    calendarTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    weekRow: { flexDirection: 'row', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
    weekDay: { flex: 1, textAlign: 'center', fontWeight: 'bold', color: '#888' },
    daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    dayCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', position: 'relative' },
    dayText: { fontSize: 16, color: '#333', fontWeight: '500' },
    todayCell: { backgroundColor: '#E8F5E9', borderRadius: 50, borderWidth: 1, borderColor: '#4CAF50' },
    noteDot: { position: 'absolute', bottom: 5, width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF9800' },
    
    hintBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20 },
    hintText: { marginLeft: 10, color: '#666', fontSize: 14 },

    // Modal Note
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    noteModalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 25, elevation: 10 },
    noteModalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
    modalDate: { textAlign: 'center', color: '#666', marginTop: 5, marginBottom: 15 },
    noteInput: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 15, height: 120, textAlignVertical: 'top', fontSize: 16 },
    modalButtons: { flexDirection: 'row', marginTop: 20 },
    cancelButton: { flex: 1, padding: 15, marginRight: 10, borderRadius: 12, backgroundColor: '#f0f0f0', alignItems: 'center' },
    cancelText: { color: '#666', fontWeight: 'bold' },
    saveButton: { flex: 1, padding: 15, marginLeft: 10, borderRadius: 12, backgroundColor: '#4CAF50', alignItems: 'center' },
    saveText: { color: '#fff', fontWeight: 'bold' }
});