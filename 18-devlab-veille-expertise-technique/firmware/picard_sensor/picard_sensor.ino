// Picard vending machine sensor node
// ESP32 DevKit V1, DS18B20 probe in the freezer compartment, reed switch on the service door.
// Reads every 30 s and posts a JSON line to the server over Wi-Fi.
// LED: blinking = connecting, on = Wi-Fi up, short off = reading sent.

#include <WiFi.h>
#include <HTTPClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include "config.h"

#define LED_PIN 2       // blue LED on the DevKit
#define ONE_WIRE_PIN 4  // DS18B20 data, 4.7k pull-up to 3V3
#define REED_PIN 27     // reed switch to GND, internal pull-up

const unsigned long WIFI_TIMEOUT_MS = 15000;
const unsigned long WIFI_RETRY_MS = 20000;
const unsigned long READ_INTERVAL_MS = 30000;
const int BUF_SIZE = 40;  // 20 min of readings kept in RAM when offline

OneWire oneWire(ONE_WIRE_PIN);
DallasTemperature sensors(&oneWire);

struct Reading {
  float tempC;
  bool doorOpen;
  unsigned long uptimeS;
};

Reading buf[BUF_SIZE];
int bufCount = 0;

unsigned long lastRead = 0;
unsigned long lastWifiTry = 0;

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
  lastWifiTry = millis();
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

/** Write the JSON body by hand, 5 fields is not worth pulling ArduinoJson in. */
void buildJson(char *out, size_t len, const Reading &r) {
  if (isnan(r.tempC)) {
    snprintf(out, len, "{\"device\":\"%s\",\"temp_c\":null,\"door_open\":%s,\"rssi\":%d,\"uptime_s\":%lu}",
             DEVICE_ID, r.doorOpen ? "true" : "false", WiFi.RSSI(), r.uptimeS);
  } else {
    snprintf(out, len, "{\"device\":\"%s\",\"temp_c\":%.2f,\"door_open\":%s,\"rssi\":%d,\"uptime_s\":%lu}",
             DEVICE_ID, r.tempC, r.doorOpen ? "true" : "false", WiFi.RSSI(), r.uptimeS);
  }
}

/** POST one reading, true on a 2xx answer. */
bool postReading(const Reading &r) {
  if (WiFi.status() != WL_CONNECTED) return false;
  char body[160];
  buildJson(body, sizeof(body), r);

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(5000);
  int code = http.POST(body);
  http.end();

  Serial.print("post: ");
  Serial.print(code);
  Serial.print(" ");
  Serial.println(body);
  return code >= 200 && code < 300;
}

/** Keep a reading for later, drop the oldest one when full. */
void bufferReading(const Reading &r) {
  if (bufCount == BUF_SIZE) {
    for (int i = 1; i < BUF_SIZE; i++) buf[i - 1] = buf[i];
    bufCount--;
  }
  buf[bufCount++] = r;
}

/** Send buffered readings oldest first, stop at the first failure. */
void flushBuffer() {
  while (bufCount > 0) {
    if (!postReading(buf[0])) return;
    for (int i = 1; i < bufCount; i++) buf[i - 1] = buf[i];
    bufCount--;
  }
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
  bool online = WiFi.status() == WL_CONNECTED;
  digitalWrite(LED_PIN, online);

  if (!online && millis() - lastWifiTry >= WIFI_RETRY_MS) {
    WiFi.disconnect();
    connectWifi();
  }

  if (millis() - lastRead >= READ_INTERVAL_MS || lastRead == 0) {
    lastRead = millis();
    Reading r = { readTempC(), doorIsOpen(), millis() / 1000 };

    flushBuffer();  // older readings go first so the server keeps the order
    if (postReading(r)) {
      digitalWrite(LED_PIN, LOW);  // quick blink so you can see it sent
      delay(80);
    } else {
      bufferReading(r);
      Serial.print("buffered, count=");
      Serial.println(bufCount);
    }
  }
  // TODO deep sleep between reads if this ever runs on battery
  delay(100);
}
