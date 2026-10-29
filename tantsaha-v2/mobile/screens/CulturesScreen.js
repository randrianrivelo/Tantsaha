import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import AudioButton from '../components/AudioButton'; // 👈 IMPORT AUDIO

export default function CulturesScreen({ navigation }) {
    const [cultures, setCultures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [newCulture, setNewCulture] = useState({ nomMalagasy: '', description: '', duree: '' });

    useEffect(() => {
        loadCultures();
    }, []);

    const loadCultures = async () => {
        try {
            const response = await api.get('/cultures');
            setCultures(response.data);
        } catch (error) {
            console.log('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCulture = async () => {
        if (!newCulture.nomMalagasy.trim()) {
            Alert.alert('Diso', 'Mila manoratra ny anaran\'ny voly');
            return;
        }

        try {
            const response = await api.post('/cultures', {
                nomMalagasy: newCulture.nomMalagasy,
                description: newCulture.description || 'Voly nataon\'ny mpampiasa',
                duree: parseInt(newCulture.duree) || 90
            });
            setCultures([...cultures, response.data]);
            setModalVisible(false);
            setNewCulture({ nomMalagasy: '', description: '', duree: '' });
            Alert.alert('Vita!', 'Voasoratra ny voly vaovao');
        } catch (error) {
            Alert.alert('Diso', 'Tsy afaka nanoratra');
        }
    };

    const handleDeleteCulture = (id, nom) => {
        Alert.alert(
            'Hamafa?',
            `Tena hamafa ny "${nom}" ve ianao?`,
            [
                { text: 'Tsia', style: 'cancel' },
                {
                    text: 'Eny',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/cultures/${id}`);
                            setCultures(cultures.filter(c => c.id !== id));
                        } catch (error) {
                            Alert.alert('Diso', 'Tsy azo fafana ity voly ity');
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 50 }} />;
    }

    return (
        <View style={styles.container}>
            {/* 👇 BOUTON AUDIO AJOUTÉ ICI 👇 */}
            <View style={styles.audioContainer}>
                <AudioButton label="🔊 Henoy ny fanazavana" audioKey="cultures_guide" />
            </View>
            {/* 👆 FIN AJOUT 👆 */}

            <FlatList
                data={cultures}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <TouchableOpacity 
                        style={styles.card}
                        onPress={() => navigation.navigate('CultureDetail', { culture: item })}
                        onLongPress={() => item.personnalise && handleDeleteCulture(item.id, item.nomMalagasy)}
                    >
                        <Text style={styles.icon}>{item.image}</Text>
                        <View style={styles.info}>
                            <View style={styles.titleRow}>
                                <Text style={styles.name}>{item.nomMalagasy}</Text>
                                {item.personnalise && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>Ahy</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.description}>{item.description}</Text>
                            <Text style={styles.duree}>⏱️ {item.duree} andro</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#ccc" />
                    </TouchableOpacity>
                )}
            />

            <TouchableOpacity 
                style={styles.fab}
                onPress={() => setModalVisible(true)}
            >
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>🌿 Voly vaovao</Text>
                        
                        <TextInput
                            style={styles.input}
                            placeholder="Anaran'ny voly (ex: Voatabia)"
                            value={newCulture.nomMalagasy}
                            onChangeText={(text) => setNewCulture({...newCulture, nomMalagasy: text})}
                        />
                        
                        <TextInput
                            style={styles.input}
                            placeholder="Famaritana (optionel)"
                            value={newCulture.description}
                            onChangeText={(text) => setNewCulture({...newCulture, description: text})}
                            multiline
                        />
                        
                        <TextInput
                            style={styles.input}
                            placeholder="Faharetany (isan'andro, ex: 90)"
                            value={newCulture.duree}
                            onChangeText={(text) => setNewCulture({...newCulture, duree: text})}
                            keyboardType="numeric"
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={styles.cancelButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelText}>Ajanona</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.saveButton}
                                onPress={handleAddCulture}
                            >
                                <Text style={styles.saveText}>Tehirizo</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    audioContainer: { alignItems: 'center', marginVertical: 10 }, // 👈 STYLE AJOUTÉ
    list: { padding: 15, paddingBottom: 80 },
    card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 12, elevation: 3, alignItems: 'center' },
    icon: { fontSize: 45, marginRight: 15 },
    info: { flex: 1 },
    titleRow: { flexDirection: 'row', alignItems: 'center' },
    name: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    badge: { backgroundColor: '#4CAF50', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginLeft: 10 },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    description: { fontSize: 13, color: '#666', marginTop: 4 },
    duree: { fontSize: 12, color: '#999', marginTop: 4 },
    fab: { position: 'absolute', right: 20, bottom: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', elevation: 8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, paddingBottom: 40 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    input: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 15, marginBottom: 15, fontSize: 16 },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    cancelButton: { flex: 1, padding: 15, marginRight: 10, borderRadius: 12, backgroundColor: '#f0f0f0', alignItems: 'center' },
    cancelText: { color: '#666', fontWeight: 'bold' },
    saveButton: { flex: 1, padding: 15, marginLeft: 10, borderRadius: 12, backgroundColor: '#4CAF50', alignItems: 'center' },
    saveText: { color: '#fff', fontWeight: 'bold' },
});