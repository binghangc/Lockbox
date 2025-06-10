import React, { useState, useRef } from 'react';
import {
  Pressable,
  Text,
  TouchableOpacity,
  Image,
  View,
  Modal,
  StyleSheet,
} from 'react-native';
import { Trip } from '@/types';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import HostRow from './hostRow';

interface TripCardProps {
  trip: Trip;
  onDeleteTrip?: (tripId: string) => void;
  onLeaveTrip?: (tripId: string) => void;
}

export default function TripCard({
  trip,
  onDeleteTrip,
  onLeaveTrip,
}: TripCardProps) {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const buttonRef = useRef<React.ComponentRef<typeof TouchableOpacity>>(null);
  const [menuPosition, setMenuPosition] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  return (
    <View style={{ position: 'relative' }}>
      <TouchableOpacity
        className="w-72"
        onPress={() => router.push(`/trips/${trip.id}`)}
      >
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: trip.thumbnail_url }}
            className="w-full aspect-square mb-1"
            resizeMode="cover"
          />
          {trip.is_host && (
            <BlurView
              intensity={50}
              tint="dark"
              style={{
                position: 'absolute',
                bottom: 3,
                right: 0,
                paddingHorizontal: 10,
                paddingVertical: 8,
                overflow: 'hidden',
                zIndex: 10,
              }}
            >
              <Text className="text-white text-base font-bold">👑 HOSTING</Text>
            </BlurView>
          )}
        </View>
        <Text className="text-white font-bold text-xl mt-2" numberOfLines={1}>
          {trip.title}
        </Text>
        <HostRow host={trip.host} className="mt-0" />
      </TouchableOpacity>
      <TouchableOpacity
        ref={buttonRef}
        onPress={() => {
          buttonRef.current?.measureInWindow(
            (x: number, y: number, width: number, height: number) => {
              setMenuPosition({ x, y, width, height });
              setMenuVisible(true);
            },
          );
        }}
        style={{
          position: 'absolute',
          top: 5,
          right: 5,
          width: 25,
          height: 25,
          borderRadius: 20,
          overflow: 'hidden',
          zIndex: 20,
        }}
      >
        <BlurView
          intensity={50}
          tint="dark"
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <MaterialCommunityIcons
            name="dots-horizontal"
            size={18}
            color="white"
          />
        </BlurView>
      </TouchableOpacity>
      {menuVisible && (
        <Modal
          transparent
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setMenuVisible(false)}
          />
          <BlurView
            intensity={50}
            tint="dark"
            style={{
              position: 'absolute',
              top: menuPosition.y + menuPosition.height + 4,
              // open left of the button by subtracting the menu width, then adding the button width
              left: menuPosition.x + menuPosition.width - 120,
              width: 120,
              borderRadius: 8,
              paddingVertical: 2,
              overflow: 'hidden',
              zIndex: 30,
            }}
          >
            {trip.is_host ? (
              <TouchableOpacity
                onPress={() => {
                  onDeleteTrip?.(trip.id);
                  setMenuVisible(false);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 10,
                }}
              >
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={18}
                  color="#FF4C4C"
                />
                <Text className="text-[#FF4C4C] font-bold ml-2">
                  Delete Trip
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  onLeaveTrip?.(trip.id);
                  setMenuVisible(false);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 10,
                }}
              >
                <FontAwesome5 name="running" size={18} color="#FF4C4C" />
                <Text className="text-[#FF4C4C] font-bold ml-2">
                  Leave Trip
                </Text>
              </TouchableOpacity>
            )}
          </BlurView>
        </Modal>
      )}
    </View>
  );
}
