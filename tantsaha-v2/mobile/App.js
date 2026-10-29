import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native'; // Ajouté View/ActivityIndicator
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import MeteoScreen from './screens/MeteoScreen';
import JournalScreen from './screens/JournalScreen';
import CulturesScreen from './screens/CulturesScreen';
import CultureDetailScreen from './screens/CultureDetailScreen';
import ConseilsScreen from './screens/ConseilsScreen';
import CalendrierScreen from './screens/CalendrierScreen';
import AlertesScreen from './screens/AlertesScreen';
import GuideScreen from './screens/GuideScreen';
import CulturesActivesScreen from './screens/CulturesActivesScreen';

const Stack = createNativeStackNavigator();

export default function App() {
    const [isFirstLaunch, setIsFirstLaunch] = useState(null);

    useEffect(() => {
        checkFirstLaunch();
    }, []);

    const checkFirstLaunch = async () => {
        try {
            const hasLaunched = await AsyncStorage.getItem('hasLaunched');
            if (hasLaunched === null) {
                setIsFirstLaunch(true);
            } else {
                setIsFirstLaunch(false);
            }
        } catch (error) {
            setIsFirstLaunch(false);
        }
    };

    if (isFirstLaunch === null) {
        return (
            <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                <ActivityIndicator size="large" color="#4CAF50"/>
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName={isFirstLaunch ? "Onboarding" : "Home"}
                screenOptions={{
                    headerStyle: { backgroundColor: '#4CAF50' },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: 'bold' }
                }}
            >
                <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Guide" component={GuideScreen} options={{ title: '❓ Torolalana' }} />
                <Stack.Screen name="Meteo" component={MeteoScreen} options={{ title: '🌤️ Toetr\'andro' }} />
                <Stack.Screen name="Journal" component={JournalScreen} options={{ title: '📖 Tati-boly' }} />
                <Stack.Screen name="Cultures" component={CulturesScreen} options={{ title: '🌾 Voly' }} />
                <Stack.Screen name="CultureDetail" component={CultureDetailScreen} options={{ title: '🌱 Momba ny voly' }} />
                <Stack.Screen name="CulturesActives" component={CulturesActivesScreen} options={{ title: '🌱 Voly eo am-panjariana' }} />
                <Stack.Screen name="Conseils" component={ConseilsScreen} options={{ title: '💡 Toro-hevitra' }} />
                <Stack.Screen name="Calendrier" component={CalendrierScreen} options={{ title: '📅 Kalandrie' }} />
                <Stack.Screen name="Alertes" component={AlertesScreen} options={{ title: '⚠️ Fampitandremana' }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}