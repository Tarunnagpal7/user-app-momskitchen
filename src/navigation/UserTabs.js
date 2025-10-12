import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/user/DashboardScreen';
import OrdersScreen from '../screens/user/OrdersScreen';
import ProfileScreen from '../screens/user/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function UserTabs() {
  const surfaceColor = '#b8fabe';
  const primaryColor = '#0C3415';
  const subtitleColor = '#666666';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: surfaceColor,
          borderTopColor: '#e6e6e6',
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: primaryColor,
        tabBarInactiveTintColor: subtitleColor,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="view-dashboard" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="receipt" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account-circle" color={color} size={28} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
