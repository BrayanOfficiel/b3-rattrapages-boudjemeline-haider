# 17 - Usages de l'IA

Appli web qui reconnaît ce qu'il y a sur une image avec ml5.js et MobileNet, pour un futur distributeur Picard. On importe une photo ou on prend la webcam, et on a les 3 résultats les plus probables avec leur confiance.

## Lancer

Node 18 ou plus, pas de dépendance.

```
npm install
npm start
```

Puis http://localhost:3000. Le seuil de confiance se règle avec `MIN_CONFIDENCE` (voir `.env.example`), par défaut 0.5.

## Choix

ml5 1.x avec MobileNet, le modèle par défaut, léger, tout tourne dans le navigateur. Serveur Node avec le module `http`, Render a juste besoin d'un port. Bootstrap 5 et JS vanilla. En dessous du seuil les résultats restent affichés mais grisés.

Vidéo : https://youtu.be/8ysgeStM5bY

## Sources

- https://docs.ml5js.org/#/reference/image-classifier : doc ImageClassifier
- https://github.com/tensorflow/tfjs-models/tree/master/mobilenet : MobileNet, 1000 classes
- https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia : getUserMedia
- https://render.com/docs/deploy-node-express-app : build et start command
- https://teachablemachine.withgoogle.com/ : pour la suite
