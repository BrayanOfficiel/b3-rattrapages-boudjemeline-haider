// Picard vending machine sensor node
// ESP32 DevKit V1, DHT11 (temperature + humidity) and HC-SR04 in front of the service door.
// Reads every 10 s and posts a JSON line to the server over Wi-Fi.
// LED: blinking = connecting, on = Wi-Fi up, short off = reading sent.

#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include "config.h"

#define LED_PIN 2       // blue LED on the DevKit
#define DHT_PIN 4       // DHT11 module S pin, the 10k pull-up is already on the module
#define TRIG_PIN 5      // HC-SR04 trig, 3.3 V is enough to trigger it
#define ECHO_PIN 18     // HC-SR04 echo through a 1k / 2k divider, the echo is 5 V

const unsigned long WIFI_TIMEOUT_MS = 15000;
const unsigned long WIFI_RETRY_MS = 20000;
const unsigned long READ_INTERVAL_MS = 10000;
const int BUF_SIZE = 40;          // about 7 min of readings kept in RAM when offline
const float DOOR_OPEN_CM = 15.0;  // door shut = a few cm in front of the sensor

DHT dht(DHT_PIN, DHT11);

struct Reading {
  float tempC;
  float humidity;
  float distanceCm;
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

/** One ping, NAN when nothing comes back within 30 ms (about 5 m). */
float pingCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  unsigned long us = pulseIn(ECHO_PIN, HIGH, 30000);
  if (us == 0) return NAN;
  return us / 58.0;  // datasheet formula, us / 58 = cm
}

/** Median of 3 pings, 60 ms apart as the datasheet asks, NAN if none came back. */
float readDistanceCm() {
  float d[3];
  int n = 0;
  for (int i = 0; i < 3; i++) {
    float v = pingCm();
    if (!isnan(v)) d[n++] = v;
    delay(60);
  }
  if (n == 0) return NAN;
  // tiny sort, 3 values max
  for (int i = 0; i < n; i++)
    for (int j = i + 1; j < n; j++)
      if (d[j] < d[i]) { float t = d[i]; d[i] = d[j]; d[j] = t; }
  return d[n / 2];
}

/** Write a float or null in the JSON. */
void fmtNum(char *out, size_t len, float v, int decimals) {
  if (isnan(v)) snprintf(out, len, "null");
  else snprintf(out, len, "%.*f", decimals, v);
}

/** Write the JSON body by hand, 7 fields is not worth pulling ArduinoJson in. */
void buildJson(char *out, size_t len, const Reading &r) {
  char t[12], h[12], d[12];
  fmtNum(t, sizeof(t), r.tempC, 1);
  fmtNum(h, sizeof(h), r.humidity, 0);
  fmtNum(d, sizeof(d), r.distanceCm, 1);
  snprintf(out, len,
           "{\"device\":\"%s\",\"temp_c\":%s,\"humidity\":%s,\"door_open\":%s,\"distance_cm\":%s,\"rssi\":%d,\"uptime_s\":%lu}",
           DEVICE_ID, t, h, r.doorOpen ? "true" : "false", d, WiFi.RSSI(), r.uptimeS);
}

/** POST one reading, true on a 2xx answer. */
bool postReading(const Reading &r) {
  if (WiFi.status() != WL_CONNECTED) return false;
  char body[220];
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
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  dht.begin();
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
    float dist = readDistanceCm();
    // no echo at all = nothing in front, so the door is open
    bool open = isnan(dist) || dist > DOOR_OPEN_CM;
    // DHT11 gives NAN when the read fails, sent as null
    Reading r = { dht.readTemperature(), dht.readHumidity(), dist, open, millis() / 1000 };

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
