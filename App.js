import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, Image, ActivityIndicator, ImageBackground } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

API_KEY = 'e4ecc485da4470b4cc428c3bcc90dee4';

const Cell = ({ item }) => {
  return (
    <View style={styles.cell}>
      <View style={styles.cellSection}>
        <Text style={styles.textDay}>{item.day}</Text>
      </View>
      <View style={styles.cellSection}>
        <Image
          source={{ uri: `https://openweathermap.org/img/wn/${item.icon}.png` }}
          style={styles.weatherIcon}
        />
      </View>
      <View style={styles.cellSection}>
        <Text style={styles.cellTime}>{item.time}</Text>
        <Text style={styles.cellDesc}>{item.desc}</Text>
      </View>
      <View style={styles.cellSection}>
        <Text style={styles.cellTemp}>{Math.round(item.temp)}°C</Text>
      </View>
    </View>
  );
};

export default function App() {
  const [city, setCity] = useState('Hermosillo');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentdata, setcurrentData] = useState(null);
  const [forecastData, setForecastData] = useState([]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      getData(city);
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [city]);

  const cityChange = (text) => {
    setCity(text);
  };

  const getData = async (cityName) => {
    if (!cityName) return;
    setLoading(true);
    setForecastData([]);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=${API_KEY}`
      );

      const json = await response.json();

      if (json.cod === '200') {
        const current = json.list[0];
        setcurrentData({
          city: json.city.name,
          temp: current.main.temp,
          desc: current.weather[0].description,
          icon: current.weather[0].icon,
          humidity: current.main.humidity,
          wind: current.wind.speed,
        });

        const today = new Date().toISOString().split('T')[0];

        const getEnglishDay = (date) => {
          const days = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
          ];
          return days[date.getDay()];
        };

        const forecast = json.list
          .filter((element) => element.dt_txt.includes(today))
          .map((element) => {

            const date = new Date(element.dt_txt);
            const dayOfWeek = getEnglishDay(date);
            const time = date.toLocaleTimeString('es-US', {hour: '2-digit', minute: '2-digit'});

            return {
              id: element.dt,
              temp: element.main.temp,
              desc: element.weather[0].description,
              icon: element.weather[0].icon,
              day: dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1),
              time: time,
            };

          });
        setForecastData(forecast);
        setError(null);

      } else {
        setError('City not found');
        setcurrentData(null);
      }
    } catch (error) {
      console.log(error);
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaProvider>
      <ImageBackground 
        source={require('./assets/background.jpeg')}
        style={styles.backgroundImage}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.searchContainer}>
            <TextInput
              placeholder="Search city"
              style={styles.search}
              placeholderTextColor="white"
              value={city}
              onChangeText={cityChange}
            />
          </View>

          {loading &&(
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          )}

          {error && <Text style={styles.errorText}>{error}</Text>}

          {currentdata && (
            <View style={styles.forecastContainer}>
              <Text style={styles.cityname}>{currentdata.city}</Text>
              <View>
              </View>
              <Image
                source={{
                  uri: `https://openweathermap.org/img/wn/${currentdata.icon}@2x.png`,
                }}
                style={styles.weatherIconMain}
              />
              <Text style={styles.citytemp}>
                {Math.round(currentdata.temp)}°C
              </Text>

              <View style={styles.forecastDetails}>
                <View style={styles.section}>
                  <Image
                    source={require('./assets/humidity.png')}
                    style={styles.weatherIconDetail}
                  />
                  <Text style={styles.detailDesc}>{currentdata.humidity}%</Text>
                </View>

                <View style={styles.section}>
                  <Image
                    source={require('./assets/wind.png')}
                    style={styles.weatherIconDetail}
                  />
                  <Text style={styles.detailDesc}>{currentdata.wind} m/s</Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.forecastListContainer}>
            <FlatList
              data={forecastData}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <Cell item={item} />}
              contentContainerStyle={styles.forecastList}
            />
          </View>
        </SafeAreaView>
      </ImageBackground>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  searchContainer: {
    justifyContent: 'center',
    padding: 10,
  },
  search: {
    padding: 15,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 10,
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  // MAIN FORECAST
  forecastContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
    margin: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',

    flexDirection: 'column',
    rowGap: '10',
  },
  cityname: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
  },
  citytemp: {
    fontSize: 70,
    color: 'white',
  },

  // MAIN FORECAST - DETAILS
  weatherIconMain: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  forecastDetails: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  section: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    gap: 10,
    width: 150,
  },
  weatherIconDetail: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  // detailTitle: {
  //   fontSize: 20,
  //   fontWeight: 'bold',
  //   color: 'white',
  // },
  detailDesc: {
    fontSize: 15,
    color: 'white',
  },

  // FLATLIST SECTION
  forecastListContainer: {
    flex: 1,
    marginVertical: 10,
  },
  forecastList: {
    paddingHorizontal: 10,
  },
  cell: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    minWidth: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cellSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  textDay: {
    color: 'white',
    fontSize: 20,
  },
  cellTime: {
    color: 'white',
  },
  cellDesc: {
    color: 'white',
  },
  cellTemp: {
    color: 'white',
  },

//MENSAJES
  errorText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});
