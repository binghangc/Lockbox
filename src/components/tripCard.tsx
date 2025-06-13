import React, { useState, useRef } from 'react';
import { Text, TouchableOpacity, Image, View } from 'react-native';
import { Trip } from '@/types';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ManagementDropdown from '@/components/managementDropdown';
import ConfirmModal from '@/components/confirmModal'; // Make sure this path points to the correct ConfirmModal component that accepts the expected props
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
  const [confirmAction, setConfirmAction] = useState<'delete' | 'leave' | null>(
    null,
  );

  const handleDelete = () => {
    setConfirmAction('delete');
    setMenuVisible(false);
  };
  const handleLeave = () => {
    setConfirmAction('leave');
    setMenuVisible(false);
  };

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
      <ManagementDropdown
        visible={menuVisible}
        position={menuPosition}
        isHost={trip.is_host}
        onDelete={handleDelete}
        onLeave={handleLeave}
        onClose={() => setMenuVisible(false)}
      />
      <ConfirmModal
        visible={confirmAction !== null}
        message={
          confirmAction === 'delete'
            ? 'Are you sure you want to delete this trip?'
            : 'Are you sure you want to leave this trip?'
        }
        confirmText={confirmAction === 'delete' ? 'Delete Trip' : 'Leave Trip'}
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => {
          if (confirmAction === 'delete') {
            onDeleteTrip?.(trip.id);
          } else if (confirmAction === 'leave') {
            onLeaveTrip?.(trip.id);
          }
          setConfirmAction(null);
        }}
      />
    </View>
  );
}
