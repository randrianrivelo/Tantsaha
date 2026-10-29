import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import AudioButton from '../components/AudioButton'; // 👈 AJOUTÉ ICI

const TYPES_JOURNAL = [
    { id: 'orana', icon: '🌧️', label: 'Orana', color: '#4FACFE' },
    { id: 'famafazana', icon: '🌱', label: 'Famafazana', color: '#43E97B' },
    { id: 'fijinjana', icon: '🌾', label: 'Fijinjana', color: '#F5AF19' },
    { id: 'fandena', icon: '💧', label: 'Fandena', color: '#4FC3F7' },
    { id: 'zezika', icon: '💩', label: 'Zezika', color: '#8D6E63' },
    { id: 'bibikely', icon: '🐛', label: 'Bibikely', color: '#F44336' },
    { id: 'fivarotana', icon: '💰', label: 'Fivarotana', color: '#9C27B0' },
    { id: 'hafa', icon: '📝', label: 'Hafa', color: '#607D8B' }
];

export default function JournalScreen() {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const [formData, setFormData] = useState({ titre: '', description: '', voly: '', quantite: '' });

    useEffect(() => {
        loadEntries();
    }, []);

    const loadEntries = async () => {
        try {
            const response = await api.get('/journal');
            setEntries(response.data);
        } catch (error) {
            console.log('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedType) {
            Alert.alert('Diso', 'Mila misafidy karazana');
            return;
        }

        try {
            const typeInfo = TYPES_JOURNAL.find(t => t.id === selectedType);
            await api.post('/journal', {
                type: selectedType,
                icon: typeInfo.icon,
                titre: formData.titre || typeInfo.label,
                description: formData.description,
                voly: formData.voly,
                quantite: formData.quantite
            });
            setModalVisible(false);
            setSelectedType(null);
            setFormData({ titre: '', description: '', voly: '', quantite: '' });
            loadEntries();
        } catch (error) {
            Alert.alert('Diso', 'Tsy afaka nanoratra');
        }
    };

    const handleDelete = (id) => {
        Alert.alert('Hamafa?', 'Tena hamafa ity fanamarihana ity ve?', [
            { text: 'Tsia', style: 'cancel' },
            {
                text: 'Eny',
                style: 'destructive',
                onPress: async () => {
                    await api.delete(`/journal/${id}`);
                    loadEntries();
                }
            }
        ]);
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 50 }} />;
    }

    return (
        <View style={styles.container}>
            {/* 👇 BOUTON AUDIO AJOUTÉ ICI 👇 */}
            <View style={styles.audioContainer}>
                <AudioButton label="🔊 Henoy ny torolalana" audioKey="journal_guide" />
            </View>
            {/* 👆 FIN AJOUT 👆 */}

            <FlatList
                data={entries}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onLongPress={() => handleDelete(item.id)}
                    >
                        <Text style={styles.entryIcon}>{item.icon}</Text>
                        <View style={styles.entryContent}>
                            <Text style={styles.entryTitle}>{item.titre}</Text>
                            {item.description && (
                                <Text style={styles.entryDescription}>{item.description}</Text>
                            )}
                            {item.voly && (
                                <Text style={styles.entryMeta}>🌱 {item.voly}</Text>
                            )}
                            {item.quantite && (
                                <Text style={styles.entryMeta}>📦 {item.quantite}</Text>
                            )}
                            <Text style={styles.entryDate}>
                                {item.dateMalagasy || new Date(item.date).toLocaleDateString('fr-FR')}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="book-outline" size={60} color="#ccc" />
                        <Text style={styles.emptyText}>Tsy mbola misy fanamarihana</Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => setModalVisible(true)}
            >
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>📝 Fanamarihana vaovao</Text>

                        <Text style={styles.label}>Karazana:</Text>
                        <View style={styles.typeGrid}>
                            {TYPES_JOURNAL.map((type) => (
                                <TouchableOpacity
                                    key={type.id}
                                    style={[
                                        styles.typeButton,
                                        selectedType === type.id && { backgroundColor: type.color }
                                    ]}
                                    onPress={() => setSelectedType(type.id)}
                                >
                                    <Text style={styles.typeIcon}>{type.icon}</Text>
                                    <Text style={[
                                        styles.typeLabel,
                                        selectedType === type.id && { color: '#fff' }
                                    ]}>{type.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="Lohateny (optionel)"
                            value={formData.titre}
                            onChangeText={(text) => setFormData({ ...formData, titre: text })}
                        />

                        <TextInput
                            style={[styles.input, { height: 80 }]}
                            placeholder="Antsipiriany - Inona no nataonao androany?"
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            multiline
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Voly voakasika (optionel)"
                            value={formData.voly}
                            onChangeText={(text) => setFormData({ ...formData, voly: text })}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Habetsaka (ex: 10 kg, 5 gony)"
                            value={formData.quantite}
                            onChangeText={(text) => setFormData({ ...formData, quantite: text })}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => {
                                    setModalVisible(false);
                                    setSelectedType(null);
                                    setFormData({ titre: '', description: '', voly: '', quantite: '' });
                                }}
                            >
                                <Text style={styles.cancelText}>Ajanona</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
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
    card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 12, elevation: 2 },
    entryIcon: { fontSize: 35, marginRight: 15 },
    entryContent: { flex: 1 },
    entryTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    entryDescription: { fontSize: 14, color: '#666', marginTop: 4 },
    entryMeta: { fontSize: 13, color: '#888', marginTop: 4 },
    entryDate: { fontSize: 12, color: '#aaa', marginTop: 6 },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: '#999', marginTop: 15 },
    fab: { position: 'absolute', right: 20, bottom: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', elevation: 8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, paddingBottom: 40, maxHeight: '90%' },
    modalTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    label: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
    typeGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
    typeButton: { width: '23%', margin: '1%', padding: 10, borderRadius: 12, backgroundColor: '#f0f0f0', alignItems: 'center' },
    typeIcon: { fontSize: 24 },
    typeLabel: { fontSize: 10, color: '#666', marginTop: 4 },
    input: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 15, marginBottom: 12, fontSize: 15 },
    modalButtons: { flexDirection: 'row', marginTop: 10 },
    cancelButton: { flex: 1, padding: 15, marginRight: 10, borderRadius: 12, backgroundColor: '#f0f0f0', alignItems: 'center' },
    cancelText: { color: '#666', fontWeight: 'bold' },
    saveButton: { flex: 1, padding: 15, marginLeft: 10, borderRadius: 12, backgroundColor: '#4CAF50', alignItems: 'center' },
    saveText: { color: '#fff', fontWeight: 'bold' }
});