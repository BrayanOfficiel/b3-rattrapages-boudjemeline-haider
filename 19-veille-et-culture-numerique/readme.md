# 19 - Veille et culture numérique

Site Genuary 2026 en p5.js avec 31 sketches, chatbot non-IA, zine, dans le style webcurios.

## Lancer

```
python3 -m http.server 8000
```

Puis http://localhost:8000. Le zine est dans `zine/zine.png`.

## Choix

Chaque sketch se lance seulement au clic sur sa miniature, render 31 canvas en même temps lague trop. Les miniatures sont des captures des sketches.

Le chatbot c'est une liste de règles avec des mots-clés, la première qui matche répond, sinon réponse par défaut. Il n'y a d'apprentissage, juste des patterns si/alors (un peu comme les assistants vocaux pré-IA comme 'Controle Vocal' iOS qui suivent des pattern, sauf la partie vocale).

Aucune lib css, pour réaliser queleque chose d'unique.

Vidéo : [lien à ajouter]

Agent EDEN.ART : [lien à ajouter]

## Sources

- https://genuary.art/prompts : liste des prompts
- https://p5js.org/tutorials/criticalAI4-no-ai-chatbot/ : structure du chatbot non-IA
- https://webcurios.co.uk : l'esprit du site
- https://patorjk.com/software/taag/ : titres ASCII
- https://p5js.org/reference/p5/noise : bruit de Perlin, utilisé un peu partout
- https://dev.to/nyxtom/flow-fields-and-noise-algorithms-with-p5-js-5g67 : flow fields, sketch 25
