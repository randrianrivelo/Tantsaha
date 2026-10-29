import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

export default function AlertesScreen() {
    const [alertes, setAlertes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAlertes();
    }, []);

    const loadAlertes = async () => {
        try {
            const response = await api.get('/alerts');
            setAlertes(response.data);
        } catch (error) {
            console.log('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.patch(`/alerts/${id}/lu`);
            setAlertes(alertes.map(a => a.id === id ? { ...a, lu: true } : a));
        } catch (error) {
            console.log('Erreur:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/alerts/tout-lu');
            setAlertes(alertes.map(a => ({ ...a, lu: true })));
        } catch (error) {
            console.log('Erreur:', error);
        }
    };

    const getAlertStyle = (type) => {
        const styles = {
            info: { bg: '#E3F2FD', border: '#2196F3' },
            semis: { bg: '#E8F5E9', border: '#4CAF50' },
            recolte: { bg: '#FFF8E1', border: '#FF9800' },
            cyclone: { bg: '#FFEBEE', border: '#F44336' }
        };
        return styles[type] || styles.info;
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 50 }} />;
    }

    const nonLues = alertes.filter(a => !a.lu).length;

    return (
        <View style={styles.container}>
            {nonLues > 0 && (
                <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
                    <Ionicons name="checkmark-done" size={20} color="#4CAF50" />
                    <Text style={styles.markAllText}>Mariho ho voavaky daholo ({nonLues})</Text>
                </TouchableOpacity>
            )}

            <FlatList
                data={alertes}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => {
                    const alertStyle = getAlertStyle(item.type);
                    return (
                        <TouchableOpacity
                            style={[
                                styles.card,
                                { backgroundColor: alertStyle.bg, borderLeftColor: alertStyle.border },
                                !item.lu && styles.cardUnread
                            ]}
                            onPress={() => markAsRead(item.id)}
                        >
                            {!item.lu && <View style={styles.unreadDot} />}
                            <Text style={styles.titre}>{item.titre}</Text>
                            <Text style={styles.message}>{item.message}</Text>
                            <Text style={styles.date}>
                                {new Date(item.date).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </Text>
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="notifications-off-outline" size={60} color="#ccc" />
                        <Text style={styles.emptyText}>Tsy misy fampitandremana</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    markAllButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
    markAllText: { marginLeft: 10, color: '#4CAF50', fontWeight: 'bold' },
    list: { padding: 15 },
    card: { borderRadius: 15, padding: 18, marginBottom: 12, borderLeftWidth: 5, position: 'relative' },
    cardUnread: { elevation: 4 },
    unreadDot: { position: 'absolute', top: 15, right: 15, width: 12, height: 12, borderRadius: 6, backgroundColor: '#F44336' },
    titre: { fontSize: 17, fontWeight: 'bold', color: '#333', marginBottom: 8 },
    message: { fontSize: 14, color: '#555', lineHeight: 20 },
    date: { fontSize: 12, color: '#888', marginTop: 10 },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: '#999', marginTop: 15, fontSize: 16 }
});