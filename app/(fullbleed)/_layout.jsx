import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function FullBleedLayout () {
    return (
        <>
            <StatusBar style="light" translucent backgroundColor="transparent" />
            <Stack screenOptions={{ headerShown: false }} />
        </>
    );
}