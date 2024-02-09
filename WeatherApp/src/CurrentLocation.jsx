import React, { useState, useEffect, useRef } from "react";
import ReactAnimatedWeather from "react-animated-weather";
import apiKeys from "./apiKeys";
import Forcast from "./Forcast";
import loader from "../src/assets/WeatherIcons.jpeg";

const dateBuilder = (d) => {
    let months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    let day = days[d.getDay()];
    let date = d.getDate();
    let month = months[d.getMonth()];
    let year = d.getFullYear();

    return `${day}, ${date} ${month} ${year}`;
};

const defaults = {
    color: "white",
    size: 112,
    animate: true,
};

const Weather = () => {
    const [weatherData, setWeatherData] = useState({
        lat: undefined,
        lon: undefined,
        temperatureC: undefined,
        temperatureF: undefined,
        city: undefined,
        country: undefined,
        humidity: undefined,
        main: undefined,
        icon: "CLEAR_DAY",
        errorMsg: undefined,
        currentTime: "",
    });

    const timerRef = useRef(null);
    const clockRef = useRef(null);

    const padZero = (num) => (num < 10 ? `0${num}` : num);

    const getPosition = (options) => {
        return new Promise(function (resolve, reject) {
            navigator.geolocation.getCurrentPosition(resolve, reject, options);
        });
    };

    const getWeather = async (lat, lon) => {
        try {
            const api_call = await fetch(`${apiKeys.base}weather?lat=${lat}&lon=${lon}&units=metric&APPID=${apiKeys.key}`);
            const data = await api_call.json();

            const updatedData = {
                lat: lat,
                lon: lon,
                city: data.name,
                temperatureC: Math.round(data.main.temp),
                temperatureF: Math.round(data.main.temp * 1.8 + 32),
                humidity: data.main.humidity,
                main: data.weather[0].main,
                country: data.sys.country,
            };

            switch (updatedData.main) {
                case "Haze":
                    updatedData.icon = "CLEAR_DAY";
                    break;
                case "Clouds":
                    updatedData.icon = "CLOUDY";
                    break;
                case "Rain":
                    updatedData.icon = "RAIN";
                    break;
                case "Snow":
                    updatedData.icon = "SNOW";
                    break;
                case "Dust":
                    updatedData.icon = "WIND";
                    break;
                case "Drizzle":
                    updatedData.icon = "SLEET";
                    break;
                case "Fog":
                case "Smoke":
                    updatedData.icon = "FOG";
                    break;
                case "Tornado":
                    updatedData.icon = "WIND";
                    break;
                default:
                    updatedData.icon = "CLEAR_DAY";
            }

            setWeatherData(updatedData);
        } catch (error) {
            console.error("Error fetching weather data:", error);
            setWeatherData((prevData) => ({
                ...prevData,
                errorMsg: "Not Found",
            }));
        }
    };

    useEffect(() => {
        const fetchWeatherData = async () => {
            if (navigator.geolocation) {
                try {
                    const position = await getPosition();
                    await getWeather(position.coords.latitude, position.coords.longitude);
                } catch (error) {
                    await getWeather(28.67, 77.22);
                    alert("You have disabled location service. Allow this app to access your location.");
                }
            } else {
                alert("Geolocation not available");
            }

            timerRef.current = setInterval(() => getWeather(weatherData.lat, weatherData.lon), 600000);
            clockRef.current = setInterval(tick, 1000);
        };

        fetchWeatherData();

        return () => {
            clearInterval(timerRef.current);
            clearInterval(clockRef.current);
        };
    }, [weatherData.lat, weatherData.lon]);

    const tick = () => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const formattedTime = `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;

        setWeatherData((prevData) => ({
            ...prevData,
            currentTime: formattedTime,
        }));
    };

    if (weatherData.temperatureC) {
        return (
            <>
                <div className="city">
                    <div className="title">
                        <h2>{weatherData.city}</h2>
                        <h3>{weatherData.country}</h3>
                    </div>
                    <div className="mb-icon">
                        <ReactAnimatedWeather
                            icon={weatherData.icon}
                            color={defaults.color}
                            size={defaults.size}
                            animate={defaults.animate}
                        />
                        <p>{weatherData.main}</p>
                    </div>
                    <div className="date-time">
                        <div className="dmy">
                            <div id="txt"></div>
                            <div className="current-time">{weatherData.currentTime}</div>
                            <div className="current-date">{dateBuilder(new Date())}</div>
                        </div>
                        <div className="temperature">
                            <p>
                                {weatherData.temperatureC}°<span>C</span>
                            </p>
                        </div>
                    </div>
                </div>
                <Forcast icon={weatherData.icon} weather={weatherData.main} />
            </>
        );
    } else {
        return (
            <>
                <img src={loader} style={{ width: "50%", WebkitUserDrag: "none" }} alt="loading" />
                <h3 style={{ color: "white", fontSize: "22px", fontWeight: "600" }}>Detecting your location</h3>
                <h3 style={{ color: "white", marginTop: "10px" }}>
                    Your current location will be displayed on the App <br /> & used for calculating Real-time weather.
                </h3>
            </>
        );
    }
};

export default Weather;
