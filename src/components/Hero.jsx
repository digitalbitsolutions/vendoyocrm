import {ImageBackground, Image, View, StyleSheet, Dimensions} from 'react-native';

const BG = require("../../assets/images/Hero/background.png");
const LOGO = require("../../assets/images/Hero/logo.png");

export function Hero() {
    // tamaño responsivo del logo (máx 320px o 60% del ancho de la pantalla)
    const screenW = Dimensions.get("window").width;
    const logoWidth = Math.min(320, Math.round(screenW * 0.6));

    // obtener proporción del logo para calcular la altura automáticamente
    const { width: lw, height: lh} = Image.resolveAssetSource(LOGO);
    const logoHeight = Math.round(logoWidth * (lh / lw));

    return (
        <View style={{ flex: 1, backgroundColor: "#FFF8F2" }}>
          <ImageBackground
            source={BG}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
            imageStyle={{ transform: [{ scale: 1.06 }] }}
          />
          <View style={styles.center}>
            <Image
              source={LOGO}
              style={{ width: logoWidth, height: logoHeight }}
              resizeMode="contain"
              accessible
              accessibilityLabel="VendoYo.es"
            />
          </View>
        </View>
      );
    }
    
    const styles = StyleSheet.create({
      center: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, alignItems: "center", justifyContent: "center" }
});