// picard vending machine sensor node
// esp32 + dht11 + hc-sr04, sends readings over wifi every 10s

#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include "config.h"

#define LED_PIN 2       // blue led on the board
#define DHT_PIN 4       // dht11 data pin, pull-up already on module
#define TRIG_PIN 5      // hc-sr04 trig
#define ECHO_PIN 18     // hc-sr04 echo, no divider, could add one later

const unsigned long WIFI_TIMEOUT_MS = 15000;
const unsigned long WIFI_RETRY_MS = 20000;
const unsigned long READ_INTERVAL_MS = 10000;
const int BUF_SIZE = 40;          // about 7 min of readings kept in ram
const float DOOR_OPEN_CM = 15.0;  // door closed is a few cm from sensor

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
bool doorOpen = false;
unsigned long lastWifiTry = 0;

/** wait for wifi or timeout, blink led while waiting */
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

/** one ping, nan if nothing back in 30ms */
float pingCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  unsigned long us = pulseIn(ECHO_PIN, HIGH, 30000);
  if (us == 0) return NAN;
  return us / 58.0;  // datasheet formula for cm
}

/** median of 3 pings, 60ms apart, nan if none work */
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

/** write float or null for json */
void fmtNum(char *out, size_t len, float v, int decimals) {
  if (isnan(v)) snprintf(out, len, "null");
  else snprintf(out, len, "%.*f", decimals, v);
}

/** build json by hand, not worth a library for 7 fields */
void buildJson(char *out, size_t len, const Reading &r) {
  char t[12], h[12], d[12];
  fmtNum(t, sizeof(t), r.tempC, 1);
  fmtNum(h, sizeof(h), r.humidity, 0);
  fmtNum(d, sizeof(d), r.distanceCm, 1);
  snprintf(out, len,
           "{\"device\":\"%s\",\"temp_c\":%s,\"humidity\":%s,\"door_open\":%s,\"distance_cm\":%s,\"rssi\":%d,\"uptime_s\":%lu}",
           DEVICE_ID, t, h, r.doorOpen ? "true" : "false", d, WiFi.RSSI(), r.uptimeS);
}

/** post one reading, true if server answers 2xx */
bool postReading(const Reading &r) {
  if (WiFi.status() != WL_CONNECTED) return false;
  char body[220];
  buildJson(body, sizeof(body), r);

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(2000);  // weak wifi, dont block the loop too long
  int code = http.POST(body);
  http.end();

  Serial.print("post: ");
  Serial.print(code);
  Serial.print(" ");
  Serial.println(body);
  return code >= 200 && code < 300;
}

/** keep reading for later, drop oldest one if full */
void bufferReading(const Reading &r) {
  if (bufCount == BUF_SIZE) {
    for (int i = 1; i < BUF_SIZE; i++) buf[i - 1] = buf[i];
    bufCount--;
  }
  buf[bufCount++] = r;
}

/** send buffered readings oldest first, stop on fail */
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
    // no echo = too close (under 2cm) or too far, so keep the last state
    if (!isnan(dist)) doorOpen = dist > DOOR_OPEN_CM;
    // dht11 gives nan on fail, sent as null
    Reading r = { dht.readTemperature(), dht.readHumidity(), dist, doorOpen, millis() / 1000 };

    flushBuffer();  // old readings first so server keeps the order
    if (postReading(r)) {
      digitalWrite(LED_PIN, LOW);  // quick blink to see it sent
      delay(80);
    } else {
      bufferReading(r);
      Serial.print("buffered, count=");
      Serial.println(bufCount);
    }
  }
  // todo deep sleep between reads if on battery
  delay(100);
}
