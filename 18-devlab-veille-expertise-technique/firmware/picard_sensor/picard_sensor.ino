// Picard vending machine sensor node
// ESP32 DevKit V1, DS18B20 probe in the freezer compartment, reed switch on the service door.
// Reads every 30 s and posts a JSON line to the server over Wi-Fi.

#include <WiFi.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include "config.h"

#define LED_PIN 2       // blue LED on the DevKit
#define ONE_WIRE_PIN 4  // DS18B20 data, 4.7k pull-up to 3V3
#define REED_PIN 27     // reed switch to GND, internal pull-up

const unsigned long WIFI_TIMEOUT_MS = 15000;
const unsigned long READ_INTERVAL_MS = 30000;

OneWire oneWire(ONE_WIRE_PIN);
DallasTemperature sensors(&oneWire);

unsigned long lastRead = 0;

/** Block until Wi-Fi is up or the timeout passes, blinking the LED meanwhile. */
bool connectWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("wifi: connecting");
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < WIFI_TIMEOUT_MS) {
    digitalWrite(LED_PIN, !digitalRead(LED_PIN));
    delay(250);
    Serial.print(".");
  }
  Serial.println();
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("wifi: failed");
    return false;
  }
  Serial.print("wifi: ok, ip ");
  Serial.println(WiFi.localIP());
  return true;
}

/** Read the probe in Celsius, NAN if the bus answers -127 (probe missing or no pull-up). */
float readTempC() {
  sensors.requestTemperatures();  // blocks ~750 ms at 12 bits, fine for us
  float t = sensors.getTempCByIndex(0);
  if (t == DEVICE_DISCONNECTED_C) return NAN;
  // 85.0 is the power-on value, the probe did not convert yet
  if (t == 85.0) return NAN;
  return t;
}

/** Reed contact is NO: magnet close (door shut) = LOW, open door = HIGH. Invert this for an MC-38 (NC). */
bool doorIsOpen() {
  return digitalRead(REED_PIN) == HIGH;
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  pinMode(REED_PIN, INPUT_PULLUP);
  sensors.begin();
  sensors.setResolution(12);
  connectWifi();
}

void loop() {
  digitalWrite(LED_PIN, WiFi.status() == WL_CONNECTED);

  if (millis() - lastRead >= READ_INTERVAL_MS || lastRead == 0) {
    lastRead = millis();
    float t = readTempC();
    bool door = doorIsOpen();
    Serial.print("temp: ");
    Serial.print(t);
    Serial.print(" door_open: ");
    Serial.println(door);
  }
  delay(100);
}
